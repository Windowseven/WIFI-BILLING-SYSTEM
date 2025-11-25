// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// strict rate limiter for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window per IP
  message: { error: 'Too many login attempts, try again later.' }
});

router.post(
  '/login',
  loginLimiter,
  body('username').trim().isLength({ min: 3 }),
  body('password').isLength({ min: 8 }),
  authController.login
);

router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
