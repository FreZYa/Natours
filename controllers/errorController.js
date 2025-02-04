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

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    console.log("err,", err.isOperational)
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR 💥')
        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }

}
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.isOperational = err.isOperational || false;
    console.log("process.env.NODE_ENV", process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // Spread operatörü ile kopyalama yaparken bazı özellikler kaybolabiliyor
        // Bu yüzden error nesnesini manuel olarak oluşturuyoruz
        let error = Object.create(err);
        error.message = err.message;
        error.name = err.name;
        error.code = err.code;
        error.errors = err.errors;
        error.statusCode = err.statusCode;
        error.status = err.status;
        error.isOperational = err.isOperational;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    }
};