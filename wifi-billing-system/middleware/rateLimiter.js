// Temporary fallback rate limiter (replace when express-rate-limit is available)
const createLimiter = (max, windowMs, message) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!requests.has(ip)) {
            requests.set(ip, []);
        }
        
        const ipRequests = requests.get(ip).filter(time => time > windowStart);
        
        if (ipRequests.length >= max) {
            return res.status(429).json(message);
        }
        
        ipRequests.push(now);
        requests.set(ip, ipRequests);
        next();
    };
};

// General API rate limiter
exports.generalLimiter = createLimiter(100, 15 * 60 * 1000, {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
});

// Strict limiter for auth endpoints
exports.authLimiter = createLimiter(5, 15 * 60 * 1000, {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
});

// Admin endpoints limiter
exports.adminLimiter = createLimiter(50, 15 * 60 * 1000, {
    error: 'Too many admin requests, please try again later.',
    retryAfter: '15 minutes'
});
