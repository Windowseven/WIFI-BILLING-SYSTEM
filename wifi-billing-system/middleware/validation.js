const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
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

// Common validation rules
exports.validateAuth = [
    body('username').trim().isLength({ min: 3, max: 50 }).escape(),
    body('password').isLength({ min: 8, max: 128 }),
    exports.handleValidationErrors
];

exports.validateVoucher = [
    body('quantity').optional().isInt({ min: 1, max: 1000 }),
    body('code_length').optional().isInt({ min: 6, max: 16 }),
    body('plan_id').isInt({ min: 1 }),
    body('device_limit').optional().isInt({ min: 1, max: 10 }),
    body('data_limit_mb').optional().isInt({ min: 0 }),
    body('duration_minutes').optional().isInt({ min: 1 }),
    exports.handleValidationErrors
];

exports.validateUser = [
    body('username').trim().isLength({ min: 3, max: 50 }).escape(),
    body('password').optional().isLength({ min: 8, max: 128 }),
    body('role').optional().isIn(['admin', 'staff', 'user']),
    exports.handleValidationErrors
];

exports.validatePlan = [
    body('name').trim().isLength({ min: 1, max: 100 }).escape(),
    body('price').isFloat({ min: 0 }),
    body('duration_minutes').isInt({ min: 1 }),
    body('data_limit_mb').optional().isInt({ min: 0 }),
    exports.handleValidationErrors
];
