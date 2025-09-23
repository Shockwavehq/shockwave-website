/* ===================================================================
   🔥 ENHANCED HERO SECTION INTERACTIVE EFFECTS - FUSION VERSION
   =================================================================== */

class ShockwaveNeuralHero {
  constructor() {
    this.animationQueue = [];
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }
  
  init() {
    if (!this.isReduced) {
      this.initTypewriterEffect();
      this.initCounterAnimations();
      this.initParallaxEffects();
      this.initPerformanceMonitoring();
    }
    this.initAccessibility();
    this.initScrollIndicator();
  }
  
  // Enhanced Typewriter Effect with Multiple Phases
  initTypewriterEffect() {
    const typewriterElements = {
      line1: document.querySelector('.typewriter-line-1'),
      highlight: document.querySelector('.typewriter-highlight'), 
      subline: document.querySelector('.typewriter-subline')
    };
    
    if (!typewriterElements.line1) return;
    
    // Phase 1: Main competitor line
    setTimeout(() => {
      this.typewriterAnimation(
        typewriterElements.line1,
        'Your competitors respond in hours.',
        50
      );
    }, 500);
    
    // Phase 2: Shockwave advantage
    setTimeout(() => {
      this.typewriterAnimation(
        typewriterElements.highlight,
        'We respond in 60 seconds.',
        45,
        () => {
          // Add emphasis pulse
          typewriterElements.highlight.style.animation += ', emphasisPulse 0.6s ease-in-out';
        }
      );
    }, 2500);
    
    // Phase 3: Revenue impact
    setTimeout(() => {
      this.typewriterAnimation(
        typewriterElements.subline,
        'Recovering $2.4K-25K+ monthly.',
        40
      );
    }, 3800);
    
    // Add emphasis pulse animation
    this.addEmphasisAnimation();
  }
  
