// Professional Features & Enhanced UX
class ProfessionalFeatures {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupAdvancedSearch();
        this.setupDragAndDrop();
        this.setupContextMenus();
        this.setupTooltips();
        this.setupProgressIndicators();
        this.setupAutoSave();
        this.setupThemeToggle();
        this.setupNotificationCenter();
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        const shortcuts = {
            'ctrl+k': () => this.openCommandPalette(),
            'ctrl+/': () => this.showShortcutsHelp(),
            'ctrl+r': () => this.refreshCurrentPage(),
            'ctrl+s': () => this.saveCurrentForm(),
            'ctrl+n': () => this.createNew(),
            'ctrl+f': () => this.focusSearch(),
            'esc': () => this.closeModals(),
            'ctrl+shift+d': () => this.toggleDarkMode(),
            'ctrl+shift+n': () => this.openNotifications(),
            'alt+1': () => this.navigateTo('dashboard'),
            'alt+2': () => this.navigateTo('vouchers'),
            'alt+3': () => this.navigateTo('sessions'),
            'alt+4': () => this.navigateTo('customers'),
            'alt+5': () => this.navigateTo('analytics'),
            'alt+6': () => this.navigateTo('settings')
        };

        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });

        // Show shortcuts indicator
        this.createShortcutsIndicator();
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    // Command Palette
    openCommandPalette() {
        const palette = document.createElement('div');
        palette.className = 'command-palette';
        palette.innerHTML = `
            <div class="command-palette-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="command-palette-content">
                <div class="command-search">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Type a command..." id="commandInput">
                </div>
                <div class="command-results" id="commandResults">
                    <div class="command-item" data-action="refresh">
                        <i class="fas fa-sync-alt"></i>
                        <span>Refresh Page</span>
                        <kbd>Ctrl+R</kbd>
                    </div>
                    <div class="command-item" data-action="create-voucher">
                        <i class="fas fa-plus"></i>
                        <span>Create Voucher</span>
                        <kbd>Ctrl+N</kbd>
                    </div>
                    <div class="command-item" data-action="settings">
                        <i class="fas fa-cog"></i>
                        <span>Open Settings</span>
                        <kbd>Alt+6</kbd>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(palette);
        document.getElementById('commandInput').focus();

        // Command search functionality
        this.setupCommandSearch();
    }

    // Advanced Search with Filters
    setupAdvancedSearch() {
        document.querySelectorAll('.advanced-search').forEach(searchBox => {
            const dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown';
            dropdown.innerHTML = `
                <div class="search-filters">
                    <label><input type="checkbox" value="ip"> IP Address</label>
                    <label><input type="checkbox" value="mac"> MAC Address</label>
                    <label><input type="checkbox" value="voucher"> Voucher Code</label>
                    <label><input type="checkbox" value="date"> Date Range</label>
                </div>
                <div class="search-suggestions" id="searchSuggestions"></div>
            `;
            
            searchBox.parentNode.appendChild(dropdown);
            
            searchBox.addEventListener('focus', () => {
                dropdown.style.display = 'block';
                this.loadSearchSuggestions();
            });
            
            searchBox.addEventListener('blur', (e) => {
                setTimeout(() => dropdown.style.display = 'none', 200);
            });
        });
    }

    // Drag and Drop for File Uploads
    setupDragAndDrop() {
        document.querySelectorAll('.drag-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                this.handleFileUpload(e.dataTransfer.files, zone);
            });
        });
    }

    // Context Menus
    setupContextMenus() {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.context-menu-trigger')) {
                e.preventDefault();
                this.showContextMenu(e);
            }
        });
    }

    showContextMenu(e) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-item" onclick="this.parentElement.remove()">
                <i class="fas fa-eye"></i> View Details
            </div>
            <div class="context-item" onclick="this.parentElement.remove()">
                <i class="fas fa-edit"></i> Edit
            </div>
            <div class="context-item" onclick="this.parentElement.remove()">
                <i class="fas fa-copy"></i> Copy
            </div>
            <hr>
            <div class="context-item danger" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i> Delete
            </div>
        `;

        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        document.body.appendChild(menu);

        // Remove on click outside
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    }

    // Enhanced Tooltips
    setupTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'professional-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    hideTooltip() {
        document.querySelectorAll('.professional-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
    }

    // Progress Indicators
    setupProgressIndicators() {
        this.createGlobalProgressBar();
    }

    createGlobalProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'globalProgress';
        progressBar.className = 'global-progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);
    }

    showProgress(percentage = 0) {
        const progressBar = document.getElementById('globalProgress');
        const fill = progressBar.querySelector('.progress-fill');
        progressBar.classList.add('active');
        fill.style.width = percentage + '%';
    }

    hideProgress() {
        const progressBar = document.getElementById('globalProgress');
        progressBar.classList.remove('active');
    }

    // Auto-save functionality
    setupAutoSave() {
        document.querySelectorAll('form[data-autosave]').forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.debounce(() => this.autoSave(form), 2000)();
                });
            });
        });
    }

    autoSave(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        localStorage.setItem(`autosave_${form.id}`, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));

        this.showAutoSaveIndicator();
    }

    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = '<i class="fas fa-check"></i> Auto-saved';
        document.body.appendChild(indicator);

        setTimeout(() => indicator.remove(), 2000);
    }

    // Theme Toggle
    setupThemeToggle() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        showToast(`Switched to ${newTheme} mode`, 'info');
    }

    // Notification Center
    setupNotificationCenter() {
        this.createNotificationCenter();
        this.loadNotifications();
    }

    createNotificationCenter() {
        const center = document.createElement('div');
        center.id = 'notificationCenter';
        center.className = 'notification-center';
        center.innerHTML = `
            <div class="notification-header">
                <h6>Notifications</h6>
                <button onclick="this.parentElement.parentElement.classList.remove('show')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-list" id="notificationList">
                <!-- Notifications will be loaded here -->
            </div>
        `;
        document.body.appendChild(center);
    }

    openNotifications() {
        document.getElementById('notificationCenter').classList.add('show');
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    navigateTo(page) {
        window.location.href = `${page}.html`;
    }

    refreshCurrentPage() {
        window.location.reload();
    }

    saveCurrentForm() {
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }

    createNew() {
        const createBtn = document.querySelector('[data-bs-target*="create"], [data-bs-target*="Create"]');
        if (createBtn) createBtn.click();
    }

    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
        if (searchInput) searchInput.focus();
    }

    closeModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            bootstrap.Modal.getInstance(modal)?.hide();
        });
    }

    createShortcutsIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'shortcuts-indicator';
        indicator.innerHTML = '<kbd>Ctrl</kbd> + <kbd>/</kbd> for shortcuts';
        indicator.onclick = () => this.showShortcutsHelp();
        document.body.appendChild(indicator);
    }

    showShortcutsHelp() {
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="shortcuts-content">
                <h5>Keyboard Shortcuts</h5>
                <div class="shortcuts-grid">
                    <div><kbd>Ctrl</kbd> + <kbd>K</kbd> <span>Command Palette</span></div>
                    <div><kbd>Ctrl</kbd> + <kbd>R</kbd> <span>Refresh</span></div>
                    <div><kbd>Ctrl</kbd> + <kbd>N</kbd> <span>Create New</span></div>
                    <div><kbd>Ctrl</kbd> + <kbd>F</kbd> <span>Search</span></div>
                    <div><kbd>Alt</kbd> + <kbd>1-6</kbd> <span>Navigate</span></div>
                    <div><kbd>Esc</kbd> <span>Close Modals</span></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize professional features
document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalFeatures();
});

