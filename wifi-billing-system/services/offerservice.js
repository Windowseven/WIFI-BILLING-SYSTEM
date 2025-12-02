// services/OfferService.js
// --------------------------------------------------------------
// Offer Engine: Auto-generate free voucher for new MAC address
// Triggered when a new device connects to hotspot
// --------------------------------------------------------------

const db = require('../config/db');

module.exports = {
    
    // STEP 1: Check if MAC address already exists in users table
    async checkIfNewUser(mac) {
        const [rows] = await db.execute(
            "SELECT id, got_free_offer FROM users WHERE mac_address = ?",
            [mac]
        );
        return rows.length ? rows[0] : null;
    },

    // STEP 2: Register new user with got_free_offer = 0
    async registerNewUser(mac) {
        const [result] = await db.execute(
            "INSERT INTO users (mac_address, got_free_offer, created_at) VALUES (?, 0, NOW())",
            [mac]
        );
        return result.insertId;
    },

    // STEP 3: Create free voucher for this user
    async generateFreeVoucher(userId, planId = 1) {
        const [result] = await db.execute(
            `INSERT INTO vouchers (user_id, plan_id, price_paid, is_free_offer, status, created_at)
             VALUES (?, ?, 0, 1, 'unused', NOW())`,
            [userId, planId]
        );
        return result.insertId;
    },

    // STEP 4: Mark user as having received a free offer
    async markOfferGiven(userId) {
        await db.execute(
            "UPDATE users SET got_free_offer = 1 WHERE id = ?",
            [userId]
        );
    }
};
