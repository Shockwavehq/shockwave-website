(function(){
  const Module = {
    id: 'hero',
    init(root){
      if (!root) return;
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const push = (event, extra={}) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event, section:'hero', page_goal:'book_demo', ...extra });
      };

      // Fade-up
      const els = root.querySelectorAll('.fade-up');
      if (!rm && els.length){
        const io = new IntersectionObserver((ents,ob)=>{
          ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); ob.unobserve(e.target);} });
        }, { rootMargin:'0px 0px -10% 0px', threshold:0.2 });
        els.forEach(n=>io.observe(n));
      } else { els.forEach(n=>n.classList.add('is-visible')); }

      // Typewriter
      (function typewriter(){
        const line = root.querySelector('[data-typewriter]');
        const target = line && root.querySelector('.typewriter [data-typewriter-target]');
        const cursor = line && root.querySelector('.typewriter .cursor');
        if (!line || !target) return;

        const words = (line.getAttribute('data-words') || '').split('|').map(s=>s.trim()).filter(Boolean);
        const typeSpeed = +line.getAttribute('data-type-speed') || 75;
        const deleteSpeed = +line.getAttribute('data-delete-speed') || 45;
        const delay = +line.getAttribute('data-delay-between') || 1000;
        const loop = (line.getAttribute('data-loop') || 'true') === 'true';

        if (rm){ target.textContent = words.join(', '); if (cursor) cursor.style.display='none'; return; }

        let i=0, txt='', del=false, tId=0, paused=false;
        const step = ()=>{
          if (paused || document.hidden) return;
          const w = words[i % words.length];
          if (!del){
            txt = w.slice(0, txt.length+1);
            target.textContent = txt;
            if (txt === w){ del = true; tId = setTimeout(step, delay); return; }
            tId = setTimeout(step, typeSpeed);
          } else {
            txt = w.slice(0, txt.length-1);
            target.textContent = txt;
            if (txt === ''){ del=false; i++; if (!loop && i>=words.length) return; tId = setTimeout(step, 200); return; }
            tId = setTimeout(step, deleteSpeed);
          }
        };
        const pause=()=>{ paused=true; clearTimeout(tId); };
        const resume=()=>{ if (!paused) return; paused=false; step(); };
        line.addEventListener('mouseenter', pause);
        line.addEventListener('mouseleave', resume);
        line.addEventListener('focusin', pause);
        line.addEventListener('focusout', resume);
        setTimeout(step, 600);
        push('typewriter_started', { words: words.length });
        Module._cleanupType = ()=> clearTimeout(tId);
      })();

      // Desktop-only particles
      (function particles(){
        const host = root.querySelector('[data-particles]');
        const desktop = window.matchMedia('(min-width: 1025px)').matches;
        if (!host || rm || !desktop) return;

        const dpr = Math.min(window.devicePixelRatio||1, 2);
        const cv = document.createElement('canvas'); cv.className = 'particles'; host.appendChild(cv);
        const ctx = cv.getContext('2d');
        const color = 'rgba(209,46,31,0.6)'; const linkColor = 'rgba(209,46,31,0.25)';
        const count = 70, maxSpeed = 0.3, linkDist = 120;
        let w=0,h=0,raf=null,running=true;

        const resize = ()=>{
          const r = host.getBoundingClientRect();
          w = Math.max(1,r.width); h = Math.max(1,r.height);
          cv.width = Math.floor(w*dpr); cv.height = Math.floor(h*dpr);
          cv.style.width = w+'px'; cv.style.height = h+'px';
          ctx.setTransform(dpr,0,0,dpr,0,0);
        };
        resize(); window.addEventListener('resize', resize, { passive:true });

        const pts = Array.from({length:count}, ()=>({
          x: Math.random()*w, y: Math.random()*h,
          vx:(Math.random()*2-1)*maxSpeed, vy:(Math.random()*2-1)*maxSpeed
        }));

        const draw = ()=>{
          if (!running || document.hidden) return;
          ctx.clearRect(0,0,w,h);
          for (const p of pts){
            p.x+=p.vx; p.y+=p.vy;
            if (p.x<0||p.x>w) p.vx*=-1;
            if (p.y<0||p.y>h) p.vy*=-1;
          }
          ctx.strokeStyle = linkColor; ctx.lineWidth = 1;
          for (let i=0;i<count;i++){
            for (let j=i+1;j<count;j++){
              const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
              const dist=Math.hypot(dx,dy);
              if (dist<linkDist){ ctx.globalAlpha = (1 - dist/linkDist)*0.5; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); }
            }
          }
          ctx.globalAlpha=1; ctx.fillStyle=color;
          for (const p of pts){ ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill(); }
          raf = requestAnimationFrame(draw);
        };

        const vis = new IntersectionObserver((ents)=>{
          ents.forEach(e=>{
            if (e.isIntersecting){ if (!raf){ running=true; raf=requestAnimationFrame(draw); } }
            else { running=false; if (raf){ cancelAnimationFrame(raf); raf=null; } }
          });
        }, { threshold:0.1 });
        vis.observe(root);
        raf = requestAnimationFrame(draw);

        Module._cleanupParticles = ()=>{
          running=false; if (raf) cancelAnimationFrame(raf);
          window.removeEventListener('resize', resize);
          try{ host.removeChild(cv); }catch(_){}
        };
      })();

      // Personalization (?vertical, ?source)
      (function personalize(){
        const p = new URLSearchParams(location.search);
        const vertical = (p.get('vertical')||'').toLowerCase();
        const source   = (p.get('source')||'').toLowerCase();
        const h1 = root.querySelector('h1');
        const sub = root.querySelector('.subhead');
        const map = {
          'dental':{h1:'Answer first. Book faster.', append:' Enforce deposits, fill cancellations, and reduce no‑shows.'},
          'hvac':{h1:'Capture emergencies. Win weekends.', append:' Auto‑reply after hours, triage, and route with ETAs.'},
          'legal':{h1:'First to respond. First to consult.', append:' Fast intake standards and weekend coverage.'},
          'plumbing':{h1:'Never miss an emergency again.', append:' Instant SMS on missed calls with priority routing.'},
          'med-spa':{h1:'Keep your schedule predictably full.', append:' Smart waitlists and deposits stabilize utilization.'},
          'pest-control':{h1:'Capture seasonal demand automatically.', append:' Route optimization and recurring service flows.'}
        };
        if (vertical && map[vertical] && h1 && sub){ h1.textContent = map[vertical].h1; sub.textContent = sub.textContent + map[vertical].append; push('personalization_applied',{vertical,source}); }
        const pri = root.querySelector('[data-cta="primary"]');
        const sec = root.querySelector('[data-cta="secondary"]');
        if (pri){
          const ctas = { googleads:'Book Free Strategy Call', linkedin:'Schedule Intro Call', retargeting:'Claim Your Spot' };
          const main = pri.querySelector('.btn-main'); if (ctas[source] && main) main.textContent = ctas[source];
        }
        if (sec && source==='retargeting'){ sec.textContent = 'See ROI Now'; }
      })();

      // Analytics
      const pri = root.querySelector('[data-cta="primary"]');
      const sec = root.querySelector('[data-cta="secondary"]');
      pri?.addEventListener('click', ()=> push('hero_primary_cta_click'));
      sec?.addEventListener('click', ()=> push('hero_secondary_cta_click'));
      root.querySelectorAll('.trust [data-evt="trust_logo"]').forEach(img=>{
        img.addEventListener('click', ()=> push('hero_trust_logo_click',{logo:img.alt||''}));
      });
      const seen = new IntersectionObserver((ents,ob)=>{ ents.forEach(e=>{ if(e.isIntersecting){ push('hero_seen'); ob.disconnect(); } }); }, {threshold:0.5});
      seen.observe(root);
    },
    destroy(){
      if (this._cleanupType) this._cleanupType();
      if (this._cleanupParticles) this._cleanupParticles();
    }
  };

  if (window.SHOCKWAVE_LIVE && typeof window.SHOCKWAVE_LIVE.register==='function'){
    window.SHOCKWAVE_LIVE.register(Module.id, Module);
  } else {
    document.addEventListener('DOMContentLoaded', ()=> Module.init(document.querySelector('#hero')));
  }
})();

