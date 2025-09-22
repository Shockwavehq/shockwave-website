/* =====================================================
   SHOCKWAVE HERO - COMPLETE REWRITE
   Clean, optimized, conversion-focused
   ===================================================== */

class ShockwaveHero {
  constructor() {
    this.counters = [];
    this.flowSteps = [];
    this.currentStep = 0;
    this.spotsCount = 3;
    this.isVisible = false;
    this.flowInterval = null;
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.heroSection = document.querySelector('.shockwave-hero');
    
    if (!this.heroSection) {
      console.warn('Shockwave Hero section not found');
      return;
    }

    this.initCounters();
    this.initFlowAnimation();
    this.initUrgencySystem();
    this.initScrollObserver();
    this.initInteractions();
    this.initAnalytics();
    
    console.log('🚀 Shockwave Hero initialized successfully');
  }

  // Counter Animation System
  initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach((counter, index) => {
      const target = parseInt(counter.dataset.target) || 0;
      
      this.counters.push({
        element: counter,
        target: target,
        current: 0,
        increment: Math.max(1, Math.ceil(target / 30)),
        animated: false,
        delay: index * 200
      });
      
      // Set initial value
      counter.textContent = '0';
    });
  }

  animateCounter(counterData) {
    if (counterData.animated) return;
    
    counterData.animated = true;
    
    const animate = () => {
      if (counterData.current < counterData.target) {
        counterData.current += counterData.increment;
        
        if (counterData.current > counterData.target) {
          counterData.current = counterData.target;
        }
        
        counterData.element.textContent = counterData.current;
        
        if (counterData.current < counterData.target) {
          requestAnimationFrame(animate);
        } else {
          // Counter completed
          this.trackEvent('Counter Completed', {
            target: counterData.target,
            element: counterData.element.closest('.stat-card')?.querySelector('.stat-label')?.textContent
          });
        }
      }
    };
    
    setTimeout(() => requestAnimationFrame(animate), counterData.delay);
  }

  // Flow Animation System
  initFlowAnimation() {
    this.flowSteps = document.querySelectorAll('.flow-step');
    
    if (this.flowSteps.length === 0) return;
    
    // Start flow animation after hero is visible
    setTimeout(() => {
      this.startFlowAnimation();
    }, 7000); // Start after initial animations
  }

  startFlowAnimation() {
    if (this.flowInterval) {
      clearInterval(this.flowInterval);
    }
    
    this.flowInterval = setInterval(() => {
      this.animateFlowStep();
    }, 3000); // Change every 3 seconds
  }

  animateFlowStep() {
    // Remove active class from all steps
    this.flowSteps.forEach(step => {
      step.classList.remove('active');
    });
    
    // Add active class to current step
    if (this.flowSteps[this.currentStep]) {
      this.flowSteps[this.currentStep].classList.add('active');
      
      // Track step view
      this.trackEvent('Flow Step Viewed', {
        step: this.currentStep + 1,
        stepText: this.flowSteps[this.currentStep].querySelector('.flow-text')?.textContent
      });
    }
    
    // Move to next step
    this.currentStep = (this.currentStep + 1) % this.flowSteps.length;
  }

  // Urgency System
  initUrgencySystem() {
    const spotsElement = document.querySelector('.spots-count');
    const urgencyFill = document.querySelector('.urgency-fill');
    
    if (!spotsElement || !urgencyFill) return;
    
    // Decrease spots every 45 seconds
    setInterval(() => {
      if (this.spotsCount > 1) {
        this.spotsCount--;
        spotsElement.textContent = this.spotsCount;
        
        // Update urgency bar
        const percentage = (this.spotsCount / 3) * 25;
        urgencyFill.style.width = `${Math.max(8, percentage)}%`;
        
        // Track urgency change
        this.trackEvent('Urgency Updated', {
          spotsRemaining: this.spotsCount
        });
        
        // Add visual emphasis
        spotsElement.style.transform = 'scale(1.2)';
        spotsElement.style.color = '#FF4444';
        
        setTimeout(() => {
          spotsElement.style.transform = '';
          spotsElement.style.color = '';
        }, 500);
      }
    }, 45000);
  }

  // Scroll Observer
  initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.isVisible = true;
          this.triggerHeroAnimations();
          
          this.trackEvent('Hero Section Viewed', {
            timestamp: Date.now(),
            viewportHeight: window.innerHeight,
            scrollPosition: window.scrollY
          });
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -100px 0px'
    });
    
    observer.observe(this.heroSection);
  }

  triggerHeroAnimations() {
    // Animate counters with stagger
    this.counters.forEach(counter => {
      setTimeout(() => {
        this.animateCounter(counter);
      }, 6500 + counter.delay); // Start after text animations
    });
    
    // Additional engagement animations
    setTimeout(() => {
      this.addEngagementEffects();
    }, 8000);
  }

  addEngagementEffects() {
    // Pulse the primary CTA periodically
    const primaryCTA = document.querySelector('.primary-cta');
    if (primaryCTA) {
      setInterval(() => {
        primaryCTA.style.transform = 'translateY(-4px) scale(1.02)';
        setTimeout(() => {
          primaryCTA.style.transform = '';
        }, 300);
      }, 8000);
    }
  }

  // Interaction Handlers
  initInteractions() {
    // Primary CTA click
    const primaryCTA = document.querySelector('.primary-cta');
    if (primaryCTA) {
      primaryCTA.addEventListener('click', (e) => {
        this.handleCTAClick(e, 'Primary CTA', primaryCTA);
      });
    }

    // Secondary buttons
    document.querySelectorAll('.secondary-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = btn.textContent.trim();
        this.handleCTAClick(e, `Secondary: ${text}`, btn);
      });
    });

    // Trust card hovers
    document.querySelectorAll('.trust-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const vertical = card.dataset.vertical;
        const metric = card.querySelector('.trust-metric')?.textContent;
        
        this.trackEvent('Trust Card Hovered', {
          vertical: vertical,
          metric: metric
        });
      });
    });

    // Nav button
    const navButton = document.querySelector('.nav-button');
    if (navButton) {
      navButton.addEventListener('click', (e) => {
        this.handleCTAClick(e, 'Navigation CTA', navButton);
      });
    }
  }

  handleCTAClick(event, ctaType, element) {
    // Prevent default for anchor links
    if (element.tagName === 'A' && element.getAttribute('href').startsWith('#')) {
      event.preventDefault();
    }
    
    // Track the click
    this.trackEvent('CTA Clicked', {
      type: ctaType,
      text: element.textContent.trim(),
      position: this.getElementPosition(element),
      timestamp: Date.now()
    });
    
    // Visual feedback
    this.addClickFeedback(element);
    
    // Handle specific actions
    if (ctaType.includes('Primary') || ctaType.includes('Navigation')) {
      // Scroll to booking section or trigger modal
      this.handleBookingAction();
    } else if (ctaType.includes('Calculate')) {
      // Scroll to calculator
      this.scrollToSection('#calculator');
    } else if (ctaType.includes('Results')) {
      // Scroll to results/case studies
      this.scrollToSection('#results');
    }
  }

  addClickFeedback(element) {
    // Scale animation
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      element.style.transform = '';
      element.style.transition = '';
    }, 100);

    // Ripple effect for primary CTA
    if (element.classList.contains('primary-cta')) {
      this.createRipple(element);
    }
  }

  createRipple(element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      width: ${size}px;
      height: ${size}px;
      left: ${rect.width / 2 - size / 2}px;
      top: ${rect.height / 2 - size / 2}px;
      transform: scale(0);
      animation: rippleEffect 0.8s linear;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 800);
  }

  handleBookingAction() {
    // This would typically open a booking modal or scroll to booking form
    console.log('Booking action triggered');
    
    // For now, just scroll to a booking section if it exists
    const bookingSection = document.querySelector('#pilot') || 
                          document.querySelector('#booking') ||
                          document.querySelector('#contact');
    
    if (bookingSection) {
      this.scrollToSection(bookingSection);
    }
  }

  scrollToSection(selector) {
    const element = typeof selector === 'string' ? 
                   document.querySelector(selector) : selector;
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Analytics System
  initAnalytics() {
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.startTime = Date.now();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('Page Hidden', {
          timeOnPage: Date.now() - this.startTime
        });
      } else {
        this.trackEvent('Page Visible', {
          timeOnPage: Date.now() - this.startTime
        });
      }
    });
  }

  trackScrollDepth() {
    const milestones = [25, 50, 75, 100];
    const tracked = new Set();
    
    const checkScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          this.trackEvent('Scroll Depth', {
            milestone: milestone,
            section: 'Hero'
          });
        }
      });
    };
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName.toLowerCase().replace(/\s+/g, '_'), {
        event_category: 'Shockwave_Hero',
        event_label: data.text || data.type || 'Hero_Interaction',
        custom_parameter: JSON.stringify(data)
      });
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('trackCustom', eventName, data);
    }

    // Console log for development
    console.log(`📊 ${eventName}:`, data);
    
    // Custom analytics endpoint (if available)
    if (window.customAnalytics && typeof window.customAnalytics.track === 'function') {
      window.customAnalytics.track(eventName, {
        section: 'Hero',
        timestamp: Date.now(),
        ...data
      });
    }
  }

  // Utility Methods
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  }

  // Public Methods
  pauseAnimations() {
    if (this.flowInterval) {
      clearInterval(this.flowInterval);
      this.flowInterval = null;
    }
  }

  resumeAnimations() {
    if (!this.flowInterval && this.isVisible) {
      this.startFlowAnimation();
    }
  }

  resetCounters() {
    this.counters.forEach(counter => {
      counter.animated = false;
      counter.current = 0;
      counter.element.textContent = '0';
    });
  }

  destroy() {
    this.pauseAnimations();
    // Remove event listeners if needed
  }
}

// CSS for ripple effect
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `
  @keyframes rippleEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleCSS);

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.shockwaveHero = new ShockwaveHero();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (window.shockwaveHero) {
    if (document.hidden) {
      window.shockwaveHero.pauseAnimations();
    } else {
      window.shockwaveHero.resumeAnimations();
    }
  }
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const paintData = performance.getEntriesByType('paint');
      
      if (perfData && window.shockwaveHero) {
        window.shockwaveHero.trackEvent('Performance Metrics', {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          firstPaint: paintData.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paintData.find(entry => entry.name === 'first-contentful-paint')?.startTime
        });
      }
    }, 1000);
  });
}

