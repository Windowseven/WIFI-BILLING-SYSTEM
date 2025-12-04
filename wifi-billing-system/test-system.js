const express = require('express');
const path = require('path');

// Simple test server
const app = express();

// Serve static files
app.use(express.static('public'));

// Test routes
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'WiFi Billing System is running'
    });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

app.get('/', (req, res) => {
    res.json({
        message: 'WiFi Billing System Test Server',
        endpoints: {
            health: '/health',
            login: '/login',
            admin: '/admin'
        }
    });
});

const PORT = 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test server running on http://0.0.0.0:${PORT}`);
    console.log(`🔐 Captive Portal: http://localhost:${PORT}/login`);
    console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;
