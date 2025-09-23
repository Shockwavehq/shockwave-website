/* sections/hero.js */
(function(){
  'use strict';

  function initReveal(root=document){
    const els = root.querySelectorAll('[data-sw-anim]');
    if(!els.length) return;
    const io = new IntersectionObserver((entries)=>entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('is-inview'); io.unobserve(e.target); }
    }), { threshold:0.18 });
    els.forEach(el=>io.observe(el));
  }

  function typewriter(el){
    const words=(el.getAttribute('data-sw-typewords')||'').split('|').map(s=>s.trim()).filter(Boolean);
    if(!words.length) return;
    const typeSpd=+el.getAttribute('data-sw-type-speed')||70;
    const delSpd =+el.getAttribute('data-sw-delete-speed')||45;
    const pause  =+el.getAttribute('data-sw-pause')||1200;
    let i=0, txt='', del=false;
    (function tick(){
      const word=words[i%words.length];
      txt = del ? word.slice(0, txt.length-1) : word.slice(0, txt.length+1);
      el.textContent=txt;
      let delay = del ? delSpd : typeSpd;
      if(!del && txt===word){ delay=pause; del=true; }
      else if(del && txt===''){ del=false; i++; delay=200; }
      setTimeout(tick, delay);
    })();
  }

  function smoothScroll(root){
    root.querySelectorAll('[data-sw-scroll-to]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = btn.getAttribute('data-sw-scroll-to');
        const target=document.querySelector(id);
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
      });
    });
  }

  function initHero(root){
    initReveal(root);
    const t = root.querySelector('.sw-typewriter');
    if(t) typewriter(t);
    smoothScroll(root);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-sw-section="hero"]').forEach(initHero);
  });
})();
