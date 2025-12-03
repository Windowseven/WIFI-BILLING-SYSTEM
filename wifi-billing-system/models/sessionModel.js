// models/sessionModel.js
const db = require('../config/db');

class SessionModel {
    /* =========================================================
       CREATE SESSION
    ========================================================= */
    static async create(sessionData) {
        const { 
            user_id, 
            voucher_id, 
            mac_address, 
            ip_address, 
            start_time, 
            duration_minutes, 
            data_limit_mb 
        } = sessionData;
        
        const [result] = await db.query(
            `INSERT INTO sessions (user_id, voucher_id, mac_address, ip_address, 
             start_time, duration_minutes, data_limit_mb, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
            [user_id, voucher_id, mac_address, ip_address, start_time, duration_minutes, data_limit_mb]
        );
        
        return result.insertId;
    }

    /* =========================================================
       GET SESSION BY ID
    ========================================================= */
    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM sessions WHERE id = ? LIMIT 1",
            [id]
        );
        return rows[0] || null;
    }

    /* =========================================================
       GET ACTIVE SESSIONS BY USER
    ========================================================= */
    static async getActiveByUser(userId) {
        const [rows] = await db.query(
            "SELECT * FROM sessions WHERE user_id = ? AND status = 'active' ORDER BY start_time DESC",
            [userId]
        );
        return rows;
    }

    /* =========================================================
       GET SESSION BY MAC ADDRESS
    ========================================================= */
    static async getByMacAddress(macAddress) {
        const [rows] = await db.query(
            "SELECT * FROM sessions WHERE mac_address = ? AND status = 'active' LIMIT 1",
            [macAddress]
        );
        return rows[0] || null;
    }

    /* =========================================================
       UPDATE SESSION STATUS
    ========================================================= */
    static async updateStatus(id, status, endTime = null) {
        let query = "UPDATE sessions SET status = ?, updated_at = NOW()";
        let params = [status];
        
        if (endTime) {
            query += ", end_time = ?";
            params.push(endTime);
        }
        
        query += " WHERE id = ?";
        params.push(id);
        
        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    }

    /* =========================================================
       UPDATE DATA USAGE
    ========================================================= */
    static async updateDataUsage(id, dataUsedMb) {
        const [result] = await db.query(
            "UPDATE sessions SET data_used_mb = ?, updated_at = NOW() WHERE id = ?",
            [dataUsedMb, id]
        );
        return result.affectedRows > 0;
    }

    /* =========================================================
       GET EXPIRED SESSIONS
    ========================================================= */
    static async getExpiredSessions() {
        const [rows] = await db.query(
            `SELECT * FROM sessions 
             WHERE status = 'active' 
             AND (
                 (duration_minutes > 0 AND TIMESTAMPDIFF(MINUTE, start_time, NOW()) >= duration_minutes)
                 OR 
                 (data_limit_mb > 0 AND data_used_mb >= data_limit_mb)
             )`
        );
        return rows;
    }

    /* =========================================================
       GET ALL SESSIONS WITH PAGINATION
    ========================================================= */
    static async getAll(limit = 50, offset = 0) {
        const [rows] = await db.query(
            `SELECT s.*, u.username, v.code as voucher_code 
             FROM sessions s 
             LEFT JOIN users u ON s.user_id = u.id 
             LEFT JOIN vouchers v ON s.voucher_id = v.id 
             ORDER BY s.start_time DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    /* =========================================================
       DELETE OLD SESSIONS
    ========================================================= */
    static async deleteOldSessions(daysOld = 30) {
        const [result] = await db.query(
            "DELETE FROM sessions WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
            [daysOld]
        );
        return result.affectedRows;
    }
}

module.exports = SessionModel;
