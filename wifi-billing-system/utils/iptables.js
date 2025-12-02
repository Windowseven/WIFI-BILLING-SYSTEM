// utils/iptables.js
const { exec } = require('child_process');

function isValidIPv4(ip) {
  return /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/.test(ip);
}

/**
 * Executes a command with sudo if necessary.
 * Note: the process must have permission to run iptables (run as root or use sudoers).
 */
function runCmd(cmd, cb) {
  exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
    if (err) return cb(err);
    cb(null, stdout);
  });
}

function blockIp(ip, cb = () => {}) {
  if (!isValidIPv4(ip)) return cb(new Error('Invalid IP'));
  // insert rule only once: check then add
  const check = `iptables -C FORWARD -s ${ip} -j DROP 2>/dev/null || echo "no"`;
  runCmd(check, (err, out) => {
    if (err && !out) return cb(err);
    if (out && out.trim() === 'no') {
      const cmd = `iptables -A FORWARD -s ${ip} -j DROP`;
      runCmd(cmd, cb);
    } else {
      // already exists
      return cb(null, 'already-blocked');
    }
  });
}

function unblockIp(ip, cb = () => {}) {
  if (!isValidIPv4(ip)) return cb(new Error('Invalid IP'));
  // remove all matching rules for that IP (be careful)
  const cmd = `iptables -D FORWARD -s ${ip} -j DROP 2>/dev/null || echo "notfound"`;
  runCmd(cmd, (err, out) => {
    if (err && !out) return cb(err);
    cb(null, out);
  });
}

module.exports = { blockIp, unblockIp, isValidIPv4 };
