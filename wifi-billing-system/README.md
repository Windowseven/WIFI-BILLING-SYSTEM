# WiFi Billing System 🚀

A comprehensive WiFi billing system with voucher-based authentication, built with Node.js, Express, and MySQL.

## ✨ Features

- **Voucher-based Authentication**: Generate and manage WiFi access vouchers
- **User Management**: Admin, staff, and user roles with proper authorization
- **Session Management**: Track and manage user sessions
- **Payment Integration**: Handle billing and payments
- **Rate Limiting**: Protect against abuse and DDoS attacks
- **Comprehensive Logging**: Track all system activities
- **API Documentation**: Interactive Swagger documentation
- **Health Monitoring**: Real-time system health checks
- **Security**: JWT authentication, input validation, and security headers

## 🛠️ Installation

### Quick Setup
```bash
# Clone the repository
git clone <repository-url>
cd wifi-billing-system

# Run setup script
./setup.sh

# Update environment variables
nano .env

# Start the server
npm start
```

### Manual Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Create logs directory
mkdir logs

# Start the server
npm start
```

## 📋 Requirements

- Node.js 16+
- MySQL 8.0+
- npm or yarn

## ⚙️ Configuration

Update `.env` file with your configuration:

```env
# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=wifi_billing

# JWT
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=production

# Security
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

## 🚀 Usage

### Start the Server
```bash
# Production
npm start

# Development with auto-reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### API Endpoints

- **Documentation**: `GET /api-docs` - Interactive API documentation
- **Health Check**: `GET /health` - System health status
- **Authentication**: `POST /api/auth/login` - User login
- **Users**: `GET /api/user/profile` - Get user profile
- **Admin**: `GET /api/admin/users` - Manage users (admin only)
- **Vouchers**: `POST /api/voucher/create` - Create vouchers
- **Plans**: `GET /api/plans` - Get billing plans

## 🔒 Security Features

- **Rate Limiting**: Different limits for auth, admin, and general endpoints
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: Parameterized queries

## 📊 Monitoring & Logging

- **Health Checks**: Database connectivity and system metrics
- **Comprehensive Logging**: File and console logging with different levels
- **Audit Trails**: Track admin actions and system events
- **Error Tracking**: Detailed error logging and reporting

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📖 API Documentation

Access interactive API documentation at: `http://localhost:5000/api-docs`

## 🏥 Health Monitoring

Check system health at: `http://localhost:5000/health`

Response includes:
- Overall system status
- Database connectivity
- Memory usage
- Response time
- Uptime

## 📁 Project Structure

```
wifi-billing-system/
├── controllers/         # Business logic
├── routes/             # API routes
├── middleware/         # Custom middleware
├── models/            # Database models
├── utils/             # Utility functions
├── docs/              # API documentation
├── tests/             # Test files
├── logs/              # Log files
├── cron/              # Scheduled tasks
└── config/            # Configuration files
```

## 🔧 Development

### Adding New Features
1. Create controller in `controllers/`
2. Add routes in `routes/`
3. Add validation in `middleware/validation.js`
4. Write tests in `tests/`
5. Update API documentation

### Database Migrations
```bash
# Import initial schema
mysql -u username -p database_name < wifi_billing.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Ensure MySQL is running
   - Verify database exists

2. **JWT Token Errors**
   - Check JWT_SECRET in `.env`
   - Ensure secret is at least 32 characters

3. **Rate Limiting Issues**
   - Adjust rate limits in `.env`
   - Check IP whitelisting if needed

### Logs
Check logs in the `logs/` directory:
- `info.log` - General information
- `error.log` - Error messages
- `audit.log` - Admin actions

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions, please check the documentation or create an issue.

---

**Made with ❤️ for WiFi management**
