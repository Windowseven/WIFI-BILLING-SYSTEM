# 🚀 **Complete WiFi Billing System Deployment Guide**

## **📋 Overview**
This guide covers the complete setup of the WiFi Billing System on Ubuntu, from hardware setup to customer usage.

---

## **🔧 Part 1: Ubuntu Server Setup**

### **Prerequisites:**
- Ubuntu 20.04/22.04/24.04 (Desktop or Server)
- WiFi adapter capable of AP mode
- Ethernet connection for internet
- Root/sudo access

### **Step 1: Install Required Packages**
```bash
sudo apt update
sudo apt install hostapd dnsmasq iptables netfilter-persistent git curl nodejs npm mysql-server -y

# Stop services temporarily
sudo systemctl stop hostapd
sudo systemctl stop dnsmasq
```

### **Step 2: Configure WiFi Hotspot**
```bash
# Create hostapd configuration
sudo nano /etc/hostapd/hostapd.conf
```

**Add this content:**
```
interface=wlan0
driver=nl80211
ssid=Windowseven_Hotspot
hw_mode=g
channel=6
auth_algs=1
wmm_enabled=1
ignore_broadcast_ssid=0
```

**Register configuration:**
```bash
sudo nano /etc/default/hostapd
```
**Add:** `DAEMON_CONF="/etc/hostapd/hostapd.conf"`

### **Step 3: Configure DHCP & DNS**
```bash
# Backup original
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.backup

# Create new configuration
sudo nano /etc/dnsmasq.conf
```

**Add this content:**
```
interface=wlan0
dhcp-range=10.10.0.10,10.10.0.200,12h
dhcp-option=3,10.10.0.1
dhcp-option=6,10.10.0.1
address=/#/10.10.0.1
```

### **Step 4: Set Static IP for Hotspot**
```bash
sudo nano /etc/netplan/01-hotspot.yaml
```

**Add this content:**
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    wlan0:
      addresses:
        - 10.10.0.1/24
      dhcp4: no
```

**Apply configuration:**
```bash
sudo netplan apply
```

### **Step 5: Setup NAT & Captive Portal**
```bash
# Enable IP forwarding
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf

# Setup NAT rules
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT

# Captive portal redirect
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.10.0.1:8080
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j DNAT --to-destination 10.10.0.1:8080

# Save rules
sudo netfilter-persistent save
```

### **Step 6: Start Hotspot Services**
```bash
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq
sudo systemctl start hostapd
sudo systemctl start dnsmasq
```

---

## **💾 Part 2: Database Setup**

### **Step 1: Secure MySQL Installation**
```bash
sudo mysql_secure_installation
```

### **Step 2: Create Database & User**
```bash
sudo mysql -u root -p
```

**Run these SQL commands:**
```sql
CREATE DATABASE wifi_billing;
CREATE USER 'wifi_user'@'localhost' IDENTIFIED BY 'Windowseven77.';
GRANT ALL PRIVILEGES ON wifi_billing.* TO 'wifi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **Step 3: Import Database Schema**
```bash
cd /root/WIFI-BILLING-SYSTEM/wifi-billing-system
mysql -u wifi_user -pWindowseven77. wifi_billing < wifi_billing.sql
mysql -u wifi_user -pWindowseven77. wifi_billing < sessions_table.sql
```

---

## **🌐 Part 3: Application Deployment**

### **Step 1: Install Dependencies**
```bash
cd /root/WIFI-BILLING-SYSTEM/wifi-billing-system
npm install
```

### **Step 2: Configure Environment**
```bash
cp .env.example .env
nano .env
```

**Update .env file:**
```
DB_HOST=localhost
DB_USER=wifi_user
DB_PASSWORD=Windowseven77.
DB_NAME=wifi_billing
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
PORT=8080
NODE_ENV=production
ALLOWED_ORIGINS=http://10.10.0.1:8080,http://localhost:3000
```

### **Step 3: Create System Service**
```bash
sudo nano /etc/systemd/system/wifi-billing.service
```

**Add this content:**
```ini
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
```

### **Step 4: Enable & Start Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable wifi-billing.service
sudo systemctl start wifi-billing.service
```

### **Step 5: Verify Installation**
```bash
# Check service status
sudo systemctl status wifi-billing.service

# Check if server is running
curl http://10.10.0.1:8080/health

# Check hotspot status
sudo systemctl status hostapd
sudo systemctl status dnsmasq
```

---

## **🎯 Part 3: System Testing**

### **Test 1: Hotspot Connectivity**
1. Use a mobile device or laptop
2. Look for "Windowseven_Hotspot" WiFi network
3. Connect (no password required)
4. Device should get IP in range 10.10.0.10-200

### **Test 2: Captive Portal Redirect**
1. Open browser on connected device
2. Try to visit any website (google.com)
3. Should redirect to `http://10.10.0.1:8080`
4. Should see Windowseven Network login page

### **Test 3: Admin Access**
1. Go to `http://10.10.0.1:8080/admin`
2. Login with: admin / admin123
3. Should access admin dashboard
4. Create test vouchers

### **Test 4: Voucher System**
1. Create a test voucher in admin panel
2. Use voucher code on customer portal
3. Verify internet access works
4. Check session appears in admin panel

---

## **👨‍💼 Part 4: Admin Operations**

### **Daily Operations:**

