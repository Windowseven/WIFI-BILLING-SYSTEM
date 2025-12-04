const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for root to serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🎨 UI Server running at http://localhost:${PORT}`);
    console.log(`📱 Customer Portal: http://localhost:${PORT}/`);
    console.log(`🔐 Admin Portal: http://localhost:${PORT}/admin`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/admin/dashboard.html`);
});
