// Cyberlab-inspired Admin Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeCharts();
    loadDashboardData();
});

// Sidebar functionality
function initializeSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Profile menu functionality
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    profileMenu.classList.toggle('show');
}

// Close profile menu when clicking outside
document.addEventListener('click', function(e) {
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileMenu && !profileDropdown.contains(e.target)) {
        profileMenu.classList.remove('show');
    }
});

// Initialize charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [120, 190, 300, 500, 200, 300, 450],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: '#f1f3f4' },
                        ticks: { color: '#666' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666' }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    // Voucher Chart
    const voucherCtx = document.getElementById('voucherChart');
    if (voucherCtx) {
        new Chart(voucherCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['1 Hour', '2 Hours', '12 Hours', '24 Hours', 'Weekly'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2', 
                        '#28a745',
                        '#ffc107',
                        '#17a2b8'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Simulate API calls - replace with actual endpoints
        const stats = await mockApiCall('/api/admin/stats');
        const sessions = await mockApiCall('/api/admin/sessions/recent');
        const vouchers = await mockApiCall('/api/admin/vouchers/recent');
        
        updateStats(stats);
        updateRecentSessions(sessions);
        updateRecentVouchers(vouchers);
        
    } catch (error) {
        showToast('Error loading dashboard data', 'error');
    }
}

// Mock API call for demonstration
function mockApiCall(endpoint) {
    return new Promise((resolve) => {
        setTimeout(() => {
            switch(endpoint) {
                case '/api/admin/stats':
                    resolve({
                        totalUsers: 247,
                        activeSessions: 89,
                        vouchersSold: 156,
                        totalRevenue: 1234
                    });
                    break;
                case '/api/admin/sessions/recent':
                    resolve([
                        { client_ip: '192.168.1.101', device: 'Mobile', timeLeft: '45m', status: 'Active' },
                        { client_ip: '192.168.1.102', device: 'Laptop', timeLeft: '23m', status: 'Active' },
                        { client_ip: '192.168.1.103', device: 'Tablet', timeLeft: '12m', status: 'Expiring' }
                    ]);
                    break;
                case '/api/admin/vouchers/recent':
                    resolve([
                        { code: 'ABC123', duration: '1 Hour', type: 'Standard', status: 'Active' },
                        { code: 'DEF456', duration: '2 Hours', type: 'Premium', status: 'Used' },
                        { code: 'GHI789', duration: '24 Hours', type: 'Extended', status: 'Active' }
                    ]);
                    break;
                default:
                    resolve({});
            }
        }, 500);
    });
}

// Update stats with animation
function updateStats(stats) {
    animateCounter('totalUsers', stats.totalUsers);
    animateCounter('activeSessions', stats.activeSessions);
    animateCounter('vouchersSold', stats.vouchersSold);
    animateCounter('totalRevenue', stats.totalRevenue, '$');
}

// Animate counter numbers
function animateCounter(elementId, targetValue, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
        
        element.textContent = prefix + Math.floor(currentValue).toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Update recent sessions table
function updateRecentSessions(sessions) {
    const tbody = document.getElementById('recentSessions');
    if (!tbody || !sessions) return;
    
    tbody.innerHTML = sessions.map(session => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="user-avatar bg-primary me-2">
                        <i class="fas fa-${getDeviceIcon(session.device)} text-white"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${session.client_ip}</div>
                        <small class="text-muted">${session.device}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="fw-bold ${session.status === 'Expiring' ? 'text-warning' : ''}">${session.timeLeft}</div>
                <small class="text-muted">remaining</small>
            </td>
            <td>
                <span class="badge bg-${session.status === 'Active' ? 'success' : 'warning'}">${session.status}</span>
            </td>
        </tr>
    `).join('');
}

// Update recent vouchers table
function updateRecentVouchers(vouchers) {
    const tbody = document.getElementById('recentVouchers');
    if (!tbody || !vouchers) return;
    
    tbody.innerHTML = vouchers.map(voucher => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="user-avatar bg-${voucher.status === 'Active' ? 'success' : 'secondary'} me-2">
                        <i class="fas fa-ticket-alt text-white"></i>
                    </div>
                    <code class="fw-bold">${voucher.code}</code>
                </div>
            </td>
            <td>
                <div class="fw-bold">${voucher.duration}</div>
                <small class="text-muted">${voucher.type}</small>
            </td>
            <td>
                <span class="badge bg-${voucher.status === 'Active' ? 'success' : 'secondary'}">${voucher.status}</span>
            </td>
        </tr>
    `).join('');
}

// Get device icon
function getDeviceIcon(device) {
    const icons = {
        'Mobile': 'mobile-alt',
        'Laptop': 'laptop',
        'Tablet': 'tablet-alt',
        'Desktop': 'desktop'
    };
    return icons[device] || 'device';
}

// Refresh dashboard data
function refreshData() {
    showToast('Refreshing dashboard...', 'info');
    loadDashboardData();
}

// Show toast notification
function showToast(message, type = 'info') {
    const bgColor = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    }[type] || '#17a2b8';
    
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: bgColor,
            stopOnFocus: true,
            style: {
                borderRadius: "10px"
            }
        }).showToast();
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showToast('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Responsive handling
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth >= 768) {
        sidebar.classList.remove('active');
    }
});

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
    loadDashboardData();
}, 30000);
