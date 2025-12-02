const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Protected endpoint: Admin marks payment as completed (simulation)
router.post(
    '/simulate',
    auth.requireAuth,
    auth.requireRole('admin'),
    body('voucher_id').isInt(),
    body('user_id').isInt(),
    body('amount').isFloat({ min: 0 }),
    paymentController.simulatePayment
);

module.exports = router;
