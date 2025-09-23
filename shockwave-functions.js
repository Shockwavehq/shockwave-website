/* ===================================================================
   🔥 ENHANCED HERO SECTION EFFECTS - FUSION VERSION
   =================================================================== */

class ShockwaveNeuralHero {
  constructor() {
    this.animationSequence = [];
    this.isAnimating = false;
    this.observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.initTypewriterSequence();
    this.initParticleSystem();
    this.initCTATracking();
    this.initPerformanceOptimizations();
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isAnimating) {
          this.startHeroSequence();
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);
    
    const heroSection = document.querySelector('.shockwave-neural-hero');
    if (heroSection) {
      observer.observe(heroSection);
    }
  }
  
  startHeroSequence() {
    this.isAnimating = true;
    
    // Track hero impression
    this.trackHeroEvent('hero_impression', {
      sequence_started: true,
      viewport_time: performance.now()
    });
    
    // Initialize counter animations when ROI panel appears
    setTimeout(() => {
      this.initCounterAnimations();
    }, 5000);
  }
  
  initTypewriterSequence() {
    const line1 = document.querySelector('.typewriter-line-1');
    const highlight = document.querySelector('.typewriter-highlight');
    const subline = document.querySelector('.typewriter-subline');
    
    if (!line1 || !highlight || !subline) return;
    
    // Enhanced typewriter with sound effect simulation
    const typewriterSteps = [
      {
        element: line1,
        text: 'Your competitors respond in hours.',
        delay: 500,
        duration: 2000
      },
      {
        element: highlight,
        text: 'We respond in 60 seconds.',
        delay: 2500,
        duration: 1000
      },
      {
        element: subline,
        text: 'Recovering $2.4K-25K+ monthly.',
        delay: 4000,
        duration: 800
      }
    ];
    
    typewriterSteps.forEach(step => {
      setTimeout(() => {
        this.typewriterEffect(step.element, step.text, step.duration);
      }, step.delay);
    });
  }
  
  typewriterEffect(element, text, duration) {
    if (!element) return;
    
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    // Track typewriter completion
    setTimeout(() => {
      this.trackHeroEvent('typewriter_complete', {
        text_revealed: text,
        element_class: element.className
      });
    }, duration);
  }
  
  initCounterAnimations() {
    const counters = [
      {
        selector: '.roi-stat:first-child',
        start: 1,
        end: 21,
        suffix: 'x',
        duration: 1500
      },
      {
        selector: '.roi-stat:last-child', 
        start: 1000,
        end: 25000,
        prefix: '$',
        suffix: 'K+',
        duration: 2000
      }
    ];
    
    counters.forEach(counter => {
      const element = document.querySelector(counter.selector);
      if (element) {
        this.animateCounter(element, counter);
      }
    });
  }
  
  animateCounter(element, config) {
    const { start, end, duration, prefix = '', suffix = '' } = config;
    const startTime = performance.now();
    const range = end - start;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (range * easeOutQuart));
      
      element.textContent = prefix + this.formatNumber(current) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Track counter completion
        this.trackHeroEvent('counter_complete', {
          final_value: current,
          element_text: element.textContent
        });
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1);
    }
    return num.toString();
  }
  
  initParticleSystem() {
    // Enhanced particle system with mouse interaction
    const hero = document.querySelector('.shockwave-neural-hero');
    if (!hero) return;
    
    let mouseX = 0;
    let mouseY = 0;
    
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
      
      // Update CSS custom properties for mouse-responsive effects
      hero.style.setProperty('--mouse-x', mouseX);
      hero.style.setProperty('--mouse-y', mouseY);
    });
    
    // Track mouse interaction
    let interactionTracked = false;
    hero.addEventListener('mousemove', () => {
      if (!interactionTracked) {
        this.trackHeroEvent('mouse_interaction', {
          interaction_type: 'mousemove',
          section: 'hero'
        });
        interactionTracked = true;
      }
    });
  }
  
  initCTATracking() {
    const primaryCTA = document.querySelector('.shockwave-glass-button.primary-cta');
    const trustBadges = document.querySelectorAll('.shockwave-glass-trust.trust-badge');
    
    if (primaryCTA) {
      primaryCTA.addEventListener('click', (e) => {
        this.trackHeroEvent('cta_click', {
          cta_text: primaryCTA.textContent.trim(),
          cta_type: 'primary',
          position: 'hero'
        });
      });
      
      // Track CTA hover
      primaryCTA.addEventListener('mouseenter', () => {
        this.trackHeroEvent('cta_hover', {
          cta_type: 'primary',
          hover_time: performance.now()
        });
      });
    }
    
    // Track trust badge interactions
    trustBadges.forEach(badge => {
      badge.addEventListener('click', () => {
        const trustType = badge.querySelector('.trust-text').textContent;
        this.trackHeroEvent('trust_badge_click', {
          trust_type: trustType,
          badge_position: Array.from(trustBadges).indexOf(badge)
        });
      });
    });
  }
  
  initPerformanceOptimizations() {
    // Optimize animations based on device capabilities
    const isLowEndDevice = this.detectLowEndDevice();
    
    if (isLowEndDevice) {
      document.documentElement.classList.add('low-end-device');
      
      // Reduce animation complexity
      const hero = document.querySelector('.shockwave-neural-hero');
      if (hero) {
        hero.style.animationDuration = '20s';
      }
    }
    
    // Pause animations when not visible
    this.setupVisibilityHandler();
  }
  
  detectLowEndDevice() {
    // Simple heuristics for low-end device detection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    return slowConnection || lowMemory || lowCores;
  }
  
  setupVisibilityHandler() {
    let animationsPaused = false;
    
    document.addEventListener('visibilitychange', () => {
      const hero = document.querySelector('.shockwave-neural-hero');
      if (!hero) return;
      
      if (document.hidden && !animationsPaused) {
        hero.style.animationPlayState = 'paused';
        animationsPaused = true;
      } else if (!document.hidden && animationsPaused) {
        hero.style.animationPlayState = 'running';
        animationsPaused = false;
      }
    });
  }
  
  trackHeroEvent(eventName, data = {}) {
    // Enhanced analytics tracking
    const eventData = {
      event_category: 'Hero Section',
      event_label: 'Neural Hero Fusion',
      section: 'hero',
      timestamp: new Date().toISOString(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: navigator.userAgent,
      ...data
    };
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    }
    
    // Custom tracking endpoint (if available)
    if (window.ShockwaveAnalytics && typeof window.ShockwaveAnalytics.track === 'function') {
      window.ShockwaveAnalytics.track(eventName, eventData);
    }
    
    // Console log for development
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('test')) {
      console.log('🔥 Shockwave Hero Event:', eventName, eventData);
    }
  }
}

