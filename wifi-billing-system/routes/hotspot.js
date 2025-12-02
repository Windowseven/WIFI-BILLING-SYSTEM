const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const hotspotAuth = require('../controllers/hotspotAuth');

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

module.exports = router;
