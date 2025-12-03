// controllers/hotspotAuth.js
// Hotspot Authentication & Middleware for WiFi Billing System
// Handles: voucher login, session validation, hotspot accounting, middleware protection

const db = require('../config/db'); // assume MySQL pool
const { validationResult } = require('express-validator');
const crypto = require('crypto');

/**
 * Middleware to protect hotspot accounting & admin routes
 * Ensures request has valid shared secret or token
 */
const hotspotMiddleware = (req, res, next) => {
    try {
        const secret = req.headers['x-hotspot-secret'];
        if (!secret || secret !== process.env.HOTSPOT_SHARED_SECRET) {
            return res.status(403).json({ error: 'Unauthorized hotspot request' });
        }
        next();
    } catch (err) {
        console.error('Hotspot middleware error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Authenticate voucher for device login (captive portal)
 * Body: voucher_code, mac_address, ip
 */
const authenticateVoucher = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { voucher_code, mac_address, ip } = req.body;

        // Find voucher in DB
        const [voucherRows] = await db.query(
            'SELECT * FROM vouchers WHERE code = ? AND status = "active"',
            [voucher_code]
        );

        if (!voucherRows.length) {
            return res.status(404).json({ error: 'Voucher not found or inactive' });
        }

        const voucher = voucherRows[0];

        // Create session token
        const session_token = crypto.randomBytes(24).toString('hex');
        const now = new Date();
        const expires_at = new Date(now.getTime() + voucher.duration_minutes * 60000);

        // Insert session into DB
        await db.query(
            `INSERT INTO sessions (voucher_id, mac_address, ip, session_token, expires_at, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [voucher.id, mac_address, ip, session_token, expires_at, 'active']
        );

        // Mark voucher as used
        await db.query('UPDATE vouchers SET status="used" WHERE id=?', [voucher.id]);

        res.json({
            message: 'Access granted',
            session_token,
            expires_at
        });
    } catch (err) {
        console.error('authenticateVoucher error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Validate an active session
 * Query: session_token, mac_address
 */
const validateSession = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { session_token, mac_address } = req.query;

        const [rows] = await db.query(
            'SELECT * FROM sessions WHERE session_token=? AND mac_address=? AND status="active"',
            [session_token, mac_address]
        );

        if (!rows.length) {
            return res.json({ access: false });
        }

        const session = rows[0];
        const now = new Date();

        if (now > session.expires_at) {
            // Expire session
            await db.query('UPDATE sessions SET status="expired" WHERE id=?', [session.id]);
            return res.json({ access: false });
        }

        res.json({ access: true, expires_at: session.expires_at });
    } catch (err) {
        console.error('validateSession error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    hotspotMiddleware,        // middleware for protected routes
    authenticateVoucher,      // voucher login handler
    validateSession           // session validation
};
