// controllers/voucherController.js
const db = require('../config/db');
const crypto = require('crypto');

/* =========================================================
   CREATE VOUCHERS (Bulk)
========================================================= */
exports.create = async (req, res) => {
    try {
        const { quantity = 1, code_length = 8, plan_id, device_limit = 1, data_limit_mb = 0, duration_minutes = 60, expiry_date } = req.body;

        const vouchers = [];

        for (let i = 0; i < quantity; i++) {
            const code = crypto.randomBytes(Math.ceil(code_length / 2)).toString('hex').slice(0, code_length).toUpperCase();

            vouchers.push([code, plan_id, device_limit, data_limit_mb, duration_minutes, expiry_date || null, 'active']);
        }

        await db.query(
            `INSERT INTO vouchers (code, plan_id, device_limit, data_limit_mb, duration_minutes, expiry_date, status)
             VALUES ?`,
            [vouchers]
        );

        res.json({ message: `${quantity} vouchers created successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   LIST VOUCHERS
========================================================= */
exports.list = async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let sql = "SELECT * FROM vouchers";
        const params = [];

        if (status) {
            sql += " WHERE status = ?";
            params.push(status);
        }

        sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   GET VOUCHER BY CODE
========================================================= */
exports.getByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const [rows] = await db.query("SELECT * FROM vouchers WHERE code = ? LIMIT 1", [code]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Voucher not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   REDEEM VOUCHER (Updated for Captive Portal)
========================================================= */
exports.redeem = async (req, res) => {
    try {
        const { voucher_code } = req.body;
        const client_ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const mac_address = req.body.mac_address || 'unknown';
        
        // Find and validate voucher
        const [vouchers] = await db.query(
            'SELECT * FROM vouchers WHERE code = ? AND status = "active" AND (expiry_date IS NULL OR expiry_date > NOW())',
            [voucher_code]
        );
        
        if (vouchers.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired voucher code' 
            });
        }
        
        const voucher = vouchers[0];
        
        // Create session record
        const session_id = crypto.randomBytes(16).toString('hex');
        const expires_at = new Date(Date.now() + (voucher.duration_minutes * 60 * 1000));
        
        await db.query(
            `INSERT INTO sessions (session_id, voucher_id, client_ip, mac_address, expires_at, data_used_mb, status)
             VALUES (?, ?, ?, ?, ?, 0, 'active')`,
            [session_id, voucher.id, client_ip, mac_address, expires_at]
        );
        
        // Mark voucher as used
        await db.query(
            'UPDATE vouchers SET status = "used", used_at = NOW(), mac_address = ? WHERE id = ?',
            [mac_address, voucher.id]
        );
        
        // In a real captive portal, you would add iptables rules here to allow internet access
        // For Ubuntu setup, this would involve removing the redirect rule for this IP
        
        res.json({ 
            success: true,
            message: 'Internet access granted successfully!',
            session: {
                session_id: session_id,
                duration_minutes: voucher.duration_minutes,
                data_limit_mb: voucher.data_limit_mb,
                expires_at: expires_at,
                client_ip: client_ip
            }
        });
    } catch (error) {
        console.error('Redeem voucher error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to process voucher. Please try again.' 
        });
    }
};

/* =========================================================
   DELETE VOUCHER
========================================================= */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM vouchers WHERE id = ?", [id]);

        res.json({ message: "Voucher deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
