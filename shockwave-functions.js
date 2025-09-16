/* ==========================================
   SHOCKWAVE PLATFORM v2.0 - IMPROVED
   ========================================== */

// Global namespace to avoid conflicts
window.ShockwaveHQ = {
  version: '2.0.0',
  debug: true,
  initialized: false,
  
  log(message, data = null) {
    if (this.debug) {
      if (data) {
        console.log(`[ShockwaveHQ] ${message}`, data);
      } else {
        console.log(`[ShockwaveHQ] ${message}`);
      }
    }
  },
  
  error(message, error = null) {
    console.error(`[ShockwaveHQ ERROR] ${message}`, error);
  },
  
  init() {
    this.log('🚀 Platform initializing...');
    
    try {
      // Wait for DOM to be fully ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    } catch (error) {
      this.error('Initialization failed', error);
    }
  },
  
  start() {
    this.log('🎬 Starting platform modules...');
    
    try {
      // Initialize calculator
      this.Calculator.init();
      
      // Initialize other modules
      this.SmoothScroll.init();
      this.Analytics.init();
      
      this.initialized = true;
      this.log('✅ Platform ready!');
      
    } catch (error) {
      this.error('Platform startup failed', error);
    }
  }
};

/* ==========================================
   ROI CALCULATOR MODULE - IMPROVED
   ========================================== */
