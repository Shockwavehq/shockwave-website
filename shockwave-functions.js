/* =====================================================
   SHOCKWAVE ULTIMATE HERO - INTERACTIVE CONTROLLER
   Performance: <100ms interactions, conversion tracking
   ===================================================== */

class ShockwaveUltimateHero {
  constructor() {
    this.counters = [];
    this.flowSteps = [];
    this.currentFlowStep = 0;
    this.spotCount = 3;
    this.isVisible = false;
    this.performanceMetrics = {};
    
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
    this.heroSection = document.querySelector('.shockwave-neural-hero');
    
    if (!this.heroSection) {
      console.warn('Shockwave Ultimate Hero not found');
      return;
    }

    this.initializeCounters();
    this.initializeFlowAnimation();
    this.initializeUrgencySystem();
    this.initializeScrollTrigger();
    this.initializeAnalytics();
    this.initializeInteractions();
    this.monitorPerformance();
    
    console.log('🚀 Shockwave Ultimate Hero initialized');
  }

  // Enhanced Counter System
  initializeCounters() {
    const counterElements = document.querySelectorAll('[data-animate]');
    
    counterElements.forEach((element, index) => {
      const finalCount = parseInt(element.dataset.animate);
      
      this.counters.push({
        element: element,
        current: 0,
        target: finalCount,
        increment: Math.max(1, Math.ceil(finalCount / 25)),
        hasAnimated: false,
        delay: index * 200 // Stagger animations
      });
    });
  }

  animateCounter(counter) {
    if (counter.hasAnimated) return;
    
    counter.hasAnimated = true;
    
    const animate = () => {
      if (counter.current < counter.target) {
        counter.current += counter.increment;
        if (counter.current > counter.target) {
          counter.current = counter.target;
        }
        
        counter.element.textContent = counter.current;
        
        if (counter.current < counter.target) {
          requestAnimationFrame(animate);
        } else {
          // Trigger completion event
          this.trackEvent('Counter Completed', {
            target: counter.target,
            element: counter.element.closest('.proof-stat')?.querySelector('.stat-label')?.textContent
          });
        }
      }
    };
    
    setTimeout(() => requestAnimationFrame(animate), counter.delay);
  }

  // Enhanced Flow Animation
  initializeFlowAnimation() {
    this.flowSteps = document.querySelectorAll('.flow-step');
    
    if (this.flowSteps.length === 0) return;
    
    // Start flow animation after hero visibility
    this.flowInterval = setInterval(() => {
      this.animateFlowStep();
    }, 2500);
  }

  animateFlowStep() {
    // Remove active class from all steps
    this.flowSteps.forEach(step => step.classList.remove('active'));
    
    // Add active class to current step
    if (this.flowSteps[this.currentFlowStep]) {
      this.flowSteps[this.currentFlowStep].classList.add('active');
      
      // Track flow step engagement
      this.trackEvent('Flow Step Viewed', {
        step: this.currentFlowStep + 1,
        stepText: this.flowSteps[this.currentFlowStep].querySelector('.flow-text')?.textContent
      });
    }
    
    this.currentFlowStep = (this.currentFlowStep + 1) % this.flowSteps.length;
  }

  // Urgency System
  initializeUrgencySystem() {
    const spotsElement = document.querySelector('[data-spots]');
    
    if (!spotsElement) return;
    
    // Simulate spot decrease every 30 seconds
    setInterval(() => {
      if (this.spotCount > 1) {
        this.spotCount--;
        spotsElement.textContent = this.spotCount;
        spotsElement.dataset.spots = this.spotCount;
        
        // Update urgency bar
        const urgencyFill = document.querySelector('.urgency-fill');
        if (urgencyFill) {
          const percentage = (this.spotCount / 3) * 25; // Max 25%
          urgencyFill.style.width = `${Math.max(5, percentage)}%`;
        }
        
        // Track urgency engagement
        this.trackEvent('Urgency Update', {
          spotsRemaining: this.spotCount
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Scroll-based Visibility
  initializeScrollTrigger() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.isVisible = true;
          this.triggerHeroAnimations();
          
          this.trackEvent('Hero Viewed', {
            timestamp: Date.now(),
            viewportHeight: window.innerHeight
          });
        }
      });
    }, {
      threshold: 0.2
    });
    
    observer.observe(this.heroSection);
  }

