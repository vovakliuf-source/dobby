const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Wrong mongoose ObjectId error
        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}`;
            err = new ErrorHandler(message, 404);
        }

        // Validation error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            err = new ErrorHandler(message, 400);
        }

        if (err.code === 11000) {
            const message = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}`;
            err = new ErrorHandler(message, 400);
        }

        if (err.name === 'JsonWebTokenError') {
            const message = 'JSON Web Token is invalid. Please try again.';
            err = new ErrorHandler(message, 401);
        }

        if (err.name === 'TokenExpiredError') {
            const message = 'JSON Web Token has expired. Please try again.';
            err = new ErrorHandler(message, 401);
        }

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
};