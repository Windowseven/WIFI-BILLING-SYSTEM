// controllers/planController.js
const db = require('../config/db');

/* =========================================================
   CREATE PLAN
========================================================= */
exports.createPlan = async (req, res) => {
    try {
        const { name, price, duration_minutes, speed_mbps = null } = req.body;

        // Check if plan name exists
        const [existing] = await db.query(
            "SELECT id FROM plans WHERE name = ? LIMIT 1",
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Plan name already exists" });
        }

        await db.query(
            "INSERT INTO plans (name, price, duration_minutes, speed_mbps) VALUES (?, ?, ?, ?)",
            [name, price, duration_minutes, speed_mbps]
        );

        res.json({ message: "Plan created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   LIST PLANS
========================================================= */
exports.listPlans = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM plans ORDER BY id DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   UPDATE PLAN
========================================================= */
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, duration_minutes, speed_mbps } = req.body;

        // Update plan dynamically
        const updates = [];
        const params = [];

        if (name) { updates.push("name = ?"); params.push(name); }
        if (price) { updates.push("price = ?"); params.push(price); }
        if (duration_minutes) { updates.push("duration_minutes = ?"); params.push(duration_minutes); }
        if (speed_mbps !== undefined) { updates.push("speed_mbps = ?"); params.push(speed_mbps); }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        params.push(id);

        const sql = `UPDATE plans SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(sql, params);

        res.json({ message: "Plan updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

/* =========================================================
   DELETE PLAN
========================================================= */
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM plans WHERE id = ?", [id]);

        res.json({ message: "Plan deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