ShockwaveHQ.Calculator = {
  currentStep: 1,
  maxSteps: 4,
  data: {},
  elements: {},
  
  init() {
    ShockwaveHQ.log('📊 Calculator initializing...');
    
    try {
      this.cacheElements();
      this.bindEvents();
      this.setupInitialState();
      
      ShockwaveHQ.log('📊 Calculator ready');
    } catch (error) {
      ShockwaveHQ.error('Calculator initialization failed', error);
    }
  },
  
  cacheElements() {
    // Cache frequently used elements
    this.elements = {
      calculator: document.querySelector('.calculator-container'),
      steps: document.querySelectorAll('.calc-step'),
      industryBtns: document.querySelectorAll('.industry-btn'),
      revenueBtns: document.querySelectorAll('.revenue-btn'),
      painBtns: document.querySelectorAll('.pain-btn'),
      resultsContainer: document.getElementById('calc-results')
    };
    
    ShockwaveHQ.log('🎯 Elements cached', {
      calculator: !!this.elements.calculator,
      steps: this.elements.steps.length,
      industryBtns: this.elements.industryBtns.length,
      revenueBtns: this.elements.revenueBtns.length,
      painBtns: this.elements.painBtns.length,
      resultsContainer: !!this.elements.resultsContainer
    });
  },
  
  setupInitialState() {
    // Show only step 1
    this.elements.steps.forEach((step, index) => {
      if (index === 0) {
        step.classList.remove('hidden');
      } else {
        step.classList.add('hidden');
      }
    });
    
    ShockwaveHQ.log('🎯 Initial state set - showing step 1');
  },
  
  bindEvents() {
    // Use event delegation for better performance
    document.addEventListener('click', (e) => this.handleClick(e));
    
    ShockwaveHQ.log('👂 Event listeners attached');
  },
  
  handleClick(event) {
    const target = event.target;
    
    try {
      if (target.classList.contains('industry-btn')) {
        ShockwaveHQ.log('🏢 Industry button clicked', target.textContent.trim());
        this.selectIndustry(target);
        return;
      }
      
      if (target.classList.contains('revenue-btn')) {
        ShockwaveHQ.log('💰 Revenue button clicked', target.textContent.trim());
        this.selectRevenue(target);
        return;
      }
      
      if (target.classList.contains('pain-btn')) {
        ShockwaveHQ.log('😤 Pain button clicked', target.textContent.trim());
        this.selectPainPoint(target);
        return;
      }
    } catch (error) {
      ShockwaveHQ.error('Click handling failed', error);
    }
  },
  
  selectIndustry(button) {
    try {
      const industry = button.getAttribute('data-industry');
      
      if (!industry) {
        ShockwaveHQ.error('No industry data found on button');
        return;
      }
      
      // Store data
      this.data.industry = industry;
      
      // Update UI
      this.updateButtonSelection(this.elements.industryBtns, button);
      
      // Track event
      ShockwaveHQ.Analytics.track('industry_selected', { industry });
      
      // Show next step
      setTimeout(() => {
        this.showStep(2);
      }, 600);
      
      ShockwaveHQ.log('✅ Industry selected', { industry });
      
    } catch (error) {
      ShockwaveHQ.error('Industry selection failed', error);
    }
  },
  
  selectRevenue(button) {
    try {
      const revenue = parseInt(button.getAttribute('data-revenue'));
      
      if (!revenue || isNaN(revenue)) {
        ShockwaveHQ.error('Invalid revenue data on button');
        return;
      }
      
      // Store data
      this.data.revenue = revenue;
      
      // Update UI
      this.updateButtonSelection(this.elements.revenueBtns, button);
      
      // Track event
      ShockwaveHQ.Analytics.track('revenue_selected', { revenue });
      
      // Show next step
      setTimeout(() => {
        this.showStep(3);
      }, 600);
      
      ShockwaveHQ.log('✅ Revenue selected', { revenue });
      
    } catch (error) {
      ShockwaveHQ.error('Revenue selection failed', error);
    }
  },
  
  selectPainPoint(button) {
    try {
      const painPoint = button.getAttribute('data-pain');
      
      if (!painPoint) {
        ShockwaveHQ.error('No pain point data found on button');
        return;
      }
      
      // Store data
      this.data.painPoint = painPoint;
      
      // Update UI
      this.updateButtonSelection(this.elements.painBtns, button);
      
      // Track event
      ShockwaveHQ.Analytics.track('pain_point_selected', { painPoint });
      
      // Calculate and show results
      setTimeout(() => {
        this.calculateAndShowResults();
      }, 600);
      
      ShockwaveHQ.log('✅ Pain point selected', { painPoint });
      
    } catch (error) {
      ShockwaveHQ.error('Pain point selection failed', error);
    }
  },
  
  updateButtonSelection(buttons, selectedButton) {
    // Remove selection from all buttons
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selection to clicked button
    selectedButton.classList.add('selected');
    
    ShockwaveHQ.log('🎯 Button selection updated');
  },
  
  showStep(stepNumber) {
    try {
      if (stepNumber < 1 || stepNumber > this.maxSteps) {
        ShockwaveHQ.error('Invalid step number', stepNumber);
        return;
      }
      
      // Hide all steps
      this.elements.steps.forEach(step => {
        step.classList.add('hidden');
      });
      
      // Show target step
      const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
      
      if (targetStep) {
        setTimeout(() => {
          targetStep.classList.remove('hidden');
          
          // Smooth scroll to step
          targetStep.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          this.currentStep = stepNumber;
          ShockwaveHQ.log(`📄 Step ${stepNumber} shown`);
          
        }, 200);
      } else {
        ShockwaveHQ.error('Step element not found', stepNumber);
      }
      
    } catch (error) {
      ShockwaveHQ.error('Show step failed', error);
    }
  },
  
  calculateAndShowResults() {
    try {
      const { industry, revenue, painPoint } = this.data;
      
      if (!industry || !revenue || !painPoint) {
        ShockwaveHQ.error('Missing calculation data', this.data);
        return;
      }
      
      ShockwaveHQ.log('🧮 Calculating ROI...', this.data);
      
      // Industry multipliers
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
      
      // Calculations
      const baseROI = revenue * 0.15; // 15% base improvement
      const industryBoost = industryMultipliers[industry] || 2.5;
      const painBoost = painMultipliers[painPoint] || 2.0;
      
      const monthlyROI = Math.round((baseROI * industryBoost * painBoost) / 12);
      const yearlyROI = monthlyROI * 12;
      const paybackPeriod = Math.ceil(3500 / monthlyROI); // $3500 setup cost
      const efficiencyGain = Math.round((yearlyROI / revenue) * 100);
      
      const results = {
        monthly: monthlyROI,
        yearly: yearlyROI,
        payback: Math.max(1, paybackPeriod), // Minimum 1 month
        efficiency: Math.min(500, efficiencyGain), // Cap at 500%
        industry: industry,
        revenue: revenue,
        painPoint: painPoint
      };
      
      ShockwaveHQ.log('💰 ROI calculated', results);
      
      this.displayResults(results);
      
      // Track completion
      ShockwaveHQ.Analytics.track('calculator_completed', results);
      
    } catch (error) {
      ShockwaveHQ.error('ROI calculation failed', error);
    }
  },
  
  displayResults(results) {
    try {
      // Show step 4
      this.showStep(4);
      
      // Generate results HTML
      const resultsHTML = `
        <div class="results-container">
          <h3 style="margin-bottom: 1rem;">🎯 Your AI Agent ROI Projection</h3>
          <div class="result-value">${this.formatCurrency(results.monthly)}/month</div>
          <p style="margin-bottom: 2rem; opacity: 0.9;">
            Projected monthly value with AI automation for your ${this.formatIndustry(results.industry)} business
          </p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div style="font-size: 1.8rem; font-weight: 700;">${this.formatCurrency(results.yearly)}</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Annual ROI</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div style="font-size: 1.8rem; font-weight: 700;">${results.payback} months</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Payback Period</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div style="font-size: 1.8rem; font-weight: 700;">${results.efficiency}%</div>
              <div style="font-size: 0.9rem; opacity: 0.8;">Efficiency Gain</div>
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 8px; margin: 2rem 0; text-align: left;">
            <div style="font-size: 0.95rem; line-height: 1.5;">
              ✅ Based on ${this.formatIndustry(results.industry)} industry benchmarks<br>
              ✅ Conservative estimates (actual results often 20-40% higher)<br>
              ✅ Includes setup, training, and first 30 days optimization<br>
              ✅ ROI typically realized within first ${results.payback} months
            </div>
          </div>
          
          <button class="swx-btn" 
                  style="background: white; color: var(--primary); font-size: 1.2rem; padding: 1.2rem 2.5rem; font-weight: 700; margin-top: 1rem; border-radius: 50px;" 
                  onclick="ShockwaveHQ.bookCall()">
            📅 Get This ROI for Your Business
          </button>
        </div>
      `;
      
      // Insert results
      if (this.elements.resultsContainer) {
        this.elements.resultsContainer.innerHTML = resultsHTML;
        ShockwaveHQ.log('📊 Results displayed successfully');
      } else {
        ShockwaveHQ.error('Results container not found');
      }
      
    } catch (error) {
      ShockwaveHQ.error('Results display failed', error);
    }
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
    const names = {
      'healthcare': 'Healthcare',
      'saas': 'SaaS/Technology',
      'ecommerce': 'E-commerce',
      'consulting': 'Consulting',
      'finance': 'Financial Services',
      'realestate': 'Real Estate',
      'insurance': 'Insurance'
    };
    return names[industry] || industry;
  }
};

