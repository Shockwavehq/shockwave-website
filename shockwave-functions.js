 * 🔥 SHOCKWAVE FUNCTIONS - Impact on Contact™
 * Premium AI Automation Agency JavaScript
 * Performance: <200ms interactions, Mobile-optimized
 * Version: 1.0.0
 */

(function() {
  'use strict';

  // ===================================================================
  // SHOCKWAVE CORE CONFIGURATION
  // ===================================================================
  
  const SHOCKWAVE_CONFIG = {
    // Brand Identity
    brand: {
      name: 'ShockwaveHQ',
      tagline: 'Impact on Contact™',
      primaryColor: '#D12E1F'
    },
    
    // Performance Thresholds
    performance: {
      maxInteractionDelay: 200, // milliseconds
      animationDuration: 300,
      debounceDelay: 250
    },
    
    // Conversion Tracking
    analytics: {
      gtmId: 'GTM-XXXXXXX', // Replace with actual GTM ID
      events: {
        heroView: 'sw_hero_view',
        ctaClick: 'sw_cta_click',
        formSubmit: 'sw_form_submit',
        calculatorUse: 'sw_calculator_use'
      }
    }
  };

  // ===================================================================
  // ROI CALCULATOR (CONVERSION TOOL)
  // ===================================================================
  
  class ShockwaveROICalculator {
    constructor() {
      this.init();
    }
    
    init() {
      const calculatorContainer = document.querySelector('.sw-roi-calculator');
      if (!calculatorContainer) return;
      
      this.createCalculatorHTML();
      this.bindEvents();
    }
    
    createCalculatorHTML() {
      const container = document.querySelector('.sw-roi-calculator');
      container.innerHTML = `
        <div class="sw-calculator-wrapper">
          <h3>Revenue Recovery Calculator</h3>
          <p>Discover how much revenue you're losing to slow response times</p>
          
          <div class="sw-calculator-form">
            <div class="sw-form-group">
              <label class="sw-form-label">Monthly Qualified Leads</label>
              <input type="number" id="sw-monthly-leads" class="sw-form-input" placeholder="50" min="1">
            </div>
            
            <div class="sw-form-group">
              <label class="sw-form-label">Average Deal Value ($)</label>
              <input type="number" id="sw-deal-value" class="sw-form-input" placeholder="2500" min="1">
            </div>
            
            <div class="sw-form-group">
              <label class="sw-form-label">Current Response Time</label>
              <select id="sw-response-time" class="sw-form-input">
                <option value="5">Under 5 minutes</option>
                <option value="30" selected>30 minutes - 2 hours</option>
                <option value="120">2+ hours</option>
                <option value="1440">Next day</option>
              </select>
            </div>
            
            <button type="button" class="sw-cta sw-calculate-btn">Calculate Revenue Recovery</button>
          </div>
          
          <div class="sw-results" style="display: none;">
            <div class="sw-results-grid">
              <div class="sw-result-card">
                <h4>Monthly Revenue Loss</h4>
                <div class="sw-result-value" id="sw-monthly-loss">$0</div>
              </div>
              <div class="sw-result-card">
                <h4>Annual Revenue Loss</h4>
                <div class="sw-result-value" id="sw-annual-loss">$0</div>
              </div>
              <div class="sw-result-card">
                <h4>ROI with Shockwave</h4>
                <div class="sw-result-value" id="sw-roi-percentage">0%</div>
              </div>
            </div>
            <button type="button" class="sw-cta sw-book-audit">Book Revenue Audit</button>
          </div>
        </div>
      `;
    }
    
    bindEvents() {
      const calculateBtn = document.querySelector('.sw-calculate-btn');
      const bookAuditBtn = document.querySelector('.sw-book-audit');
      
      if (calculateBtn) {
        calculateBtn.addEventListener('click', () => this.calculateROI());
      }
      
      if (bookAuditBtn) {
        bookAuditBtn.addEventListener('click', () => this.trackEvent('calculator_to_booking'));
      }
    }
    
    calculateROI() {
      const monthlyLeads = parseInt(document.getElementById('sw-monthly-leads').value) || 0;
      const dealValue = parseInt(document.getElementById('sw-deal-value').value) || 0;
      const responseTime = parseInt(document.getElementById('sw-response-time').value) || 30;
      
      // Shockwave conversion rate advantage (based on MIT research)
      const conversionMultiplier = responseTime <= 5 ? 1 : 21;
      const currentConversion = 0.15; // 15% baseline
      const shockwaveConversion = currentConversion * conversionMultiplier;
      
      // Calculate losses
      const currentRevenue = monthlyLeads * dealValue * currentConversion;
      const potentialRevenue = monthlyLeads * dealValue * shockwaveConversion;
      const monthlyLoss = potentialRevenue - currentRevenue;
      const annualLoss = monthlyLoss * 12;
      
      // ROI calculation (assuming Growth tier at $6500/month)
      const shockwaveCost = 6500 * 12; // Annual cost
      const roi = ((annualLoss - shockwaveCost) / shockwaveCost) * 100;
      
      // Display results
      document.getElementById('sw-monthly-loss').textContent = this.formatCurrency(monthlyLoss);
      document.getElementById('sw-annual-loss').textContent = this.formatCurrency(annualLoss);
      document.getElementById('sw-roi-percentage').textContent = Math.round(roi) + '%';
      
      // Show results with animation
      const resultsDiv = document.querySelector('.sw-results');
      resultsDiv.style.display = 'block';
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Track calculator use
      this.trackEvent('calculator_completed', {
        monthly_leads: monthlyLeads,
        deal_value: dealValue,
        response_time: responseTime,
        calculated_roi: Math.round(roi)
      });
    }
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    trackEvent(eventName, parameters = {}) {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'ROI Calculator',
          ...parameters
        });
      }
    }
  }

  // ===================================================================
  // FORM ENHANCEMENT SYSTEM
  // ===================================================================
  
  class ShockwaveFormHandler {
    constructor() {
      this.init();
    }
    
    init() {
      this.enhanceForms();
      this.setupValidation();
    }
    
    enhanceForms() {
      const forms = document.querySelectorAll('.sw-form, .sw-lead-form');
      forms.forEach(form => {
        this.addProgressIndicator(form);
        this.enableRealTimeValidation(form);
      });
    }
    
    addProgressIndicator(form) {
      const inputs = form.querySelectorAll('input[required], select[required]');
      const progressBar = document.createElement('div');
      progressBar.className = 'sw-form-progress';
      progressBar.innerHTML = '<div class="sw-form-progress-bar"></div>';
      
      form.insertBefore(progressBar, form.firstChild);
      
      inputs.forEach(input => {
        input.addEventListener('input', () => this.updateProgress(form));
        input.addEventListener('change', () => this.updateProgress(form));
      });
    }
    
    updateProgress(form) {
      const inputs = form.querySelectorAll('input[required], select[required]');
      const completed = Array.from(inputs).filter(input => input.value.trim() !== '').length;
      const progress = (completed / inputs.length) * 100;
      
      const progressBar = form.querySelector('.sw-form-progress-bar');
      if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.style.background = progress === 100 ? 
          SHOCKWAVE_CONFIG.brand.primaryColor : '#E2E8F0';
      }
    }
    
    enableRealTimeValidation(form) {
      const inputs = form.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
      });
    }
    
    validateField(input) {
      const isValid = input.checkValidity();
      const errorMsg = input.parentNode.querySelector('.sw-field-error');
      
      if (!isValid) {
        if (!errorMsg) {
          const error = document.createElement('div');
          error.className = 'sw-field-error';
          error.textContent = input.validationMessage;
          input.parentNode.appendChild(error);
        }
        input.classList.add('sw-field-invalid');
      } else {
        if (errorMsg) errorMsg.remove();
        input.classList.remove('sw-field-invalid');
        input.classList.add('sw-field-valid');
      }
    }
    
    setupValidation() {
      // Add validation styles
      const style = document.createElement('style');
      style.textContent = `
        .sw-form-progress {
          height: 4px;
          background: #E2E8F0;
          border-radius: 2px;
          margin-bottom: 1rem;
          overflow: hidden;
        }
        .sw-form-progress-bar {
          height: 100%;
          background: ${SHOCKWAVE_CONFIG.brand.primaryColor};
          width: 0%;
          transition: width 0.3s ease;
        }
        .sw-field-invalid {
          border-color: #E53E3E !important;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1) !important;
        }
        .sw-field-valid {
          border-color: #38A169 !important;
        }
        .sw-field-error {
          color: #E53E3E;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ===================================================================
  // PERFORMANCE MONITORING
  // ===================================================================
  
  class ShockwavePerformanceMonitor {
    constructor() {
      this.metrics = {};
      this.init();
    }
    
    init() {
      this.measurePageLoad();
      this.setupInteractionTracking();
    }
    
    measurePageLoad() {
      window.addEventListener('load', () => {
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0];
          this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.metrics.domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          
          // Track if we meet performance thresholds
          if (this.metrics.loadTime < 2500) {
            this.trackEvent('performance_good', { load_time: this.metrics.loadTime });
          } else {
            this.trackEvent('performance_slow', { load_time: this.metrics.loadTime });
          }
        }
      });
    }
    
    setupInteractionTracking() {
      // Track CTA clicks with timing
      document.addEventListener('click', (e) => {
        if (e.target.matches('.sw-cta, .sw-cta *')) {
          const startTime = performance.now();
          setTimeout(() => {
            const interactionTime = performance.now() - startTime;
            this.trackEvent('cta_interaction_time', { 
              duration: interactionTime,
              meets_threshold: interactionTime < SHOCKWAVE_CONFIG.performance.maxInteractionDelay
            });
          }, 10);
        }
      });
    }
    
    trackEvent(eventName, data = {}) {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'Performance',
          ...data
        });
      }
    }
  }

  // ===================================================================
  // INITIALIZATION & DOM READY
  // ===================================================================
  
  class ShockwaveApp {
    constructor() {
      this.components = [];
      this.init();
    }
    
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
      } else {
        this.initializeComponents();
      }
    }
    
    initializeComponents() {
      // Initialize all Shockwave components
      this.components.push(new ShockwaveROICalculator());
      this.components.push(new ShockwaveFormHandler());
      this.components.push(new ShockwavePerformanceMonitor());
      
      // Setup global event tracking
      this.setupGlobalTracking();
      
      // Initialize hero view tracking
      this.trackHeroView();
    }
    
    setupGlobalTracking() {
      // Track all CTA clicks
      document.addEventListener('click', (e) => {
        if (e.target.matches('.sw-cta, .sw-cta *')) {
          const ctaText = e.target.textContent.trim();
          this.trackEvent('cta_click', { cta_text: ctaText });
        }
      });
    }
    
    trackHeroView() {
      const hero = document.querySelector('.sw-hero');
      if (hero) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.trackEvent('hero_view');
              observer.unobserve(hero);
            }
          });
        }, { threshold: 0.5 });
        
        observer.observe(hero);
      }
    }
    
    trackEvent(eventName, data = {}) {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'ShockwaveHQ',
          ...data
        });
      }
    }
  }

  // ===================================================================
  // AUTO-INITIALIZATION
  // ===================================================================
  
  // Start Shockwave application
  new ShockwaveApp();

})();

// Export for potential external use
window.ShockwaveHQ = {
  version: '1.0.0',
  config: typeof SHOCKWAVE_CONFIG !== 'undefined' ? SHOCKWAVE_CONFIG : null
};
