require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Import middleware
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const hotspotRoutes = require('./routes/hotspot');
const planRoutes = require('./routes/plans');
const sessionRoutes = require('./routes/session');
const voucherRoutes = require('./routes/voucher');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Disable x-powered-by header
app.disable('x-powered-by');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/hotspot', hotspotRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/voucher', voucherRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'WiFi Billing System API Running 🚀',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            admin: '/api/admin',
            payment: '/api/payment',
            hotspot: '/api/hotspot',
            plans: planRoutes ? '/api/plans' : 'Not available',
            session: sessionRoutes ? '/api/session' : 'Not available',
            voucher: voucherRoutes ? '/api/voucher' : 'Not available',
            health: '/health'
        }
    });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start session cleanup interval (optional, only if sessionCleaner exists)
try {
    const sessionCleaner = require("./cron/sessionCleaner");
    setInterval(() => {
        try {
            sessionCleaner.runCleaner();
        } catch (error) {
            console.error('Session cleaner error:', error);
        }
    }, 60 * 1000); // Run every minute
    console.log('Session cleaner started');
} catch (error) {
    console.warn('Session cleaner not available:', error.message);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

module.exports = app;
