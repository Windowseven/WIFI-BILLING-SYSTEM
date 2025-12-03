require('dotenv').config();
const db = require('./config/db');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const [rows] = await db.query('SELECT 1 as test');
        console.log('Database connection successful:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
