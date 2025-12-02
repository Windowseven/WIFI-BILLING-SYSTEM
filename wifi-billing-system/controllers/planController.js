// controllers/planController.js
// ======================================================
//  PLAN CONTROLLER — Full professional CRUD
//  Handles: create, list, get single, update, delete
//  Includes: input validation, SQL safety, dynamic update
// ======================================================

const db = require('../config/db');
const { validationResult } = require('express-validator');

// Helper: Convert to number safely
const toNumber = (v, d = 0) =>
  (v === undefined || v === null || v === '') ? d : Number(v);

/* =========================================================
   CREATE PLAN
   ---------------------------------------------------------
   - Validates input
   - Checks for duplicate plan name
   - Inserts new plan into DB
   - Supports: price_tsh, data_limit_mb, duration_minutes,
               device_limit, is_offer
========================================================= */
exports.createPlan = async (req, res) => {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      name,
      price_tsh = 0,
      data_limit_mb = 0,
      duration_minutes = 60,
      device_limit = 1,
      is_offer = 0
    } = req.body;

    // Ensure plan name is unique
    const [exists] = await db.query(
      'SELECT id FROM plans WHERE name = ? LIMIT 1',
      [name]
    );
    if (exists.length)
      return res.status(400).json({
        error: 'A plan with this name already exists'
      });

    // Insert new plan
    const [result] = await db.query(
      `INSERT INTO plans 
       (name, price_tsh, data_limit_mb, duration_minutes, device_limit, is_offer, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        toNumber(price_tsh, 0),
        toNumber(data_limit_mb, 0),
        toNumber(duration_minutes, 60),
        toNumber(device_limit, 1),
        is_offer ? 1 : 0
      ]
    );

    // Return the created plan
    const [rows] = await db.query(
      'SELECT * FROM plans WHERE id = ? LIMIT 1',
      [result.insertId]
    );

    return res.status(201).json({ plan: rows[0] });
  } catch (err) {
    console.error('createPlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/* =========================================================
   LIST ALL PLANS
   ---------------------------------------------------------
   - Returns all plans
   - Ordered from newest to oldest
========================================================= */
exports.listPlans = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plans ORDER BY id DESC');
    return res.json({ plans: rows });
  } catch (err) {
    console.error('listPlans error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/* =========================================================
   GET SINGLE PLAN BY ID
========================================================= */
exports.getPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM plans WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ error: 'Plan not found' });

    return res.json({ plan: rows[0] });
  } catch (err) {
    console.error('getPlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/* =========================================================
   UPDATE PLAN
   ---------------------------------------------------------
   - Supports partial updates (only fields provided)
   - Dynamically builds SQL UPDATE statement
========================================================= */
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price_tsh,
      data_limit_mb,
      duration_minutes,
      device_limit,
      is_offer
    } = req.body;

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (price_tsh !== undefined) {
      updates.push('price_tsh = ?');
      params.push(toNumber(price_tsh, 0));
    }

    if (data_limit_mb !== undefined) {
      updates.push('data_limit_mb = ?');
      params.push(toNumber(data_limit_mb, 0));
    }

    if (duration_minutes !== undefined) {
      updates.push('duration_minutes = ?');
      params.push(toNumber(duration_minutes, 60));
    }

    if (device_limit !== undefined) {
      updates.push('device_limit = ?');
      params.push(toNumber(device_limit, 1));
    }

    if (is_offer !== undefined) {
      updates.push('is_offer = ?');
      params.push(is_offer ? 1 : 0);
    }

    // Nothing to update
    if (updates.length === 0)
      return res.status(400).json({ error: 'No fields to update' });

    // Final SQL
    params.push(id);
    const sql = `UPDATE plans SET ${updates.join(', ')} WHERE id = ?`;

    await db.query(sql, params);

    // Return updated plan
    const [rows] = await db.query(
      'SELECT * FROM plans WHERE id = ? LIMIT 1',
      [id]
    );

    return res.json({ plan: rows[0] });
  } catch (err) {
    console.error('updatePlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/* =========================================================
   DELETE PLAN
   ---------------------------------------------------------
   - Checks if plan has vouchers already assigned
   - Blocks deletion if in use (prevents system corruption)
========================================================= */
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting a plan used in vouchers
    const [used] = await db.query(
      'SELECT COUNT(*) AS cnt FROM vouchers WHERE plan_id = ?',
      [id]
    );

    if (used[0].cnt > 0) {
      return res.status(400).json({
        error: 'Plan is in use by existing vouchers; deletion blocked'
      });
    }

    // Delete plan
    await db.query('DELETE FROM plans WHERE id = ?', [id]);

    return res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('deletePlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
/* =========================================================
   END OF PLAN CONTROLLER
========================================================= */