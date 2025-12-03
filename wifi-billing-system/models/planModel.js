// models/planModel.js
const db = require('../config/db');

class PlanModel {
    /* =========================================================
       CREATE PLAN
    ========================================================= */
    static async create(planData) {
        const { name, description, price, duration_minutes, data_limit_mb, device_limit } = planData;
        
        const [result] = await db.query(
            `INSERT INTO plans (name, description, price, duration_minutes, data_limit_mb, device_limit, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [name, description, price, duration_minutes, data_limit_mb, device_limit]
        );
        
        return result.insertId;
    }

    /* =========================================================
       GET ALL PLANS
    ========================================================= */
    static async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM plans WHERE active = 1 ORDER BY price ASC"
        );
        return rows;
    }

    /* =========================================================
       GET PLAN BY ID
    ========================================================= */
    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM plans WHERE id = ? AND active = 1 LIMIT 1",
            [id]
        );
        return rows[0] || null;
    }

    /* =========================================================
       UPDATE PLAN
    ========================================================= */
    static async update(id, planData) {
        const { name, description, price, duration_minutes, data_limit_mb, device_limit } = planData;
        
        const [result] = await db.query(
            `UPDATE plans SET name = ?, description = ?, price = ?, 
             duration_minutes = ?, data_limit_mb = ?, device_limit = ?, updated_at = NOW()
             WHERE id = ?`,
            [name, description, price, duration_minutes, data_limit_mb, device_limit, id]
        );
        
        return result.affectedRows > 0;
    }

    /* =========================================================
       DELETE PLAN (SOFT DELETE)
    ========================================================= */
    static async delete(id) {
        const [result] = await db.query(
            "UPDATE plans SET active = 0, updated_at = NOW() WHERE id = ?",
            [id]
        );
        
        return result.affectedRows > 0;
    }

    /* =========================================================
       GET ACTIVE PLANS COUNT
    ========================================================= */
    static async getActiveCount() {
        const [rows] = await db.query(
            "SELECT COUNT(*) as count FROM plans WHERE active = 1"
        );
        return rows[0].count;
    }
}

module.exports = PlanModel;
