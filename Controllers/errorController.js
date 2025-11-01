
const customError = require("../utils/customError");


const devError = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}

const handleDuplicateKeyError = error => {
    // Extract the field that caused the duplicate error
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const message = `Duplicate value for '${field}': '${value}'. Please use another value!`;
    return new customError(message, 400);
};

const handleValidationError = error => {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = errors.join('. ');
    return new customError(message, 400);
};

const prodError = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}


module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === "development") {
        devError(res, error);
    } else if (process.env.NODE_ENV === "production") {
        if (error.name === 'ValidationError') error = handleValidationError(error);
        if (error.code === 11000) error = handleDuplicateKeyError(error);
        prodError(res, error);
    }

}