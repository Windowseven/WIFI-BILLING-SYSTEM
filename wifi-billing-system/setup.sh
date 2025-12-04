#!/bin/bash

echo "🚀 Setting up WiFi Billing System..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install new dependencies
echo "📦 Installing new dependencies..."
npm install express-rate-limit swagger-jsdoc swagger-ui-express jest supertest

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration"
fi

# Create logs directory structure
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "📖 Documentation: http://localhost:5000/api-docs"
echo "🏥 Health Check: http://localhost:5000/health"
echo "🧪 Run tests: npm test"
echo "🚀 Start server: npm start"
echo "🔧 Development: npm run dev"
