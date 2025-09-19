
/**
 * ============================
 *     SHOCKWAVEHQ FUNCTIONS
 * Award-Winning Animations & Micro-Interactions
 * ============================
 */

// === PERFORMANCE & INITIALIZATION === //
class ShockwaveHero {
  constructor() {
    this.tl = gsap.timeline();
    this.particles = [];
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particleSystem = null;
    this.mousePosition = { x: 0, y: 0 };
    this.isTouch = 'ontouchstart' in window;

    this.init();
  }

  init() {
    // Wait for DOM and GSAP to be ready
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAll());
    } else {
      this.initializeAll();
    }
  }

  initializeAll() {
    this.setupPerformanceOptimizations();
    this.createNeuralNetwork();
    this.initHeroAnimations();
    this.setupScrollTriggers();
    this.initMicroInteractions();
    this.setupROICounters();
    this.addTouchOptimizations();
    this.createAtmosphericEffects();
  }

  // === PERFORMANCE OPTIMIZATIONS === //
  setupPerformanceOptimizations() {
    // Enable GPU acceleration for key elements
    const gpuElements = document.querySelectorAll('.hero-glass, .metric-card, .cta-primary, .cta-secondary');
    gpuElements.forEach(el => {
      el.classList.add('gpu-layer');
    });

    // Optimize scroll performance
    let ticking = false;
    const updateMousePosition = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
          this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
          ticking = false;
        });
        ticking = true;
      }
    };

    if (!this.isTouch) {
      document.addEventListener('mousemove', updateMousePosition, { passive: true });
    }

    // Intersection Observer for performance
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.metric-card, .hero-glass').forEach(el => {
      observer.observe(el);
    });
  }

  // === NEURAL NETWORK PARTICLE SYSTEM === //
  createNeuralNetwork() {
    const canvas = document.querySelector('.neural-canvas');
    if (!canvas) {
      console.warn('Neural canvas not found, creating fallback');
      this.createFallbackParticles();
      return;
    }

    try {
      // Initialize Three.js scene
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: false,
        powerPreference: 'high-performance'
      });

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Create particle system
      this.createParticleSystem();
      this.animate3D();

      // Handle resize
      window.addEventListener('resize', () => this.handleResize(), { passive: true });

    } catch (error) {
      console.warn('WebGL not supported, using fallback:', error);
      this.createFallbackParticles();
    }
  }

  createParticleSystem() {
    const particleCount = this.isTouch ? 150 : 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // ShockwaveHQ brand colors
    const brandColor = new THREE.Color(0xD12E1F);
    const accentColor = new THREE.Color(0xF03E3E);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random positions
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;

      // Alternate between brand colors
      const color = Math.random() > 0.7 ? accentColor : brandColor;
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;

      // Random sizes
      sizes[i / 3] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Shader material for enhanced performance
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform vec2 mouse;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Mouse interaction
          float mouseDistance = distance(mouse, position.xy * 0.1);
          float mouseEffect = smoothstep(2.0, 0.0, mouseDistance);
          mvPosition.xy += mouse * mouseEffect * 0.5;

          // Floating animation
          mvPosition.y += sin(time * 0.5 + position.x * 0.1) * 0.2;
          mvPosition.x += cos(time * 0.3 + position.z * 0.1) * 0.1;

          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float r = distance(gl_PointCoord, vec2(0.5));
          if (r > 0.5) discard;

          float alpha = smoothstep(0.5, 0.0, r);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
    this.camera.position.z = 5;
  }

  createFallbackParticles() {
    const canvas = document.querySelector('.neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = this.isTouch ? 50 : 100;

    // Create fallback particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.7 ? '#F03E3E' : '#D12E1F',
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const animateFallback = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      requestAnimationFrame(animateFallback);
    };

    animateFallback();
  }

  animate3D() {
    if (!this.renderer || !this.scene || !this.camera) return;

    const animate = () => {
      requestAnimationFrame(animate);

      if (this.particleSystem) {
        this.particleSystem.rotation.y += 0.001;
        this.particleSystem.material.uniforms.time.value = performance.now() * 0.001;
        this.particleSystem.material.uniforms.mouse.value.set(this.mousePosition.x, this.mousePosition.y);
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  handleResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // === HERO ENTRANCE ANIMATIONS === //
  initHeroAnimations() {
    const tl = gsap.timeline();

    // Set initial states
    gsap.set(['.hero-tagline', '.hero-headline', '.hero-subtitle', '.hero-mission', '.hero-cta-group', '.hero-metrics'], {
      opacity: 0,
      y: 30
    });

    gsap.set('.hero-glass', {
      opacity: 0,
      scale: 0.9,
      rotationX: 15
    });

    // Entrance sequence
    tl.to('.hero-glass', {
      duration: 1.2,
      opacity: 1,
      scale: 1,
      rotationX: 0,
      ease: 'power3.out'
    })
    .to('.hero-tagline', {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: 'power2.out'
    }, '-=0.8')
    .to('.hero-headline', {
      duration: 1,
      opacity: 1,
      y: 0,
      ease: 'power3.out'
    }, '-=0.6')
    .to('.hero-subtitle', {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.hero-mission', {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: 'power2.out'
    }, '-=0.6')
    .to('.hero-cta-group', {
      duration: 1,
      opacity: 1,
      y: 0,
      ease: 'back.out(1.2)'
    }, '-=0.4')
    .to('.hero-metrics', {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: 'power2.out'
    }, '-=0.4');

    // Kinetic typography for headline
    this.initKineticTypography();
  }

  initKineticTypography() {
    const headline = document.querySelector('.hero-headline');
    if (!headline) return;

    const text = headline.textContent;
    headline.innerHTML = '';

    // Split text into spans
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(50px) rotateX(90deg)';
      headline.appendChild(span);
    });

    // Animate each letter
    gsap.to(headline.children, {
      duration: 0.1,
      opacity: 1,
      y: 0,
      rotationX: 0,
      ease: 'power2.out',
      stagger: 0.03,
      delay: 1
    });
  }

  // === SCROLL TRIGGERS === //
  setupScrollTriggers() {
    // Parallax effect for hero elements
    gsap.to('.hero-glass', {
      y: -100,
      scrollTrigger: {
        trigger: '.shockwave-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Metrics cards reveal
    gsap.utils.toArray('.metric-card').forEach((card, index) => {
      gsap.fromTo(card, {
        opacity: 0,
        y: 60,
        rotationY: -15
      }, {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.1
      });
    });
  }

  // === MICRO-INTERACTIONS === //
  initMicroInteractions() {
    // Enhanced button interactions
    this.setupButtonMicroInteractions();
    this.setupHoverEffects();
    this.setupClickRipples();
    this.setupMagneticEffects();
  }

  setupButtonMicroInteractions() {
    const buttons = document.querySelectorAll('.cta-primary, .cta-secondary');

    buttons.forEach(button => {
      let hoverTween;

      button.addEventListener('mouseenter', (e) => {
        if (hoverTween) hoverTween.kill();

        hoverTween = gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });

        gsap.to(button, {
          boxShadow: '0 20px 40px rgba(209, 46, 31, 0.4)',
          duration: 0.3
        });
      });

      button.addEventListener('mouseleave', (e) => {
        if (hoverTween) hoverTween.kill();

        hoverTween = gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });

        gsap.to(button, {
          boxShadow: '0 10px 30px rgba(209, 46, 31, 0.3)',
          duration: 0.3
        });
      });

      button.addEventListener('mousedown', () => {
        gsap.to(button, { scale: 0.98, duration: 0.1 });
      });

      button.addEventListener('mouseup', () => {
        gsap.to(button, { scale: 1.05, duration: 0.1 });
      });
    });
  }

  setupClickRipples() {
    const buttons = document.querySelectorAll('.cta-primary');

    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          pointer-events: none;
          z-index: 1000;
        `;

        button.appendChild(ripple);

        gsap.to(ripple, {
          scale: 4,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        });
      });
    });
  }

  setupHoverEffects() {
    const cards = document.querySelectorAll('.metric-card');

    cards.forEach(card => {
      let hoverTween;

      card.addEventListener('mouseenter', () => {
        if (hoverTween) hoverTween.kill();

        hoverTween = gsap.to(card, {
          y: -10,
          rotationY: 5,
          scale: 1.02,
          duration: 0.4,
          ease: 'power2.out'
        });

        gsap.to(card.querySelector('.metric-value'), {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(2)'
        });
      });

      card.addEventListener('mouseleave', () => {
        if (hoverTween) hoverTween.kill();

        hoverTween = gsap.to(card, {
          y: 0,
          rotationY: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        });

        gsap.to(card.querySelector('.metric-value'), {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  setupMagneticEffects() {
    if (this.isTouch) return; // Skip on touch devices

    const magneticElements = document.querySelectorAll('.cta-primary, .cta-secondary');

    magneticElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;

        gsap.to(element, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  // === ROI COUNTERS === //
  setupROICounters() {
    const counters = document.querySelectorAll('.metric-value');

    counters.forEach((counter, index) => {
      const finalValue = counter.textContent;
      const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));

      if (!isNaN(numericValue)) {
        counter.textContent = '0';

        ScrollTrigger.create({
          trigger: counter,
          start: 'top 80%',
          onEnter: () => {
            gsap.to({ value: 0 }, {
              value: numericValue,
              duration: 2,
              ease: 'power2.out',
              delay: index * 0.2,
              onUpdate: function() {
                const currentValue = this.targets()[0].value;
                const formatted = finalValue.includes('K') ? 
                  `$${currentValue.toFixed(1)}K` : 
                  finalValue.includes('%') ? 
                  `${currentValue.toFixed(1)}%` :
                  `$${Math.floor(currentValue).toLocaleString()}`;
                counter.textContent = formatted;
              }
            });
          }
        });
      }
    });
  }

  // === TOUCH OPTIMIZATIONS === //
  addTouchOptimizations() {
    if (!this.isTouch) return;

    // Touch-friendly button feedback
    const touchElements = document.querySelectorAll('.cta-primary, .cta-secondary, .metric-card');

    touchElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        gsap.to(element, {
          scale: 0.95,
          duration: 0.1,
          ease: 'power2.out'
        });
      }, { passive: true });

      element.addEventListener('touchend', () => {
        gsap.to(element, {
          scale: 1,
          duration: 0.2,
          ease: 'back.out(2)'
        });
      }, { passive: true });
    });

    // Reduce particle count on mobile
    if (this.particleSystem) {
      const geometry = this.particleSystem.geometry;
      const positions = geometry.attributes.position.array;
      const reducedCount = Math.floor(positions.length * 0.5);

      geometry.attributes.position.array = positions.slice(0, reducedCount);
      geometry.attributes.position.needsUpdate = true;
    }
  }

  // === ATMOSPHERIC EFFECTS === //
  createAtmosphericEffects() {
    // Subtle background animations
    this.createFloatingElements();
    this.setupTrustPulse();
    this.addBreathingEffects();
  }

  createFloatingElements() {
    // Create floating geometric shapes
    const heroSection = document.querySelector('.shockwave-hero');
    const shapes = ['circle', 'triangle', 'square'];

    for (let i = 0; i < 6; i++) {
      const shape = document.createElement('div');
      shape.className = `floating-shape floating-${shapes[i % 3]}`;
      shape.style.cssText = `
        position: absolute;
        width: ${Math.random() * 20 + 10}px;
        height: ${Math.random() * 20 + 10}px;
        background: rgba(209, 46, 31, ${Math.random() * 0.1 + 0.05});
        border-radius: ${shapes[i % 3] === 'circle' ? '50%' : '0'};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
        z-index: 1;
      `;

      heroSection.appendChild(shape);

      // Animate floating
      gsap.to(shape, {
        y: Math.random() * 100 - 50,
        x: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        duration: Math.random() * 20 + 10,
        repeat: -1,
        yoyo: true,
        ease: 'none'
      });
    }
  }

  setupTrustPulse() {
    const trustElements = document.querySelectorAll('.trust-pulse');

    trustElements.forEach((element, index) => {
      gsap.to(element, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5
      });
    });
  }

  addBreathingEffects() {
    // Subtle breathing animation for the main glass card
    gsap.to('.hero-glass', {
      scale: 1.01,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}

// === UTILITY FUNCTIONS === //
const ShockwaveUtils = {
  // Preload critical resources
  preloadResources() {
    const criticalImages = [
      // Add any critical images here
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    });
  },

  // Smooth scroll to element
  scrollTo(target) {
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: target, offsetY: 100 },
      ease: 'power3.inOut'
    });
  },

  // Add loading states
  showLoading() {
    const loader = document.createElement('div');
    loader.id = 'shockwave-loader';
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <p>Initializing ShockwaveHQ...</p>
    `;
    document.body.appendChild(loader);
  },

  hideLoading() {
    const loader = document.getElementById('shockwave-loader');
    if (loader) {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => loader.remove()
      });
    }
  }
};

// === INITIALIZATION === //
// Auto-initialize when libraries are loaded
function initShockwave() {
  // Check if required libraries are loaded
  if (typeof gsap === 'undefined') {
    console.error('GSAP is required for ShockwaveHQ animations');
    return;
  }

  // Initialize the hero experience
  ShockwaveUtils.preloadResources();
  const shockwaveHero = new ShockwaveHero();

  // Make globally accessible for debugging
  window.shockwaveHero = shockwaveHero;
  window.ShockwaveUtils = ShockwaveUtils;

  console.log('ðŸš€ ShockwaveHQ Hero initialized successfully');
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShockwave);
} else {
  initShockwave();
}

// Fallback initialization
setTimeout(initShockwave, 1000);
