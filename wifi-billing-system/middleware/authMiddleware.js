// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/* =========================================================
   requireAuth - verify JWT
========================================================= */
exports.requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ error: 'Invalid or expired token' });
            req.user = decoded; // attach user info to request
            next();
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

/* =========================================================
   requireRole - check user role
========================================================= */
exports.requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        next();
    };
};

