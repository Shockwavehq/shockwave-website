// ================================================
// SHOCKWAVEHQ ULTRA-PREMIUM ANIMATION SYSTEM V2.0
// Award-Winning Interactions + Real-Time Analytics
// ================================================

class ShockwaveUltraPremium {
  constructor() {
    this.isInitialized = false;
    this.performanceMonitor = null;
    this.neuralCanvas = null;
    this.voiceRecognition = null;
    this.engagementTracker = null;
    this.currentIndustry = 'dental';
    
    // Real ROI Data from Brand Files
    this.roiData = {
      dental: { monthly: 2497, roiMin: 2400, roiMax: 6500, multiplier: 2.6 },
      legal: { monthly: 3997, roiMin: 3000, roiMax: 12000, multiplier: 3.8 },
      hvac: { monthly: 1997, roiMin: 2800, roiMax: 8500, multiplier: 4.2 },
      medspa: { monthly: 2997, roiMin: 2400, roiMax: 9500, multiplier: 3.2 }
    };
    
    // Advanced Animation Timeline
    this.masterTimeline = null;
    this.scrollTimeline = null;
    
    this.init();
  }

  async init() {
    // Wait for GSAP
    if (typeof gsap === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }

    console.log('🚀 Initializing ShockwaveHQ Ultra-Premium Experience...');
    
    this.setupGSAP();
    this.setupPerformanceMonitoring();
    this.createNeuralNetwork();
    this.setupVoiceActivation();
    this.initEngagementTracking();
    this.startMasterAnimation();
    this.setupAdvancedInteractions();
    this.createLiveActivityFeed();
    this.setupExitIntent();
    
    this.isInitialized = true;
    console.log('✨ ShockwaveHQ Ultra-Premium Experience Loaded!');
  }

  setupGSAP() {
    // Register plugins
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
    
    // Performance defaults
    gsap.defaults({
      duration: 0.8,
      ease: "power2.out"
    });
    
    // Set ticker for 60fps
    gsap.ticker.fps(60);
  }

  setupPerformanceMonitoring() {
    this.performanceMonitor = new PerformanceMonitor();
    this.performanceMonitor.start();
  }

  createNeuralNetwork() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const neurons = [];
    const connections = [];
    let mouse = { x: 0, y: 0 };
    let animationId = null;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Neuron class
    class Neuron {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          this.vx += (dx / distance) * force * 0.02;
          this.vy += (dy / distance) * force * 0.02;
        }

        // Natural movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Pulse animation
        this.pulsePhase += 0.02;
        this.currentRadius = this.radius + Math.sin(this.pulsePhase) * 0.5;

        // Boundary physics
        if (this.x < 0 || this.x > canvas.width) this.vx *= -0.8;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -0.8;
        