/* ==========================================
   ANALYTICS MODULE
   ========================================== */
ShockwaveHQ.Analytics = {
  init() {
    ShockwaveHQ.log('📊 Analytics initialized');
  },
  
  track(event, data = {}) {
    const payload = {
      event: event,
      data: data,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    ShockwaveHQ.log('📈 Event tracked', payload);
    
    // Future integrations:
    // Google Analytics, Facebook Pixel, etc.
    
    try {
      // Example: Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', event, data);
      }
      
      // Example: Facebook Pixel
      if (typeof fbq !== 'undefined') {
        fbq('track', 'CustomEvent', { event_name: event, ...data });
      }
    } catch (error) {
      ShockwaveHQ.error('Analytics tracking failed', error);
    }
  }
};

/* ==========================================
   SMOOTH SCROLLING MODULE
   ========================================== */
ShockwaveHQ.SmoothScroll = {
  init() {
    document.addEventListener('click', this.handleAnchorClick);
    ShockwaveHQ.log('🔗 Smooth scrolling initialized');
  },
  
  handleAnchorClick(e) {
    if (e.target.matches('a[href^="#"]')) {
      e.preventDefault();
      
      const targetId = e.target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        ShockwaveHQ.log('🔗 Smooth scroll to', targetId);
      }
    }
  }
};

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */
ShockwaveHQ.bookCall = function() {
  ShockwaveHQ.Analytics.track('book_call_clicked', {
    source: 'roi_calculator',
    calculator_data: ShockwaveHQ.Calculator.data
  });
  
  // For now, show alert (replace with real booking integration)
  alert('🚀 Strategy Call Booking\n\nThis would redirect to your calendar!\n\n✅ Your ROI projection has been calculated\n✅ Our team will show you how to achieve it\n✅ 30-minute free consultation\n\nNext: Connect your actual booking system here.');
  
  ShockwaveHQ.log('📞 Book call clicked', ShockwaveHQ.Calculator.data);
};

ShockwaveHQ.openDemo = function() {
  ShockwaveHQ.Analytics.track('demo_requested');
  
  alert('🎥 AI Demo\n\nThis would open your interactive demo!\n\nNext step: Add your demo widget integration.');
  
  ShockwaveHQ.log('🎥 Demo requested');
};

/* ==========================================
   AUTO-INITIALIZE
   ========================================== */
// Start the platform
ShockwaveHQ.init();

// Make available globally for debugging
window.SHQ = ShockwaveHQ; // Shorthand for console testing
