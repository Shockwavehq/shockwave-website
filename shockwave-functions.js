/* Global UI: calendar modal, sticky CTA, smooth scroll */
(function(){
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const dl = (name, detail={}) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event:name, ...detail }); };

  // Smooth scroll (idempotent)
  function smoothScrollInit(){
    if (window.__swSmoothScroll) return; window.__swSmoothScroll = true;

    $$('[data-sw-scroll-to]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const tgt = btn.getAttribute('data-sw-scroll-to');
        const el  = document.querySelector(tgt);
        if(!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Modal (calendar) with focus trap
  function modalInit(){
    const modal = $('[data-sw-modal="calendar"]');
    if(!modal || window.__swModalInit) return; window.__swModalInit = true;

    const openers = $$('[data-sw-open="calendar"]');
    const closers = $$('[data-sw-modal="close"]', modal);
    const content = $('[data-sw-modal-content]', modal);
    let lastFocused = null;

    function getFocusable() {
      return $$('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])', content)
        .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    }
    function open() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      const f = getFocusable()[0] || content;
      f.setAttribute('tabindex', '-1'); f.focus();
      dl('calendar_opened', { section:'global' });
      document.dispatchEvent(new CustomEvent('sw:calendar_opened'));
      document.addEventListener('keydown', onKeydown);
      document.addEventListener('focus', onFocusTrap, true);
    }
    function close() {
      modal.hidden = true;
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('focus', onFocusTrap, true);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    function onKeydown(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function onFocusTrap(e) {
      if (!modal.hidden && !modal.contains(e.target)) {
        e.stopPropagation();
        (getFocusable()[0] || content).focus();
      }
    }

    openers.forEach(btn => btn.addEventListener('click', (ev)=>{ ev.preventDefault(); open(); }));
    closers.forEach(btn => btn.addEventListener('click', close));
    $('.sw-modal__overlay', modal)?.addEventListener('click', close);
  }

  // Sticky CTA
  function stickyInit(){
    const bar = $('[data-sw-sticky]');
    if(!bar || window.__swStickyInit) return; window.__swStickyInit = true;
    let shown = false;
    function show() {
      if (!shown) { bar.style.display = 'block'; shown = true; dl('sticky_cta_shown', { section:'global' }); }
    }
    function onScroll() {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      if (scrolled > window.innerHeight * 0.35) show();
    }
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) setTimeout(show, 1200); else { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    smoothScrollInit();
    modalInit();
    stickyInit();
  });
})();
