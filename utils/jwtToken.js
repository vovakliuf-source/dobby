const OPTIONS = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
};

const sendToken = async (user, statusCode, res) => {
  const token = await user.getJwtToken();
  res.status(statusCode).cookie('token', token, OPTIONS).json({
    success: true,
    token,
  });
};

module.exports = sendToken;