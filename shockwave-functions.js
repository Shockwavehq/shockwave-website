/**
 * SHOCKWAVE WEBSITE FUNCTIONALITY
 * Core JavaScript for GHL Integration
 * Performance-optimized, mobile-first approach
 */

// =========================================
// INITIALIZATION & PERFORMANCE MONITORING
// =========================================

class ShockwaveWebsite {
  constructor() {
    this.initTime = performance.now();
    this.isGHLEnvironment = this.detectGHL();
    this.isMobile = window.innerWidth <= 768;
    
    this.init();
  }
  
  detectGHL() {
    return window.location.hostname.includes('gohighlevel') || 
           window.location.hostname.includes('.app');
  }
  
  init() {
    this.bindEvents();
    this.initializeComponents();
    this.setupAnalytics();
    this.logPerformance();
  }
  
  // =========================================
  // EVENT DELEGATION SYSTEM
  // =========================================
  
  bindEvents() {
    // Single event delegation for performance
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('submit', this.handleSubmit.bind(this));
    document.addEventListener('input', this.handleInput.bind(this));
    
    // Intersection Observer for animations
    this.setupScrollAnimations();
    
    // Resize handler with throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.handleResize();
      }, 150);
    });
  }
  
  handleClick(e) {
    const target = e.target.closest('[data-sw-action]');
    if (!target) return;
    
    const action = target.dataset.swAction;
    const data = this.parseDataAttributes(target);
    
    switch(action) {
      case 'industry-select':
        this.selectIndustry(data, target);
        break;
      case 'calculate-roi':
        this.calculateROI(data, target);
        break;
      case 'show-pricing':
        this.showPricing(data, target);
        break;
      case 'open-calendar':
        this.openCalendar(data, target);
        break;
      case 'track-cta':
        this.trackCTA(data, target);
        break;
    }
  }
  
  handleSubmit(e) {
    const form = e.target.closest('.sw-form');
    if (!form) return;
    
    e.preventDefault();
    this.processForm(form);
  }
  
  handleInput(e) {
    const input = e.target;
    if (input.classList.contains('sw-form__input')) {
      this.validateInput(input);
    }
  }
  
  // =========================================
  // INDUSTRY SELECTION SYSTEM
  // =========================================
  
  selectIndustry(data, element) {
    const industry = data.industry;
    const pricing = this.getIndustryPricing(industry);
    
    // Track selection
    this.trackEvent('industry_selected', {
      industry: industry,
      element_position: this.getElementPosition(element)
    });
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('industry', industry);
    window.history.pushState({industry}, '', url);
    
    // Show industry-specific content
    this.showIndustryContent(industry, pricing);
  }
  
  getIndustryPricing(industry) {
    const pricingMap = {
      'dental': {
        starter: '$1,497',
        growth: '$2,497',
        domination: '$3,497',
        enterprise: '$6,000-$10,000+'
      },
      'law': {
        starter: '$2,497',
        growth: '$3,997',
        domination: '$5,997',
        enterprise: '$8,000-$12,000+'
      },
      'medspa': {
        starter: '$1,797',
        growth: '$2,997',
        domination: '$4,497',
        enterprise: '$7,500-$12,000+'
      },
      'hvac': {
        starter: '$1,297',
        growth: '$1,997',
        domination: '$2,997',
        enterprise: '$6,000-$10,000+'
      },
      'plumbing': {
        starter: '$1,297',
        growth: '$2,197',
        domination: '$2,997',
        enterprise: '$6,000-$10,000+'
      },
      'pest': {
        starter: '$1,197',
        growth: '$1,997',
        domination: '$2,997',
        enterprise: '$6,000-$9,000+'
      }
    };
    
    return pricingMap[industry] || pricingMap['hvac']; // Default fallback
  }
  
  showIndustryContent(industry, pricing) {
    // Update pricing display
    const pricingCards = document.querySelectorAll('.sw-pricing-card');
    pricingCards.forEach((card, index) => {
      const tiers = ['starter', 'growth', 'domination', 'enterprise'];
      const tier = tiers[index];
      if (pricing[tier]) {
        const priceElement = card.querySelector('.sw-pricing-card__price');
        if (priceElement) {
          priceElement.textContent = pricing[tier];
        }
      }
    });
    
    // Update industry-specific messaging
    this.updateIndustryMessaging(industry);
    
    // Smooth scroll to pricing section
    const pricingSection = document.querySelector('.sw-pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  updateIndustryMessaging(industry) {
    const messaging = {
      'dental': {
        headline: 'Stop Losing Dental Patients to Missed Calls',
        subheading: 'Capture every appointment, reduce no-shows by 50%, fill cancellations automatically.'
      },
      'law': {
        headline: 'Win More Cases with 5-Minute Response Times',
        subheading: 'Capture leads before competitors, increase consultation show rates, automate intake.'
      },
      'medspa': {
        headline: 'Fill Every Treatment Slot Automatically',
        subheading: 'Smart waitlists, deposit enforcement, and instant booking for maximum revenue.'
      },
      'hvac': {
        headline: 'Never Miss Another Emergency Call',
        subheading: 'After-hours coverage, smart routing, and seasonal surge management.'
      },
      'plumbing': {
        headline: 'Capture Emergency Calls 24/7',
        subheading: 'Instant triage, route optimization, and premium pricing automation.'
      },
      'pest': {
        headline: 'Maximize Seasonal Revenue Capture',
        subheading: 'Route optimization, weather triggers, and recurring service automation.'
      }
    };
    
    const content = messaging[industry];
    if (content) {
      const headline = document.querySelector('.sw-hero__headline');
      const subheadline = document.querySelector('.sw-hero__subheadline');
      
      if (headline) headline.textContent = content.headline;
      if (subheadline) subheadline.textContent = content.subheading;
    }
  }
  
  // =========================================
  // ROI CALCULATOR SYSTEM
  // =========================================
  
  calculateROI(data, element) {
    const form = element.closest('.sw-calculator');
    const inputs = form.querySelectorAll('.sw-form__input');
    const values = {};
    
    // Collect input values
    inputs.forEach(input => {
      values[input.name] = parseFloat(input.value) || 0;
    });
    
    // Industry-specific ROI calculations
    const industry = data.industry || this.getCurrentIndustry();
    const roi = this.calculateIndustryROI(industry, values);
    
    // Display results
    this.displayROIResults(roi, form);
    
    // Track calculation
    this.trackEvent('roi_calculated', {
      industry: industry,
      monthly_revenue: roi.monthlyRevenue,
      annual_revenue: roi.annualRevenue,
      roi_percentage: roi.roiPercentage
    });
  }
  
  calculateIndustryROI(industry, values) {
    const { calls, missedRate, avgValue, currentNoShows } = values;
    
    // Base calculations
    const missedCalls = calls * (missedRate / 100);
    const recoveredCalls = missedCalls * 0.30; // 30% recovery rate
    const recoveredAppointments = recoveredCalls * 0.60; // 60% conversion
    const noShowReduction = currentNoShows * 0.40; // 40% reduction
    
    // Revenue calculations
    const recoveredRevenue = recoveredAppointments * avgValue;
    const savedNoShowRevenue = noShowReduction * avgValue;
    const totalMonthlyBenefit = recoveredRevenue + savedNoShowRevenue;
    
    // Industry-specific pricing
    const pricing = this.getIndustryPricing(industry);
    const monthlyCost = this.extractNumericValue(pricing.growth);
    
    return {
      monthlyRevenue: totalMonthlyBenefit,
      annualRevenue: totalMonthlyBenefit * 12,
      monthlyCost: monthlyCost,
      netBenefit: totalMonthlyBenefit - monthlyCost,
      roiPercentage: ((totalMonthlyBenefit / monthlyCost) * 100).toFixed(0)
    };
  }
  
  displayROIResults(roi, container) {
    const resultHTML = `
      <div class="sw-calculator__result">
        <div class="sw-calculator__result-amount">$${roi.monthlyRevenue.toLocaleString()}</div>
        <div class="sw-calculator__result-label">Additional Monthly Revenue</div>
        <div class="sw-mt-md">
          <div class="sw-text-sm">Annual Impact: $${roi.annualRevenue.toLocaleString()}</div>
          <div class="sw-text-sm">ROI: ${roi.roiPercentage}% Monthly Return</div>
        </div>
        <button class="sw-btn sw-btn--secondary sw-mt-md" data-sw-action="open-calendar">
          Get Your Custom ROI Plan
        </button>
      </div>
    `;
    
    let resultContainer = container.querySelector('.sw-calculator__results');
    if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.className = 'sw-calculator__results';
      container.appendChild(resultContainer);
    }
    
    resultContainer.innerHTML = resultHTML;
    
    // Animate result appearance
    setTimeout(() => {
      resultContainer.classList.add('sw-fade-in-up');
    }, 100);
  }
  
  // =========================================
  // FORM PROCESSING SYSTEM
  // =========================================
  
  processForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add form loading state
    form.classList.add('sw-loading');
    
    // Validate form
    const validation = this.validateForm(data);
    if (!validation.valid) {
      this.showFormErrors(form, validation.errors);
      form.classList.remove('sw-loading');
      return;
    }
    
    // Submit to GHL
    this.submitToGHL(data, form);
  }
  
  validateForm(data) {
    const errors = {};
    let valid = true;
    
    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Please enter a valid email address';
        valid = false;
      }
    }
    
    // Phone validation
    if (data.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
        valid = false;
      }
    }
    
    // Required field validation
    const required = ['firstName', 'email', 'phone'];
    required.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        errors[field] = 'This field is required';
        valid = false;
      }
    });
    
    return { valid, errors };
  }
  
  showFormErrors(form, errors) {
    // Clear existing errors
    form.querySelectorAll('.sw-form__error').forEach(error => error.remove());
    form.querySelectorAll('.sw-form__input--error').forEach(input => {
      input.classList.remove('sw-form__input--error');
    });
    
    // Show new errors
    Object.entries(errors).forEach(([field, message]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        input.classList.add('sw-form__input--error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'sw-form__error sw-text-sm';
        errorElement.style.color = 'var(--sw-highlight)';
        errorElement.textContent = message;
        
        input.parentNode.appendChild(errorElement);
      }
    });
  }
  
  submitToGHL(data, form) {
    // Add industry context
    data.industry = this.getCurrentIndustry();
    data.source = 'shockwave_website';
    data.timestamp = new Date().toISOString();
    
    // Track form submission
    this.trackEvent('form_submitted', {
      form_type: form.dataset.formType || 'contact',
      industry: data.industry
    });
    
    // GHL webhook submission
    if (this.isGHLEnvironment) {
      // Use GHL's native form submission
      form.submit();
    } else {
      // Development mode - simulate submission
      setTimeout(() => {
        this.showFormSuccess(form);
      }, 1000);
    }
  }
  
  showFormSuccess(form) {
    form.classList.remove('sw-loading');
    
    const successHTML = `
      <div class="sw-form__success">
        <div class="sw-text-center sw-p-lg">
          <div class="sw-text-primary sw-font-bold sw-mb-sm">Thank you!</div>
          <div>We'll contact you within 5 minutes to discuss your automation needs.</div>
        </div>
      </div>
    `;
    
    form.innerHTML = successHTML;
    
    // Redirect to calendar after 3 seconds
    setTimeout(() => {
      this.openCalendar({ source: 'form_success' });
    }, 3000);
  }
  
  // =========================================
  // CALENDAR INTEGRATION
  // =========================================
  
  openCalendar(data = {}, element = null) {
    const calendarUrl = this.getCalendarUrl(data);
    
    // Track calendar open
    this.trackEvent('calendar_opened', {
      source: data.source || 'cta_click',
      industry: this.getCurrentIndustry()
    });
    
    // Open calendar modal or new tab
    if (this.isMobile) {
      window.open(calendarUrl, '_blank');
    } else {
      this.openCalendarModal(calendarUrl);
    }
  }
  
  getCalendarUrl(data) {
    // Base calendar URL - update with your actual Calendly/GHL calendar
    let baseUrl = 'https://calendar.app.gohighlevel.com/shockwave-demo';
    
    // Add UTM parameters for tracking
    const params = new URLSearchParams({
      utm_source: 'website',
      utm_medium: 'cta',
      utm_campaign: data.source || 'general',
      industry: this.getCurrentIndustry()
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  openCalendarModal(url) {
    const modal = document.createElement('div');
    modal.className = 'sw-modal';
    modal.innerHTML = `
      <div class="sw-modal__backdrop" data-sw-action="close-modal"></div>
      <div class="sw-modal__content">
        <button class="sw-modal__close" data-sw-action="close-modal">&times;</button>
        <iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal functionality
    modal.addEventListener('click', (e) => {
      if (e.target.dataset.swAction === 'close-modal') {
        this.closeCalendarModal(modal);
      }
    });
  }
  
  closeCalendarModal(modal) {
    document.body.removeChild(modal);
    document.body.style.overflow = '';
  }
  
  // =========================================
  // ANALYTICS & TRACKING
  // =========================================
  
  setupAnalytics() {
    // Track page view
    this.trackEvent('page_view', {
      page: window.location.pathname,
      industry: this.getCurrentIndustry(),
      referrer: document.referrer
    });
    
    // Track scroll depth
    this.setupScrollTracking();
  }
  
  setupScrollTracking() {
    let scrollDepth = 0;
    const trackingThresholds = [25, 50, 75, 100];
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      trackingThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && scrollDepth < threshold) {
          scrollDepth = threshold;
          this.trackEvent('scroll_depth', {
            depth: threshold,
            industry: this.getCurrentIndustry()
          });
        }
      });
    });
  }
  
  trackEvent(eventName, data = {}) {
    // Enhanced event data
    const eventData = {
      ...data,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', eventName, eventData);
    }
    
    // Console log for development
    if (!this.isGHLEnvironment) {
      console.log('Event:', eventName, eventData);
    }
  }
  
  trackCTA(data, element) {
    const ctaData = {
      cta_text: element.textContent.trim(),
      cta_position: this.getElementPosition(element),
      cta_type: data.type || 'button',
      ...data
    };
    
    this.trackEvent('cta_clicked', ctaData);
  }
  
  // =========================================
  // SCROLL ANIMATIONS
  // =========================================
  
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.sw-fade-in-up, .sw-card, .sw-pricing-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'sw-fadeInUp 0.6s ease forwards';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }
  
  // =========================================
  // UTILITY FUNCTIONS
  // =========================================
  
  getCurrentIndustry() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('industry') || 'general';
  }
  
  parseDataAttributes(element) {
    const data = {};
    Object.keys(element.dataset).forEach(key => {
      if (key.startsWith('sw')) {
        const cleanKey = key.replace('sw', '').toLowerCase();
        data[cleanKey] = element.dataset[key];
      }
    });
    return data;
  }
  
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      section: this.getElementSection(element)
    };
  }
  
  getElementSection(element) {
    const sections = ['hero', 'pricing', 'industry', 'calculator', 'footer'];
    for (const section of sections) {
      if (element.closest(`.sw-${section}`)) {
        return section;
      }
    }
    return 'unknown';
  }
  
  extractNumericValue(priceString) {
    const matches = priceString.match(/[\d,]+/);
    if (matches) {
      return parseInt(matches[0].replace(/,/g, ''));
    }
    return 0;
  }
  
  validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    
    // Remove existing validation classes
    input.classList.remove('sw-form__input--error');
    
    // Email validation
    if (input.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
    }
    
    // Phone validation
    if (input.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      isValid = phoneRegex.test(value.replace(/\D/g, ''));
    }
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
      isValid = false;
    }
    
    // Apply validation state
    if (!isValid) {
      input.classList.add('sw-form__input--error');
    }
    
    return isValid;
  }
  
  handleResize() {
    // Recalculate mobile state
    this.isMobile = window.innerWidth <= 768;
    
    // Adjust modal sizes if any are open
    const modals = document.querySelectorAll('.sw-modal');
    modals.forEach(modal => {
      const content = modal.querySelector('.sw-modal__content');
      if (content && this.isMobile) {
        content.style.width = '95%';
        content.style.height = '90%';
      }
    });
  }
  
  logPerformance() {
    const loadTime = performance.now() - this.initTime;
    
    // Track performance metrics
    this.trackEvent('performance', {
      load_time: Math.round(loadTime),
      dom_interactive: Math.round(performance.timing.domInteractive - performance.timing.navigationStart),
      page_load: Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart)
    });
    
    // Console log for development
    if (!this.isGHLEnvironment) {
      console.log(`Shockwave Website initialized in ${Math.round(loadTime)}ms`);
    }
  }
  
  // =========================================
  // COMPONENT INITIALIZERS
  // =========================================
  
  initializeComponents() {
    this.initializePricingCards();
    this.initializeROICalculators();
    this.initializeIndustryCards();
  }
  
  initializePricingCards() {
    const pricingCards = document.querySelectorAll('.sw-pricing-card');
    pricingCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });
      
      card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('sw-pricing-card--featured')) {
          card.style.transform = 'translateY(0)';
        }
      });
    });
  }
  
  initializeROICalculators() {
    const calculators = document.querySelectorAll('.sw-calculator');
    calculators.forEach(calculator => {
      const inputs = calculator.querySelectorAll('.sw-form__input');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          // Auto-calculate if all fields are filled
          const allFilled = Array.from(inputs).every(inp => inp.value.trim() !== '');
          if (allFilled) {
            const button = calculator.querySelector('[data-sw-action="calculate-roi"]');
            if (button) {
              setTimeout(() => {
                button.click();
              }, 500);
            }
          }
        });
      });
    });
  }
  
  initializeIndustryCards() {
    // Auto-select industry from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const industry = urlParams.get('industry');
    
    if (industry) {
      const industryCard = document.querySelector(`[data-sw-industry="${industry}"]`);
      if (industryCard) {
        industryCard.click();
      }
    }
  }
}

// =========================================
// INITIALIZE ON DOM READY
// =========================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.shockwave = new ShockwaveWebsite();
  });
} else {
  window.shockwave = new ShockwaveWebsite();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShockwaveWebsite;
}

// =========================================
// ADDITIONAL UTILITY FUNCTIONS
// =========================================

// URL Parameter Management
function updateURLParameter(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({[key]: value}, '', url);
}

// Smooth Scrolling Utility
function smoothScrollTo(element, offset = 0) {
  const targetPosition = element.offsetTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

// Format Currency Utility
function formatCurrency(amount, includeSymbol = true) {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  return includeSymbol ? `$${formatted}` : formatted;
}

// Debounce Utility
function debounce(func, wait) {
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

// Load External Script Utility
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

// Check if Element is in Viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
// Modal Calendar System with Calendly Integration
function openCalendarModal(industry = null) {
    const modal = document.createElement('div');
    modal.className = 'calendar-modal-overlay';
    modal.innerHTML = `
        <div class="calendar-modal">
            <div class="modal-header">
                <h3>Book Your ${industry ? industry : 'AI Automation'} Strategy Call</h3>
                <button class="close-modal" onclick="closeCalendarModal()">&times;</button>
            </div>
            <div class="modal-content">
                <div class="booking-benefits">
                    <h4>What You'll Get (15 Minutes):</h4>
                    <ul>
                        <li>✅ Custom ROI calculation for your ${industry ? industry.toLowerCase() : 'business'}</li>
                        <li>✅ Specific automation recommendations</li>
                        <li>✅ Implementation timeline & investment</li>
                        <li>✅ 48-hour pilot proposal (if qualified)</li>
                    </ul>
                </div>
                <div class="calendly-container">
                    <div class="calendly-inline-widget" 
                         data-url="https://calendly.com/your-calendly-link/strategy-call"
                         style="min-width:320px;height:630px;">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Load Calendly widget
    loadCalendlyWidget();
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCalendarModal();
    });
}

function closeCalendarModal() {
    const modal = document.querySelector('.calendar-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function loadCalendlyWidget() {
    // Load Calendly CSS if not already loaded
    if (!document.querySelector('link[href*="calendly.com"]')) {
        const link = document.createElement('link');
        link.href = 'https://assets.calendly.com/assets/external/widget.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    
    // Load Calendly JS if not already loaded
    if (!window.Calendly) {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.onload = () => {
            initializeCalendlyWidget();
        };
        document.head.appendChild(script);
    } else {
        initializeCalendlyWidget();
    }
}

function initializeCalendlyWidget() {
    const container = document.querySelector('.calendly-inline-widget');
    if (container && window.Calendly) {
        window.Calendly.initInlineWidget({
            url: container.dataset.url,
            parentElement: container,
            prefill: {},
            utm: {
                utmCampaign: 'Website Modal',
                utmSource: 'ShockwaveHQ',
                utmMedium: 'Modal Popup'
            }
        });
    }
}

// Enhanced CTA buttons with modal integration
function updateCTAButtons() {
    // Update all "Book Call" buttons to use modal
    document.querySelectorAll('.cta-button, .book-call-btn').forEach(button => {
        const industry = button.closest('.industry-card')?.dataset.industry;
        button.onclick = () => openCalendarModal(industry);
    });
}

// Auto-trigger modal for high-intent actions
function setupAutoTriggers() {
    // Trigger after ROI calculation
    window.addEventListener('roi-calculated', (e) => {
        const industry = e.detail.industry;
        setTimeout(() => {
            if (!document.querySelector('.calendar-modal-overlay')) {
                showBookingPrompt(industry);
            }
        }, 3000); // 3 second delay after ROI calc
    });
}

function showBookingPrompt(industry) {
    const prompt = document.createElement('div');
    prompt.className = 'booking-prompt';
    prompt.innerHTML = `
        <div class="prompt-content">
            <p><strong>Ready to see these results in your ${industry.toLowerCase()} practice?</strong></p>
            <button onclick="openCalendarModal('${industry}'); this.parentElement.parentElement.remove();" class="prompt-cta">
                Book 15-Min Strategy Call
            </button>
            <button onclick="this.parentElement.parentElement.remove();" class="prompt-close">Maybe Later</button>
        </div>
    `;
    document.body.appendChild(prompt);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (prompt.parentElement) prompt.remove();
    }, 10000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCTAButtons();
    setupAutoTriggers();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCalendarModal();
});
// ===== HERO SECTION ANIMATIONS =====

// Neural Network Background Animation
class NeuralNetworkBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mousePos = { x: 0, y: 0 };
        
        this.init();
        this.bindEvents();
        this.animate();
    }
    
    init() {
        this.resize();
        this.createParticles();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Mouse interaction
            const dx = this.mousePos.x - particle.x;
            const dy = this.mousePos.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                particle.x -= dx * 0.001;
                particle.y -= dy * 0.001;
            }
        });
        
        // Draw connections
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(209, 46, 31, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Typewriter Effect
class TypewriterEffect {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
        
        this.start();
    }
    
    start() {
        this.element.textContent = '';
        this.type();
    }
    
    type() {
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text[this.currentIndex];
            this.currentIndex++;
            setTimeout(() => this.type(), this.speed);
        } else {
            // Remove cursor after typing
            setTimeout(() => {
                this.element.classList.add('typing-complete');
            }, 1000);
        }
    }
}