/* ===================================================================
   GLASSMORPHISM INTERACTIVE EFFECTS
   =================================================================== */

class GlassmorphismEffects {
  constructor() {
    this.init();
  }
  
  init() {
    this.enhanceGlassElements();
    this.addInteractiveGlow();
    this.setupHoverEffects();
  }
  
  enhanceGlassElements() {
    const glassElements = document.querySelectorAll([
      '.hero-message-glass',
      '.shockwave-glass-roi',
      '.shockwave-glass-button',
      '.shockwave-glass-trust'
    ].join(', '));
    
    glassElements.forEach(element => {
      this.addGlassEnhancements(element);
    });
  }
  
  addGlassEnhancements(element) {
    // Add subtle mouse tracking for enhanced depth
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      // Create subtle tilt effect
      const tiltX = (y - 0.5) * 10;
      const tiltY = (x - 0.5) * -10;
      
      element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  }
  
  addInteractiveGlow() {
    const hero = document.querySelector('.shockwave-neural-hero');
    if (!hero) return;
    
    hero.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      hero.style.background = `
        radial-gradient(circle at ${x}% ${y}%, rgba(209, 46, 31, 0.1) 0%, transparent 50%),
        var(--ai-gradient)
      `;
    });
  }
  
  setupHoverEffects() {
    // Enhanced CTA button effects
    const ctaButton = document.querySelector('.shockwave-glass-button.primary-cta');
    if (ctaButton) {
      ctaButton.addEventListener('mouseenter', () => {
        ctaButton.style.setProperty('--glow-intensity', '1');
      });
      
      ctaButton.addEventListener('mouseleave', () => {
        ctaButton.style.setProperty('--glow-intensity', '0');
      });
    }
  }
}

/* ===================================================================
   INITIALIZATION
   =================================================================== */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize hero effects
  new ShockwaveNeuralHero();
  new GlassmorphismEffects();
  
  // Track initial load performance
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const loadTime = performance.getEntriesByType('navigation')[0].loadEventEnd - 
                      performance.getEntriesByType('navigation')[0].fetchStart;
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'hero_load_complete', {
          event_category: 'Performance',
          load_time: Math.round(loadTime),
          meets_target: loadTime < 2500
        });
      }
    }
  });
});

// Export for external use
window.ShockwaveHero = {
  NeuralHero: ShockwaveNeuralHero,
  GlassmorphismEffects: GlassmorphismEffects,
  version: '2.0.0'
};
