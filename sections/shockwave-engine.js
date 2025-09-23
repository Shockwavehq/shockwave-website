(function(){
  const STATE = { manifest:null, base:'', loadedCSS:new Set(), loadedJS:new Set(), modules:{}, debug:false };

  // Utils
  const log = (...a)=> STATE.debug && console.log('[SW]', ...a);
  const err = (...a)=> console.warn('[SW]', ...a);
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const pushEvent = (name, detail={}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event:name, ...detail });
  };

  // Load JSON manifest
  async function loadManifest(path){
    try{
      const res = await fetch(path, { cache:'no-cache' });
      if(!res.ok) throw new Error(`Manifest fetch ${res.status}`);
      const json = await res.json();
      STATE.manifest = json;
      STATE.base = (json.cdn_base || '').replace(/\/+$/,'');
      STATE.debug = /\bdebug=1\b/.test(location.search);
      log('manifest loaded', json);
      return json;
    }catch(e){ err('manifest error', e); }
  }

  // Apply brand tokens
  function applyTokens(tokens){
    if(!tokens) return;
    const r = document.documentElement;
    const c = tokens.colors || {};
    const f = tokens.fonts || {};
    if(c.primary) r.style.setProperty('--brand', c.primary);
    if(c.primary_hover) r.style.setProperty('--brand-hover', c.primary_hover);
    if(c.text) r.style.setProperty('--text', c.text);
    if(c.muted) r.style.setProperty('--muted', c.muted);
    if(c.bg) r.style.setProperty('--bg', c.bg);
    if(c.divider) r.style.setProperty('--divider', c.divider);
    // Fonts are linked via assets; body already uses Inter/system stack.
  }

  // Preload assets (images/fonts)
  function preloadAssets(assets){
    if(!assets) return;
    const head = document.head;
    // Fonts preconnect + stylesheet
    (assets.fonts || []).forEach(f=>{
      (f.preconnect || []).forEach(url=>{
        const ln = document.createElement('link');
        ln.rel = 'preconnect'; ln.href = url; ln.crossOrigin = '';
        head.appendChild(ln);
      });
      const ln = document.createElement('link');
      ln.rel = f.rel || 'stylesheet';
      ln.href = f.href;
      head.appendChild(ln);
    });
    // Preload images
    (assets.preload || []).forEach(p=>{
      const ln = document.createElement('link');
      ln.rel = 'preload';
      ln.as = p.as || 'image';
      ln.href = (STATE.base || '') + p.href;
      if (p.imagesrcset) ln.setAttribute('imagesrcset', p.imagesrcset.replace(/(\/assets\/)/g, (m)=> (STATE.base + m)));
      if (p.imagesizes) ln.setAttribute('imagesizes', p.imagesizes);
      if (p.fetchpriority) ln.setAttribute('fetchpriority', p.fetchpriority);
      head.appendChild(ln);
    });
  }

  // Load CSS/JS once
  function loadCSS(path){
    const href = (STATE.base || '') + path;
    if (STATE.loadedCSS.has(href)) return Promise.resolve();
    return new Promise(res=>{
      const ln = document.createElement('link');
      ln.rel = 'stylesheet'; ln.href = href;
      ln.onload = ()=>{ STATE.loadedCSS.add(href); res(); };
      ln.onerror = ()=>{ err('css load failed', href); res(); };
      document.head.appendChild(ln);
    });
  }
  function loadJS(path){
    const src = (STATE.base || '') + path;
    if (STATE.loadedJS.has(src)) return Promise.resolve();
    return new Promise(res=>{
      const sc = document.createElement('script');
      sc.src = src; sc.defer = true;
      sc.onload = ()=>{ STATE.loadedJS.add(src); res(); };
      sc.onerror = ()=>{ err('js load failed', src); res(); };
      document.body.appendChild(sc);
    });
  }

  // Module registry API (sections call register to bind)
  window.SHOCKWAVE_LIVE = window.SHOCKWAVE_LIVE || {
    register(id, mod){
      STATE.modules[id] = mod;
      const cfg = (STATE.manifest?.sections || []).find(s=>s.id===id);
      const el = cfg && document.querySelector(cfg.selector);
      if (el && mod.init) {
        try { mod.init(el, { pushEvent, manifest: STATE.manifest }); }
        catch(e){ err('module init error', id, e); }
      }
    }
  };

  // Calendar opener alias
  function wireCalendarAlias(){
    document.addEventListener('click', (e)=>{
      const t = e.target.closest('[data-action="open_calendar"]');
      if (!t) return;
      e.preventDefault();
      const opener = document.querySelector('[data-sw-open="calendar"]');
      if (opener) opener.click();
      pushEvent('hero_primary_cta_click', { section:'hero' });
    });
  }

  // Lazy-init sections by visibility or immediate if defer:false
  function initSections(){
    const sections = STATE.manifest?.sections || [];
    const rm = STATE.manifest?.flags?.respect_reduced_motion && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    sections.forEach(cfg=>{
      const el = document.querySelector(cfg.selector);
      if (!el) return;
      const boot = async () => {
        await loadCSS(cfg.css);
        await loadJS(cfg.js);
      };
      if (cfg.defer !== false) {
        const io = new IntersectionObserver((entries, ob)=>{
          entries.forEach(en=>{
            if (en.isIntersecting){
              ob.unobserve(en.target);
              boot().then(()=> log('booted', cfg.id));
            }
          });
        }, { rootMargin:'0px 0px -10% 0px', threshold:0.08 });
        io.observe(el);
      } else {
        boot().then(()=> log('booted immediate', cfg.id));
      }
    });

    // Mark hero seen when visible (baseline analytics)
    const hero = document.querySelector('#hero');
    if (hero) {
      const seenObs = new IntersectionObserver((entries,ob)=>{
        entries.forEach(e=>{
          if (e.isIntersecting){
            pushEvent('hero_seen', { section:'hero' });
            ob.disconnect();
          }
        });
      }, { threshold:0.3 });
      seenObs.observe(hero);
    }
  }

  // Boot
  document.addEventListener('DOMContentLoaded', async ()=>{
    const manifestPath = (window.SW_MANIFEST_PATH || '/sections/manifest.json');
    const m = await loadManifest(manifestPath);
    if (!m) return;
    applyTokens(m.brand_tokens);
    preloadAssets(m.assets);
    wireCalendarAlias();
    initSections();
  });
})();
