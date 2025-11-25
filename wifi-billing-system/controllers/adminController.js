// controllers/adminController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* =========================================================
   1. CREATE USER (ADMIN OR STAFF)
========================================================= */
exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const [existing] = await db.query(
            "SELECT id FROM users WHERE username = ? LIMIT 1",
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [username, hashed, role]
        );

        res.json({ message: "User created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   2. LIST USERS
========================================================= */
exports.listUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, username, role, created_at FROM users ORDER BY id DESC"
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   3. UPDATE USER ROLE
========================================================= */
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        await db.query(
            "UPDATE users SET role = ? WHERE id = ?",
            [role, id]
        );

        res.json({ message: "Role updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   4. DELETE USER
========================================================= */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM users WHERE id = ?", [id]);

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   5. SYSTEM SETTINGS — UPDATE
========================================================= */
exports.updateSystemSettings = async (req, res) => {
    try {
        const { currency, hotspot_name, session_grace_minutes } = req.body;

        await db.query(
            `UPDATE system_settings 
             SET currency = COALESCE(?, currency),
                 hotspot_name = COALESCE(?, hotspot_name),
                 session_grace_minutes = COALESCE(?, session_grace_minutes)
             WHERE id = 1`,
            [currency, hotspot_name, session_grace_minutes]
        );

        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   6. SYSTEM SETTINGS — GET
========================================================= */
exports.getSystemSettings = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM system_settings WHERE id = 1");
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   7. DASHBOARD — OVERVIEW STATS
========================================================= */
exports.getOverviewStats = async (req, res) => {
    try {
        const [[totalUsers]] = await db.query("SELECT COUNT(*) AS count FROM users");
        const [[totalVouchers]] = await db.query("SELECT COUNT(*) AS count FROM vouchers");
        const [[usedVouchers]] = await db.query("SELECT COUNT(*) AS count FROM vouchers WHERE status = 'used'");
        const [[activeVouchers]] = await db.query("SELECT COUNT(*) AS count FROM vouchers WHERE status = 'active'");

        res.json({
            total_users: totalUsers.count,
            total_vouchers: totalVouchers.count,
            used_vouchers: usedVouchers.count,
            active_vouchers: activeVouchers.count
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   8. SALES REPORT
========================================================= */
exports.getSalesReport = async (req, res) => {
    try {
        const { from, to } = req.query;

        const [rows] = await db.query(
            `SELECT 
                SUM(price) AS total_sales,
                COUNT(*) AS total_vouchers_sold
             FROM voucher_sales
             WHERE created_at BETWEEN ? AND ?`,
            [from || '2000-01-01', to || '2999-12-31']
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   9. ACTIVE USERS (CONNECTED USERS)
========================================================= */
exports.getActiveUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM active_sessions ORDER BY login_time DESC"
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   10. AUDIT LOGS
========================================================= */
exports.getAuditLogs = async (req, res) => {
    try {
        const limit = req.query.limit || 50;

        const [rows] = await db.query(
            "SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?",
            [parseInt(limit)]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
