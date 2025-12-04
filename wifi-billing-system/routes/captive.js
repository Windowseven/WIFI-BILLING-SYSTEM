const express = require('express');
const path = require('path');
const router = express.Router();

// Captive portal login page - serve the HTML file
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Admin routes
router.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

router.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// Captive portal detection endpoints
router.get('/generate_204', (req, res) => {
    // Android captive portal detection
    res.status(204).send();
});

router.get('/hotspot-detect.html', (req, res) => {
    // iOS captive portal detection
    res.send('<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>');
});

router.get('/connecttest.txt', (req, res) => {
    // Windows captive portal detection
    res.send('Microsoft Connect Test');
});

module.exports = router;
