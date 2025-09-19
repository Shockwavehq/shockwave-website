// ===== SHOCKWAVE FUNCTIONS - CDN READY =====

// Counter Animation
function shockwaveAnimateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    updateCounter();
}

// Industry Card System
function initShockwaveIndustryCards() {
    const cards = document.querySelectorAll('.shockwave-industry-card');
    const roiCounter = document.querySelector('.shockwave-roi-counter');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected from all cards
            cards.forEach(c => c.classList.remove('selected'));
            
            // Add selected to clicked card
            this.classList.add('selected');
            
            // Get industry data
            const industry = this.dataset.industry;
            const roi = parseInt(this.dataset.roi);
            
            // Update ROI counter
            if (roiCounter) {
                shockwaveAnimateCounter(roiCounter, roi, 1500);
            }
            
            // Store for later use
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('shockwaveSelectedIndustry', industry);
                localStorage.setItem('shockwaveSelectedROI', roi);
            }
            
            // Auto-open ROI calculator
            setTimeout(() => {
                openShockwaveROICalculator(industry);
            }, 1000);
        });
    });
}

// ROI Calculator Modal
function openShockwaveROICalculator(selectedIndustry = null) {
    const existingModal = document.getElementById('shockwaveROIModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div class="shockwave-modal-overlay" id="shockwaveROIModal">
            <div class="shockwave-modal">
                <div class="shockwave-modal-header">
                    <h3>Calculate Your ${selectedIndustry || 'Business'} ROI</h3>
                    <button class="shockwave-close-modal" onclick="closeShockwaveROICalculator()">&times;</button>
                </div>
                <div class="shockwave-modal-content">
                    <div class="shockwave-roi-form">
                        <div class="shockwave-form-group">
                            <label>Monthly Revenue ($):</label>
                            <input type="number" id="shockwaveMonthlyRevenue" placeholder="50000" value="50000">
                        </div>
                        <div class="shockwave-form-group">
                            <label>Current Lead Conversion Rate (%):</label>
                            <input type="number" id="shockwaveConversionRate" placeholder="3" value="3" min="1" max="100">
                        </div>
                        <div class="shockwave-form-group">
                            <label>Average Deal Size ($):</label>
                            <input type="number" id="shockwaveDealSize" placeholder="2500" value="2500">
                        </div>
                        <button class="shockwave-cta-primary" onclick="calculateShockwaveROI()" style="width: 100%; margin-bottom: 20px;">
                            📊 Calculate My ROI
                        </button>
                    </div>
                    <div class="shockwave-results" id="shockwaveROIResults" style="display: none;">
                        <h4 style="margin-bottom: 20px; color: var(--shockwave-red);">Your Automation ROI Potential:</h4>
                        <div class="shockwave-result-item">
                            <span>Additional Monthly Revenue:</span>
                            <span class="shockwave-result-value" id="shockwaveAdditionalRevenue">$0</span>
                        </div>
                        <div class="shockwave-result-item">
                            <span>Time Saved Per Month:</span>
                            <span class="shockwave-result-value" id="shockwaveTimeSaved">0 hours</span>
                        </div>
                        <div class="shockwave-result-item">
                            <span>ROI Percentage:</span>
                            <span class="shockwave-result-value" id="shockwaveROIPercentage">0%</span>
                        </div>
                        <button class="shockwave-cta-primary shockwave-pulse" onclick="openShockwaveCalendar()" style="width: 100%; margin-top: 20px;">
                            🚀 Book My Implementation Call
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Close on overlay click
    document.getElementById('shockwaveROIModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeShockwaveROICalculator();
        }
    });
}