// Animated Counter
class AnimatedCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = parseInt(target);
        this.duration = duration;
        this.current = 0;
        
        this.animate();
    }
    
    animate() {
        const startTime = performance.now();
        const startValue = this.current;
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.current = Math.floor(startValue + (this.target - startValue) * easeOut);
            this.element.textContent = this.formatNumber(this.current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    formatNumber(num) {
        return num.toLocaleString();
    }
}

// Hero Section Controller
class HeroSectionController {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize neural network background
        this.neuralNetwork = new NeuralNetworkBackground('neuralCanvas');
        
        // Start animations when page loads
        window.addEventListener('load', () => {
            this.startAnimations();
        });
        
        // Industry card interactions
        this.bindIndustryCards();
    }
    
    startAnimations() {
        // Typewriter effect for headline
        const typewriterElement = document.querySelector('.typewriter-text');
        if (typewriterElement) {
            const text = typewriterElement.dataset.text;
            new TypewriterEffect(typewriterElement, text, 80);
        }
        
        // Staggered fade-in animations
        gsap.timeline()
            .to('.hero-subhead', { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                delay: 2.5,
                ease: 'power2.out' 
            })
            .to('.industry-quick-select', { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                delay: 0.3,
                ease: 'power2.out' 
            })
            .to('.roi-ticker-container', { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                delay: 0.2,
                ease: 'power2.out' 
            })
            .to('.hero-cta-container', { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                delay: 0.1,
                ease: 'power2.out' 
            });
        
        // Start counters after delay
        setTimeout(() => {
            this.startCounters();
        }, 3000);
    }
    
    startCounters() {
        // ROI Counter
        const roiCounter = document.querySelector('.roi-counter');
        if (roiCounter) {
            new AnimatedCounter(roiCounter, roiCounter.dataset.target, 3000);
        }
        
        // Live ticker counter
        const liveCounter = document.querySelector('.live-counter');
        if (liveCounter) {
            new AnimatedCounter(liveCounter, liveCounter.dataset.target, 2000);
        }
        
        // Metric bubbles
        document.querySelectorAll('.metric-bubble .counter').forEach((counter, index) => {
            setTimeout(() => {
                new AnimatedCounter(counter, counter.dataset.target, 2500);
            }, index * 500);
        });
    }
    
    bindIndustryCards() {
        document.querySelectorAll('.industry-card').forEach(card => {
            card.addEventListener('click', () => {
                const industry = card.dataset.industry;
                const roi = card.dataset.roi;
                
                // Add selection effect
                document.querySelectorAll('.industry-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // Update ROI counter to industry-specific value
                const roiCounter = document.querySelector('.roi-counter');
                if (roiCounter) {
                    new AnimatedCounter(roiCounter, roi, 1500);
                }
                
                // Trigger industry selection event
                window.dispatchEvent(new CustomEvent('industrySelected', {
                    detail: { industry, roi }
                }));
                
                // Auto-open ROI calculator after selection
                setTimeout(() => {
                    openROICalculator(industry);
                }, 1000);
            });
            
            // Hover effects
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { 
                    scale: 1.05, 
                    duration: 0.3, 
                    ease: 'power2.out' 
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { 
                    scale: 1, 
                    duration: 0.3, 
                    ease: 'power2.out' 
                });
            });
        });
    }
}

// Initialize hero section when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HeroSectionController();
});

// ROI Calculator trigger function (to be implemented in next section)
function openROICalculator(selectedIndustry = null) {
    console.log('Opening ROI Calculator for:', selectedIndustry);
    // Implementation will come in the next section
}
// =========================================
// END SHOCKWAVE FUNCTIONALITY
// =========================================