// Add professional CSS styles
const professionalStyles = `
<style>
.command-palette {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
}

.command-palette-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(5px);
}

.command-palette-content {
    background: white;
    border-radius: 15px;
    width: 500px;
    max-width: 90vw;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    position: relative;
    z-index: 1;
}

.command-search {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
}

.command-search i {
    color: #6c757d;
    margin-right: 15px;
}

.command-search input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 16px;
}

.command-item {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.command-item:hover {
    background: #f8f9fa;
}

.command-item i {
    width: 20px;
    margin-right: 15px;
    color: #6c757d;
}

.command-item span {
    flex: 1;
}

.command-item kbd {
    background: #e9ecef;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.context-menu {
    position: absolute;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 9999;
    min-width: 150px;
    padding: 8px 0;
}

.context-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.context-item:hover {
    background: #f8f9fa;
}

.context-item i {
    width: 16px;
    margin-right: 12px;
}

.context-item.danger {
    color: #dc3545;
}

.professional-tooltip {
    position: absolute;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 9999;
    opacity: 0;
    transform: translateY(5px);
    transition: all 0.2s ease;
}

.professional-tooltip.show {
    opacity: 1;
    transform: translateY(0);
}

.global-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #e9ecef;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.global-progress-bar.active {
    opacity: 1;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
}

.autosave-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 10px 15px;
    border-radius: 25px;
    font-size: 14px;
    z-index: 9999;
    animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.shortcuts-indicator {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    cursor: pointer;
    z-index: 1000;
}

.shortcuts-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.shortcuts-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
}

.shortcuts-content {
    background: white;
    border-radius: 15px;
    padding: 30px;
    position: relative;
    z-index: 1;
    max-width: 500px;
}

.shortcuts-grid {
    display: grid;
    gap: 15px;
    margin-top: 20px;
}

.shortcuts-grid div {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-center {
    position: fixed;
    top: 70px;
    right: -350px;
    width: 350px;
    height: calc(100vh - 100px);
    background: white;
    box-shadow: -5px 0 20px rgba(0,0,0,0.1);
    z-index: 9999;
    transition: right 0.3s ease;
    border-radius: 15px 0 0 15px;
}

.notification-center.show {
    right: 0;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
}

[data-theme="dark"] {
    --bs-body-bg: #1a1a1a;
    --bs-body-color: #e9ecef;
}

[data-theme="dark"] .card {
    background: #2d2d2d;
    border-color: #404040;
}

[data-theme="dark"] .navbar-custom {
    background: linear-gradient(90deg, #2d2d2d 0%, #404040 100%);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', professionalStyles);
