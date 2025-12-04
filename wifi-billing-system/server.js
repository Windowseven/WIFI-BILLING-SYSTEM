require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Temporary fallback for swagger-ui-express
let swaggerUi;
try {
    swaggerUi = require('swagger-ui-express');
} catch (error) {
    swaggerUi = {
        serve: [],
        setup: (specs) => (req, res) => {
            res.json({
                message: 'API Documentation temporarily unavailable',
                note: 'Install swagger-ui-express to enable full documentation',
                specs: specs
            });
        }
    };
}

// Import utilities
const Logger = require('./utils/logger');
const HealthCheck = require('./utils/healthCheck');
const swaggerSpecs = require('./docs/swagger');

// Import middleware
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { generalLimiter, authLimiter, adminLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const hotspotRoutes = require('./routes/hotspot');
const planRoutes = require('./routes/plans');
const sessionRoutes = require('./routes/session');
const voucherRoutes = require('./routes/voucher');
const captiveRoutes = require('./routes/captive');

const app = express();

// Security middleware - Updated for UI integration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api', generalLimiter);

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['http://localhost:3000', 'http://localhost:8080', 'http://10.10.0.1:8080'];
        
        if (!origin) return callback(null, true);
        if (origin.includes('10.10.0.')) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined', {
    stream: {
        write: (message) => Logger.info(message.trim(), { source: 'morgan' })
    }
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Disable x-powered-by header
app.disable('x-powered-by');

// API Documentation
if (swaggerUi.serve.length > 0) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
} else {
    app.get('/api-docs', swaggerUi.setup(swaggerSpecs));
}

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
    try {
        const health = await HealthCheck.getFullHealth();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        Logger.error('Health check failed', { error: error.message });
        res.status(503).json({
            status: 'unhealthy',
            error: 'Health check failed'
        });
    }
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

// Captive portal routes
app.use('/', captiveRoutes);

// UI Routes - Serve our updated pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// API status endpoint
app.get('/api', (req, res) => {
    res.json({ 
        message: 'WiFi Billing System API Running 🚀',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health',
        ui: {
            customer: '/',
            admin: '/admin'
        },
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            admin: '/api/admin',
            payment: '/api/payment',
            hotspot: '/api/hotspot',
            plans: '/api/plans',
            session: '/api/session',
            voucher: '/api/voucher'
        }
    });
});

// Mock API endpoints for UI testing
app.get('/api/admin/dashboard-stats', (req, res) => {
    res.json({
        totalUsers: 247,
        activeSessions: 89,
        vouchersSold: 156,
        totalRevenue: 2850000 // TSh 2,850,000
    });
});

app.get('/api/admin/vouchers', (req, res) => {
    res.json({
        vouchers: [
            {
                id: 1,
                code: 'WIFI-2024-001',
                duration: 60,
                dataLimit: 500, // 500 MB
                price: 12000, // TSh 12,000
                status: 'used',
                created_at: new Date().toISOString(),
                used_by: '192.168.1.101'
            },
            {
                id: 2,
                code: 'WIFI-2024-002',
                duration: 1440,
                dataLimit: 2048, // 2 GB
                price: 35000, // TSh 35,000
                status: 'active',
                created_at: new Date().toISOString(),
                used_by: null
            }
        ]
    });
});

app.get('/api/admin/plans', (req, res) => {
    res.json({
        plans: [
            {
                id: 1,
                name: '500MB - 1 Hour',
                duration: 60,
                dataLimit: 500,
                price: 12000,
                pricePerMB: 24,
                status: 'active'
            },
            {
                id: 2,
                name: '1GB - 2 Hours',
                duration: 120,
                dataLimit: 1024,
                price: 20000,
                pricePerMB: 19.5,
                status: 'active'
            },
            {
                id: 3,
                name: '2GB - 24 Hours',
                duration: 1440,
                dataLimit: 2048,
                price: 35000,
                pricePerMB: 17.1,
                status: 'active'
            },
            {
                id: 4,
                name: '5GB - Weekly',
                duration: 10080,
                dataLimit: 5120,
                price: 75000,
                pricePerMB: 14.6,
                status: 'active'
            }
        ]
    });
});

