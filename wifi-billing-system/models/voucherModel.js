const db = require('./db');

module.exports = {
  createVoucher: async (voucher) => {
    const {
      code, plan_id=null, created_by=null, device_limit=1,
      data_limit_mb=0, duration_minutes=60, expiry_date=null
    } = voucher;

    const sql = `INSERT INTO vouchers
      (code, plan_id, created_by, device_limit, data_limit_mb, duration_minutes, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [code, plan_id, created_by, device_limit, data_limit_mb, duration_minutes, expiry_date]);
    const [rows] = await db.query('SELECT * FROM vouchers WHERE id=?', [result.insertId]);
    return rows[0];
  },

  findByCode: async (code) => {
    const [rows] = await db.query('SELECT * FROM vouchers WHERE code=?', [code]);
    return rows[0];
  },

  list: async (filter = {}, limit = 50, offset = 0) => {
    let sql = 'SELECT * FROM vouchers WHERE 1=1';
    const params = [];
    if (filter.status) { sql += ' AND status=?'; params.push(filter.status); }
    if (filter.plan_id) { sql += ' AND plan_id=?'; params.push(filter.plan_id); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(sql, params);
    return rows;
  },

  expireVoucher: async (id) => {
    await db.query('UPDATE vouchers SET status="expired" WHERE id=?', [id]);
  }
};
