require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./cron/disconnect'); // add near top of server.js

const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const hotspotRoutes = require('./routes/hotspot');





const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(cookieParser());
app.use(express.json());
//app.use(helmet());
app.disable('x-powered-by');

// if you expose any cookie-backed session endpoints, enable csurf for them
// const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' } });
// app.use('/api/admin', csrfProtection);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/hotspot', hotspotRoutes);

// Basic route
app.get('/', (req, res) => res.send('WiFi Billing System API Running 🚀'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
