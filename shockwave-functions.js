/* ===================================================================
   🤖 SHOCKWAVE AI AUTOMATION HERO EFFECTS
   Interactive Neural Network + Psychological Typewriter
   =================================================================== */

class ShockwaveAIHero {
  constructor() {
    this.typewriterPhrases = [
      "Your leads are calling competitors while you sleep...",
      "Every missed call costs you $2,500 in revenue...",
      "Prospects hang up after 3 rings - you respond in hours...",
      "Competitors answer in 60 seconds - you take 2 hours...",
      "Your best leads are booking with faster agencies...",
      "Manual follow-up loses 78% of hot prospects...",
      "After-hours calls = $15K monthly revenue loss...",
      "Slow response = immediate competitive disadvantage..."
    ];
    
    this.currentPhrase = 0;
    this.isTyping = false;
    this.typewriterSpeed = 80;
    this.eraseSpeed = 40;
    this.pauseDuration = 2000;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorTrails = [];
    
    this.init();
  }
  
  init() {
    this.createAIElements();
    this.initTypewriter();
    this.initInteractiveBackground();
    this.initAICursor();
    this.initNeuralNodes();
    this.initPerformanceMonitoring();
    this.initAnalytics();
  }
  
  createAIElements() {
    const hero = document.querySelector('.shockwave-ai-hero');
    if (!hero) return;
    
    // Neural Grid
    const neuralGrid = document.createElement('div');
    neuralGrid.className = 'neural-grid';
    hero.appendChild(neuralGrid);
    
    // Data Streams
    const dataStreams = document.createElement('div');
    dataStreams.className = 'data-streams';
    for (let i = 0; i < 6; i++) {
      const stream = document.createElement('div');
      stream.className = 'data-stream';
      dataStreams.appendChild(stream);
    }
    hero.appendChild(dataStreams);
    
    // Neural Nodes
    const neuralNodes = document.createElement('div');
    neuralNodes.className = 'neural-nodes';
    hero.appendChild(neuralNodes);
    
    // AI Cursor
    const aiCursor = document.createElement('div');
    aiCursor.className = 'ai-cursor';
    document.body.appendChild(aiCursor);
  }
  
  initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter-text');
    if (!typewriterElement) return;
    
    this.typewriterElement = typewriterElement;
    this.startTypewriterCycle();
    
