// create-admin.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./models/db');

async function createAdmin() {
  const username = process.env.INIT_ADMIN_USERNAME || 'admin';
  const email = process.env.INIT_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.INIT_ADMIN_PASSWORD || 'ChangeMeStrong!123';

  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);

  const [rows] = await db.query('SELECT id FROM admins WHERE username=? OR email=?', [username, email]);
  if (rows.length) {
    console.log('Admin already exists, aborting.');
    process.exit(0);
  }

  await db.query(
    'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [username, email, hash, 'superadmin']
  );
  console.log('Initial admin created:', username);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
