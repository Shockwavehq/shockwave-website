(function(){
  const STATE = { manifest:null, base:'', loadedCSS:new Set(), loadedJS:new Set(), modules:{}, debug:false };
  const log = (...a)=> STATE.debug && console.log('[SW]', ...a);
  const warn = (...a)=> console.warn('[SW]', ...a);
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const pushEvent = (name, detail={}) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event:name, ...detail }); };

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
    }catch(e){ warn('manifest error', e); }
  }

  function applyTokens(tokens){
    if(!tokens) return;
    const r = document.documentElement;
    const c = tokens.colors || {};
    if(c.primary) r.style.setProperty('--brand', c.primary);
    if(c.primary_hover) r.style.setProperty('--brand-hover', c.primary_hover);
    if(c.text) r.style.setProperty('--text', c.text);
    if(c.muted) r.style.setProperty('--muted', c.muted);
    if(c.bg) r.style.setProperty('--bg', c.bg);
    if(c.divider) r.style.setProperty('--divider', c.divider);
  }

  function preloadAssets(assets){
    if(!assets) return;
    const head = document.head;
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
    (assets.preload || []).forEach(p=>{
      const ln = document.createElement('link');
      ln.rel = 'preload';
      ln.as = p.as || 'image';
      ln.href = (STATE.base || '') + p.href;
      if (p.imagesrcset) ln.setAttribute('imagesrcset', p.imagesrcset);
      if (p.imagesizes) ln.setAttribute('imagesizes', p.imagesizes);
      if (p.fetchpriority) ln.setAttribute('fetchpriority', p.fetchpriority);
      head.appendChild(ln);
    });
  }

  function loadCSS(path){
    const href = (STATE.base || '') + path;
    if (STATE.loadedCSS.has(href)) return Promise.resolve();
    return new Promise(res=>{
      const ln = document.createElement('link');
      ln.rel = 'stylesheet'; ln.href = href;
      ln.onload = ()=>{ STATE.loadedCSS.add(href); res(); };
      ln.onerror = ()=>{ warn('css load failed', href); res(); };
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
      sc.onerror = ()=>{ warn('js load failed', src); res(); };
      document.body.appendChild(sc);
    });
  }

  window.SHOCKWAVE_LIVE = window.SHOCKWAVE_LIVE || {
    register(id, mod){
      STATE.modules[id] = mod;
      const cfg = (STATE.manifest?.sections || []).find(s=>s.id===id);
      const el = cfg && document.querySelector(cfg.selector);
      if (el && mod.init) {
        try { mod.init(el, { pushEvent, manifest: STATE.manifest }); }
        catch(e){ warn('module init error', id, e); }
      }
    }
  };

  function wireCalendarAlias(){
    document.addEventListener('click', (e)=>{
      const t = e.target.closest('[data-action="open_calendar"]');
      if (!t) return;
      e.preventDefault();
      const opener = document.querySelector('[data-sw-open="calendar"]');
      if (opener) opener.click();
      pushEvent('calendar_opened', { section:'global' });
    });
  }

  function initSections(){
    const sections = STATE.manifest?.sections || [];
    sections.forEach(cfg=>{
      const el = document.querySelector(cfg.selector);
      if (!el) return;
      const boot = async () => { await loadCSS(cfg.css); await loadJS(cfg.js); };
      if (cfg.defer !== false) {
        const io = new IntersectionObserver((entries, ob)=>{
          entries.forEach(en=>{
            if (en.isIntersecting){ ob.unobserve(en.target); boot(); }
          });
        }, { rootMargin:'0px 0px -10% 0px', threshold:0.08 });
        io.observe(el);
      } else {
        boot();
      }
    });

    // Baseline hero_seen
    const hero = document.querySelector('#hero');
    if (hero) {
      const seenObs = new IntersectionObserver((entries,ob)=>{
        entries.forEach(e=>{
          if (e.isIntersecting){ pushEvent('hero_seen', { section:'hero' }); ob.disconnect(); }
        });
      }, { threshold:0.3 });
      seenObs.observe(hero);
    }
  }

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