app.get('/api/admin/sessions', (req, res) => {
    res.json({
        sessions: [
            {
                id: 1,
                ip: '192.168.1.101',
                device: 'Mobile',
                timeLeft: '45m 23s',
                dataUsed: 234,
                dataLimit: 500,
                dataRemaining: 266,
                status: 'active'
            }
        ],
        stats: {
            total: 12,
            active: 8,
            expiring: 3,
            bandwidth: '2.4 GB'
        }
    });
});

app.get('/api/admin/customers', (req, res) => {
    res.json({
        customers: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+255 234 567 890',
                status: 'active',
                totalSpent: 105000 // TSh 105,000
            }
        ],
        stats: {
            total: 156,
            active: 89,
            new: 12,
            revenue: 5460000 // TSh 5,460,000
        }
    });
});

app.get('/api/admin/analytics', (req, res) => {
    res.json({
        totalRevenue: '29,050,000', // TSh 29,050,000
        totalUsers: '2,847',
        avgSessionTime: '2h 34m',
        dataUsage: '847 GB'
    });
});

// Plan management endpoints
app.post('/api/admin/plans', (req, res) => {
    const { name, duration, dataLimit, price } = req.body;
    const pricePerMB = Math.round((price / dataLimit) * 100) / 100;
    
    res.json({
        success: true,
        plan: {
            id: Date.now(),
            name,
            duration,
            dataLimit,
            price,
            pricePerMB,
            status: 'active'
        }
    });
});

app.put('/api/admin/plans/:id', (req, res) => {
    const { name, duration, dataLimit, price } = req.body;
    const pricePerMB = Math.round((price / dataLimit) * 100) / 100;
    
    res.json({
        success: true,
        plan: {
            id: req.params.id,
            name,
            duration,
            dataLimit,
            price,
            pricePerMB,
            status: 'active'
        }
    });
});

app.post('/api/vouchers/redeem', (req, res) => {
    const { voucherCode } = req.body;
    
    if (voucherCode && voucherCode.length > 0) {
        res.json({
            success: true,
            message: 'Voucher redeemed successfully!',
            redirectUrl: '/success.html'
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Invalid voucher code'
        });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        res.json({
            success: true,
            token: 'mock-jwt-token',
            redirectUrl: '/admin/dashboard.html'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// 404 handler for API routes
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            error: 'API endpoint not found',
            path: req.path
        });
    } else {
        next();
    }
});

// Global error handler
app.use(globalErrorHandler);

// Start session cleanup interval
try {
    const sessionCleaner = require("./cron/sessionCleaner");
    setInterval(() => {
        try {
            sessionCleaner.runCleaner();
            Logger.info('Session cleanup completed');
        } catch (error) {
            Logger.error('Session cleaner error', { error: error.message });
        }
    }, 60 * 1000);
    Logger.info('Session cleaner started');
} catch (error) {
    Logger.warn('Session cleaner not available', { error: error.message });
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
    Logger.info(`${signal} received, shutting down gracefully`);
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for captive portal
const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 WiFi Billing System Server running on http://${HOST}:${PORT}`);
    console.log(`📱 Customer Portal: http://10.10.0.1:${PORT}/`);
    console.log(`🔐 Admin Portal: http://10.10.0.1:${PORT}/admin`);
    console.log(`📊 Dashboard: http://10.10.0.1:${PORT}/admin/dashboard.html`);
    console.log(`📚 API Docs: http://10.10.0.1:${PORT}/api-docs`);
    console.log(`❤️  Health Check: http://10.10.0.1:${PORT}/health`);
    console.log(`💰 Currency: TSh (Tanzanian Shilling)`);
    console.log(`📡 Captive Portal Ready for Ubuntu Setup`);
    
    Logger.info(`Server running on ${HOST}:${PORT}`, {
        host: HOST,
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        currency: 'TSh',
        captivePortal: true
    });
});

// Handle server errors
server.on('error', (error) => {
    Logger.error('Server error', { error: error.message });
});

module.exports = app;
