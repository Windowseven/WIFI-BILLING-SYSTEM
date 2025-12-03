require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugConnection() {
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
    console.log('DB_NAME:', process.env.DB_NAME);
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'wifi_billing'
        });
        
        console.log('Connection created successfully');
        const [rows] = await connection.query('SELECT 1 as test');
        console.log('Query executed successfully:', rows);
        await connection.end();
        console.log('Connection closed');
    } catch (error) {
        console.error('Connection failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error errno:', error.errno);
    }
}

debugConnection();
