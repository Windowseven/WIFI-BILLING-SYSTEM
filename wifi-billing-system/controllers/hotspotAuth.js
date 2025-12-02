// controllers/hotspotAuth.js
const db = require('../config/db');
const crypto = require('crypto');

module.exports = {
    authenticateVoucher: async (req, res) => {
        try {
            const { voucher_code, mac_address } = req.body;

            if (!voucher_code || !mac_address) {
                return res.status(400).json({ error: 'Missing voucher_code or mac_address' });
            }

            // check voucher
            const [voucher] = await db.query(
                "SELECT * FROM vouchers WHERE code = ? LIMIT 1",
                [voucher_code]
            );

            if (voucher.length === 0) {
                return res.status(404).json({ error: 'Invalid voucher code' });
            }

            const v = voucher[0];

            // check status
            if (v.status === 'expired') {
                return res.status(400).json({ error: 'Voucher already expired' });
            }

            if (v.status === 'used') {
                // check device_limit
                const [devices] = await db.query(
                    "SELECT COUNT(*) AS count FROM sessions WHERE voucher_id = ?",
                    [v.id]
                );

                if (devices[0].count >= v.device_limit) {
                    return res.status(403).json({ error: 'Device limit reached' });
                }
            }

            // check expiry_date
            if (v.expiry_date && new Date(v.expiry_date) < new Date()) {
                return res.status(400).json({ error: 'Voucher expired by date' });
            }

            // check if payment completed
            const [payments] = await db.query(
                "SELECT * FROM payments WHERE voucher_id = ? AND status = 'completed' LIMIT 1",
                [v.id]
            );

            if (payments.length === 0) {
                return res.status(402).json({ error: 'Payment required before using voucher' });
            }

            // generate session
            const sessionToken = crypto.randomBytes(20).toString('hex');
            const expiry = new Date(Date.now() + v.duration_minutes * 60000);

            await db.query(
                `INSERT INTO sessions (voucher_id, mac_address, session_token, expires_at)
                 VALUES (?, ?, ?, ?)`,
                [v.id, mac_address, sessionToken, expiry]
            );

            // update voucher status -> used
            if (v.status === 'active') {
                await db.query(
                    "UPDATE vouchers SET status = 'used' WHERE id = ?",
                    [v.id]
                );
            }

            return res.json({
                success: true,
                message: 'Access granted',
                session_token: sessionToken,
                expires_at: expiry
            });

        } catch (error) {
            console.error('Hotspot Auth Error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    },


    validateSession: async (req, res) => {
        try {
            const { session_token, mac_address } = req.query;

            if (!session_token || !mac_address) {
                return res.status(400).json({ error: 'Missing token or mac_address' });
            }

            const [session] = await db.query(
                "SELECT * FROM sessions WHERE session_token = ? AND mac_address = ? LIMIT 1",
                [session_token, mac_address]
            );

            if (session.length === 0) {
                return res.status(401).json({ error: 'Invalid session' });
            }

            const s = session[0];

            if (new Date(s.expires_at) < new Date()) {
                return res.status(403).json({ error: 'Session expired' });
            }

            return res.json({ allowed: true });

        } catch (error) {
            console.error('Session Validation Error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
};
