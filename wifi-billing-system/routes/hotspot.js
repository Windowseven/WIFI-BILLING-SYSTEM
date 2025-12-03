const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const hotspotController = require('../controllers/hotspotController');
const hotspotAuth = require('../controllers/hotspotAuth');
const hotspotAuth = require('../middleware/hotspotAuth');

// Authorize (user submits voucher) — can be public if portal handles secret
router.post(
  '/authorize',
  body('voucher_code').isString().trim(),
  body('mac_address').isString().trim(),
  body('ip').isString().trim(),
  hotspotController.authorize
);





// User enters voucher to login
router.post(
    '/login',
    body('voucher_code').isLength({ min: 4 }),
    body('mac_address').isMACAddress(),
    hotspotAuth.authenticateVoucher
);

// Hotspot firewall calls this periodically to check if user still allowed
router.get(
    '/validate',
    query('session_token').isLength({ min: 10 }),
    query('mac_address').isMACAddress(),
    hotspotAuth.validateSession
);

// Accounting (start/update/stop) — protect with hotspot shared secret
router.post(
  '/accounting',
  hotspotAuth,
  body('session_token').optional().isString(),
  body('event').isString(),
  hotspotController.accounting
);

// Logout — protected
router.post('/logout', hotspotAuth, body('session_token').isString(), hotspotController.logout);

// Status (optional) — protected or public for debug
router.get('/status', hotspotAuth, query('session_token').isString(), hotspotController.status);

module.exports = router;
