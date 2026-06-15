const jwt = require('jsonwebtoken');
const User = require('../models/users');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorHandler('Not authorized to access this route', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // User must be authenticated first and is available in req.user
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    };
}