  triggerHeroAnimations() {
    // Animate counters with stagger
    this.counters.forEach(counter => {
      setTimeout(() => {
        this.animateCounter(counter);
      }, counter.delay);
    });

    // Start flow animation after a delay
    setTimeout(() => {
      this.animateFlowStep();
    }, 6500);
  }

  // Enhanced Analytics
  initializeAnalytics() {
    // Track all CTA clicks
    document.querySelectorAll('[data-track]').forEach(element => {
      element.addEventListener('click', (e) => {
        const action = element.dataset.track;
        const text = element.textContent?.trim() || 'Unknown';
        
        this.trackEvent('CTA Click', {
          action: action,
          text: text,
          position: this.getElementPosition(element),
          timestamp: Date.now()
        });
        
        // Visual feedback
        this.addClickFeedback(element);
      });
    });

    // Track trust badge interactions
    document.querySelectorAll('.trust-badge').forEach(badge => {
      badge.addEventListener('mouseenter', () => {
        const vertical = badge.dataset.vertical;
        const metric = badge.querySelector('.trust-metric')?.textContent;
        
        this.trackEvent('Trust Badge Hover', {
          vertical: vertical,
          metric: metric
        });
      });
    });

    // Track scroll depth
    this.trackScrollDepth();
  }

  trackScrollDepth() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          this.trackEvent('Scroll Depth', {
            milestone: milestone,
            section: 'Hero'
          });
        }
      });
    });
  }

  // Enhanced Interactions
  initializeInteractions() {
    // ROI Calculator link tracking
    const roiLinks = document.querySelectorAll('a[href="#roi-calculator"]');
    roiLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        this.trackEvent('ROI Calculator Interest', {
          source: 'Hero Section',
          timestamp: Date.now()
        });
        
        // Smooth scroll to calculator (when available)
        const calculator = document.querySelector('#roi-calculator');
        if (calculator) {
          calculator.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Case studies link tracking
    const caseLinks = document.querySelectorAll('a[href="#case-studies"]');
    caseLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        this.trackEvent('Case Studies Interest', {
          source: 'Hero Section',
          timestamp: Date.now()
        });
        
        // Smooth scroll to case studies (when available)
        const caseStudies = document.querySelector('#case-studies');
        if (caseStudies) {
          caseStudies.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Click Feedback Animation
  addClickFeedback(element) {
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      element.style.transform = '';
      element.style.transition = '';
    }, 100);

    // Add ripple effect for buttons
    if (element.classList.contains('primary-cta')) {
      this.createRippleEffect(element);
    }
  }

  createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Performance Monitoring
  monitorPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        this.performanceMetrics = {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
        };
        
        console.log('Hero Performance Metrics:', this.performanceMetrics);
        
        this.trackEvent('Performance Metrics', this.performanceMetrics);
      });
    }
  }

  // Event Tracking
  trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName.toLowerCase().replace(/\s+/g, '_'), {
        event_category: 'Hero_Ultimate',
        event_label: data.text || data.action || 'Hero_Interaction',
        ...data
      });
    }

    // Custom analytics (if needed)
    if (window.customAnalytics) {
      window.customAnalytics.track(eventName, {
        section: 'Hero Ultimate',
        ...data
      });
    }

    console.log('📊 Event:', eventName, data);
  }

  // Utility Methods
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    };
  }

  // Public Methods for External Control
  refreshCounters() {
    this.counters.forEach(counter => {
      counter.hasAnimated = false;
      counter.current = 0;
      counter.element.textContent = '0';
    });
  }

  pauseAnimations() {
    if (this.flowInterval) {
      clearInterval(this.flowInterval);
    }
  }

  resumeAnimations() {
    this.initializeFlowAnimation();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.ShockwaveUltimateHero = new ShockwaveUltimateHero();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (window.ShockwaveUltimateHero) {
    if (document.hidden) {
      window.ShockwaveUltimateHero.pauseAnimations();
    } else {
      window.ShockwaveUltimateHero.resumeAnimations();
    }
  }
});

// CSS Animation for ripple effect
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleCSS);
