// controllers/hotspotController.js
/**
 * Hotspot Controller
 * - authorize: portal asks if voucher/mac/ip allowed -> returns session_token, expires_at, speed
 * - accounting: portal reports start/update/stop and data usage (for accounting)
 * - logout: portal requests session termination
 * - status: optional endpoint to check session info
 *
 * Important:
 * - All hotspot endpoints that change state should be protected with hotspotAuth middleware
 * - Responses are JSON and include clear fields the portal can parse
 */

const db = require('../config/db');
const crypto = require('crypto');
const { isValidIPv4 } = require('../utils/iptables'); // reuse validation
const HOTSPOT_DEFAULT_SPEED = 1; // default speed if plan doesn't set

// Helper: generate secure session token
function genToken(len = 40) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

// Convert minutes to MySQL DATETIME string
function minutesFromNow(min) {
  const t = new Date(Date.now() + min * 60000);
  return t.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = {
  /**
   * Authorize (portal calls this when user submits voucher / when captive portal checks)
   * Expected body: { voucher_code, mac_address, ip }
   * Returns: { allowed: true/false, reason?:string, session_token, expires_at, speed_mbps }
   */
  authorize: async (req, res) => {
    try {
      const { voucher_code, mac_address, ip } = req.body;
      if (!voucher_code || !mac_address || !ip) {
        return res.status(400).json({ allowed: false, reason: 'voucher_code, mac_address and ip required' });
      }
      if (!isValidIPv4(ip)) return res.status(400).json({ allowed: false, reason: 'invalid ip' });

      // 1) Fetch voucher + plan
      const [vrows] = await db.query(
        `SELECT v.*, p.data_limit_mb AS plan_data_limit, p.duration_minutes AS plan_duration, p.speed_mbps AS plan_speed
         FROM vouchers v
         LEFT JOIN plans p ON v.plan_id = p.id
         WHERE v.code = ? LIMIT 1`,
        [voucher_code]
      );

      if (!vrows.length) {
        return res.status(404).json({ allowed: false, reason: 'voucher not found' });
      }

      const voucher = vrows[0];

      // 2) Check voucher status / expiry_date
      if (voucher.status === 'expired') {
        return res.status(403).json({ allowed: false, reason: 'voucher expired' });
      }
      if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
        // mark expired
        await db.query('UPDATE vouchers SET status = ? WHERE id = ?', ['expired', voucher.id]);
        return res.status(403).json({ allowed: false, reason: 'voucher expired by date' });
      }

      // 3) Device limit: count active sessions for this voucher (distinct mac_address)
      const [countRows] = await db.query(
        `SELECT COUNT(DISTINCT mac_address) AS cnt
         FROM sessions WHERE voucher_id = ? AND status = 'active'`,
        [voucher.id]
      );
      const activeDevices = parseInt(countRows[0].cnt || 0, 10);
      if (voucher.device_limit && activeDevices >= voucher.device_limit) {
        return res.status(403).json({ allowed: false, reason: 'device limit reached' });
      }

      // 4) Payment check (allow only if payment recorded OR voucher is free)
      // We consider vouchers with status 'active' and/or associated completed payment
      if (voucher.price_paid && Number(voucher.price_paid) > 0) {
        const [pay] = await db.query('SELECT id FROM payments WHERE voucher_id = ? AND status = "completed" LIMIT 1', [voucher.id]);
        if (!pay.length) {
          return res.status(402).json({ allowed: false, reason: 'payment required' });
        }
      }
      // If price_paid is 0 or voucher marked free, allow

      // 5) Generate session: set token and expires_at by plan duration or voucher.duration_minutes
      const durationMinutes = voucher.duration_minutes || voucher.plan_duration || 60;
      const expiresAt = minutesFromNow(durationMinutes);
      const sessionToken = genToken(40);

      const insert = await db.query(
        `INSERT INTO sessions
         (user_id, device_index, voucher_id, ip, mac_address, session_token, started_at, expires_at, last_activity, data_used_mb, session_speed_mbps, status)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), 0, ?, 'active')`,
        [
          voucher.user_id || null,
          1, // device_index default - for multi-device support extend logic later
          voucher.id,
          ip,
          mac_address,
          sessionToken,
          expiresAt,
          voucher.plan_speed || voucher.speed_mbps || HOTSPOT_DEFAULT_SPEED
        ]
      );

      // 6) Optionally update voucher status (single-use)
      if (voucher.device_limit === 1) {
        await db.query('UPDATE vouchers SET status = ? WHERE id = ?', ['used', voucher.id]);
      }

      // 7) Audit log
      await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
        'hotspot', 'authorize', `voucher:${voucher.id}|mac:${mac_address}`
      ]);

      // 8) Return allow
      return res.json({
        allowed: true,
        session_token: sessionToken,
        expires_at: expiresAt,
        speed_mbps: voucher.plan_speed || voucher.speed_mbps || HOTSPOT_DEFAULT_SPEED
      });
    } catch (err) {
      console.error('hotspot authorize error', err);
      return res.status(500).json({ allowed: false, reason: 'server error' });
    }
  },

  /**
   * Accounting endpoint (start/update/stop)
   * Expected body:
   * { session_token, event: 'start'|'update'|'stop', data_used_mb (optional), ip (optional) }
   * Protected by hotspotAuth middleware.
   */
  accounting: async (req, res) => {
    try {
      const { session_token, event, data_used_mb = 0, ip } = req.body;
      if (!session_token || !event) return res.status(400).json({ error: 'session_token and event required' });

      const [srows] = await db.query('SELECT * FROM sessions WHERE session_token = ? LIMIT 1', [session_token]);
      if (!srows.length) return res.status(404).json({ error: 'session not found' });
      const session = srows[0];

      // update last_activity and ip (if provided)
      const updates = [];
      const params = [];
      updates.push('last_activity = NOW()');

      if (ip && isValidIPv4(ip)) {
        updates.push('ip = ?');
        params.push(ip);
      }

      // For update event, increment data
      if (event === 'update') {
        const newData = (session.data_used_mb || 0) + Number(data_used_mb || 0);
        updates.push('data_used_mb = ?');
        params.push(newData);

        // If data limit exceeded -> expire session and optionally block
        const [vrows] = await db.query('SELECT data_limit_mb FROM vouchers WHERE id = ? LIMIT 1', [session.voucher_id]);
        const voucher = vrows[0] || {};
        if (voucher.data_limit_mb && voucher.data_limit_mb > 0 && newData >= voucher.data_limit_mb) {
          // expire session
          await db.query('UPDATE sessions SET status = ?, end_time = NOW() WHERE id = ?', ['expired', session.id]);
          // mark voucher used if needed
          await db.query('UPDATE vouchers SET status = ? WHERE id = ?', ['used', session.voucher_id]);
          await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
            'hotspot', 'data_limit_expired', `session:${session.id}`
          ]);
          return res.json({ message: 'data limit reached; session expired' });
        }
      }

      // For stop event - close session
      if (event === 'stop') {
        await db.query('UPDATE sessions SET status = ?, end_time = NOW(), last_activity = NOW() WHERE id = ?', ['stopped', session.id]);
        await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
          'hotspot', 'stop', `session:${session.id}`
        ]);
        return res.json({ message: 'session stopped' });
      }

      // apply updates for start/update
      if (params.length) {
        params.push(session.id);
        const sql = `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(sql, params);
      } else {
        // if only last_activity update
        await db.query('UPDATE sessions SET last_activity = NOW() WHERE id = ?', [session.id]);
      }

      return res.json({ message: 'accounting updated' });
    } catch (err) {
      console.error('hotspot accounting error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  /**
   * Logout endpoint - portal calls to free resources
   * Body: { session_token }
   */
  logout: async (req, res) => {
    try {
      const { session_token } = req.body;
      if (!session_token) return res.status(400).json({ error: 'session_token required' });

      const [srows] = await db.query('SELECT * FROM sessions WHERE session_token = ? LIMIT 1', [session_token]);
      if (!srows.length) return res.status(404).json({ error: 'session not found' });
      const session = srows[0];

      await db.query('UPDATE sessions SET status = ?, end_time = NOW() WHERE id = ?', ['stopped', session.id]);
      await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
        'hotspot', 'logout', `session:${session.id}`
      ]);

      return res.json({ message: 'session logged out' });
    } catch (err) {
      console.error('hotspot logout error', err);
      return res.status(500).json({ error: 'server error' });
    }
  },

  /**
   * Status: optional helper for debugging / portal status checks
   * Query: ?session_token=...
   */
  status: async (req, res) => {
    try {
      const token = req.query.session_token;
      if (!token) return res.status(400).json({ error: 'session_token required' });

      const [rows] = await db.query('SELECT id, voucher_id, ip, mac_address, started_at, expires_at, last_activity, data_used_mb, status FROM sessions WHERE session_token = ? LIMIT 1', [token]);
      if (!rows.length) return res.status(404).json({ error: 'session not found' });

      return res.json({ session: rows[0] });
    } catch (err) {
      console.error('hotspot status error', err);
      return res.status(500).json({ error: 'server error' });
    }
  }
};
