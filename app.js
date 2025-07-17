// QR Code Generator Application
class QRCodeGenerator {
    constructor() {
        this.currentTab = 'url';
        this.qrCode = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
        this.generateQRCode();
    }

    setupEventListeners() {
        // Input field listeners for real-time updates
        document.querySelectorAll('.qr-input').forEach(input => {
            input.addEventListener('input', () => this.generateQRCode());
        });

        // Customization listeners
        document.querySelectorAll('.customize-input').forEach(input => {
            input.addEventListener('input', () => this.generateQRCode());
            input.addEventListener('change', () => this.generateQRCode());
        });

        // Download button
        document.getElementById('download-btn').addEventListener('click', () => this.downloadQRCode());

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => this.resetFields());
    }

    setupTabSwitching() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update current tab
        this.currentTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');

        // Generate QR code for new tab
        this.generateQRCode();
    }

    generateQRCode() {
        const data = this.getQRData();
        if (!data) {
            this.showPlaceholder();
            return;
        }

        this.createQRCode(data);
    }

    getQRData() {
        switch (this.currentTab) {
            case 'url':
                return this.getURLData();
            case 'email':
                return this.getEmailData();
            case 'phone':
                return this.getPhoneData();
            case 'wifi':
                return this.getWiFiData();
            case 'sms':
                return this.getSMSData();
            case 'text':
                return this.getTextData();
            case 'vcard':
                return this.getVCardData();
            default:
                return null;
        }
    }

    getURLData() {
        const url = document.getElementById('url-input').value.trim();
        if (!url) return null;
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }

    getEmailData() {
        const email = document.getElementById('email-input').value.trim();
        if (!email) return null;

        const subject = document.getElementById('email-subject').value.trim();
        const body = document.getElementById('email-body').value.trim();

        let mailtoUrl = `mailto:${email}`;
        const params = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
            mailtoUrl += `?${params.join('&')}`;
        }

        return mailtoUrl;
    }

    getPhoneData() {
        const phone = document.getElementById('phone-input').value.trim();
        if (!phone) return null;
        return `tel:${phone}`;
    }

    getWiFiData() {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        if (!ssid) return null;

        const password = document.getElementById('wifi-password').value.trim();
        const security = document.getElementById('wifi-security').value;

        let wifiString = `WIFI:T:${security};S:${ssid};`;
        if (password && security !== 'None') {
            wifiString += `P:${password};`;
        }
        wifiString += 'H:false;;';

        return wifiString;
    }

    getSMSData() {
        const phone = document.getElementById('sms-phone').value.trim();
        if (!phone) return null;

        const message = document.getElementById('sms-message').value.trim();
        let smsUrl = `sms:${phone}`;
        
        if (message) {
            smsUrl += `?body=${encodeURIComponent(message)}`;
        }

        return smsUrl;
    }

    getTextData() {
        const text = document.getElementById('text-input').value.trim();
        return text || null;
    }

    getVCardData() {
        const name = document.getElementById('vcard-name').value.trim();
        if (!name) return null;

        const phone = document.getElementById('vcard-phone').value.trim();
        const email = document.getElementById('vcard-email').value.trim();
        const organization = document.getElementById('vcard-organization').value.trim();

        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcard += `FN:${name}\n`;
        vcard += `N:${name.split(' ').reverse().join(';')}\n`;
        
        if (phone) vcard += `TEL:${phone}\n`;
        if (email) vcard += `EMAIL:${email}\n`;
        if (organization) vcard += `ORG:${organization}\n`;
        
        vcard += 'END:VCARD';

        return vcard;
    }

    createQRCode(data) {
        const container = document.getElementById('qr-code-container');
        const size = parseInt(document.getElementById('qr-size').value);
        const errorCorrection = document.getElementById('error-correction').value;
        const fgColor = document.getElementById('fg-color').value;
        const bgColor = document.getElementById('bg-color').value;
        const borderSize = parseInt(document.getElementById('border-size').value);

        // Clear previous QR code
        container.innerHTML = '';

        try {
            this.qrCode = new QRCode(container, {
                text: data,
                width: size,
                height: size,
                colorDark: fgColor,
                colorLight: bgColor,
                correctLevel: QRCode.CorrectLevel[errorCorrection],
                quietZone: borderSize,
                quietZoneColor: bgColor
            });

            this.updateStatus('success', 'QR code generated successfully');
            this.enableDownload();
        } catch (error) {
            this.updateStatus('error', 'Error generating QR code');
            this.showPlaceholder();
        }
    }

    showPlaceholder() {
        const container = document.getElementById('qr-code-container');
        container.innerHTML = `
            <div class="qr-placeholder" id="qr-placeholder">
                <div class="placeholder-icon">📱</div>
                <p>Enter information to generate QR code</p>
            </div>
        `;
        this.updateStatus('info', 'Ready to generate');
        this.disableDownload();
    }

    updateStatus(type, message) {
        const statusElement = document.getElementById('preview-status');
        statusElement.className = `status status--${type}`;
        statusElement.textContent = message;
    }

    enableDownload() {
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download QR Code';
    }

    disableDownload() {
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Download QR Code';
    }

    downloadQRCode() {
        if (!this.qrCode) return;

        try {
            const canvas = document.querySelector('#qr-code-container canvas');
            if (!canvas) return;

            // Create download link
            const link = document.createElement('a');
            link.download = `qr-code-${this.currentTab}-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.updateStatus('success', 'QR code downloaded successfully');
        } catch (error) {
            this.updateStatus('error', 'Error downloading QR code');
        }
    }

    resetFields() {
        // Reset all input fields in the current tab
        const currentTabPane = document.getElementById(`${this.currentTab}-tab`);
        currentTabPane.querySelectorAll('.qr-input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Reset all tab input fields
        document.querySelectorAll('.qr-input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Reset customization options to defaults
        document.getElementById('qr-size').value = '300';
        document.getElementById('error-correction').value = 'M';
        document.getElementById('fg-color').value = '#000000';
        document.getElementById('bg-color').value = '#ffffff';
        document.getElementById('border-size').value = '0';

        // Reset to first tab
        this.switchTab('url');
        
        // Generate QR code (will show placeholder)
        this.generateQRCode();
        
        this.updateStatus('info', 'All fields reset');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Add input validation styles
document.addEventListener('DOMContentLoaded', () => {
    // Add real-time validation feedback
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = 'var(--color-error)';
            } else {
                this.style.borderColor = '';
            }
        });
    });

    document.querySelectorAll('input[type="url"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateURL(this.value)) {
                this.style.borderColor = 'var(--color-error)';
            } else {
                this.style.borderColor = '';
            }
        });
    });

    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.style.borderColor = 'var(--color-error)';
            } else {
                this.style.borderColor = '';
            }
        });
    });
});