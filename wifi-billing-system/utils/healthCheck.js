const db = require('../config/db');
const Logger = require('./logger');

class HealthCheck {
    static async checkDatabase() {
        try {
            const [rows] = await db.query('SELECT 1 as test');
            return { status: 'healthy', latency: Date.now() };
        } catch (error) {
            Logger.error('Database health check failed', { error: error.message });
            return { status: 'unhealthy', error: error.message };
        }
    }

    static async checkMemory() {
        const used = process.memoryUsage();
        return {
            status: 'healthy',
            rss: Math.round(used.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
            heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB'
        };
    }

    static async getFullHealth() {
        const startTime = Date.now();
        
        const [database, memory] = await Promise.all([
            this.checkDatabase(),
            this.checkMemory()
        ]);

        const responseTime = Date.now() - startTime;

        return {
            status: database.status === 'healthy' ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            responseTime: `${responseTime}ms`,
            services: {
                database,
                memory
            }
        };
    }
}

module.exports = HealthCheck;
