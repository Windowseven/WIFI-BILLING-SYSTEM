const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const voucherController = require('../controllers/voucherController');
const auth = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// strict rate limiter for voucher creation endpoints (per IP)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, 
  message: { error: 'Too many voucher creation requests, slow down' }
});

// =============================
// ADMIN — LIST VOUCHERS FIRST
// =============================
router.get('/',
  auth.requireAuth,
  auth.requireRole('admin'),
  query('status').optional().isIn(['active','used','expired']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  voucherController.list
);

// =============================
// ADMIN — GET VOUCHER BY CODE
// =============================
router.get('/:code',
  auth.requireAuth,
  auth.requireRole('admin'),
  param('code').trim().isLength({ min: 4, max: 64 }),
  voucherController.getByCode
);

// =============================
// ADMIN — CREATE VOUCHERS
// =============================
router.post('/',
  auth.requireAuth,
  auth.requireRole('admin'),
  createLimiter,
  body('quantity').optional().isInt({ min: 1, max: 500 }),
  body('code_length').optional().isInt({ min: 6, max: 32 }),
  body('plan_id').optional().isInt(),
  body('device_limit').optional().isInt({ min: 1 }),
  body('data_limit_mb').optional().isInt({ min: 0 }),
  body('duration_minutes').optional().isInt({ min: 1 }),
  body('expiry_date').optional().isISO8601(),
  voucherController.create
);

module.exports = router;
