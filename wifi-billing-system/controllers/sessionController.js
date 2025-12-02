// controllers/sessionController.js
const db = require('../config/db');
const { blockIp, unblockIp, isValidIPv4 } = require('../utils/iptables');

/**
 * Start session: validate voucher, enforce device limit, create session row,
 * bind mac + ip for auto-login.
 *
 * Expected body:
 * { voucher_code, mac, ip, device_info (optional), user_id (optional - guest) }
 */
exports.startSession = async (req, res) => {
  try {
    const { voucher_code, mac, ip, device_info, user_id = null } = req.body;
    if (!voucher_code || !mac || !ip) return res.status(400).json({ error: 'voucher_code, mac and ip required' });
    if (!isValidIPv4(ip)) return res.status(400).json({ error: 'Invalid IP' });

    // fetch voucher
    const [vrows] = await db.query('SELECT * FROM vouchers WHERE code = ? AND status = "active" LIMIT 1', [voucher_code]);
    if (vrows.length === 0) return res.status(404).json({ error: 'Voucher not found or inactive' });
    const voucher = vrows[0];

    // check expiry date
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      await db.query('UPDATE vouchers SET status="expired" WHERE id=?', [voucher.id]);
      return res.status(400).json({ error: 'Voucher expired' });
    }

    // device limit: count active sessions with same voucher & distinct macs
    const [activeSessions] = await db.query(
      'SELECT COUNT(DISTINCT mac) AS cnt FROM sessions WHERE voucher_id = ? AND status = "active"',
      [voucher.id]
    );
    const deviceCount = activeSessions[0].cnt || 0;
    if (voucher.device_limit && deviceCount >= voucher.device_limit) {
      return res.status(403).json({ error: 'Device limit reached for this voucher' });
    }

    // create session
    const [result] = await db.query(
      `INSERT INTO sessions (user_id, voucher_id, ip, mac, start_time, status)
       VALUES (?, ?, ?, ?, NOW(), 'active')`,
      [user_id, voucher.id, ip, mac]
    );

    const sessionId = result.insertId;

    // Optionally mark voucher as used if it's single-use
    // Comment or modify this based on your voucher logic (status 'used' vs reusable)
    if (voucher.device_limit === 1) {
      await db.query('UPDATE vouchers SET status="used" WHERE id=?', [voucher.id]);
    }

    // Log admin_audit_logs or admin_audit_logs table (if needed)
    await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
      'system', 'start_session', `session:${sessionId}`
    ]);

    return res.json({ message: 'Session started', session_id: sessionId, voucher_id: voucher.id });
  } catch (err) {
    console.error('startSession error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update session usage - called periodically by hotspot to report usage (MB)
 * Body: { session_id, data_used_mb }
 */
exports.updateSession = async (req, res) => {
  try {
    const { session_id, data_used_mb } = req.body;
    if (!session_id || data_used_mb === undefined) return res.status(400).json({ error: 'session_id and data_used_mb required' });

    // fetch session + voucher
    const [srows] = await db.query('SELECT * FROM sessions WHERE id = ? LIMIT 1', [session_id]);
    if (srows.length === 0) return res.status(404).json({ error: 'Session not found' });
    const session = srows[0];

    const [vrows] = await db.query('SELECT * FROM vouchers WHERE id = ? LIMIT 1', [session.voucher_id]);
    const voucher = vrows[0];

    // increment data_used
    const newData = (session.data_used_mb || 0) + parseInt(data_used_mb, 10);
    await db.query('UPDATE sessions SET data_used_mb = ? WHERE id = ?', [newData, session_id]);

    // if data limit reached -> expire & block
    if (voucher.data_limit_mb > 0 && newData >= voucher.data_limit_mb) {
      // expire session
      await db.query('UPDATE sessions SET status = "expired", end_time = NOW() WHERE id = ?', [session_id]);
      // block IP
      if (isValidIPv4(session.ip)) {
        blockIp(session.ip, (err) => {
          if (err) console.error('blockIp error', err);
        });
      }
      // optionally mark voucher used
      await db.query('UPDATE vouchers SET status = "used" WHERE id = ?', [voucher.id]);
      return res.json({ message: 'Data limit reached; session expired' });
    }

    return res.json({ message: 'Session updated', data_used_mb: newData });
  } catch (err) {
    console.error('updateSession error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Stop session manually or when user logs out.
 * Body: { session_id }
 */
exports.stopSession = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const [srows] = await db.query('SELECT * FROM sessions WHERE id = ? LIMIT 1', [session_id]);
    if (srows.length === 0) return res.status(404).json({ error: 'Session not found' });
    const session = srows[0];

    // update session
    await db.query('UPDATE sessions SET status = "completed", end_time = NOW() WHERE id = ?', [session_id]);

    // unblock ip if blocked previously (optional logic)
    if (isValidIPv4(session.ip)) {
      unblockIp(session.ip, (err) => {
        if (err) console.error('unblockIp error', err);
      });
    }

    // if voucher is reusable, keep it active; otherwise mark used as needed
    // optionally add audit log
    await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
      'system', 'stop_session', `session:${session_id}`
    ]);

    return res.json({ message: 'Session stopped' });
  } catch (err) {
    console.error('stopSession error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
