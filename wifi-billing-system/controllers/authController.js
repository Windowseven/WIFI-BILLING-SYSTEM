// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsupersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // access token
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d'; // refresh token

/* =========================================================
   LOGIN
========================================================= */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ? LIMIT 1",
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT
        const accessToken = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES_IN }
        );

        // Save refresh token in DB
        await db.query(
            "UPDATE users SET refresh_token = ? WHERE id = ?",
            [refreshToken, user.id]
        );

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   REFRESH TOKEN
========================================================= */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(401).json({ error: "No token provided" });

        const [rows] = await db.query(
            "SELECT * FROM users WHERE refresh_token = ? LIMIT 1",
            [refreshToken]
        );

        if (rows.length === 0) return res.status(403).json({ error: "Invalid refresh token" });

        const user = rows[0];

        jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err) => {
            if (err) return res.status(403).json({ error: "Expired refresh token" });
        });

        const newAccessToken = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   LOGOUT
========================================================= */
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "No token provided" });

        // Remove refresh token from DB
        await db.query(
            "UPDATE users SET refresh_token = NULL WHERE refresh_token = ?",
            [refreshToken]
        );

        res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
