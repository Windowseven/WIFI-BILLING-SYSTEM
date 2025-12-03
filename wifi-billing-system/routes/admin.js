// routes/admin.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');


const auth = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const voucherController = require('../controllers/voucherController');
const planController = require('../controllers/planController');
const paymentController = require('../controllers/paymentController');


// Require Admin Authentication for ALL routes
router.use(auth.requireAuth);
router.use(auth.requireRole('admin'));

/* =========================================================
   1. USER MANAGEMENT (Admins & Staff)
========================================================= */

// Create new user (admin or staff)
router.post(
  '/users',
  body('username').trim().isLength({ min: 3 }),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['admin', 'staff']),
  adminController.createUser
);

// List all users
router.get('/users', adminController.listUsers);

// Update user role
router.put(
  '/users/:id/role',
  param('id').isInt(),
  body('role').isIn(['admin', 'staff']),
  adminController.updateUserRole
);

// Delete a user
router.delete(
  '/users/:id',
  param('id').isInt(),
  adminController.deleteUser
);

/* =========================================================
   2. INTERNET PLAN MANAGEMENT
========================================================= */

// Create a new internet plan
router.post(
  '/plans',
  body('name').isString(),
  body('price').isFloat({ min: 0 }),
  body('duration_minutes').isInt({ min: 1 }),
  body('speed_mbps').optional().isInt({ min: 1 }),
  planController.createPlan
);

// List all internet plans
router.get('/plans', planController.listPlans);

// Update a plan
router.put(
  '/plans/:id',
  param('id').isInt(),
  body('name').optional().isString(),
  body('price').optional().isFloat({ min: 0 }),
  body('duration_minutes').optional().isInt({ min: 1 }),
  body('speed_mbps').optional().isInt({ min: 1 }),
  planController.updatePlan
);

// Delete a plan
router.delete(
  '/plans/:id',
  param('id').isInt(),
  planController.deletePlan
);

/* =========================================================
   3. VOUCHER MANAGEMENT
========================================================= */

// Create bulk vouchers
router.post(
  '/vouchers',
  body('quantity').isInt({ min: 1, max: 500 }),
  body('code_length').optional().isInt({ min: 6, max: 32 }),
  body('plan_id').isInt(),
  body('device_limit').optional().isInt({ min: 1 }),
  body('data_limit_mb').optional().isInt({ min: 0 }),
  voucherController.create
);

// List all vouchers
router.get(
  '/vouchers',
  query('status').optional().isIn(['active', 'used', 'expired']),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('offset').optional().isInt({ min: 0 }),
  voucherController.list
);

// Get voucher by code
router.get(
  '/vouchers/:code',
  param('code').isString().isLength({ min: 4 }),
  voucherController.getByCode
);

// Delete voucher
router.delete(
  '/vouchers/:id',
  param('id').isInt(),
  voucherController.deleteVoucher
);

/* =========================================================
   4. SYSTEM SETTINGS (Billing + Hotspot)
========================================================= */

router.put(
  '/settings',
  body('currency').optional().isString(),
  body('hotspot_name').optional().isString(),
  body('session_grace_minutes').optional().isInt({ min: 0, max: 60 }),
  adminController.updateSystemSettings
);

router.get('/settings', adminController.getSystemSettings);

/* =========================================================
   5. DASHBOARD STATISTICS
========================================================= */

router.get('/stats/overview', adminController.getOverviewStats);

router.get(
  '/stats/sales',
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  adminController.getSalesReport
);

router.get(
  '/stats/active-users',
  adminController.getActiveUsers
);

/* =========================================================
   6. LOGS & AUDIT TRAIL
========================================================= */

router.get(
  '/logs',
  query('limit').optional().isInt({ min: 10, max: 500 }),
  adminController.getAuditLogs
);

/*=========================================================
   PROTECTED ENDPOINTS; ADMIN CHANGES OWN PASSWORD
========================================================= */
router.post(
    '/change-password',
    auth.requireAuth,
    auth.requireRole('admin'),
    body('oldPassword').isLength({ min: 8 }),
    body('newPassword').isLength({ min: 8 }),
    adminController.changePassword
);


// -----------------------------
// Online Payment Simulation
// -----------------------------
router.post(
    '/simulate',
    auth.requireAuth,
    auth.requireRole('admin'),
    body('voucher_id').isInt(),
    body('user_id').isInt(),
    body('amount').isFloat({ min: 0 }),
    paymentController.simulatePayment
);

// -----------------------------
// Physical Payment (Cash Payment)
// -----------------------------
router.post(
    '/payments/physical',
    auth.requireAuth,
    auth.requireRole('admin'),
    body('plan_id').isInt({ min: 1 }),
    body('amount_paid').isFloat({ min: 0 }),
    body('paid_by').optional().isString(),
    paymentController.createPhysicalPayment
);


module.exports = router;