#### **Creating Vouchers:**
1. Access admin panel: `http://10.10.0.1:8080/admin`
2. Go to Vouchers → Create Vouchers
3. Select plan and quantity
4. Generate and distribute codes

#### **Monitoring Sessions:**
1. Go to Active Sessions
2. Monitor connected users
3. Extend time if needed
4. Disconnect problematic users

#### **Managing Customers:**
1. View customer statistics
2. Track usage patterns
3. Manage customer accounts
4. Handle support requests

### **Pricing Management:**
1. Go to Settings → Pricing
2. Add/edit plans with data limits
3. Set prices in TSh
4. Monitor price per MB efficiency

### **System Maintenance:**
```bash
# Check system status
sudo systemctl status wifi-billing.service
sudo systemctl status hostapd
sudo systemctl status dnsmasq

# View logs
sudo journalctl -u wifi-billing.service -f
tail -f /root/WIFI-BILLING-SYSTEM/wifi-billing-system/logs/info.log

# Restart services if needed
sudo systemctl restart wifi-billing.service
sudo systemctl restart hostapd
sudo systemctl restart dnsmasq
```

---

## **👥 Part 5: Customer Experience**

### **Customer Journey:**
1. **Connect to WiFi:** "Windowseven_Hotspot"
2. **Auto-redirect:** Browser opens login page
3. **Purchase voucher:** From reception/vendor
4. **Enter code:** On login page
5. **Access internet:** Immediate access
6. **Monitor usage:** Time and data limits

### **Voucher Distribution:**
- Print voucher codes for reception
- Train staff on plan differences
- Set up payment methods (cash, mobile money)
- Create pricing display boards

### **Customer Support:**
- Provide customer guide (CUSTOMER-USER-GUIDE.md)
- Train reception staff on troubleshooting
- Set up support contact methods
- Monitor common issues

---

## **📊 Part 6: Monitoring & Analytics**

### **Key Metrics to Track:**
- Daily revenue in TSh
- Number of active users
- Popular plans
- Peak usage hours
- Data consumption patterns

### **Regular Reports:**
1. **Daily:** Revenue, users, issues
2. **Weekly:** Trends, plan performance
3. **Monthly:** Customer analysis, system health

### **Performance Monitoring:**
```bash
# System resources
htop
df -h
free -h

# Network status
iwconfig
ip addr show

# Service logs
sudo journalctl -u wifi-billing.service --since "1 hour ago"
```

---

## **🔒 Part 7: Security & Backup**

### **Security Checklist:**
- [ ] Change default admin password
- [ ] Enable firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Secure database access

### **Backup Strategy:**
```bash
# Database backup
mysqldump -u wifi_user -pWindowseven77. wifi_billing > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf wifi-billing-backup-$(date +%Y%m%d).tar.gz /root/WIFI-BILLING-SYSTEM/

# Automated backup script
echo "0 2 * * * /root/backup-script.sh" | sudo crontab -
```

### **Recovery Procedures:**
1. **Database recovery:** Restore from SQL backup
2. **Application recovery:** Restore from tar backup
3. **Network recovery:** Reconfigure hotspot settings
4. **Service recovery:** Restart system services

---

## **📞 Part 8: Troubleshooting**

### **Common Issues:**

#### **Hotspot Not Broadcasting:**
```bash
sudo systemctl status hostapd
sudo journalctl -u hostapd
# Check WiFi adapter compatibility
iwconfig
```

#### **Clients Can't Get IP:**
```bash
sudo systemctl status dnsmasq
sudo journalctl -u dnsmasq
# Check DHCP range configuration
```

#### **Captive Portal Not Working:**
```bash
# Check iptables rules
sudo iptables -t nat -L
# Verify application is running
curl http://10.10.0.1:8080/health
```

#### **Database Connection Issues:**
```bash
# Test database connection
mysql -u wifi_user -pWindowseven77. wifi_billing -e "SHOW TABLES;"
# Check service logs
sudo journalctl -u wifi-billing.service
```

### **Emergency Procedures:**
1. **System restart:** `sudo reboot`
2. **Service restart:** `sudo systemctl restart wifi-billing.service`
3. **Network reset:** Restart hostapd and dnsmasq
4. **Database repair:** Use MySQL repair tools

---

## **🎉 Deployment Complete!**

### **Final Checklist:**
- [ ] Ubuntu hotspot configured and running
- [ ] Database created and populated
- [ ] Application deployed and running
- [ ] Admin panel accessible
- [ ] Customer portal working
- [ ] Voucher system functional
- [ ] Captive portal redirecting
- [ ] Pricing configured in TSh
- [ ] Staff trained on system
- [ ] Customer guides distributed
- [ ] Backup procedures in place
- [ ] Monitoring systems active

### **System URLs:**
- **Customer Portal:** `http://10.10.0.1:8080/`
- **Admin Panel:** `http://10.10.0.1:8080/admin`
- **API Documentation:** `http://10.10.0.1:8080/api-docs`
- **Health Check:** `http://10.10.0.1:8080/health`

### **Default Credentials:**
- **Admin Username:** `admin`
- **Admin Password:** `admin123`
- **Database User:** `wifi_user`
- **Database Password:** `Windowseven77.`

**🚨 Remember to change default passwords immediately!**

---

**Your WiFi Billing System is now ready for production use!**
