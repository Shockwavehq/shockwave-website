/* ==========================================
   SHOCKWAVE ROI CALCULATOR - CLEAN & FAST
   ========================================== */

const ShockwaveHQ = {
  data: {},
  
  init() {
    console.log('🚀 ShockwaveHQ Calculator Loading...');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  },
  
  start() {
    this.bindEvents();
    this.showStep(1);
    console.log('✅ Calculator Ready');
  },
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('industry-btn')) {
        this.selectIndustry(e.target);
      }
      if (e.target.classList.contains('revenue-btn')) {
        this.selectRevenue(e.target);
      }
      if (e.target.classList.contains('pain-btn')) {
        this.selectPainPoint(e.target);
      }
    });
  },
  
  selectIndustry(button) {
    const industry = button.dataset.industry;
    this.data.industry = industry;
    
    // Instant visual feedback
    this.clearSelection('.industry-btn');
    button.classList.add('selected');
    
    console.log('Industry:', industry);
    
    // Fast transition
    setTimeout(() => this.showStep(2), 100);
  },
  
  selectRevenue(button) {
    const revenue = parseInt(button.dataset.revenue);
    this.data.revenue = revenue;
    
    // Instant visual feedback
    this.clearSelection('.revenue-btn');
    button.classList.add('selected');
    
    console.log('Revenue:', revenue);
    
    // Fast transition
    setTimeout(() => this.showStep(3), 100);
  },
  
  selectPainPoint(button) {
    const painPoint = button.dataset.pain;
    this.data.painPoint = painPoint;
    
    // Instant visual feedback
    this.clearSelection('.pain-btn');
    button.classList.add('selected');
    
    console.log('Pain Point:', painPoint);
    
    // Fast calculation
    setTimeout(() => this.calculateResults(), 100);
  },
  
  clearSelection(selector) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.classList.remove('selected');
    });
  },
  
  showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.calc-step').forEach(step => {
      step.classList.add('hidden');
    });
    
    // Show target step
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
      targetStep.classList.remove('hidden');
      targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
  
  calculateResults() {
    const { industry, revenue, painPoint } = this.data;
    
    // Industry multipliers
    const industryMultipliers = {
      'healthcare': 3.2,
      'saas': 2.8,
      'ecommerce': 2.4,
      'consulting': 3.8,
      'finance': 3.5,
      'realestate': 2.9
    };
    
    // Pain multipliers
    const painMultipliers = {
      'response-time': 2.1,
      'lead-qualification': 2.8,
      'after-hours': 2.5,
      'scaling': 3.2
    };
    
    // Calculate ROI
    const baseROI = revenue * 0.15;
    const industryBoost = industryMultipliers[industry] || 2.5;
    const painBoost = painMultipliers[painPoint] || 2.0;
    
    const monthlyROI = Math.round((baseROI * industryBoost * painBoost) / 12);
    const yearlyROI = monthlyROI * 12;
    const paybackMonths = Math.ceil(3500 / monthlyROI);
    
    this.showResults({
      monthly: monthlyROI,
      yearly: yearlyROI,
      payback: Math.max(1, paybackMonths),
      industry: industry
    });
  },
  
  showResults(results) {
    this.showStep(4);
    
    const container = document.getElementById('calc-results');
    if (!container) return;
    
    container.innerHTML = `
      <div class="results-container">
        <h3>🎯 Your AI Agent ROI</h3>
        <div class="result-value">${this.formatMoney(results.monthly)}/month</div>
        <p>Projected monthly value with AI automation</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0;">
          <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 1.5rem; font-weight: 700;">${this.formatMoney(results.yearly)}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">Annual ROI</div>
          </div>
          <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 1.5rem; font-weight: 700;">${results.payback} months</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">Payback Period</div>
          </div>
          <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 1.5rem; font-weight: 700;">${this.getIndustryName(results.industry)}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">Industry</div>
          </div>
        </div>
        
        <button class="swx-btn" 
                style="background: white; color: var(--primary); font-size: 1.1rem; padding: 1rem 2rem; font-weight: 700; margin-top: 1rem;" 
                onclick="ShockwaveHQ.bookCall()">
          📅 Get This ROI for Your Business
        </button>
      </div>
    `;
    
    console.log('Results:', results);
  },
  
  formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  getIndustryName(industry) {
    const names = {
      'healthcare': 'Healthcare',
      'saas': 'SaaS/Tech',
      'ecommerce': 'E-commerce',
      'consulting': 'Consulting',
      'finance': 'Finance',
      'realestate': 'Real Estate'
    };
    return names[industry] || industry;
  },
  
  bookCall() {
    alert('🚀 Strategy Call\n\nThis would open your booking calendar!\n\nYour ROI: ' + this.formatMoney(this.data.monthlyROI || 0) + '/month');
    console.log('📞 Book call clicked');
  }
};

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Start the calculator
ShockwaveHQ.init();

// Global access
window.ShockwaveHQ = ShockwaveHQ;
