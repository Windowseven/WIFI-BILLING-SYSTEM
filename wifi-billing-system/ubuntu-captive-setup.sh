#!/bin/bash

# Ubuntu Captive Portal Setup Script for WiFi Billing System
# This script configures the system to work with Ubuntu's captive portal

echo "🔧 Setting up WiFi Billing System for Ubuntu Captive Portal..."

# 1. Install additional dependencies for captive portal
echo "📦 Installing additional dependencies..."
npm install express-rate-limit helmet morgan

# 2. Create database sessions table
echo "🗄️ Setting up database sessions table..."
mysql -u wifi_user -pWindowseven77. wifi_billing < sessions_table.sql

# 3. Create systemd service for the WiFi billing system
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/wifi-billing.service > /dev/null <<EOF
[Unit]
Description=WiFi Billing System
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/WIFI-BILLING-SYSTEM/wifi-billing-system
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 4. Enable and start the service
echo "🚀 Enabling WiFi billing service..."
sudo systemctl daemon-reload
sudo systemctl enable wifi-billing.service

# 5. Update iptables rules for captive portal integration
echo "🔥 Updating iptables rules..."

# Allow traffic to the billing system
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT

# Redirect HTTP traffic to captive portal (port 8080)
sudo iptables -t nat -F PREROUTING
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.10.0.1:8080
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j DNAT --to-destination 10.10.0.1:8080

# Save iptables rules
sudo netfilter-persistent save

# 6. Start the WiFi billing service
echo "▶️ Starting WiFi billing service..."
sudo systemctl start wifi-billing.service

# 7. Show status
echo "📊 Service Status:"
sudo systemctl status wifi-billing.service --no-pager

echo ""
echo "✅ Ubuntu Captive Portal Setup Complete!"
echo ""
echo "🌐 Captive Portal URL: http://10.10.0.1:8080/login"
echo "📱 Admin Panel: http://10.10.0.1:8080/api-docs"
echo "🔍 Health Check: http://10.10.0.1:8080/health"
echo ""
echo "📋 Next Steps:"
echo "1. Create vouchers using the admin API"
echo "2. Test connection from a device"
echo "3. Monitor logs: sudo journalctl -u wifi-billing.service -f"
echo ""
echo "🔧 Troubleshooting:"
echo "- Check service: sudo systemctl status wifi-billing.service"
echo "- View logs: sudo journalctl -u wifi-billing.service"
echo "- Restart service: sudo systemctl restart wifi-billing.service"
