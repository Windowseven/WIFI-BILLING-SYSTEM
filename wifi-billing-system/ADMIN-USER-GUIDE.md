# 🔐 **WiFi Billing System - Administrator Guide**

## **📋 Table of Contents**
1. [Getting Started](#getting-started)
2. [Admin Login](#admin-login)
3. [Dashboard Overview](#dashboard-overview)
4. [Voucher Management](#voucher-management)
5. [Session Management](#session-management)
6. [Customer Management](#customer-management)
7. [System Settings](#system-settings)
8. [Analytics & Reports](#analytics--reports)
9. [Troubleshooting](#troubleshooting)

---

## **🚀 Getting Started**

### **Access URLs:**
- **Admin Portal:** `http://10.10.0.1:8080/admin`
- **Dashboard:** `http://10.10.0.1:8080/admin/dashboard.html`
- **API Documentation:** `http://10.10.0.1:8080/api-docs`

### **Default Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ **Security Note:** Change default credentials immediately after first login!

---

## **🔑 Admin Login**

### **Step 1: Access Admin Portal**
1. Open browser and go to `http://10.10.0.1:8080/admin`
2. You'll see the professional admin login page

### **Step 2: Login**
1. Enter username: `admin`
2. Enter password: `admin123`
3. Check "Remember me" for 30-day login (optional)
4. Click **"Sign In to Dashboard"**

### **Step 3: First Login Setup**
- Change default password in Settings
- Configure system settings
- Set up pricing plans

---

## **📊 Dashboard Overview**

### **Key Metrics Cards:**
- **Total Users Today:** Current day's user count
- **Active Sessions:** Currently connected users
- **Vouchers Sold:** Daily voucher sales
- **Revenue Today:** Daily earnings in TSh

### **Charts & Analytics:**
- **Revenue Trend:** Weekly revenue graph
- **Voucher Types:** Distribution by plan type
- **Recent Sessions:** Latest user connections
- **Recent Vouchers:** Latest voucher sales

### **Quick Actions:**
- **Refresh Data:** Update all statistics
- **Create Vouchers:** Quick voucher generation
- **View Sessions:** Monitor active connections

---

## **🎫 Voucher Management**

### **Creating Vouchers:**

#### **Step 1: Access Voucher Management**
- Click **"Vouchers"** in sidebar
- Click **"Create Vouchers"** button

#### **Step 2: Select Plan**
Choose from available plans:
- **500MB - 1 Hour:** TSh 12,000
- **1GB - 2 Hours:** TSh 20,000
- **2GB - 24 Hours:** TSh 35,000
- **5GB - Weekly:** TSh 75,000

#### **Step 3: Set Quantity**
- Enter number of vouchers (1-100)
- System generates unique codes automatically

#### **Step 4: Custom Prefix (Optional)**
- Add custom prefix (e.g., "WIFI", "HOTEL")
- Default: "WIFI"

#### **Step 5: Generate**
- Click **"Create Vouchers"**
- Vouchers are generated instantly
- Codes format: `PREFIX-YYYY-XXX`

### **Managing Vouchers:**

#### **Filter Options:**
- **Status:** Active, Used, Expired
- **Duration:** Filter by plan type
- **Search:** Find specific voucher codes

#### **Voucher Actions:**
- **👁️ View:** See voucher details
- **🗑️ Delete:** Remove unused vouchers
- **📊 Export:** Download voucher list

### **Voucher Status:**
- **🟢 Active:** Ready to use
- **✅ Used:** Successfully redeemed
- **❌ Expired:** Past expiration date

---

## **📡 Session Management**

### **Monitoring Active Sessions:**

#### **Session Information:**
- **Device Type:** Mobile, Laptop, Tablet
- **IP Address:** Client network address
- **Time Remaining:** Session countdown
- **Data Usage:** MB/GB consumed
- **Data Remaining:** Available data
- **Connection Time:** When user connected

#### **Session Actions:**
- **👁️ View Details:** Full session information
- **⏰ Extend Time:** Add more time
- **🔌 Disconnect:** Terminate session

### **Bulk Operations:**
- **Disconnect All:** Emergency disconnect
- **Export Sessions:** Download session data
- **Filter Sessions:** By status, device type

### **Session Statistics:**
- **Total Sessions:** All connections today
- **Active Now:** Currently connected
- **Expiring Soon:** Sessions ending in <10 minutes
- **Total Bandwidth:** Combined data usage

---

## **👥 Customer Management**

### **Customer Overview:**
- **Total Customers:** Registered users
- **Active Today:** Users connected today
- **New This Week:** Recent registrations
- **Total Revenue:** Customer lifetime value

### **Customer Information:**
- **Name & Contact:** Email, phone number
- **Registration Date:** When they first connected
- **Last Activity:** Most recent session
- **Total Spent:** Lifetime revenue (TSh)
- **Status:** Active, Inactive, Blocked

### **Customer Actions:**
- **👁️ View Profile:** Detailed customer info
- **✏️ Edit Details:** Update information
- **🚫 Block/Unblock:** Manage access

### **Adding Customers:**
1. Click **"Add Customer"**
2. Enter name, email, phone
3. Set initial status
4. Save customer record

---

## **⚙️ System Settings**

### **General Settings:**
- **System Name:** "Windowseven Network"
- **Admin Email:** Contact email
- **Timezone:** Local timezone
- **Currency:** TSh (Tanzanian Shilling)
- **Welcome Message:** Customer portal message

### **Network Configuration:**
- **Hotspot IP:** `10.10.0.1`
- **Hotspot Port:** `8080`
- **RADIUS Server:** Authentication server
- **Session Timeout:** Default session length

### **Pricing Plans Management:**

#### **Creating New Plans:**
1. Go to **Settings → Pricing**
2. Click **"Add Plan"**
3. Enter plan details:
   - **Name:** Descriptive name
   - **Duration:** Minutes (60, 120, 1440, etc.)
   - **Data Limit:** MB (500, 1024, 2048, etc.)
   - **Price:** Amount in TSh
4. System calculates **Price per MB** automatically
5. Save plan

#### **Plan Examples:**
```
Plan: 1GB Quick Access
Duration: 120 minutes (2 hours)
Data Limit: 1024 MB (1 GB)
Price: TSh 20,000
Price per MB: TSh 19.5/MB
```

### **Security Settings:**
- **Enable SSL/HTTPS:** Secure connections
- **Enable Firewall:** Network protection
- **Rate Limiting:** Prevent abuse
- **Max Login Attempts:** Security lockout
- **Allowed IP Ranges:** Network restrictions

### **Email Configuration:**
- **SMTP Server:** Email delivery
- **Username/Password:** Email credentials
- **Test Email:** Verify configuration

### **Backup & Restore:**
- **Auto Backup:** Scheduled backups
- **Manual Backup:** On-demand backup
- **Restore:** System recovery

---

## **📈 Analytics & Reports**

### **Key Performance Metrics:**
- **Total Revenue:** TSh earnings
- **Total Users:** Customer count
- **Average Session Time:** Usage patterns
- **Data Usage:** Bandwidth consumption

### **Revenue Analytics:**
- **Daily Trends:** Revenue by day
- **Weekly Patterns:** Usage by day of week
- **Peak Hours:** Busiest times
- **Plan Performance:** Best-selling plans

### **Customer Analytics:**
- **Top Customers:** Highest spenders
- **Device Types:** Mobile vs Desktop usage
- **Usage Patterns:** When customers connect

### **Generating Reports:**
1. Select date range (7, 30, 90 days, 1 year)
2. Click **"Generate Report"**
3. View charts and statistics
4. Export data as needed

### **Export Options:**
- **PDF Reports:** Formatted documents
- **CSV Data:** Spreadsheet format
- **Chart Images:** Visual exports

---

## **🔧 Troubleshooting**

### **Common Issues:**

#### **Login Problems:**
- **Forgot Password:** Contact system administrator
- **Account Locked:** Wait 15 minutes or reset
- **Browser Issues:** Clear cache, try different browser

#### **Voucher Issues:**
- **Generation Failed:** Check database connection
- **Invalid Codes:** Verify plan configuration
- **Duplicate Codes:** System prevents duplicates

#### **Session Problems:**
- **Users Can't Connect:** Check hotspot configuration
- **Sessions Not Showing:** Verify database connection
- **Disconnection Issues:** Check network settings

#### **Performance Issues:**
- **Slow Dashboard:** Refresh browser, check network
- **Data Not Loading:** Verify API endpoints
- **Charts Not Displaying:** Check JavaScript console

### **System Maintenance:**

#### **Daily Tasks:**
- Monitor active sessions
- Check voucher sales
- Review system logs
- Backup data

#### **Weekly Tasks:**
- Generate revenue reports
- Clean expired vouchers
- Update pricing if needed
- Check system health

#### **Monthly Tasks:**
- Full system backup
- Security audit
- Performance review
- Customer feedback analysis

### **Getting Help:**
- **System Logs:** Check `/logs/` directory
- **Health Check:** Visit `/health` endpoint
- **API Documentation:** Available at `/api-docs`
- **Technical Support:** Contact system administrator

---

## **📞 Support & Contact**

### **Emergency Procedures:**
1. **System Down:** Check server status, restart if needed
2. **Security Breach:** Immediately change passwords, check logs
3. **Payment Issues:** Verify payment gateway configuration
4. **Network Problems:** Check Ubuntu hotspot configuration

### **Best Practices:**
- Change default passwords immediately
- Regular backups (daily recommended)
- Monitor system logs regularly
- Keep pricing plans updated
- Review customer feedback
- Maintain network security

### **System Requirements:**
- **Ubuntu:** 20.04/22.04/24.04
- **Node.js:** v16+ recommended
- **MySQL:** 8.0+ recommended
- **Memory:** 2GB+ RAM
- **Storage:** 10GB+ available space

---

**🎉 Congratulations! You're now ready to manage your WiFi billing system effectively.**
