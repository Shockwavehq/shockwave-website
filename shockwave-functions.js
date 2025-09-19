// ===== SHOCKWAVE FUNCTIONS - WORKING CODE =====

// Simple Counter Animation
function animateCounter(element, target, duration = 2000) {
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

// Industry Card Interactions
function initIndustryCards() {
    const cards = document.querySelectorAll('.industry-card');
    const roiCounter = document.querySelector('.roi-counter');
    
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
                animateCounter(roiCounter, roi, 1500);
            }
            
            // Store selection for later use
            localStorage.setItem('selectedIndustry', industry);
            localStorage.setItem('selectedROI', roi);
            
            // Open ROI calculator after short delay
            setTimeout(() => {
                openROICalculator(industry);
            }, 1000);
        });
    });
}

// Simple ROI Calculator Modal
function openROICalculator(selectedIndustry = null) {
    // Create modal HTML
    const modalHTML = `
        <div class="roi-modal-overlay" id="roiModal">
            <div class="roi-modal">
                <div class="roi-modal-header">
                    <h3>Calculate Your ${selectedIndustry || 'Business'} ROI</h3>
                    <button class="close-modal" onclick="closeROICalculator()">&times;</button>
                </div>
                <div class="roi-modal-content">
                    <div class="roi-form">
                        <div class="form-group">
                            <label>Monthly Revenue:</label>
                            <input type="number" id="monthlyRevenue" placeholder="50000" value="50000">
                        </div>
                        <div class="form-group">
                            <label>Current Lead Conversion Rate (%):</label>
                            <input type="number" id="conversionRate" placeholder="3" value="3">
                        </div>
                        <div class="form-group">
                            <label>Average Deal Size ($):</label>
                            <input type="number" id="dealSize" placeholder="2500" value="2500">
                        </div>
                        <button class="cta-primary" onclick="calculateROI()">Calculate My ROI</button>
                    </div>
                    <div class="roi-results" id="roiResults" style="display: none;">
                        <h4>Your Automation ROI Potential:</h4>
                        <div class="result-item">
                            <span>Additional Monthly Revenue:</span>
                            <span class="result-value" id="additionalRevenue">$0</span>
                        </div>
                        <div class="result-item">
                            <span>Time Saved Per Month:</span>
                            <span class="result-value" id="timeSaved">0 hours</span>
                        </div>
                        <div class="result-item">
                            <span>ROI Percentage:</span>
                            <span class="result-value" id="roiPercentage">0%</span>
                        </div>
                        <button class="cta-primary pulse-animation" onclick="openCalendarModal()">
                            Book My Implementation Call
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Close on overlay click
    document.getElementById('roiModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeROICalculator();
        }
    });
}

function closeROICalculator() {
    const modal = document.getElementById('roiModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function calculateROI() {
    const revenue = parseFloat(document.getElementById('monthlyRevenue').value) || 0;
    const conversionRate = parseFloat(document.getElementById('conversionRate').value) || 0;
    const dealSize = parseFloat(document.getElementById('dealSize').value) || 0;
    
    // Simple ROI calculation (automation typically improves conversion by 25-40%)
    const improvementRate = 0.3; // 30% improvement
    const additionalRevenue = revenue * improvementRate;
    const timeSaved = Math.floor(revenue / 1000); // Rough estimate
    const roiPercentage = Math.floor(improvementRate * 100 * 1.5); // Enhanced ROI
    
    // Update results
    document.getElementById('additionalRevenue').textContent = '$' + additionalRevenue.toLocaleString();
    document.getElementById('timeSaved').textContent = timeSaved + ' hours';
    document.getElementById('roiPercentage').textContent = roiPercentage + '%';
    
    // Show results
    document.getElementById('roiResults').style.display = 'block';
    
    // Animate numbers
    const resultValues = document.querySelectorAll('.result-value');
    resultValues.forEach(value => {
        value.style.color = 'var(--shockwave-red)';
        value.style.fontWeight = '800';
    });
}

// Calendar Modal (Calendly Integration)
function openCalendarModal(industry = null) {
    const modalHTML = `
        <div class="calendar-modal-overlay" id="calendarModal">
            <div class="calendar-modal">
                <div class="calendar-modal-header">
                    <h3>Book Your ${industry || ''} Strategy Call</h3>
                    <button class="close-modal" onclick="closeCalendarModal()">&times;</button>
                </div>
                <div class="calendar-modal-content">
                    <div class="booking-benefits">
                        <h4>What You'll Get (15 Minutes):</h4>
                        <ul>
                            <li>✅ Custom ROI analysis for your business</li>
                            <li>✅ Specific automation recommendations</li>
                            <li>✅ Implementation timeline & investment</li>
                            <li>✅ Risk-free pilot proposal</li>
                        </ul>
                    </div>
                    <div class="calendly-container">
                        <p style="text-align: center; padding: 40px; color: #888;">
                            <strong>Calendly integration goes here</strong><br>
                            Replace this with your actual Calendly embed code
                        </p>
                        <button class="cta-primary" onclick="alert('Calendar booking would happen here')">
                            Book Strategy Call
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Close on overlay click
    document.getElementById('calendarModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCalendarModal();
        }
    });
}

function closeCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize industry cards
    initIndustryCards();
    
    // Start counters
    const roiCounter = document.querySelector('.roi-counter');
    if (roiCounter) {
        animateCounter(roiCounter, 50000, 2000);
    }
    
    const statsCounter = document.querySelector('.stats-number');
    if (statsCounter) {
        setTimeout(() => {
            animateCounter(statsCounter, 247, 1500);
        }, 1000);
    }
    
    // Add fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Escape key closes modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeROICalculator();
        closeCalendarModal();
    }
});
