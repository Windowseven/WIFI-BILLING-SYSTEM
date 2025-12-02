const cron = require('node-cron');
const { exec } = require('child_process');
const db = require('../config/db');
const { blockIp, unblockIp, isValidIPv4 } = require('../utils/iptables');

// Run every minute
cron.schedule('* * * * *', async () => {
    try {
        const [users] = await db.query(
            "SELECT s.id, s.user_id, s.ip, s.mac, s.start_time, s.data_used_mb, s.status, v.duration_minutes, v.data_limit_mb " +
            "FROM sessions s " +
            "JOIN vouchers v ON s.voucher_id = v.id " +
            "WHERE s.status='active'"
        );

        for (let session of users) {
            // Calculate elapsed time in minutes
            const start = new Date(session.start_time);
            const now = new Date();
            const elapsedMinutes = Math.floor((now - start) / 60000);

            // Check time or data limit
            if (elapsedMinutes >= session.duration_minutes || session.data_used_mb >= session.data_limit_mb) {
                // Block user using iptables
                if (session.ip) {
                    exec(`iptables -A FORWARD -s ${session.ip} -j DROP`, (err) => {
                        if (err) console.error(`Error blocking IP ${session.ip}:`, err);
                    });
                }

                // Update session & user status
                await db.query("UPDATE sessions SET status='expired', end_time=NOW() WHERE id=?", [session.id]);
                await db.query("UPDATE users SET status='blocked' WHERE id=?", [session.user_id]);

                console.log(`Session ${session.id} expired. User ${session.user_id} blocked.`);
            }
        }
    } catch (err) {
        console.error('Cron job error:', err);
    }
});

// configurable grace period (minutes) from system_settings
async function getGraceMinutes() {
  try {
    const [rows] = await db.query('SELECT session_grace_minutes FROM system_settings WHERE id = 1 LIMIT 1');
    return (rows[0] && rows[0].session_grace_minutes) ? parseInt(rows[0].session_grace_minutes, 10) : 5;
  } catch (e) {
    return 5;
  }
}

cron.schedule('* * * * *', async () => {
  try {
    const grace = await getGraceMinutes();

    // fetch active sessions + voucher info
    const [sessions] = await db.query(
      `SELECT s.id AS session_id, s.user_id, s.ip, s.mac, s.start_time, s.data_used_mb, v.duration_minutes, v.data_limit_mb, v.id AS voucher_id
       FROM sessions s
       JOIN vouchers v ON s.voucher_id = v.id
       WHERE s.status = 'active'`
    );

    const now = new Date();

    for (const s of sessions) {
      const start = new Date(s.start_time);
      const elapsed = Math.floor((now - start) / 60000); // minutes

      const timeExceeded = (s.duration_minutes && elapsed >= s.duration_minutes);
      const dataExceeded = (s.data_limit_mb && s.data_limit_mb > 0 && s.data_used_mb >= s.data_limit_mb);

      if (timeExceeded || dataExceeded) {
        // apply grace logic: if within grace, skip blocking until grace elapses
        const overByMinutes = timeExceeded ? (elapsed - s.duration_minutes) : 0;
        if (overByMinutes < grace) {
          // still in grace period; optionally notify user
          continue;
        }

        // expire session
        await db.query('UPDATE sessions SET status = "expired", end_time = NOW() WHERE id = ?', [s.session_id]);

        // block IP
        if (s.ip && isValidIPv4(s.ip)) {
          blockIp(s.ip, (err) => {
            if (err) console.error('blockIp error', err);
          });
        }

        // mark voucher used (optional)
        await db.query('UPDATE vouchers SET status = "used" WHERE id = ?', [s.voucher_id]);

        // log
        await db.query('INSERT INTO admin_audit_logs (admin_name, action, target) VALUES (?, ?, ?)', [
          'system', 'auto_expire_session', `session:${s.session_id}`
        ]);
      }
    }
  } catch (err) {
    console.error('cron disconnect error', err);
  }
});
