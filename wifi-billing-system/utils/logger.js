const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
    static log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        // Console output
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);

        // File output
        const logFile = path.join(logsDir, `${level}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }

    static info(message, meta = {}) {
        this.log('info', message, meta);
    }

    static error(message, meta = {}) {
        this.log('error', message, meta);
    }

    static warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    static debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, meta);
        }
    }

    static audit(action, user, target = null, meta = {}) {
        this.log('audit', `${action} by ${user}`, { target, ...meta });
    }
}

module.exports = Logger;
