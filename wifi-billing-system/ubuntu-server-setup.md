🔥 UBUNTU SERVER SETUP (FULL CONFIGURATION FOR HOTSPOT + VOUCHER SYSTEM)

Requirement: Ubuntu 20.04 / 22.04 / 24.04 (either Desktop or Server)

✅ STEP 1: Install required packages
sudo apt update
sudo apt install hostapd dnsmasq iptables netfilter-persistent git curl -y


Disable services for now:

sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

🟩 STEP 2: Configure WiFi Hotspot (hostapd)

File:

sudo nano /etc/hostapd/hostapd.conf


Paste:

interface=wlan0
driver=nl80211
ssid=Windowseven_Hotspot
hw_mode=g
channel=6
auth_algs=1
wmm_enabled=1
ignore_broadcast_ssid=0


Now register hostapd config:

sudo nano /etc/default/hostapd


Add:

DAEMON_CONF="/etc/hostapd/hostapd.conf"

🟦 STEP 3: Configure Dnsmasq (DHCP + DNS for clients)

Backup original:

sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.backup


Create new:

sudo nano /etc/dnsmasq.conf


Paste:

interface=wlan0
dhcp-range=10.10.0.10,10.10.0.200,12h

dhcp-option=3,10.10.0.1
dhcp-option=6,10.10.0.1

address=/#/10.10.0.1

🟥 STEP 4: Set static IP for hotspot interface (wlan0)
sudo nano /etc/netplan/01-hotspot.yaml


Paste:

network:
  version: 2
  renderer: networkd
  ethernets:
    wlan0:
      addresses:
        - 10.10.0.1/24
      dhcp4: no


Apply:

sudo netplan apply

🟨 STEP 5: Setup NAT (internet forwarding)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT


Save rules permanently:

sudo netfilter-persistent save

🟪 STEP 6: Captive Portal Redirect (Force login page)
Redirect all traffic to your API portal:
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.10.0.1:8080


Note:
10.10.0.1:8080 = Node backend running on port 8080 (we can change later).

Save:

sudo netfilter-persistent save

🟩 STEP 7: Start hotspot services
sudo systemctl start dnsmasq
sudo systemctl start hostapd


Enable on boot:

sudo systemctl enable hostapd
sudo systemctl enable dnsmasq

🟦 STEP 8: Confirm hotspot is active

Run:

sudo systemctl status hostapd
sudo systemctl status dnsmasq


Your WiFi network Windowseven_Hotspot will appear.
Clients connecting will get:

IP: 10.10.0.xxx
Gateway: 10.10.0.1
DNS: 10.10.0.1


And all traffic → redirected to your Node backend login page.

🟧 STEP 9: Integration with Node backend

Your Ubuntu hotspot will redirect devices to:

http://10.10.0.1:8080/login


Node backend must listen on:

0.0.0.0


Example:

app.listen(8080, "0.0.0.0", () => console.log("Server Running"));

🎉 DONE! Ubuntu Hotspot Billing Server fully configured.


🔹 Next Steps:
1. Deploy your Node backend
2. Test connections from devices
3. Monitor logs for authentication events

4. Set up payment processing integration
