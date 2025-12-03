// utils/email.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/* =========================================================
   SEND EMAIL
========================================================= */
exports.sendEmail = async (to, subject, text, html = null) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@wifibilling.com',
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

/* =========================================================
   SEND VOUCHER EMAIL
========================================================= */
exports.sendVoucherEmail = async (to, voucherCode, planDetails) => {
    const subject = 'Your WiFi Access Voucher';
    const text = `
Your WiFi Access Voucher

Voucher Code: ${voucherCode}
Plan: ${planDetails.name}
Duration: ${planDetails.duration_minutes} minutes
Data Limit: ${planDetails.data_limit_mb ? planDetails.data_limit_mb + ' MB' : 'Unlimited'}

Instructions:
1. Connect to the WiFi network
2. Open your browser
3. Enter the voucher code when prompted
4. Enjoy your internet access!

This voucher is valid until used or expired.
    `;

    const html = `
        <h2>Your WiFi Access Voucher</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Voucher Code: <strong>${voucherCode}</strong></h3>
            <p><strong>Plan:</strong> ${planDetails.name}</p>
            <p><strong>Duration:</strong> ${planDetails.duration_minutes} minutes</p>
            <p><strong>Data Limit:</strong> ${planDetails.data_limit_mb ? planDetails.data_limit_mb + ' MB' : 'Unlimited'}</p>
        </div>
        <h3>Instructions:</h3>
        <ol>
            <li>Connect to the WiFi network</li>
            <li>Open your browser</li>
            <li>Enter the voucher code when prompted</li>
            <li>Enjoy your internet access!</li>
        </ol>
        <p><em>This voucher is valid until used or expired.</em></p>
    `;

    return await this.sendEmail(to, subject, text, html);
};

/* =========================================================
   SEND WELCOME EMAIL
========================================================= */
exports.sendWelcomeEmail = async (to, username) => {
    const subject = 'Welcome to WiFi Billing System';
    const text = `
Welcome to WiFi Billing System!

Hello ${username},

Your account has been successfully created. You can now log in and start using our WiFi services.

If you have any questions, please contact our support team.

Best regards,
WiFi Billing System Team
    `;

    const html = `
        <h2>Welcome to WiFi Billing System!</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Your account has been successfully created. You can now log in and start using our WiFi services.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>WiFi Billing System Team</p>
    `;

    return await this.sendEmail(to, subject, text, html);
};