  typewriterAnimation(element, text, speed, callback) {
    if (!element) return;
    
    element.style.opacity = '1';
    element.textContent = '';
    
    let i = 0;
    const timer = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      
      if (i > text.length) {
        clearInterval(timer);
        if (callback) callback();
      }
    }, speed);
  }
  
  addEmphasisAnimation() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes emphasisPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Animated ROI Counters with Easing
  initCounterAnimations() {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateROICounters();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const roiPanel = document.querySelector('.shockwave-glass-roi.hero-proof');
    if (roiPanel) {
      observer.observe(roiPanel);
    }
  }
  
  animateROICounters() {
    const counters = [
      { 
        element: '.roi-stat', 
        targets: ['21x', '$25K+'], 
        durations: [1500, 2000] 
      }
    ];
    
    const roiStats = document.querySelectorAll('.roi-stat');
    
    if (roiStats[0]) {
      this.animateCounter(roiStats[0], 21, 1500, 'x');
    }
    
    if (roiStats[1]) {
      this.animateCurrency(roiStats[1], 25000, 2000, '$', 'K+');
    }
  }
  
  animateCounter(element, target, duration, suffix = '') {
    let current = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
      current += increment;
      if (current >= target) {
        element.textContent = target + suffix;
      } else {
        element.textContent = Math.floor(current) + suffix;
        requestAnimationFrame(updateCounter);
      }
    };
    
    updateCounter();
  }
  
  animateCurrency(element, target, duration, prefix = '$', suffix = '') {
    let current = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
      current += increment;
      if (current >= target) {
        element.textContent = prefix + target / 1000 + suffix;
      } else {
        element.textContent = prefix + Math.floor(current / 1000) + suffix;
        requestAnimationFrame(updateCounter);
      }
    };
    
    updateCounter();
  }
  
  // Subtle Parallax Effects for Neural Background
  initParallaxEffects() {
    let ticking = false;
    
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.shockwave-neural-hero');
      
      if (hero) {
        const yPos = -(scrolled * 0.3);
        hero.style.transform = `translateY(${yPos}px)`;
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick);
  }
  
  // Performance Monitoring for Hero Section
  initPerformanceMonitoring() {
    const hero = document.querySelector('.shockwave-neural-hero');
    if (!hero) return;
    
    // Monitor animation performance
    let animationFrames = 0;
    let lastTime = performance.now();
    
    const monitorFPS = () => {
      animationFrames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((animationFrames * 1000) / (currentTime - lastTime));
        
        // If FPS drops below 30, reduce animations
        if (fps < 30) {
          this.optimizeAnimations();
        }
        
        animationFrames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(monitorFPS);
    };
    
    monitorFPS();
  }
  
  optimizeAnimations() {
    const hero = document.querySelector('.shockwave-neural-hero');
    if (hero) {
      hero.style.animation = 'none';
      hero.classList.add('performance-optimized');
    }
  }
  
  // Accessibility Enhancements
  initAccessibility() {
    const ctaButton = document.querySelector('.shockwave-glass-button.primary-cta');
    
    if (ctaButton) {
      // Enhanced keyboard navigation
      ctaButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ctaButton.click();
        }
      });
      
      // Screen reader announcements
      ctaButton.setAttribute('aria-label', 'Get 48-Hour AI Pilot with no risk. Deploy in 48 hours and measure results immediately.');
      
      // Focus management
      ctaButton.addEventListener('focus', () => {
        ctaButton.style.outline = '3px solid rgba(240, 62, 62, 0.6)';
        ctaButton.style.outlineOffset = '2px';
      });
      
      ctaButton.addEventListener('blur', () => {
        ctaButton.style.outline = 'none';
      });
    }
    
    // Add skip link for keyboard users
    this.addSkipLink();
  }
  
  addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--sw-primary);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  // Enhanced Scroll Indicator
  initScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'sw-neural-scroll-indicator';
    scrollIndicator.innerHTML = `
      <div class="sw-scroll-text">Discover Revenue Recovery Solutions</div>
      <div class="sw-scroll-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 16L6 10H18L12 16Z" fill="currentColor"/>
        </svg>
      </div>
    `;
    
    const heroSection = document.querySelector('.shockwave-neural-hero');
    if (heroSection) {
      heroSection.appendChild(scrollIndicator);
    }
    
    // Add enhanced styles
    const styles = `
      .sw-neural-scroll-indicator {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        animation: neuralScrollBounce 2.5s ease-in-out infinite;
        z-index: 15;
        transition: all 0.3s ease;
        padding: 1rem;
        border-radius: 12px;
        backdrop-filter: blur(8px);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .sw-scroll-text {
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
      }
      
      .sw-scroll-arrow {
        font-size: 1.2rem;
        animation: arrowBounce 1.5s ease-in-out infinite;
      }
      
      .sw-scroll-arrow svg {
        width: 20px;
        height: 20px;
        color: var(--sw-primary);
      }
      
      @keyframes neuralScrollBounce {
        0%, 100% { 
          transform: translateX(-50%) translateY(0);
          opacity: 0.7;
        }
        50% { 
          transform: translateX(-50%) translateY(-8px);
          opacity: 1;
        }
      }
      
      @keyframes arrowBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(4px); }
      }
      
      .sw-neural-scroll-indicator:hover {
        color: var(--sw-primary);
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(209, 46, 31, 0.3);
        transform: translateX(-50%) translateY(-2px);
      }
      
      @media (max-width: 768px) {
        .sw-neural-scroll-indicator {
          bottom: 1rem;
          padding: 0.8rem;
        }
        
        .sw-scroll-text {
          font-size: 0.8rem;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Enhanced smooth scroll
    scrollIndicator.addEventListener('click', () => {
      const nextSection = heroSection.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        
        // Track interaction
        this.trackEvent('scroll_indicator_click');
      }
    });
    
    // Hide on scroll
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      
      if (scrolled > heroHeight * 0.3) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.transform = 'translateX(-50%) translateY(0)';
      }
    });
  }
  
  // Analytics Integration
  trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'Hero Section',
        event_label: 'Neural Hero Interaction',
        ...parameters
      });
    }
    
    // Also track to console for debugging
    console.log('ShockwaveHQ Event:', eventName, parameters);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ShockwaveNeuralHero();
});

// Export for external access
window.ShockwaveNeuralHero = ShockwaveNeuralHero;
