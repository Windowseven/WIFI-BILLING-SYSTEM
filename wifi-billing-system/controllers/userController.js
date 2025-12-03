// controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

/* =========================================================
   GET USER PROFILE
========================================================= */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [rows] = await db.query(
            "SELECT id, username, role, created_at FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   UPDATE USER PROFILE
========================================================= */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username } = req.body;

        // Check if username already exists (excluding current user)
        const [existing] = await db.query(
            "SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1",
            [username, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        await db.query(
            "UPDATE users SET username = ? WHERE id = ?",
            [username, userId]
        );

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Get current user
        const [rows] = await db.query(
            "SELECT password FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        // Verify current password
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedNewPassword, userId]
        );

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
