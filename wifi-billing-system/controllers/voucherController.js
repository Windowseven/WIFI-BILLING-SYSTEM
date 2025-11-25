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
   DELETE VOUCHER
========================================================= */
exports.deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM vouchers WHERE id = ?", [id]);

        res.json({ message: "Voucher deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
