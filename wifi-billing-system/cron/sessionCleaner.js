/**
 * ============================================================
 * SESSION & VOUCHER EXPIRY ENGINE (CRON JOB)
 * ------------------------------------------------------------
 * Runs every 1 minute:
 *  - Auto-expires sessions past expiry time
 *  - Auto-expires vouchers past validity (duration)
 *  - Cleans zombie sessions (no updates for long time)
 * ============================================================
 */

const db = require("../config/db");

module.exports.runCleaner = async () => {
    console.log("⏳ Running Session Expiry Engine...");

    try {
        // ================================
        // 1. EXPIRE SESSIONS
        // ================================
        await db.query(`
            UPDATE sessions 
            SET status = 'expired' 
            WHERE status = 'active' 
            AND expires_at < NOW()
        `);

        // ================================
        // 2. EXPIRE VOUCHERS
        // ================================
        await db.query(`
            UPDATE vouchers 
            SET status = 'expired'
            WHERE status = 'active'
            AND expiry_time < NOW()
        `);

        // ================================
        // 3. CLEAN ZOMBIE SESSIONS
        // (No activity for 10 minutes)
        // ================================
        await db.query(`
            UPDATE sessions 
            SET status = 'expired'
            WHERE status = 'active'
            AND last_activity < (NOW() - INTERVAL 10 MINUTE)
        `);

        console.log("✅ Session Expiry Engine completed");

    } catch (err) {
        console.error("❌ SessionCleaner Error:", err);
    }
};
