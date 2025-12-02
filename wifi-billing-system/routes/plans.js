// routes/plans.js
// Routes for plan management (public + admin protected)
// - Public: list all plans, get single plan
// - Admin: create, update, delete plans
// Uses: express-validator for input validation and auth middleware for protection

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const auth = require('../middleware/authMiddleware');
const planController = require('../controllers/planController');

/**
 * Public - LIST PLANS
 * GET /api/plans
 * - Returns array of plans (for user portal)
 */
router.get('/', planController.listPlans);

/**
 * Public - GET SINGLE PLAN
 * GET /api/plans/:id
 * - id must be integer
 */
router.get('/:id',
  param('id').isInt(),
  planController.getPlan
);

/* -------------------------------
   ADMIN PROTECTED ROUTES
   All routes below require:
     - req.user exists (JWT) -> auth.requireAuth
     - user has 'admin' role -> auth.requireRole('admin')
   ------------------------------- */

/**
 * Admin - CREATE PLAN
 * POST /api/plans
 * Body:
 *  - name (string, required)
 *  - price_tsh (number, optional)
 *  - data_limit_mb (int, optional)
 *  - duration_minutes (int, optional)
 *  - device_limit (int, optional)
 *  - is_offer (boolean, optional)
 */
router.post('/',
  auth.requireAuth,
  auth.requireRole('admin'),
  body('name').isString().trim().isLength({ min: 2 }),
  body('price_tsh').optional().isFloat({ min: 0 }),
  body('data_limit_mb').optional().isInt({ min: 0 }),
  body('duration_minutes').optional().isInt({ min: 1 }),
  body('device_limit').optional().isInt({ min: 1 }),
  body('is_offer').optional().isBoolean(),
  planController.createPlan
);

/**
 * Admin - UPDATE PLAN
 * PUT /api/plans/:id
 * Body: any of updatable fields (partial updates supported)
 */
router.put('/:id',
  auth.requireAuth,
  auth.requireRole('admin'),
  param('id').isInt(),
  // No field-level validators here (controller handles dynamic updates),
  planController.updatePlan
);

/**
 * Admin - DELETE PLAN
 * DELETE /api/plans/:id
 * - Prevents deletion if plan used by vouchers (controller check)
 */
router.delete('/:id',
  auth.requireAuth,
  auth.requireRole('admin'),
  param('id').isInt(),
  planController.deletePlan
);

module.exports = router;
