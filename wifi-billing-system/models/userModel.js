// models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
    /* =========================================================
       CREATE USER
    ========================================================= */
    static async create(userData) {
        const { username, password, role = 'user', email = null } = userData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            `INSERT INTO users (username, password, role, email, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [username, hashedPassword, role, email]
        );
        
        return result.insertId;
    }

    /* =========================================================
       GET USER BY ID
    ========================================================= */
    static async getById(id) {
        const [rows] = await db.query(
            "SELECT id, username, role, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
            [id]
        );
        return rows[0] || null;
    }

    /* =========================================================
       GET USER BY USERNAME
    ========================================================= */
    static async getByUsername(username) {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ? LIMIT 1",
            [username]
        );
        return rows[0] || null;
    }

    /* =========================================================
       GET USER BY EMAIL
    ========================================================= */
    static async getByEmail(email) {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        return rows[0] || null;
    }

    /* =========================================================
       UPDATE USER
    ========================================================= */
    static async update(id, userData) {
        const { username, email, role } = userData;
        
        const [result] = await db.query(
            "UPDATE users SET username = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?",
            [username, email, role, id]
        );
        
        return result.affectedRows > 0;
    }

    /* =========================================================
       UPDATE PASSWORD
    ========================================================= */
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const [result] = await db.query(
            "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
            [hashedPassword, id]
        );
        
        return result.affectedRows > 0;
    }

    /* =========================================================
       DELETE USER
    ========================================================= */
    static async delete(id) {
        const [result] = await db.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );
        
        return result.affectedRows > 0;
    }

    /* =========================================================
       GET ALL USERS WITH PAGINATION
    ========================================================= */
    static async getAll(limit = 50, offset = 0) {
        const [rows] = await db.query(
            `SELECT id, username, role, email, created_at, updated_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    /* =========================================================
       VERIFY PASSWORD
    ========================================================= */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /* =========================================================
       UPDATE REFRESH TOKEN
    ========================================================= */
    static async updateRefreshToken(id, refreshToken) {
        const [result] = await db.query(
            "UPDATE users SET refresh_token = ?, updated_at = NOW() WHERE id = ?",
            [refreshToken, id]
        );
        
        return result.affectedRows > 0;
    }

    /* =========================================================
       GET USER BY REFRESH TOKEN
    ========================================================= */
    static async getByRefreshToken(refreshToken) {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE refresh_token = ? LIMIT 1",
            [refreshToken]
        );
        return rows[0] || null;
    }

    /* =========================================================
       COUNT USERS BY ROLE
    ========================================================= */
    static async countByRole(role) {
        const [rows] = await db.query(
            "SELECT COUNT(*) as count FROM users WHERE role = ?",
            [role]
        );
        return rows[0].count;
    }
}

module.exports = UserModel;
