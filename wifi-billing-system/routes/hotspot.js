const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to authenticate voucher codes
const authenticateVoucher = async (req, res, next) => {
    try {
        const { voucherCode } = req.body;
        
        if (!voucherCode) {
            return res.status(400).json({ error: 'Voucher code is required' });
        }

        // Check if voucher exists and is valid
        const [vouchers] = await db.execute(
            'SELECT * FROM vouchers WHERE code = ? AND status = "active" AND expires_at > NOW()',
            [voucherCode]
        );

        if (vouchers.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired voucher code' });
        }

        const voucher = vouchers[0];
        
        // Check if voucher has remaining time
        if (voucher.remaining_time <= 0) {
            return res.status(401).json({ error: 'Voucher has no remaining time' });
        }

        req.voucher = voucher;
        next();
    } catch (error) {
        console.error('Voucher authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Hotspot login endpoint
router.post('/login', authenticateVoucher, async (req, res) => {
    try {
        const voucher = req.voucher;
        const clientMac = req.body.mac || req.headers['x-client-mac'];
        const clientIp = req.ip || req.connection.remoteAddress;

        // Create session
        const sessionToken = jwt.sign(
            { 
                voucherId: voucher.id,
                mac: clientMac,
                ip: clientIp
            },
            process.env.JWT_SECRET,
            { expiresIn: `${voucher.remaining_time}m` }
        );

        // Update voucher usage
        await db.execute(
            'UPDATE vouchers SET last_used = NOW() WHERE id = ?',
            [voucher.id]
        );

        // Create session record
        await db.execute(
            'INSERT INTO sessions (voucher_id, mac_address, ip_address, session_token, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
            [voucher.id, clientMac, clientIp, sessionToken, voucher.remaining_time]
        );

        res.json({
            success: true,
            sessionToken,
            expiresIn: voucher.remaining_time * 60, // in seconds
            message: 'Authentication successful'
        });
    } catch (error) {
        console.error('Hotspot login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Session validation endpoint
router.post('/validate', async (req, res) => {
    try {
        const { sessionToken } = req.body;
        
        if (!sessionToken) {
            return res.status(400).json({ error: 'Session token is required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
        
        // Check if session exists in database
        const [sessions] = await db.execute(
            'SELECT * FROM sessions WHERE session_token = ? AND expires_at > NOW() AND status = "active"',
            [sessionToken]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const session = sessions[0];
        
        // Update last activity
        await db.execute(
            'UPDATE sessions SET last_activity = NOW() WHERE id = ?',
            [session.id]
        );

        res.json({
            valid: true,
            session: {
                id: session.id,
                voucherId: session.voucher_id,
                expiresAt: session.expires_at
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid session token' });
        }
        console.error('Session validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const { sessionToken } = req.body;
        
        if (sessionToken) {
            await db.execute(
                'UPDATE sessions SET status = "terminated", ended_at = NOW() WHERE session_token = ?',
                [sessionToken]
            );
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
