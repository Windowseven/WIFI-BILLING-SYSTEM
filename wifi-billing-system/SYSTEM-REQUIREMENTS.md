# 💻 **System Requirements & Dependencies**
## **WiFi Billing System - Ubuntu Setup**

---

## **🖥️ Hardware Requirements**

### **Minimum Requirements:**
- **CPU:** Dual-core 2.0 GHz (Intel/AMD)
- **RAM:** 4 GB DDR3/DDR4
- **Storage:** 20 GB available space
- **Network:** 
  - Ethernet port (for internet connection)
  - WiFi adapter with AP mode support
- **USB Ports:** 2+ available ports

### **Recommended Requirements:**
- **CPU:** Quad-core 2.5 GHz or higher
- **RAM:** 8 GB DDR4 or higher
- **Storage:** 50 GB SSD (faster performance)
- **Network:**
  - Gigabit Ethernet
  - WiFi 802.11ac adapter with AP mode
- **Backup:** External USB drive for backups

### **WiFi Adapter Compatibility:**
**Supported Chipsets for AP Mode:**
- **Realtek:** RTL8188EUS, RTL8192CU, RTL8812AU
- **Atheros:** AR9271, AR9170
- **Ralink:** RT2870, RT3070, RT5370
- **Intel:** Most modern Intel WiFi cards
- **Broadcom:** BCM43xx series (with proper drivers)

**Check Compatibility:**
```bash
# Check current WiFi adapter
lsusb | grep -i wireless
iwconfig
# Test AP mode support
sudo iw list | grep -A 10 "Supported interface modes"
```

---

## **🐧 Operating System Requirements**

### **Supported Ubuntu Versions:**
- **Ubuntu 20.04 LTS** (Focal Fossa) ✅ **Recommended**
- **Ubuntu 22.04 LTS** (Jammy Jellyfish) ✅ **Recommended**
- **Ubuntu 24.04 LTS** (Noble Numbat) ✅ **Latest**

### **Edition Support:**
- **Ubuntu Server** ✅ **Recommended for production**
- **Ubuntu Desktop** ✅ **Good for testing/development**
- **Ubuntu Minimal** ✅ **Lightweight option**

### **Architecture:**
- **x86_64 (64-bit)** ✅ **Required**
- **ARM64** ⚠️ **Limited support**
- **x86 (32-bit)** ❌ **Not supported**

---

## **📦 System Dependencies**

### **Core System Packages:**
```bash
# Essential system tools
sudo apt update
sudo apt install -y \
    curl \
    wget \
    git \
    nano \
    htop \
    net-tools \
    iptables \
    netfilter-persistent \
    iptables-persistent \
    ufw \
    fail2ban
```

### **Network & Hotspot Packages:**
```bash
# WiFi hotspot and network management
sudo apt install -y \
    hostapd \
    dnsmasq \
    bridge-utils \
    wireless-tools \
    wpasupplicant \
    iw \
    rfkill \
    dhcpcd5
```

### **Database System:**
```bash
# MySQL database server
sudo apt install -y \
    mysql-server \
    mysql-client \
    mysql-common
```

### **Node.js & Development Tools:**
```bash
# Node.js runtime and package manager
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y \
    nodejs \
    npm \
    build-essential \
    python3 \
    python3-pip \
    gcc \
    g++ \
    make
```

### **SSL/Security Packages:**
```bash
# SSL certificates and security
sudo apt install -y \
    openssl \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common
```

### **System Monitoring:**
```bash
# Monitoring and logging tools
sudo apt install -y \
    rsyslog \
    logrotate \
    cron \
    systemd \
    systemctl
```

---

## **🔧 Node.js Dependencies**

### **Production Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.10.0",
    "nodemailer": "^6.9.4",
    "qrcode": "^1.5.3",
    "node-cron": "^3.0.2"
  }
}
```

### **Development Dependencies:**
```json
{
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "swagger-ui-express": "^5.0.0"
  }
}
```

---

## **🗄️ Database Requirements**

### **MySQL Version:**
- **MySQL 8.0+** ✅ **Recommended**
- **MySQL 5.7+** ✅ **Minimum supported**
- **MariaDB 10.3+** ✅ **Alternative**

### **Database Configuration:**
```sql
-- Minimum MySQL settings
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

### **Required Database Features:**
- InnoDB storage engine
- UTF8 character set support
- Stored procedures support
- Trigger support
- Foreign key constraints

---

## **🌐 Network Requirements**

### **Internet Connection:**
- **Minimum:** 10 Mbps download, 5 Mbps upload
- **Recommended:** 50+ Mbps download, 10+ Mbps upload
- **Latency:** <100ms to major servers
- **Reliability:** 99%+ uptime

### **Network Interfaces:**
- **eth0:** Internet connection (DHCP or static)
- **wlan0:** WiFi hotspot (static IP: 10.10.0.1/24)

