(function(){
  const Module = {
    id: 'hero',
    
    // Enhanced metrics configuration
    metricsConfig: {
      deployments: { base: 8, variance: 3, min: 5, max: 15, trend: 1 },
      revenue: { base: 2.4, variance: 0.2, min: 2.0, max: 3.5, decimals: 1, trend: 1 },
      spots_remaining: { base: 7, variance: 1, min: 3, max: 12, trend: -1 },
      avg_opportunity: { base: 127, variance: 25, min: 75, max: 200, trend: 1 },
      calculator_users: { base: 23, variance: 8, min: 15, max: 45, trend: 1 },
      response_seconds: { base: 47, variance: 15, min: 25, max: 90, trend: -1 },
      roi_guarantee: { base: 5, variance: 0, trend: 0 },
      roi_avg: { base: 247, variance: 20, min: 200, max: 400, trend: 1 }
    },

    init(root) {
      if (!root) return;
      
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const push = (event, extra = {}) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 
          event, 
          section: 'hero', 
          page_goal: 'book_demo', 
          timestamp: Date.now(),
          ...extra 
        });
      };

      // Initialize live metrics system
      this.initLiveMetrics(root);

      // Enhanced fade-up sequencing with stagger
      const animated = root.querySelectorAll('.fade-up');
      if (!rm && animated.length) {
        const io = new IntersectionObserver((ents, ob) => {
          ents.forEach((e, index) => {
            if (e.isIntersecting) {
              setTimeout(() => {
                e.target.classList.add('is-visible');
                push('element_revealed', { 
                  element: e.target.tagName.toLowerCase(),
                  index 
                });
              }, index * 100); // Staggered reveal
              ob.unobserve(e.target);
            }
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
        animated.forEach(n => io.observe(n));
      } else {
        animated.forEach(n => n.classList.add('is-visible'));
      }

      // Enhanced typewriter with better UX
      this.initTypewriter(root, rm, push);

      // Enhanced particles system
      this.initParticles(root, rm);

      // Enhanced personalization
      this.initPersonalization(root, push);

      // Enhanced analytics
      this.initAnalytics(root, push);

      // CTA interaction tracking
      this.initCTATracking(root, push);
    },

    initLiveMetrics(root) {
      const STORE = 'sw_hero_metrics_v1';
      
      const getData = () => {
        try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
        catch { return {}; }
      };
      
      const setData = (obj) => {
        try { localStorage.setItem(STORE, JSON.stringify(obj)); }
        catch {}
      };

      const generateValue = (key) => {
        const config = this.metricsConfig[key];
        if (!config) return null;

        const data = getData();
        const last = Number(data[key] ?? config.base);
        const drift = (Math.random() - 0.5) * config.variance + (config.variance * 0.1 * config.trend);
        let value = last + drift;
        value = Math.max(config.min, Math.min(config.max, value));
        
        data[key] = value;
        data._lastUpdate = Date.now();
        setData(data);
        
        return config.decimals ? value.toFixed(config.decimals) : Math.round(value);
      };

      const animateCounter = (element, newValue, duration = 1200) => {
        if (!element || !newValue) return;
        
        const startValue = parseFloat(element.textContent) || 0;
        const endValue = parseFloat(newValue);
        const startTime = performance.now();
        
        element.classList.add('sw-updating');
        
        function updateCounter(timestamp) {
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          const currentValue = startValue + (endValue - startValue) * easeOut;
          const isDecimal = newValue.toString().includes('.');
          
          element.textContent = isDecimal 
            ? currentValue.toFixed(1) 
            : Math.round(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            element.classList.remove('sw-updating');
          }
        }
        
        requestAnimationFrame(updateCounter);
      };

      const updateMetrics = () => {
        const counters = root.querySelectorAll('[data-sw-metric]');
        
        counters.forEach(counter => {
          const metricKey = counter.getAttribute('data-sw-metric');
          const newValue = generateValue(metricKey);
          
          if (newValue !== null && newValue !== counter.textContent) {
            animateCounter(counter, newValue);
          }
        });
      };

      // Initial update and interval
      setTimeout(updateMetrics, 2000);
      this._metricsInterval = setInterval(updateMetrics, 45000);

      // Pause when not visible
      const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            clearInterval(this._metricsInterval);
          } else {
            updateMetrics();
            this._metricsInterval = setInterval(updateMetrics, 45000);
          }
        });
      }, { threshold: 0.1 });
      
      visibilityObserver.observe(root);
    },

    initTypewriter(root, rm, push) {
      const twLine = root.querySelector('[data-typewriter]');
      const target = root.querySelector('.typewriter [data-typewriter-target]'); // Fixed selector
      const cursor = root.querySelector('.typewriter .cursor');
      
      if (!twLine || !target) return;
      
      const words = (twLine.getAttribute('data-words') || 'missed calls|web leads|DMs|voice messages').split('|')
        .map(s => s.trim()).filter(Boolean);
      const typeSpeed = +twLine.getAttribute('data-type-speed') || 75;
      const deleteSpeed = +twLine.getAttribute('data-delete-speed') || 45;
      const delay = +twLine.getAttribute('data-delay-between') || 1000;
      const loop = (twLine.getAttribute('data-loop') || 'true') === 'true';

      if (rm) { 
        target.textContent = words.join(', '); 
        if (cursor) cursor.style.display = 'none'; 
        return; 
      }

      let wordIndex = 0;
      let currentText = '';
      let isDeleting = false;
      let isPaused = false;
      let timeoutId = 0;

      const step = () => {
        if (isPaused || document.hidden) return;
        
        const currentWord = words[wordIndex % words.length];
        
        if (!isDeleting) {
          currentText = currentWord.substring(0, currentText.length + 1);
          target.textContent = currentText;
          
          if (currentText === currentWord) {
            isPaused = true;
            push('typewriter_word_complete', { word: currentWord });
            timeoutId = setTimeout(() => {
              isPaused = false;
              isDeleting = true;
              step();
            }, delay);
            return;
          }
        } else {
          currentText = currentWord.substring(0, currentText.length - 1);
          target.textContent = currentText;
          
          if (currentText === '') {
            isDeleting = false;
            wordIndex++;
            if (!loop && wordIndex >= words.length) return;
            timeoutId = setTimeout(step, 200);
            return;
          }
        }

        const speed = isDeleting ? deleteSpeed : typeSpeed;
        timeoutId = setTimeout(step, speed + Math.random() * 20);
      };

      // Pause on hover/focus for accessibility
      const pause = () => { isPaused = true; clearTimeout(timeoutId); };
      const resume = () => { if (!isPaused) return; isPaused = false; step(); };
      
      twLine.addEventListener('mouseenter', pause);
      twLine.addEventListener('mouseleave', resume);
      twLine.addEventListener('focusin', pause);
      twLine.addEventListener('focusout', resume);

      setTimeout(step, 1000);
      push('typewriter_started', { words: words.length });
      
      this._cleanupType = () => clearTimeout(timeoutId);
    },

    initParticles(root, rm) {
      const host = root.querySelector('[data-particles]');
      const desktop = window.matchMedia('(min-width: 1025px)').matches;
      
      if (!host || rm || !desktop) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement('canvas');
      canvas.className = 'particles';
      host.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      const color = 'rgba(209, 46, 31, 0.6)';
      const linkColor = 'rgba(209, 46, 31, 0.25)';
      const count = 70;
      const maxSpeed = 0.3;
      const linkDistance = 120;

      let width = 0, height = 0, animationFrame = null, isRunning = true;
      
      const resize = () => {
        const rect = host.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      
      resize();
      window.addEventListener('resize', resize, { passive: true });

      const particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 2 - 1) * maxSpeed,
        vy: (Math.random() * 2 - 1) * maxSpeed
      }));

      const draw = () => {
        if (!isRunning || document.hidden) return;
        
        ctx.clearRect(0, 0, width, height);
        
        // Update positions
        for (let particle of particles) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Bounce off edges
          if (particle.x < 0 || particle.x > width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        }
        
        // Draw connections
        ctx.strokeStyle = linkColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < linkDistance) {
              const opacity = 1 - (distance / linkDistance);
              ctx.globalAlpha = opacity * 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        
        // Draw particles
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        for (let particle of particles) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        animationFrame = requestAnimationFrame(draw);
      };

      // Performance monitoring
      const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!animationFrame) {
              isRunning = true;
              animationFrame = requestAnimationFrame(draw);
            }
          } else {
            isRunning = false;
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
              animationFrame = null;
            }
          }
        });
      }, { threshold: 0.1 });
      
      visibilityObserver.observe(root);
      animationFrame = requestAnimationFrame(draw);
      
      this._cleanupParticles = () => {
        isRunning = false;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resize);
        try { host.removeChild(canvas); } catch (_) {}
      };
    },

    initPersonalization(root, push) {
      const params = new URLSearchParams(location.search);
      const vertical = (params.get('vertical') || '').toLowerCase();
      const source = (params.get('source') || '').toLowerCase();
      
      const h1 = root.querySelector('h1');
      const subhead = root.querySelector('.subhead');
      
      const verticalMap = {
        'dental': {
          h1: 'Answer first. Book faster.',
          append: ' Enforce deposits, fill cancellations, and reduce no‑shows automatically.'
        },
        'hvac': {
          h1: 'Capture emergencies. Win weekends.',
          append: ' Auto‑reply after hours, triage urgency, and route with ETAs.'
        },
        'legal': {
          h1: 'First to respond. First to consult.',
          append: ' Fast intake standards and weekend coverage that converts.'
        },
        'plumbing': {
          h1: 'Never miss an emergency again.',
          append: ' Instant SMS on missed calls with priority routing.'
        },
        'med-spa': {
          h1: 'Keep your schedule predictably full.',
          append: ' Smart waitlists and deposits that stabilize utilization.'
        },
        'pest-control': {
          h1: 'Capture seasonal demand automatically.',
          append: ' Route optimization and recurring service automation.'
        }
      };
      
      if (vertical && verticalMap[vertical] && h1 && subhead) {
        const config = verticalMap[vertical];
        h1.innerHTML = h1.innerHTML.replace(/Answer first\. Book.*?faster\./, config.h1);
        subhead.textContent = subhead.textContent + config.append;
        
        push('personalization_applied', { vertical, source });
      }
      
      // Source-based CTA customization
      const primaryCTA = root.querySelector('[data-cta="primary"]');
      const secondaryCTA = root.querySelector('[data-cta="secondary"]');
      
      if (primaryCTA) {
        const ctaMap = {
          'googleads': 'Book Free Strategy Call',
          'linkedin': 'Schedule Intro Call',
          'retargeting': 'Claim Your Spot'
        };
        
        if (source && ctaMap[source]) {
          primaryCTA.querySelector('.btn-main').textContent = ctaMap[source];
        }
      }
      
      if (secondaryCTA && source === 'retargeting') {
        secondaryCTA.textContent = 'See ROI Now';
      }
    },

    initCTATracking(root, push) {
      // Track CTA interactions with enhanced data
      const primaryCTA = root.querySelector('[data-cta="primary"]');
      const secondaryCTA = root.querySelector('[data-cta="secondary"]');
      
      if (primaryCTA) {
        primaryCTA.addEventListener('click', () => {
          // Bump avg_opportunity when calendar is opened
          const data = JSON.parse(localStorage.getItem('sw_hero_metrics_v1') || '{}');
          data.avg_opportunity = (data.avg_opportunity || this.metricsConfig.avg_opportunity.base) + Math.round(Math.random() * 5);
          localStorage.setItem('sw_hero_metrics_v1', JSON.stringify(data));
          
          push('hero_primary_cta_click', {
            cta_text: primaryCTA.textContent.trim(),
            page_position: 'hero'
          });
        });
      }
      
      if (secondaryCTA) {
        secondaryCTA.addEventListener('click', () => {
          // Bump calculator_users when ROI calculator is accessed
          const data = JSON.parse(localStorage.getItem('sw_hero_metrics_v1') || '{}');
          data.calculator_users = (data.calculator_users || this.metricsConfig.calculator_users.base) + 1;
          localStorage.setItem('sw_hero_metrics_v1', JSON.stringify(data));
          
          push('hero_secondary_cta_click', {
            cta_text: secondaryCTA.textContent.trim(),
            page_position: 'hero'
          });
        });
      }
    },

    initAnalytics(root, push) {
      // Trust logo tracking
      root.querySelectorAll('.trust [data-evt="trust_logo"]').forEach(img => {
        img.addEventListener('click', () => {
          push('hero_trust_logo_click', { 
            logo: img.alt || '',
            position: 'hero_trust_section'
          });
        });
      });
      
      // Hero visibility tracking
      const seenObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            push('hero_seen', {
              viewport_percentage: Math.round(entry.intersectionRatio * 100),
              time_on_page: Date.now() - (window.pageLoadTime || Date.now())
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.5 });
      
      seenObserver.observe(root);
    },

    destroy() {
      if (this._cleanupType) this._cleanupType();
      if (this._cleanupParticles) this._cleanupParticles();
      if (this._metricsInterval) clearInterval(this._metricsInterval);
    }
  };

  // Register with engine or initialize directly
  if (window.SHOCKWAVE_LIVE && typeof window.SHOCKWAVE_LIVE.register === 'function') {
    window.SHOCKWAVE_LIVE.register(Module.id, Module);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      const heroSection = document.querySelector('#hero');
      if (heroSection) Module.init(heroSection);
    });
  }
})();