        // Friction
        this.vx *= 0.99;
        this.vy *= 0.99;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 46, 31, ${this.opacity})`;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${this.opacity * 0.3})`;
        ctx.fill();
      }
    }

    // Initialize neurons
    const neuronCount = window.innerWidth < 768 ? 30 : 60;
    for (let i = 0; i < neuronCount; i++) {
      neurons.push(new Neuron());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw neurons
      neurons.forEach(neuron => {
        neuron.update();
        neuron.draw();
      });

      // Draw connections
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const dx = neurons[i].x - neurons[j].x;
          const dy = neurons[i].y - neurons[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.3;
            ctx.beginPath();
            ctx.moveTo(neurons[i].x, neurons[i].y);
            ctx.lineTo(neurons[j].x, neurons[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Performance cleanup
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  startMasterAnimation() {
    this.masterTimeline = gsap.timeline();

    // Hero entrance sequence with advanced physics
    this.masterTimeline
      .from(".mit-research-badge", {
        duration: 0.6,
        y: -30,
        opacity: 0,
        scale: 0.8,
        ease: "back.out(1.7)"
      })
      .from(".shockwave-hero-content", {
        duration: 1,
        y: 80,
        opacity: 0,
        ease: "power3.out"
      }, "-=0.3")
      .add(() => this.typewriterEffect(), "-=0.2")
      .from(".shockwave-value-prop", {
        duration: 0.8,
        y: 40,
        opacity: 0,
        ease: "power2.out"
      }, "-=0.4")
      .from(".response-time-display", {
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        ease: "back.out(1.7)",
        onComplete: () => this.startResponseCounter()
      }, "-=0.3")
      .from(".trust-indicators-ultra", {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: "power2.out",
        onComplete: () => this.animateTrustNumbers()
      }, "-=0.4")
      .from(".shockwave-ultra-cta", {
        duration: 1,
        y: 40,
        opacity: 0,
        scale: 0.95,
        ease: "back.out(1.7)",
        onComplete: () => this.startCTAPulse()
      }, "-=0.3")
      .from(".shockwave-visual-panel", {
        duration: 1.2,
        x: 80,
        opacity: 0,
        rotationY: 15,
        ease: "power3.out"
      }, "-=1")
      .from(".roi-calculator-ultra", {
        duration: 0.8,
        y: 40,
        opacity: 0,
        rotationX: 10,
        ease: "power2.out"
      }, "-=0.6");

    // Setup scroll-triggered animations
    this.setupScrollAnimations();
  }

  typewriterEffect() {
    const title = document.querySelector('.shockwave-typewriter-title');
    if (!title) return;

    const text = "MIT Research Proves: Leads contacted within 60 seconds are 21x more likely to convert";
    const cursor = document.querySelector('.typewriter-cursor');
    
    title.innerHTML = '';
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        title.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        // Start cursor blinking
        if (cursor) {
          cursor.style.display = 'inline-block';
        }
        
        // Add emphasis after typing
        setTimeout(() => {
          title.innerHTML = title.innerHTML.replace('21x more likely', '<span class="value-emphasis">21x more likely</span>');
        }, 500);
      }
    }, 50);
  }

  startResponseCounter() {
    const counter = document.querySelector('.live-counter');
    if (!counter) return;

    let currentTime = 60;
    const updateCounter = () => {
      currentTime = Math.max(15, currentTime - Math.random() * 5);
      counter.textContent = `<${Math.round(currentTime)}s`;
      
      // Visual feedback
      gsap.to(counter, {
        duration: 0.3,
        scale: 1.1,
        ease: "back.out(2)",
        yoyo: true,
        repeat: 1
      });
    };

    // Update every 3-5 seconds
    setInterval(updateCounter, 3000 + Math.random() * 2000);
  }

  animateTrustNumbers() {
    const numbers = document.querySelectorAll('.trust-number-ultra');
    const targets = ['12,847', '94%', '30'];
    
    numbers.forEach((number, index) => {
      const target = targets[index];
      const numericTarget = parseInt(target.replace(/[^\d]/g, ''));
      
      gsap.from(number, {
        duration: 2,
        textContent: 0,
        roundProps: "textContent",
        ease: "power2.out",
        delay: index * 0.3,
        onUpdate: function() {
          const current = Math.round(this.targets()[0].textContent);
          if (target.includes('%')) {
            number.textContent = current + '%';
          } else if (target.includes(',')) {
            number.textContent = current.toLocaleString();
          } else {
            number.textContent = current;
          }
        }
      });
      
      // Add floating badge animation
      setTimeout(() => {
        const badge = number.parentElement.querySelector('.floating-trust-badge');
        if (badge) {
          gsap.from(badge, {
            duration: 0.8,
            scale: 0,
            rotation: 180,
            ease: "back.out(1.7)"
          });
        }
      }, (index + 1) * 300);
    });
  }

  startCTAPulse() {
    gsap.to(".shockwave-ultra-cta", {
      duration: 3,
      scale: 1.02,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  }

  setupAdvancedInteractions() {
    // Industry selector
    const industryButtons = document.querySelectorAll('.industry-button-ultra');
    const roiDisplay = document.querySelector('.roi-number-ultra');
    
    industryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active from all
        industryButtons.forEach(b => b.classList.remove('active'));
        
        // Add active to clicked
        btn.classList.add('active');
        
        // Update industry
        this.currentIndustry = btn.dataset.industry;
        
        // Animate ROI change
        this.updateROIDisplay();
        this.updateAutomationShowcase();
        
        // Track engagement
        this.engagementTracker?.trackInteraction('industry_change', this.currentIndustry);
      });
      
      // Advanced hover effects
      btn.addEventListener('mouseenter', () => {
        if (!btn.classList.contains('active')) {
          gsap.to(btn, {
            duration: 0.3,
            y: -2,
            scale: 1.02,
            ease: "power2.out"
          });
        }
      });
      
      btn.addEventListener('mouseleave', () => {
        if (!btn.classList.contains('active')) {
          gsap.to(btn, {
            duration: 0.3,
            y: 0,
            scale: 1,
            ease: "power2.out"
          });
        }
      });
    });

    // ROI Calculator hover
    const roiCard = document.querySelector('.roi-calculator-ultra');
    if (roiCard) {
      roiCard.addEventListener('mouseenter', () => {
        gsap.to(roiCard, {
          duration: 0.4,
          rotationX: 0,
          rotationY: 0,
          y: -12,
          ease: "power2.out"
        });
      });
      
      roiCard.addEventListener('mouseleave', () => {
        gsap.to(roiCard, {
          duration: 0.4,
          rotationX: 2,
          rotationY: -2,
          y: 0,
          ease: "power2.out"
        });
      });
    }

    // CTA button advanced interactions
    const ctaBtn = document.querySelector('.shockwave-ultra-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Create ripple effect
        this.createAdvancedRipple(e);
        
        // Track conversion attempt
        this.engagementTracker?.trackConversion('cta_click');
        
        // Scroll to ROI calculator or show modal
        this.handleCTAClick();
      });
    }
  }

  updateROIDisplay() {
    const roiDisplay = document.querySelector('.roi-number-ultra');
    const data = this.roiData[this.currentIndustry];
    
    if (!roiDisplay || !data) return;
    
    // Animate number change
    gsap.to(roiDisplay, {
      duration: 0.3,
      scale: 0.8,
      opacity: 0.5,
      ease: "power2.in",
      onComplete: () => {
        roiDisplay.textContent = `${data.multiplier}x`;
        
        gsap.to(roiDisplay, {
          duration: 0.6,
          scale: 1,
          opacity: 1,
          ease: "back.out(1.7)"
        });
      }
    });
  }

  updateAutomationShowcase() {
    const showcase = document.querySelector('.automation-showcase-ultra');
    if (!showcase) return;

    const automations = {
      dental: [
        { title: 'Smart Waitlist Fill', roi: '$2,000/mo' },
        { title: 'No-Show Prevention', roi: '$1,800/mo' },
        { title: 'AI Voice Booking', roi: '$1,200/mo' }
      ],
      legal: [
        { title: '5-Min Response System', roi: '$10,000/mo' },
        { title: '24/7 DUI Intake', roi: '$5,000/mo' },
        { title: 'Retainer Auto-Send', roi: '$3,000/mo' }
      ],
      hvac: [
        { title: 'After-Hours Capture', roi: '$2,700/mo' },
        { title: 'Emergency Triage', roi: '$1,800/mo' },
        { title: 'ETA Automation', roi: '$1,500/mo' }
      ],
      medspa: [
        { title: 'Waitlist Management', roi: '$5,270/mo' },
        { title: 'No-Show Prevention', roi: '$2,635/mo' },
        { title: 'Package Upsells', roi: '$4,000/mo' }
      ]
    };

    const currentAutomations = automations[this.currentIndustry];
    
    // Fade out current cards
    gsap.to(showcase.children, {
      duration: 0.3,
      opacity: 0,
      y: -20,
      stagger: 0.05,
      onComplete: () => {
        // Update content
        showcase.innerHTML = currentAutomations.map(auto => `
          <div class="automation-card-ultra">
            <div class="automation-title-ultra">${auto.title}</div>
            <div class="automation-roi-ultra">
              <span class="roi-trend-icon"></span>
              ROI: ${auto.roi}
            </div>
          </div>
        `).join('');
        
        // Animate in new cards
        gsap.from(showcase.children, {
          duration: 0.5,
          opacity: 0,
          y: 20,
          stagger: 0.1,
          ease: "back.out(1.7)"
        });
      }
    });
  }

  createLiveActivityFeed() {
    const activities = [
      "Sarah M. just automated her dental practice - 40% less no-shows!",
      "TechCorp implemented AI voice system - 2.3x more leads captured",
      "Legal Partners automated intake - $50K more revenue this month",
      "MedSpa Pro reduced manual work by 85% with our AI system",
      "HVAC Solutions captured 127 after-hours emergencies this week"
    ];

    const feedContainer = document.querySelector('.live-activity-feed');
    if (!feedContainer) return;

    let activityIndex = 0;
    
    const showNextActivity = () => {
      const activity = activities[activityIndex % activities.length];
      
      const activityElement = document.createElement('div');
      activityElement.className = 'activity-item';
      activityElement.innerHTML = `
        <div class="activity-dot"></div>
        <span>${activity}</span>
      `;
      
      feedContainer.appendChild(activityElement);
      
      // Remove old activities (keep max 3)
      while (feedContainer.children.length > 3) {
        const firstChild = feedContainer.firstChild;
        gsap.to(firstChild, {
          duration: 0.3,
          opacity: 0,
          x: -30,
          onComplete: () => firstChild.remove()
        });
      }
      
      activityIndex++;
    };

    // Show first activity immediately
    showNextActivity();
    
    // Then show new activity every 8-12 seconds
    setInterval(() => {
      showNextActivity();
    }, 8000 + Math.random() * 4000);
  }

  setupVoiceActivation() {
    const voiceBtn = document.querySelector('.voice-demo-trigger');
    if (!voiceBtn) return;

    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.voiceRecognition = new SpeechRecognition();
      
      this.voiceRecognition.continuous = false;
      this.voiceRecognition.interimResults = false;
      this.voiceRecognition.lang = 'en-US';

      voiceBtn.addEventListener('click', () => {
        this.startVoiceDemo();
      });

      this.voiceRecognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        this.handleVoiceCommand(command);
      };

      this.voiceRecognition.onerror = (event) => {
        console.log('Voice recognition error:', event.error);
        this.showVoiceFeedback('Sorry, I didn\'t catch that. Try clicking the button again.');
      };
    } else {
      // Fallback for browsers without speech recognition
      voiceBtn.addEventListener('click', () => {
        this.showVoiceFeedback('Voice demo: "Show me ROI for dental practices"');
        setTimeout(() => {
          this.handleVoiceCommand('show roi dental');
        }, 1500);
      });
    }
  }

  startVoiceDemo() {
    const voiceBtn = document.querySelector('.voice-demo-trigger');
    
    // Visual feedback
    gsap.to(voiceBtn, {
      duration: 0.3,
      scale: 1.2,
      ease: "back.out(1.7)"
    });
    
    this.showVoiceFeedback('Listening... Try saying "Show ROI for [industry]"');
    
    if (this.voiceRecognition) {
      try {
        this.voiceRecognition.start();
      } catch (error) {
        console.log('Voice recognition start error:', error);
        this.handleVoiceCommand('show roi dental');
      }
    }
  }

  handleVoiceCommand(command) {
    console.log('Voice command:', command);
    
    if (command.includes('roi') || command.includes('return')) {
      let industry = 'dental'; // default
      
      if (command.includes('dental') || command.includes('dentist')) {
        industry = 'dental';
      } else if (command.includes('legal') || command.includes('law')) {
        industry = 'legal';
      } else if (command.includes('hvac') || command.includes('heating')) {
        industry = 'hvac';
      } else if (command.includes('medspa') || command.includes('spa')) {
        industry = 'medspa';
      }
      
      // Trigger industry selection
      const industryBtn = document.querySelector(`[data-industry="${industry}"]`);
      if (industryBtn) {
        industryBtn.click();
        this.showVoiceFeedback(`Showing ROI for ${industry} industry`);
      }
    } else if (command.includes('demo') || command.includes('show')) {
      this.scrollToROICalculator();
      this.showVoiceFeedback('Scrolling to interactive demo');
    } else {
      this.showVoiceFeedback('Try: "Show ROI for dental" or "Show me the demo"');
    }
  }

  showVoiceFeedback(message) {
    // Create or update feedback element
    let feedback = document.querySelector('.voice-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'voice-feedback';
      feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
      `;
      document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    
    gsap.to(feedback, {
      duration: 0.3,
      opacity: 1,
      scale: 1,
      ease: "back.out(1.7)"
    });
    
    setTimeout(() => {
      gsap.to(feedback, {
        duration: 0.3,
        opacity: 0,
        scale: 0.8,
        ease: "power2.in",
        onComplete: () => feedback.remove()
      });
    }, 3000);
  }

  initEngagementTracking() {
    this.engagementTracker = new EngagementTracker();
    this.engagementTracker.start();
  }

  setupExitIntent() {
    let hasTriggered = false;
    
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !hasTriggered) {
        hasTriggered = true;
        this.showExitIntentOffer();
      }
    });
    
    // Mobile exit intent (scroll to top rapidly)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop < lastScrollTop - 100 && scrollTop < 200 && !hasTriggered) {
        hasTriggered = true;
        this.showExitIntentOffer();
      }
      lastScrollTop = scrollTop;
    });
  }

  showExitIntentOffer() {
    const overlay = document.createElement('div');
    overlay.className = 'exit-intent-overlay';
    overlay.innerHTML = `
      <div class="exit-intent-modal">
        <button class="exit-close">&times;</button>
        <h3>Wait! Get Your FREE ROI Analysis</h3>
        <p>See exactly how much revenue you're losing to manual processes</p>
        <button class="exit-cta">Calculate My ROI Now</button>
        <small>⏰ Limited time: Free consultation included</small>
      </div>
    `;
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
    `;
    
    document.body.appendChild(overlay);
    
    gsap.to(overlay, {
      duration: 0.3,
      opacity: 1,
      ease: "power2.out"
    });
    
    // Close handlers
    overlay.querySelector('.exit-close').addEventListener('click', () => {
      this.closeExitIntent(overlay);
    });
    
    overlay.querySelector('.exit-cta').addEventListener('click', () => {
      this.engagementTracker?.trackConversion('exit_intent_conversion');
      this.scrollToROICalculator();
      this.closeExitIntent(overlay);
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeExitIntent(overlay);
      }
    });
  }

  closeExitIntent(overlay) {
    gsap.to(overlay, {
      duration: 0.3,
      opacity: 0,
      ease: "power2.in",
      onComplete: () => overlay.remove()
    });
  }

  scrollToROICalculator() {
    const calculator = document.querySelector('.roi-calculator-ultra');
    if (calculator) {
      calculator.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  createAdvancedRipple(event) {
    const button = event.target;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1;
    `;
    
    button.appendChild(ripple);
    
    gsap.to(ripple, {
      duration: 0.6,
      width: '300px',
      height: '300px',
      opacity: 0,
      ease: "power2.out",
      onComplete: () => ripple.remove()
    });
  }

  handleCTAClick() {
    // Scroll to ROI calculator with highlight
    const calculator = document.querySelector('.roi-calculator-ultra');
    if (calculator) {
      calculator.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Highlight effect
      gsap.to(calculator, {
        duration: 0.5,
        boxShadow: "0 0 60px rgba(209, 46, 31, 0.4)",
        borderColor: "rgba(209, 46, 31, 0.6)",
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    }
  }

  setupScrollAnimations() {
    // Advanced scroll-triggered animations
    gsap.utils.toArray('.automation-card-ultra').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 20%',
          toggleActions: 'play none none reverse'
        },
        duration: 0.6,
        y: 40,
        opacity: 0,
        scale: 0.95,
        delay: index * 0.1,
        ease: 'back.out(1.7)'
      });
    });
  }
}

// Performance Monitor Class
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.isMonitoring = false;
  }

  start() {
    this.isMonitoring = true;
    this.monitor();
  }

  monitor() {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Optimize based on performance
      if (this.fps < 30) {
        this.optimizeForPerformance();
      }
    }

    requestAnimationFrame(() => this.monitor());
  }

  optimizeForPerformance() {
    // Reduce animation complexity on low-performance devices
    document.body.classList.add('performance-mode');
    
    // Simplify neural network
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
    
    // Reduce blur effects
    document.documentElement.style.setProperty('--blur-light', '4px');
    document.documentElement.style.setProperty('--blur-medium', '8px');
    document.documentElement.style.setProperty('--blur-heavy', '12px');
    
    console.log('⚡ Performance optimization activated');
  }

  stop() {
    this.isMonitoring = false;
  }
}

// Engagement Tracker Class
class EngagementTracker {
  constructor() {
    this.startTime = Date.now();
    this.interactions = [];
    this.scrollDepth = 0;
    this.maxScroll = 0;
  }

  start() {
    this.trackScrollDepth();
    this.trackTimeOnPage();
    this.trackMouseMovement();
  }

  trackScrollDepth() {
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      this.scrollDepth = Math.max(this.scrollDepth, scrollPercent);
      this.maxScroll = Math.max(this.maxScroll, window.scrollY);
    });
  }

  trackTimeOnPage() {
    setInterval(() => {
      const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
      if (timeSpent % 30 === 0) { // Every 30 seconds
        console.log(`⏱️ Time on page: ${timeSpent}s, Max scroll: ${this.scrollDepth}%`);
      }
    }, 1000);
  }

  trackMouseMovement() {
    let mouseEvents = 0;
    document.addEventListener('mousemove', () => {
      mouseEvents++;
      if (mouseEvents % 100 === 0) {
        console.log('🖱️ High engagement detected');
      }
    });
  }

  trackInteraction(type, data) {
    this.interactions.push({
      type,
      data,
      timestamp: Date.now(),
      scrollPosition: window.scrollY
    });
    console.log(`📊 Interaction: ${type}`, data);
  }

  trackConversion(type) {
    const conversionData = {
      type,
      timestamp: Date.now(),
      timeOnPage: Math.round((Date.now() - this.startTime) / 1000),
      scrollDepth: this.scrollDepth,
      interactions: this.interactions.length
    };
    console.log('🎯 Conversion Event:', conversionData);
    
    // Here you would send to analytics
    // analytics.track('conversion', conversionData);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for GSAP to load
  const initShockwaveUltra = () => {
    if (typeof gsap !== 'undefined') {
      window.shockwaveUltra = new ShockwaveUltraPremium();
    } else {
      setTimeout(initShockwaveUltra, 100);
    }
  };
  
  initShockwaveUltra();
});

// Utility functions
const ShockwaveUltraUtils = {
  // Device detection
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  
  // Performance detection
  isHighPerformance: () => {
    return navigator.hardwareConcurrency > 4 && 
           navigator.deviceMemory > 4;
  },
  
  // Reduced motion preference
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Smooth scroll utility
  smoothScrollTo: (target, duration = 1000) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element && typeof gsap !== 'undefined') {
      gsap.to(window, {
        duration: duration / 1000,
        scrollTo: { y: element, offsetY: 50 },
        ease: "power2.out"
      });
    }
  }
};

// Export for global access
window.ShockwaveUltraUtils = ShockwaveUltraUtils;
