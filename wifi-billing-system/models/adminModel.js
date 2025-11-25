// models/adminModel.js
const db = require('./db');

module.exports = {
  findByUsername: async (username) => {
    const [rows] = await db.query('SELECT * FROM admins WHERE username=?', [username]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM admins WHERE id=?', [id]);
    return rows[0];
  },

  updateFailedAttempts: async (id, attempts, lockedUntil=null) => {
    await db.query('UPDATE admins SET failed_attempts=?, locked_until=? WHERE id=?', [attempts, lockedUntil, id]);
  },

  logAction: async (adminId, action, ip, userAgent, meta=null) => {
    await db.query('INSERT INTO admin_audit_logs (admin_id, action, ip, user_agent, meta) VALUES (?, ?, ?, ?, ?)', 
      [adminId, action, ip, userAgent, meta ? JSON.stringify(meta) : null]);
  }
};
