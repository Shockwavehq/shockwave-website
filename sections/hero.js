(function(){
  const Module = {
    id: 'hero',
    init(el){
      // Fade-up
      const animated = el.querySelectorAll('.fade-up');
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!rm && animated.length){
        const obs = new IntersectionObserver((entries,observer)=>{
          entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); observer.unobserve(e.target); }});
        }, { rootMargin:'0px 0px -10% 0px', threshold:0.2 });
        animated.forEach(n=>obs.observe(n));
      } else animated.forEach(n=>n.classList.add('is-visible'));

      // Rotator (word switcher)
      const rotator = el.querySelector('[data-rotator]');
      if (rotator){
        const words = (rotator.getAttribute('data-words') || '').split('|').filter(Boolean);
        const span = el.querySelector('[data-rotator-target]');
        const interval = parseInt(rotator.getAttribute('data-interval-ms') || '2600',10);
        let idx = 0, t = null, paused = false;
        const render = ()=>{ if (!span || !words.length) return; span.textContent = words[idx]; span.classList.remove('active'); void span.offsetWidth; span.classList.add('active'); };
        const tick = ()=>{ if (paused) return; idx = (idx + 1) % words.length; render(); };
        render(); t = setInterval(tick, interval);
        const pause=()=>paused=true, resume=()=>paused=false;
        rotator.addEventListener('mouseenter', pause); rotator.addEventListener('mouseleave', resume);
        rotator.addEventListener('focusin', pause);   rotator.addEventListener('focusout', resume);
        this._cleanup = ()=> clearInterval(t);
      }

      // Personalization (vertical/source)
      const params = new URLSearchParams(location.search);
      const vertical = (params.get('vertical')||'').toLowerCase();
      const source = (params.get('source')||'').toLowerCase();
      const h1 = el.querySelector('h1'); const sub = el.querySelector('.subhead');
      const map = {
        'dental': { h1: 'Answer first. Book fast.', append: ' Enforce deposits, fill cancellations, and reduce no‑shows for a fuller schedule.' },
        'hvac': { h1: 'Capture emergencies. Win weekends.', append: ' Auto‑reply after hours, triage emergencies, and route techs with ETAs.' },
        'legal': { h1: 'First to respond. First to consult.', append: ' Weekend intake coverage helps secure more retainers.' },
        'plumbing': { h1: 'Never miss an emergency again.', append: ' Instant SMS on missed calls, priority routing, and dynamic after‑hours pricing.' },
        'med-spa': { h1: 'Keep your schedule predictably full.', append: ' Smart waitlists and deposits reduce no‑shows and stabilize utilization.' },
        'pest-control': { h1: 'Capture seasonal demand automatically.', append: ' Route optimization and recurring service flows boost retention.' }
      };
      if (vertical && map[vertical] && h1 && sub){ h1.textContent = map[vertical].h1; sub.textContent = sub.textContent + map[vertical].append; }
      const primaryBtn = el.querySelector('[data-cta="primary"]');
      const secondaryBtn = el.querySelector('[data-cta="secondary"]');
      if (primaryBtn){
        if (source === 'googleads') primaryBtn.textContent = 'Book Free Strategy Call';
        if (source === 'linkedin')  primaryBtn.textContent = 'Schedule Intro Call';
      }
      if (secondaryBtn && source === 'retargeting'){ secondaryBtn.textContent = 'See ROI Now'; }

      // CTA events + calendar alias
      const dl = (n,d={})=>{ window.dataLayer = window.dataLayer || []; window.dataLayer.push({event:n, ...d}); };
      primaryBtn?.addEventListener('click', (e)=>{
        e.preventDefault();
        const opener = document.querySelector('[data-sw-open="calendar"]');
        if (opener) opener.click();
        dl('hero_primary_cta_click', {section:'hero'});
      });
      secondaryBtn?.addEventListener('click', ()=> dl('hero_secondary_cta_click', {section:'hero'}));

      // Seen analytics guard (engine already sends; this is a fallback if engine missing)
      const seenObs = new IntersectionObserver((entries,ob)=>{ entries.forEach(e=>{ if(e.isIntersecting){ dl('hero_seen',{section:'hero'}); ob.disconnect(); } }); }, {threshold:0.3});
      seenObs.observe(el);
    },
    destroy(){ if (this._cleanup) this._cleanup(); }
  };

  if (window.SHOCKWAVE_LIVE && window.SHOCKWAVE_LIVE.register){
    window.SHOCKWAVE_LIVE.register(Module.id, Module);
  } else {
    document.addEventListener('DOMContentLoaded', ()=> Module.init(document.querySelector('#hero')));
  }
})();
