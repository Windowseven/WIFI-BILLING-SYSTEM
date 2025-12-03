# WiFi Billing System

A comprehensive voucher-based WiFi authentication and billing system built with Node.js, Express, and MySQL.

## 🚀 Features

### Core Functionality
- **Voucher-based Authentication**: Generate and redeem WiFi access vouchers
- **User Management**: Admin panel for managing users and permissions
- **Session Control**: Track and manage active WiFi sessions
- **Payment Processing**: Handle payments and billing
- **QR Code Generation**: Generate QR codes for easy voucher redemption
- **Real-time Monitoring**: Monitor active connections and usage

### Security Features
- JWT-based authentication
- Rate limiting and DDoS protection
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- SQL injection prevention

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Windowseven/WIFI-BILLING-SYSTEM.git
cd WIFI-BILLING-SYSTEM/wifi-billing-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE wifi_billing;"

# Import database schema
mysql -u root -p wifi_billing < wifi_billing.sql

# Create database user (recommended)
mysql -u root -p -e "CREATE USER 'wifi_user'@'localhost' IDENTIFIED BY 'your_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON wifi_billing.* TO 'wifi_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

4. **Environment Configuration**
```bash
# Copy and configure environment variables
cp .env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_USER=wifi_user
DB_PASSWORD=your_password
DB_NAME=wifi_billing
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🏗️ Project Structure

```
wifi-billing-system/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── adminController.js    # Admin operations
│   ├── authController.js     # Authentication logic
│   ├── hotspotController.js  # Hotspot management
│   ├── userController.js     # User management
│   └── voucherController.js  # Voucher operations
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── errorMiddleware.js    # Error handling
│   └── hotspotAuth.js        # Hotspot authentication
├── models/
│   ├── adminModel.js         # Admin data models
│   ├── sessionModel.js       # Session management
│   ├── userModel.js          # User data models
│   └── voucherModel.js       # Voucher data models
├── routes/
│   ├── admin.js              # Admin API routes
│   ├── auth.js               # Authentication routes
│   ├── hotspot.js            # Hotspot API routes
│   ├── user.js               # User API routes
│   └── voucher.js            # Voucher API routes
├── utils/
│   ├── cronJob.js            # Scheduled tasks
│   ├── email.js              # Email utilities
│   └── qrcode.js             # QR code generation
├── wifi_billing.sql          # Database schema
├── server.js                 # Main application file
└── package.json              # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Vouchers
- `GET /api/voucher` - List vouchers
- `POST /api/voucher/create` - Create vouchers (Admin)
- `POST /api/voucher/redeem` - Redeem voucher
- `DELETE /api/voucher/:id` - Delete voucher (Admin)

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/admin/users` - List all users (Admin)

### Hotspot
- `GET /api/hotspot/status` - Check hotspot status
- `POST /api/hotspot/connect` - Connect to hotspot
- `POST /api/hotspot/disconnect` - Disconnect from hotspot

## 💳 How It Works

### 1. Voucher Generation
- Admin creates vouchers with specific parameters:
  - Duration (minutes)
  - Data limit (MB)
  - Device limit
  - Expiry date

### 2. User Authentication
- Users redeem vouchers using voucher codes
- System validates voucher and creates session
- QR codes can be generated for easy access

### 3. Session Management
- Active sessions are tracked in real-time
- Automatic disconnection when limits are reached
- Session cleanup via cron jobs

### 4. Payment Processing
- Support for multiple payment methods
- Transaction logging and reporting
- Revenue tracking and analytics

## 🔧 Configuration

### Database Tables
- `users` - User accounts and profiles
- `vouchers` - Voucher codes and parameters
- `sessions` - Active WiFi sessions
- `payments` - Payment transactions
- `admins` - Administrator accounts
- `system_settings` - System configuration

### Environment Variables
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 5000)

## 🚦 Testing

```bash
# Test database connection
node test-db.js

# Test server startup
node test-server.js

# Run minimal test
node test-minimal.js
```

## 📊 Monitoring

The system includes built-in monitoring for:
- Active sessions
- Voucher usage statistics
- Revenue tracking
- User activity logs
- System performance metrics

## 🔒 Security Considerations

- Use strong JWT secrets in production
- Enable HTTPS in production environments
- Regularly update dependencies
- Monitor for suspicious activities
- Implement proper backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Database schema and API endpoints
- Voucher system implementation
- Admin panel backend
- Security middleware integration

---

**Note**: This system is designed for educational and small-scale commercial use. For large-scale deployments, consider additional security measures and performance optimizations.
