const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    console.log("err", err)
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    console.log(value)
    const message = `Duplicate field value: ${value}. Please use another value!`

    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = err => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = err => new AppError('Your token has expired! Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
    // A) API - send detailed error information for debugging
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } 
    // B) RENDERED WEBSITE - render error page with message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
};


const sendErrorProd = (err, req, res) => {
    // A) API 
    if (req.originalUrl.startsWith('/api')) {
        // 1) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } 
        // 2) Programming or unknown error: don't leak error details
        // Log error for developers
        console.error('ERROR 💥', err);
        // Send generic message to client
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }

    // B) RENDERED WEBSITE
    // 1) Operational, trusted error: show error message
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    
    // 2) Programming or unknown error: don't leak error details
    // Log error for developers
    console.error('ERROR 💥', err);
    // Send generic error message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.isOperational = err.isOperational || false;

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        // Create a hard copy of error object
        // Spread operator might lose some properties, so manually copy properties
        let error = Object.create(err);
        error.message = err.message;
        error.name = err.name;
        error.code = err.code;
        error.errors = err.errors;
        error.statusCode = err.statusCode;
        error.status = err.status;
        error.isOperational = err.isOperational;

        // Transform specific error types to operational errors
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

        sendErrorProd(error, req, res);
    }
};