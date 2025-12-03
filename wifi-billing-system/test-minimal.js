require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test database connection
const db = require('./config/db');

// Basic routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'WiFi Billing System API',
        status: 'running',
        version: '1.0.0'
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
        res.json({ database: 'connected', users: rows[0].count });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
