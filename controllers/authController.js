const User = require('../models/users');
const crypto = require('node:crypto');
const catchAsync = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendTokenResponse = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

exports.registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    throw new ErrorHandler('User already exists', 400);
  }
  if (!name || !email || !password) {
    throw new ErrorHandler('Please provide name, email, and password', 400);
  }
  // Create new user
  user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 201, res);
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password', 400));
  }
  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
    
  if (!user) {
    return next(new ErrorHandler('User not found', 400));
  }

  // Check password
  const isMatch = await user.isPasswordMatched(password);
  if (!isMatch) {
    return next(new ErrorHandler('Invalid credentials', 400));
  }

  sendTokenResponse(user, 200, res);
});

exports.logoutUser = catchAsync(async (req, res,) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

exports.sendResetEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler('Email could not be sent', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Hash the token from the URL
  const token = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler('Invalid or expired token', 400));
  }
  
  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});