### **Port Requirements:**
```bash
# Required open ports
Port 8080  # WiFi billing system
Port 3306  # MySQL database (localhost only)
Port 22    # SSH access (optional)
Port 53    # DNS (dnsmasq)
Port 67    # DHCP (dnsmasq)
Port 80    # HTTP redirect
Port 443   # HTTPS redirect
```

### **Firewall Configuration:**
```bash
# UFW firewall rules
sudo ufw allow 8080/tcp
sudo ufw allow 22/tcp
sudo ufw allow 53/udp
sudo ufw allow 67/udp
sudo ufw enable
```

---

## **⚡ Performance Requirements**

### **Expected Load:**
- **Concurrent Users:** 50-200 users
- **Daily Vouchers:** 100-500 vouchers
- **Database Queries:** 1000+ per hour
- **Network Traffic:** 1-10 GB per day

### **Resource Usage:**
- **CPU Usage:** 20-40% average
- **RAM Usage:** 2-4 GB
- **Disk I/O:** Moderate (logs, database)
- **Network I/O:** High (user traffic)

---

## **🔒 Security Requirements**

### **System Security:**
```bash
# Essential security packages
sudo apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    rkhunter \
    chkrootkit
```

### **SSL/TLS Support:**
```bash
# Let's Encrypt for SSL certificates
sudo apt install -y certbot
```

### **User Permissions:**
- Root access for initial setup
- Dedicated service user for application
- Restricted database user permissions
- Proper file ownership and permissions

---

## **📋 Pre-Installation Checklist**

### **Before Starting Installation:**
- [ ] Ubuntu 20.04+ installed and updated
- [ ] Internet connection working
- [ ] WiFi adapter supports AP mode
- [ ] Sufficient disk space (20+ GB)
- [ ] Root/sudo access available
- [ ] Ethernet cable connected
- [ ] System fully updated

### **Verification Commands:**
```bash
# Check Ubuntu version
lsb_release -a

# Check available space
df -h

# Check memory
free -h

# Check network interfaces
ip addr show

# Check WiFi adapter
iwconfig

# Test internet connection
ping -c 4 google.com

# Check if ports are available
sudo netstat -tlnp | grep -E ':(8080|3306|80|443)'
```

---

## **🚀 Quick Dependency Installation**

### **One-Command Installation:**
```bash
#!/bin/bash
# Complete dependency installation script

echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "📦 Installing core dependencies..."
sudo apt install -y curl wget git nano htop net-tools iptables netfilter-persistent

echo "📡 Installing network packages..."
sudo apt install -y hostapd dnsmasq bridge-utils wireless-tools iw rfkill

echo "🗄️ Installing MySQL..."
sudo apt install -y mysql-server mysql-client

echo "🟢 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm build-essential

echo "🔒 Installing security packages..."
sudo apt install -y ufw fail2ban openssl ca-certificates

echo "✅ All dependencies installed successfully!"
echo "🔄 Please reboot the system before proceeding with WiFi billing system setup."
```

### **Save and Run:**
```bash
# Save the script
nano install-dependencies.sh
chmod +x install-dependencies.sh

# Run the installation
./install-dependencies.sh
```

---

## **⚠️ Common Issues & Solutions**

### **WiFi Adapter Issues:**
```bash
# Check if adapter supports AP mode
sudo iw list | grep -A 10 "Supported interface modes"

# If AP mode not supported, install additional drivers
sudo apt install -y linux-headers-$(uname -r)
sudo apt install -y dkms
```

### **Node.js Version Issues:**
```bash
# Install specific Node.js version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### **MySQL Issues:**
```bash
# Reset MySQL root password
sudo mysql_secure_installation

# Check MySQL status
sudo systemctl status mysql
```

### **Permission Issues:**
```bash
# Fix common permission issues
sudo chown -R $USER:$USER /root/WIFI-BILLING-SYSTEM/
sudo chmod +x /root/WIFI-BILLING-SYSTEM/wifi-billing-system/server.js
```

---

## **📞 Support & Compatibility**

### **Tested Configurations:**
- **Ubuntu 22.04 + Node.js 18 + MySQL 8.0** ✅
- **Ubuntu 20.04 + Node.js 16 + MySQL 8.0** ✅
- **Ubuntu 24.04 + Node.js 20 + MySQL 8.0** ✅

### **Known Incompatibilities:**
- Ubuntu versions below 20.04
- Node.js versions below 16
- MySQL versions below 5.7
- 32-bit systems
- WiFi adapters without AP mode support

### **Getting Help:**
If you encounter dependency issues:
1. Check Ubuntu version compatibility
2. Verify WiFi adapter supports AP mode
3. Ensure all packages are installed
4. Check system logs for errors
5. Contact technical support

---

**🎉 Your system is now ready for WiFi Billing System installation!**
