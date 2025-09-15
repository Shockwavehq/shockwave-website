/* ==========================================
   SHOCKWAVE PLATFORM JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 ShockwaveHQ Platform Loading...');
  
  // Initialize all modules
  ROICalculator.init();
  SmoothScroll.init();
  
  console.log('✅ ShockwaveHQ Platform Ready!');
});

/* ==========================================
   ROI CALCULATOR MODULE  
   ========================================== */
const ROICalculator = {
  currentStep: 1,
  data: {},
  
  init() {
    console.log('📊 ROI Calculator initialized');
    this.bindEvents();
  },
  
  bindEvents() {
    // Industry selection
    document.addEventListener('click', (e) => {
      if (e.target.matches('.industry-btn')) {
        this.selectIndustry(e.target);
      }
      
      if (e.target.matches('.revenue-btn')) {
        this.selectRevenue(e.target);
      }
      
      if (e.target.matches('.pain-btn')) {
        this.selectPainPoints(e.target);
      }
    });
  },
  
  selectIndustry(button) {
    const industry = button.dataset.industry;
    this.data.industry = industry;
    
    // Visual feedback
    document.querySelectorAll('.industry-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    // Show next step after short delay
    setTimeout(() => {
      this.showStep(2);
    }, 800);
    
    console.log('Industry selected:', industry);
    this.trackEvent('industry_selected', { industry });
  },
  
  selectRevenue(button) {
    const revenue = parseInt(button.dataset.revenue);
    this.data.revenue = revenue;
    
    // Visual feedback
    document.querySelectorAll('.revenue-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    // Show next step after short delay
    setTimeout(() => {
      this.showStep(3);
    }, 800);
    
    console.log('Revenue selected:', revenue);
    this.trackEvent('revenue_selected', { revenue });
  },
  
  selectPainPoints(button) {
    const painPoints = button.dataset.pain;
    this.data.painPoints = painPoints;
    
    // Visual feedback
    document.querySelectorAll('.pain-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    // Calculate and show results after delay
    setTimeout(() => {
      this.calculateROI();
    }, 800);
    
    console.log('Pain points selected:', painPoints);
    this.trackEvent('pain_points_selected', { painPoints });
  },
  
  showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.calc-step').forEach(step => {
      step.classList.add('hidden');
    });
    
    // Show target step with animation
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
      setTimeout(() => {
        targetStep.classList.remove('hidden');
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      this.currentStep = stepNumber;
    }
  },
  
  calculateROI() {
    const { industry, revenue, painPoints } = this.data;
    
    // Industry multipliers based on typical automation benefits
    const industryMultipliers = {
      'healthcare': 3.2,
      'saas': 2.8,
      'ecommerce': 2.4,
      'consulting': 3.8,
      'finance': 3.5,
      'realestate': 2.9,
      'insurance': 3.1
    };
    
    // Pain point multipliers
    const painMultipliers = {
      'response-time': 2.1,
      'lead-qualification': 2.8,
      'after-hours': 2.5,
      'scaling': 3.2,
      'follow-up': 2.3,
      'data-entry': 1.9
    };
    
    // Base calculation: 12-18% efficiency improvement
    const baseROI = revenue * 0.15;
    const industryBoost = industryMultipliers[industry] || 2.5;
    const painBoost = painMultipliers[painPoints] || 2.0;
    
    // Calculate monthly and annual ROI
    const monthlyROI = (baseROI * (industryBoost * painBoost)) / 12;
    const yearlyROI = monthlyROI * 12;
    const paybackPeriod = Math.ceil(3500 / monthlyROI); // Assuming $3500 setup cost
    const efficiencyGain = ((monthlyROI * 12) / revenue) * 100;
    
    // Show results
    this.showResults({
      monthly: monthlyROI,
      yearly: yearlyROI,
      payback: paybackPeriod,
      efficiency: efficiencyGain,
      industry: industry,
      revenue: revenue
    });
  },
  
  showResults(results) {
    // Hide step 3, show step 4
    this.showStep(4);
    
    // Populate results with animation
    const resultsContainer = document.getElementById('calc-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="results-container">
          <h3 style="margin-bottom: 1rem;">🎯 Your AI Agent ROI Projection</h3>
          <div class="result-value">${this.formatCurrency(results.monthly)}/month</div>
          <p style="margin-bottom: 2rem; opacity: 0.9;">Projected monthly value with AI automation</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 700;">${this.formatCurrency(results.yearly)}</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Annual ROI</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 700;">${results.payback} months</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Payback Period</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.8rem; font-weight: 700;">${Math.round(results.efficiency)}%</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Efficiency Gain</div>
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 8px; margin: 2rem 0;">
            <div style="font-size: 0.9rem; opacity: 0.9;">
              ✅ Based on ${this.formatIndustry(results.industry)} industry averages<br>
              ✅ Conservative estimates (actual results often higher)<br>
              ✅ Includes setup, training, and first-month optimization
            </div>
          </div>
          
          <button class="swx-btn" style="background: white; color: var(--primary); font-size: 1.2rem; padding: 1rem 2rem; font-weight: 700; margin-top: 1rem;" onclick="bookStrategyCall()">
            📅 Get This ROI for Your Business
          </button>
        </div>
      `;
      
      // Scroll to results
      setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
    
    // Track the completion
    this.trackEvent('roi_calculated', results);
    console.log('🎉 ROI calculation completed:', results);
  },
  
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  formatIndustry(industry) {
    const industryNames = {
      'healthcare': 'Healthcare',
      'saas': 'SaaS/Technology',
      'ecommerce': 'E-commerce',
      'consulting': 'Consulting',
      'finance': 'Financial Services',
      'realestate': 'Real Estate',
      'insurance': 'Insurance'
    };
    return industryNames[industry] || industry;
  },
  
  trackEvent(eventName, data) {
    console.log('📊 Event tracked:', eventName, data);
    // Future: Add Google Analytics, Facebook Pixel, etc.
    
    // Example GA4 tracking (uncomment when you add GA4)
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', eventName, data);
    // }
  }
};

/* ==========================================
   SMOOTH SCROLLING MODULE
   ========================================== */
const SmoothScroll = {
  init() {
    document.addEventListener('click', (e) => {
      // Handle anchor links
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  }
};

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */
function bookStrategyCall() {
  // Track the click
  ROICalculator.trackEvent('book_call_clicked', {
    source: 'roi_calculator',
    timestamp: new Date().toISOString()
  });
  
  // For now, show alert (you'll replace this with real calendar booking)
  alert('🚀 Strategy Call Booking\n\nThis would redirect to your calendar booking page!\n\nNext step: Connect your actual booking calendar.');
  
  console.log('📞 Book strategy call clicked');
}

function openDemo() {
  alert('🎥 AI Demo\n\nThis would open your interactive AI demo!\n\nNext step: Add your actual demo widget.');
  console.log('🎥 Demo opened');
}

/* ==========================================
   LOAD ANIMATIONS
   ========================================== */
window.addEventListener('load', function() {
  // Add entrance animations to elements
  const animateElements = document.querySelectorAll('.hero-section, .calculator-section, .feature-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
