// Analytics Dashboard JavaScript
let charts = {};
let realtimeInterval;
let isRealtimeActive = true;

// Chart configurations
const chartColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#38ef7d',
    danger: '#f5576c',
    warning: '#ffc107',
    info: '#4facfe'
};

// Initialize all charts
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeCharts();
    loadAnalyticsData();
    startRealtimeUpdates();
    
    // Time filter event listeners
    document.querySelectorAll('.time-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadAnalyticsData(this.dataset.period);
        });
    });
});

// Initialize all charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Revenue ($)',
                data: [],
                borderColor: chartColors.primary,
                backgroundColor: `${chartColors.primary}20`,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
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
                    borderColor: chartColors.primary,
                    borderWidth: 1
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: '#e9ecef' },
                    ticks: { color: '#6c757d' }
                },
                x: {
                    grid: { color: '#e9ecef' },
                    ticks: { color: '#6c757d' }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });

    // Usage Chart (Radar)
    const usageCtx = document.getElementById('usageChart').getContext('2d');
    charts.usage = new Chart(usageCtx, {
        type: 'radar',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Usage',
                data: [20, 15, 45, 80, 95, 60],
                borderColor: chartColors.success,
                backgroundColor: `${chartColors.success}30`,
                pointBackgroundColor: chartColors.success,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#e9ecef' },
                    ticks: { display: false }
                }
            }
        }
    });

    // Voucher Chart (Bar)
    const voucherCtx = document.getElementById('voucherChart').getContext('2d');
    charts.voucher = new Chart(voucherCtx, {
        type: 'bar',
        data: {
            labels: ['1h', '2h', '12h', '24h', '1w'],
            datasets: [{
                label: 'Vouchers Sold',
                data: [120, 95, 180, 220, 45],
                backgroundColor: [
                    `${chartColors.primary}80`,
                    `${chartColors.secondary}80`,
                    `${chartColors.success}80`,
                    `${chartColors.danger}80`,
                    `${chartColors.warning}80`
                ],
                borderColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.success,
                    chartColors.danger,
                    chartColors.warning
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: '#e9ecef' }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // Geographic Chart (Doughnut)
    const geoCtx = document.getElementById('geoChart').getContext('2d');
    charts.geo = new Chart(geoCtx, {
        type: 'doughnut',
        data: {
            labels: ['Local', 'Regional', 'International'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.warning
                ],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true }
                }
            }
        }
    });

    // Device Chart (Polar Area)
    const deviceCtx = document.getElementById('deviceChart').getContext('2d');
    charts.device = new Chart(deviceCtx, {
        type: 'polarArea',
        data: {
            labels: ['Mobile', 'Laptop', 'Tablet', 'Desktop'],
            datasets: [{
                data: [45, 30, 15, 10],
                backgroundColor: [
                    `${chartColors.primary}80`,
                    `${chartColors.success}80`,
                    `${chartColors.warning}80`,
                    `${chartColors.danger}80`
                ],
                borderColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.danger
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true }
                }
            }
        }
    });

    // Duration Chart (Histogram)
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    charts.duration = new Chart(durationCtx, {
        type: 'bar',
        data: {
            labels: ['0-15m', '15-30m', '30-60m', '1-2h', '2h+'],
            datasets: [{
                label: 'Sessions',
                data: [85, 120, 95, 60, 25],
                backgroundColor: `${chartColors.info}60`,
                borderColor: chartColors.info,
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Real-time Chart
    const realtimeCtx = document.getElementById('realtimeChart').getContext('2d');
    charts.realtime = new Chart(realtimeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Active Users',
                data: [],
                borderColor: chartColors.success,
                backgroundColor: `${chartColors.success}20`,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }, {
                label: 'Bandwidth (Mbps)',
                data: [],
                borderColor: chartColors.danger,
                backgroundColor: `${chartColors.danger}20`,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: { beginAtZero: true },
                x: { display: false }
            },
            animation: { duration: 0 }
        }
    });

    // Update progress ring
    updateProgressRing();
}

// Load analytics data
async function loadAnalyticsData(period = 'today') {
    try {
        const data = await fetchWithAuth(`/api/admin/analytics?period=${period}`);
        
        // Update metrics
        updateMetrics(data.metrics);
        
        // Update charts
        updateChartData('revenue', data.revenue);
        updateChartData('usage', data.usage);
        updateChartData('voucher', data.vouchers);
        updateChartData('geo', data.geographic);
        updateChartData('device', data.devices);
        updateChartData('duration', data.duration);
        
    } catch (error) {
        showToast('Error loading analytics data', 'error');
        // Use mock data for demo
        loadMockData();
    }
}

// Load mock data for demonstration
function loadMockData() {
    const mockRevenue = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [320, 450, 380, 520, 480, 650, 590]
    };
    
    updateChartData('revenue', mockRevenue);
    
    // Animate metrics
    animateMetric('totalUsers', 1247);
    animateMetric('totalRevenue', 3456, '$');
    animateMetric('activeConnections', 89);
}

// Update chart data
function updateChartData(chartName, data) {
    if (charts[chartName] && data) {
        charts[chartName].data.labels = data.labels || charts[chartName].data.labels;
        if (data.datasets) {
            charts[chartName].data.datasets = data.datasets;
        } else if (data.data) {
            charts[chartName].data.datasets[0].data = data.data;
        }
        charts[chartName].update('active');
    }
}

// Update metrics with animation
function updateMetrics(metrics) {
    if (metrics) {
        animateMetric('totalUsers', metrics.users || 1247);
        animateMetric('totalRevenue', metrics.revenue || 3456, '$');
        animateMetric('activeConnections', metrics.active || 89);
        animateMetric('dataUsage', metrics.data || 2.3, '', ' TB');
    }
}

// Animate metric counters
function animateMetric(elementId, targetValue, prefix = '', suffix = '') {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
        
        element.textContent = prefix + Math.floor(currentValue).toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Update progress ring
function updateProgressRing() {
    const circle = document.getElementById('userProgress');
    const percentage = 78;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 500);
}

// Real-time updates
function startRealtimeUpdates() {
    realtimeInterval = setInterval(updateRealtimeChart, 2000);
}

function updateRealtimeChart() {
    if (!isRealtimeActive) return;
    
    const chart = charts.realtime;
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    // Generate mock real-time data
    const activeUsers = Math.floor(Math.random() * 20) + 70;
    const bandwidth = Math.floor(Math.random() * 50) + 100;
    
    // Add new data
    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(activeUsers);
    chart.data.datasets[1].data.push(bandwidth);
    
    // Keep only last 20 points
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
    }
    
    chart.update('none');
}

// Toggle real-time updates
function toggleRealtime() {
    isRealtimeActive = !isRealtimeActive;
    const icon = document.getElementById('realtimeIcon');
    
    if (isRealtimeActive) {
        icon.className = 'fas fa-pause';
        startRealtimeUpdates();
    } else {
        icon.className = 'fas fa-play';
        clearInterval(realtimeInterval);
    }
}

// Update specific chart
function updateChart(chartType, period) {
    showToast(`Updating ${chartType} chart for ${period} view`, 'info');
    // Implementation for specific chart updates
}

// Sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('show');
});

// Export analytics
function exportAnalytics() {
    showToast('Exporting analytics data...', 'info');
    // Implementation for export functionality
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'r':
                e.preventDefault();
                loadAnalyticsData();
                showToast('Analytics refreshed', 'success');
                break;
            case 'e':
                e.preventDefault();
                exportAnalytics();
                break;
        }
    }
});

// Resize handler for responsive charts
window.addEventListener('resize', function() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.resize();
    });
});
