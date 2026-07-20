const user = require('../models/users');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendTokenResponse = require('../utils/jwtToken');
const fs = require('fs');
const Job = require('../models/jobs');
const ApiFilters = require('../utils/apiFilters');

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userProfile = await user.findById(req.user.id).populate({path: 'jobsPublished', select: 'title company location salary'});

  if (!userProfile) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user: userProfile
  });
});

exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const userProfile = await user.findById(req.user.id).select('+password');

  if (!userProfile) {
    return next(new ErrorHandler('User not found', 404));
  }

  const isPasswordMatched = await userProfile.isPasswordMatched(req.body.currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Current password is incorrect', 400));
  }

  userProfile.password = req.body.newPassword;
  await userProfile.save();

  sendTokenResponse(userProfile, 200, res);
});

exports.updateUserProfile = catchAsyncErrors(async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const userProfile = await user.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    user: userProfile
  });
});


// Delete current user profile
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const userProfile = await user.findById(req.user.id);

  if (!userProfile) {
    return next(new ErrorHandler('User not found', 404));
  }

  await user.findByIdAndDelete(req.user.id);

  await deleteUserData(req.user.id, userProfile.role);
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(201).json({
    success: true,
    message: 'User deleted successfully',
    data: {}
  });
});

exports.getAppliedJobs = catchAsyncErrors(async (req, res) => {
  const userId = req.user.id;
  const appliedJobs = await Job.find({ 'applicantsApplied.user': userId }).select('+applicantsApplied');

  const userAppliedJobs = appliedJobs.map(job => {
    const applicant = job.applicantsApplied.find(applicant => applicant.user.toString() === userId);
    return {
      jobId: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      resume: applicant.resume,
      appliedAt: applicant.appliedAt
    };
  });

  res.status(200).json({
    success: true,
    results: appliedJobs.length,
    data: userAppliedJobs
  });
});

exports.getPublishedJobs = catchAsyncErrors(async (req, res) => {
  const userId = req.user.id;
  const publishedJobs = await Job.find({ user: userId });

  res.status(200).json({
    success: true,
    results: publishedJobs.length,
    data: publishedJobs
  });
});

exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const apiFilters = new ApiFilters(user.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await apiFilters.query;

  res.status(200).json({
    success: true,
    results: users.length,
    data: users
  });
});

exports.deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
    
  const userProfile = await user.findById(req.params.id);

  if (!userProfile) {
    return next(new ErrorHandler('User not found', 404));
  }

  await user.findByIdAndDelete(req.params.id);

  await deleteUserData(req.params.id, userProfile.role);

  res.status(201).json({
    success: true,
    message: 'User deleted successfully',
    data: {}
  });
});

async function deleteUserData(userId, role){
  if (role === 'employer') {
    await Job.deleteMany({ user: userId });
  } else if (role === 'user') {
    const appliedJobs = await Job.find({ 'applicantsApplied.user': userId }).select('+applicantsApplied');
    for (const job of appliedJobs) {
        
      // Delete resume file
      const fileName = job.applicantsApplied.find(applicant => applicant.user.toString() === userId)?.resume;
      await fs.unlink(`${process.env.FILE_UPLOAD_PATH}/${fileName}`, async (err) => {
        if (err) {
          console.error(`Error deleting file ${fileName}:`, err);
        }
      });
    }
    // Remove user from applicantsApplied array in jobs
    await Job.updateMany(
      { 'applicantsApplied.user': userId },
      { $pull: { applicantsApplied: { user: userId } } }
    );

  }
}