(function(){
  const Module = {
    id: 'hero',
    init(el){
      // Fade-up staged
      const animated = el.querySelectorAll('.fade-up');
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!rm && animated.length){
        const obs = new IntersectionObserver((ents,ob)=>{
          ents.forEach(e=>{
            if (e.isIntersecting){ e.target.classList.add('is-visible'); ob.unobserve(e.target); }
          });
        }, { rootMargin:'0px 0px -10% 0px', threshold:0.2 });
        animated.forEach(n=>obs.observe(n));
      } else { animated.forEach(n=>n.classList.add('is-visible')); }

      // Personalization (?vertical, ?source)
      const p = new URLSearchParams(location.search);
      const vertical = (p.get('vertical')||'').toLowerCase();
      const source   = (p.get('source')||'').toLowerCase();
      const h1 = el.querySelector('.title');
      const sub= el.querySelector('.subhead');
      const map = {
        'dental':       { h1: 'Answer first. Book fast.', append: ' Enforce deposits, fill cancellations, and reduce no‑shows for a fuller schedule.' },
        'hvac':         { h1: 'Capture emergencies. Win weekends.', append: ' Auto‑reply after hours, triage emergencies, and route techs with ETAs.' },
        'legal':        { h1: 'First to respond. First to consult.', append: ' Weekend intake coverage helps secure more retainers.' },
        'plumbing':     { h1: 'Never miss an emergency again.', append: ' Instant SMS on missed calls, priority routing, and dynamic after‑hours pricing.' },
        'med-spa':      { h1: 'Keep your schedule predictably full.', append: ' Smart waitlists and deposits reduce no‑shows and stabilize utilization.' },
        'pest-control': { h1: 'Capture seasonal demand automatically.', append: ' Route optimization and recurring service flows boost retention.' }
      };
      if (vertical && map[vertical] && h1 && sub){ h1.textContent = map[vertical].h1; sub.textContent = sub.textContent + map[vertical].append; }

      const pri = el.querySelector('[data-cta="primary"]');
      const sec = el.querySelector('[data-cta="secondary"]');
      if (pri){
        if (source === 'googleads') pri.textContent = 'Book Free Strategy Call';
        if (source === 'linkedin')  pri.textContent = 'Schedule Intro Call';
      }
      if (sec && source === 'retargeting'){ sec.textContent = 'See ROI Now'; }

      // Analytics + calendar alias fallback
      const dl = (n,d={})=>{ window.dataLayer = window.dataLayer || []; window.dataLayer.push({event:n, section:'hero', ...d}); };

      const seenObs = new IntersectionObserver((ents,ob)=>{
        ents.forEach(e=>{ if(e.isIntersecting){ dl('hero_seen'); ob.disconnect(); } });
      }, {threshold:0.3});
      seenObs.observe(el);

      pri?.addEventListener('click', (e)=>{
        e.preventDefault();
        const opener = document.querySelector('[data-sw-open="calendar"]');
        if (opener) opener.click();
        document.dispatchEvent(new CustomEvent('sw:calendar_opened'));
        dl('hero_primary_cta_click');
      });
      sec?.addEventListener('click', ()=> dl('hero_secondary_cta_click'));

      el.querySelectorAll('[data-evt="trust_logo"]').forEach(img=>{
        img.addEventListener('click', ()=> dl('hero_trust_logo_click', { logo: img.alt || 'unknown' }));
      });
    },
    destroy(){}
  };

  if (window.SHOCKWAVE_LIVE && window.SHOCKWAVE_LIVE.register){
    window.SHOCKWAVE_LIVE.register(Module.id, Module);
  } else {
    document.addEventListener('DOMContentLoaded', ()=> Module.init(document.querySelector('#hero')));
  }
})();