function closeShockwaveROICalculator() {
    const modal = document.getElementById('shockwaveROIModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function calculateShockwaveROI() {
    const revenue = parseFloat(document.getElementById('shockwaveMonthlyRevenue').value) || 0;
    const conversionRate = parseFloat(document.getElementById('shockwaveConversionRate').value) || 0;
    const dealSize = parseFloat(document.getElementById('shockwaveDealSize').value) || 0;
    
    // ROI Calculation Logic
    const automationImprovement = 0.35; // 35% improvement
    const additionalRevenue = Math.floor(revenue * automationImprovement);
    const timeSaved = Math.floor(revenue / 2000) + 40; // Base 40 hours + scaled
    const roiPercentage = Math.floor(automationImprovement * 100 * 1.8);
    
    // Update results with animation
    setTimeout(() => {
        document.getElementById('shockwaveAdditionalRevenue').textContent = '$' + additionalRevenue.toLocaleString();
    }, 100);
    
    setTimeout(() => {
        document.getElementById('shockwaveTimeSaved').textContent = timeSaved + ' hours';
    }, 300);
    
    setTimeout(() => {
        document.getElementById('shockwaveROIPercentage').textContent = roiPercentage + '%';
    }, 500);
    
    // Show results
    document.getElementById('shockwaveROIResults').style.display = 'block';
    
    // Scroll to results
    document.getElementById('shockwaveROIResults').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

// Calendar Modal 
function openShockwaveCalendar() {
    // Close ROI modal first
    closeShockwaveROICalculator();
    
    const modalHTML = `
        <div class="shockwave-modal-overlay" id="shockwaveCalendarModal">
            <div class="shockwave-modal" style="max-width: 900px;">
                <div class="shockwave-modal-header">
                    <h3>Book Your Strategy Call</h3>
                    <button class="shockwave-close-modal" onclick="closeShockwaveCalendar()">&times;</button>
                </div>
                <div class="shockwave-modal-content" style="display: grid; grid-template-columns: 300px 1fr; gap: 0; padding: 0;">
                    <div style="padding: 32px 24px; background: rgba(255,255,255,0.02); border-right: 1px solid var(--glass-border);">
                        <h4 style="color: var(--shockwave-red); margin-bottom: 16px;">What You'll Get:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 12px; font-size: 0.95rem;">✅ Custom ROI analysis</li>
                            <li style="margin-bottom: 12px; font-size: 0.95rem;">✅ Automation recommendations</li>
                            <li style="margin-bottom: 12px; font-size: 0.95rem;">✅ Implementation timeline</li>
                            <li style="margin-bottom: 12px; font-size: 0.95rem;">✅ Risk-free pilot proposal</li>
                        </ul>
                    </div>
                    <div style="padding: 32px 24px; text-align: center;">
                        <p style="margin-bottom: 20px; color: #888;">
                            <strong>Calendly Integration Placeholder</strong><br>
                            Replace this section with your Calendly embed code
                        </p>
                        <button class="shockwave-cta-primary" onclick="alert('Calendar booking functionality goes here')">
                            📅 Book Strategy Call Now
                        </button>
                        <p style="margin-top: 15px; font-size: 0.85rem; color: #666;">
                            🚀 Risk-free • ⚡ 15-minute setup • 💰 ROI guaranteed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    document.getElementById('shockwaveCalendarModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeShockwaveCalendar();
        }
    });
}

function closeShockwaveCalendar() {
    const modal = document.getElementById('shockwaveCalendarModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Initialize on page load
function initShockwave() {
    // Initialize industry cards
    initShockwaveIndustryCards();
    
    // Start hero counters
    const roiCounter = document.querySelector('.shockwave-roi-counter');
    if (roiCounter) {
        setTimeout(() => {
            shockwaveAnimateCounter(roiCounter, 50000, 2500);
        }, 1000);
    }
    
    const statsCounter = document.querySelector('.shockwave-stats-number');
    if (statsCounter) {
        setTimeout(() => {
            shockwaveAnimateCounter(statsCounter, 247, 2000);
        }, 1500);
    }
    
    // Fade in animations
    const fadeElements = document.querySelectorAll('.shockwave-fade-in');
    fadeElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 200);
    });
}

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShockwave);
} else {
    initShockwave();
}

// Escape key functionality
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeShockwaveROICalculator();
        closeShockwaveCalendar();
    }
});

// Global functions for direct HTML access
window.openShockwaveROICalculator = openShockwaveROICalculator;
window.closeShockwaveROICalculator = closeShockwaveROICalculator;
window.calculateShockwaveROI = calculateShockwaveROI;
window.openShockwaveCalendar = openShockwaveCalendar;
window.closeShockwaveCalendar = closeShockwaveCalendar;