    // Track typewriter engagement
    this.trackEvent('typewriter_started', {
      total_phrases: this.typewriterPhrases.length
    });
  }
  
  startTypewriterCycle() {
    if (this.isTyping) return;
    
    const phrase = this.typewriterPhrases[this.currentPhrase];
    this.typePhrase(phrase);
  }
  
  typePhrase(phrase) {
    this.isTyping = true;
    let charIndex = 0;
    
    const typeChar = () => {
      if (charIndex < phrase.length) {
        this.typewriterElement.textContent = phrase.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeChar, this.typewriterSpeed);
      } else {
        // Phrase complete - pause then erase
        setTimeout(() => this.erasePhrase(phrase), this.pauseDuration);
      }
    };
    
    typeChar();
  }
  
  erasePhrase(phrase) {
    let charIndex = phrase.length;
    
    const eraseChar = () => {
      if (charIndex > 0) {
        this.typewriterElement.textContent = phrase.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseChar, this.eraseSpeed);
      } else {
        // Phrase erased - move to next
        this.currentPhrase = (this.currentPhrase + 1) % this.typewriterPhrases.length;
        this.isTyping = false;
        
        // Track phrase completion
        this.trackEvent('typewriter_phrase_complete', {
          phrase_index: this.currentPhrase - 1,
          phrase_text: phrase.substring(0, 50) + '...'
        });
        
        setTimeout(() => this.startTypewriterCycle(), 500);
      }
    };
    
    eraseChar();
  }
  
  initInteractiveBackground() {
    const hero = document.querySelector('.shockwave-ai-hero');
    if (!hero) return;
    
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width;
      this.mouseY = (e.clientY - rect.top) / rect.height;
      
      // Update CSS custom properties for mouse effects
      hero.style.setProperty('--mouse-x', this.mouseX);
      hero.style.setProperty('--mouse-y', this.mouseY);
      
      // Dynamic background gradients
      const xPercent = this.mouseX * 100;
      const yPercent = this.mouseY * 100;
      
      hero.style.background = `
        radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(0, 245, 255, 0.08) 0%, transparent 40%),
        radial-gradient(circle at ${100-xPercent}% ${100-yPercent}%, rgba(139, 92, 246, 0.06) 0%, transparent 40%),
        linear-gradient(135deg, #000000 0%, #0F0F23 25%, #1A1A2E 50%, #16213E 75%, #0F0F23 100%)
      `;
      
      // Update neural nodes positions
      this.updateNeuralNodes();
    });
    
    // Reset on mouse leave
    hero.addEventListener('mouseleave', () => {
      hero.style.background = '';
    });
  }
  
  initAICursor() {
    const cursor = document.querySelector('.ai-cursor');
    if (!cursor) return;
    
    let lastX = 0, lastY = 0;
    
    document.addEventListener('mousemove', (e) => {
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Update cursor position
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      
      // Scale cursor based on velocity
      const scale = Math.min(1 + velocity * 0.02, 2);
      cursor.style.transform = `scale(${scale})`;
      
      // Create trailing particles
      this.createCursorTrail(e.clientX, e.clientY);
      
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '0.8';
    });
  }
  
  createCursorTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'ai-cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    
    // Animate trail
    setTimeout(() => {
      trail.style.opacity = '0';
      trail.style.transform = 'scale(0)';
      trail.style.transition = 'all 0.5s ease-out';
    }, 50);
    
    // Remove trail
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, 600);
  }
  
  initNeuralNodes() {
    const container = document.querySelector('.neural-nodes');
    if (!container) return;
    
    // Create interactive neural nodes
    for (let i = 0; i < 12; i++) {
      const node = document.createElement('div');
      node.className = 'neural-node';
      
      // Random positioning
      node.style.left = Math.random() * 100 + '%';
      node.style.top = Math.random() * 100 + '%';
      node.style.animationDelay = Math.random() * 2 + 's';
      
      container.appendChild(node);
    }
  }
  
  updateNeuralNodes() {
    const nodes = document.querySelectorAll('.neural-node');
    
    nodes.forEach((node, index) => {
      // Calculate distance from mouse
      const rect = node.getBoundingClientRect();
      const nodeX = (rect.left + rect.width / 2) / window.innerWidth;
      const nodeY = (rect.top + rect.height / 2) / window.innerHeight;
      
      const distanceX = this.mouseX - nodeX;
      const distanceY = this.mouseY - nodeY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Attraction effect
      if (distance < 0.2) {
        const attractionX = distanceX * 20;
        const attractionY = distanceY * 20;
        
        node.style.transform = `translate(${attractionX}px, ${attractionY}px) scale(${2 - distance * 5})`;
        node.style.boxShadow = `0 0 ${30 - distance * 100}px var(--neural-primary)`;
      } else {
        node.style.transform = 'translate(0, 0) scale(1)';
        node.style.boxShadow = '0 0 10px var(--neural-primary)';
      }
    });
  }
  
  initPerformanceMonitoring() {
    // Monitor frame rate
    let lastTime = performance.now();
    let frameCount = 0;
    
    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust effects based on performance
        if (fps < 30) {
          document.documentElement.classList.add('low-end-device');
          this.trackEvent('performance_degraded', { fps });
        }
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    requestAnimationFrame(checkPerformance);
  }
  
  initAnalytics() {
    // Track hero interactions
    const ctaButton = document.querySelector('.pilot-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        this.trackEvent('pilot_cta_click', {
          button_text: ctaButton.textContent.trim(),
          current_typewriter_phrase: this.currentPhrase
        });
      });
      
      ctaButton.addEventListener('mouseenter', () => {
        this.trackEvent('pilot_cta_hover', {
          hover_time: performance.now()
        });
      });
    }
    
    // Track trust indicator interactions
    document.querySelectorAll('.trust-indicator').forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        const trustType = indicator.querySelector('.trust-text').textContent;
        this.trackEvent('trust_indicator_click', {
          trust_type: trustType,
          indicator_position: index
        });
      });
    });
    
    // Track engagement time
    let engagementStart = performance.now();
    window.addEventListener('beforeunload', () => {
      const engagementTime = performance.now() - engagementStart;
      this.trackEvent('hero_engagement_time', {
        time_seconds: Math.round(engagementTime / 1000)
      });
    });
  }
  
  trackEvent(eventName, data = {}) {
    const eventData = {
      event_category: 'AI Hero Section',
      event_label: 'Neural Interface',
      section: 'ai_hero',
      timestamp: new Date().toISOString(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      ...data
    };
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    }
    
    // Console log for development
    if (window.location.hostname === 'localhost') {
      console.log('🤖 AI Hero Event:', eventName, eventData);
    }
  }
}

/* ===================================================================
   COUNTER ANIMATIONS FOR REVENUE STATS
   =================================================================== */

class RevenueCounters {
  constructor() {
    this.counters = [
      { selector: '.stat-number[data-count="21"]', target: 21, suffix: 'x' },
      { selector: '.stat-number[data-count="60"]', target: 60, suffix: 's' },
      { selector: '.stat-number[data-count="25000"]', target: 25000, prefix: '$', suffix: '+' }
    ];
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    const revenueSection = document.querySelector('.revenue-impact');
    if (revenueSection) {
      observer.observe(revenueSection);
    }
  }
  
  animateCounters() {
    this.counters.forEach(counter => {
      const element = document.querySelector(counter.selector);
      if (!element) return;
      
      this.animateCounter(element, counter);
    });
  }
  
  animateCounter(element, config) {
    const { target, prefix = '', suffix = '' } = config;
    const duration = 2000;
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(target * easeOutQuart);
      
      element.textContent = prefix + this.formatNumber(current) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }
}

/* ===================================================================
   INITIALIZATION
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    new ShockwaveAIHero();
  } else {
    // Simplified version for mobile
    document.documentElement.classList.add('low-end-device');
    
    // Initialize typewriter only
    const typewriter = new ShockwaveAIHero();
    typewriter.initTypewriter();
  }
  
  new RevenueCounters();
  
  // Track hero load
  if (typeof gtag !== 'undefined') {
    gtag('event', 'ai_hero_loaded', {
      event_category: 'Hero Section',
      load_time: performance.now()
    });
  }
});
