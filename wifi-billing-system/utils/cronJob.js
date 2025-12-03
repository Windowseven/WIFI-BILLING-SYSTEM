// utils/cronJob.js
const cron = require('node-cron');
const SessionModel = require('../models/sessionModel');
const { disconnectUser } = require('./iptables');

/* =========================================================
   SESSION CLEANUP CRON JOB
========================================================= */
const startSessionCleanup = () => {
    // Run every minute to check for expired sessions
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running session cleanup...');
            
            // Get expired sessions
            const expiredSessions = await SessionModel.getExpiredSessions();
            
            for (const session of expiredSessions) {
                try {
                    // Disconnect user from network
                    await disconnectUser(session.mac_address, session.ip_address);
                    
                    // Update session status
                    await SessionModel.updateStatus(session.id, 'expired', new Date());
                    
                    console.log(`Disconnected expired session: ${session.id}`);
                } catch (error) {
                    console.error(`Error disconnecting session ${session.id}:`, error);
                }
            }
            
            if (expiredSessions.length > 0) {
                console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
            }
        } catch (error) {
            console.error('Session cleanup error:', error);
        }
    });
    
    console.log('Session cleanup cron job started');
};

/* =========================================================
   OLD DATA CLEANUP CRON JOB
========================================================= */
const startDataCleanup = () => {
    // Run daily at 2 AM to clean old data
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('Running old data cleanup...');
            
            // Delete sessions older than 30 days
            const deletedSessions = await SessionModel.deleteOldSessions(30);
            
            console.log(`Deleted ${deletedSessions} old sessions`);
        } catch (error) {
            console.error('Data cleanup error:', error);
        }
    });
    
    console.log('Data cleanup cron job started');
};

/* =========================================================
   START ALL CRON JOBS
========================================================= */
const startAllCronJobs = () => {
    startSessionCleanup();
    startDataCleanup();
    console.log('All cron jobs started successfully');
};

module.exports = {
    startSessionCleanup,
    startDataCleanup,
    startAllCronJobs
};
