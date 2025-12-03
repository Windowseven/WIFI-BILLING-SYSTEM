// middleware/errorMiddleware.js

/* =========================================================
   VALIDATION ERROR HANDLER
========================================================= */
const { validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
exports.globalErrorHandler = (err, req, res, next) => {
    console.error('Global Error Handler:', err);

    // Default error
    let error = {
        message: 'Internal Server Error',
        status: 500
    };

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.status = 401;
    } else if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.status = 401;
    }

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        error.message = 'Duplicate entry';
        error.status = 400;
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
        error.message = 'Database table not found';
        error.status = 500;
    } else if (err.code === 'ECONNREFUSED') {
        error.message = 'Database connection refused';
        error.status = 500;
    }

    // Validation errors
    if (err.type === 'entity.parse.failed') {
        error.message = 'Invalid JSON';
        error.status = 400;
    }

    // Rate limiting errors
    if (err.status === 429) {
        error.message = 'Too many requests';
        error.status = 429;
    }

    res.status(error.status).json({
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/* =========================================================
   NOT FOUND HANDLER
========================================================= */
exports.notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
};

/* =========================================================
   ASYNC ERROR WRAPPER
========================================================= */
exports.asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
