/* sections/roi.js */
(function(){
  'use strict';

  function formatUSD(n){ return '$' + Math.round(n).toLocaleString(); }

  function initROI(root){
    const leads = root.querySelector('[name="leads"]');
    const cr    = root.querySelector('[name="close_rate"]');
    const acv   = root.querySelector('[name="acv"]');
    const out   = root.querySelector('[data-sw-roi="result"]');
    if(!leads || !cr || !acv || !out) return;

    function calc(){
      const L = +leads.value || 0;
      const CR = (+cr.value || 0) / 100;
      const ACV = +acv.value || 0;
      const uplift = 0.15; // 15% extra conversions via AI follow-up (tunable)
      const extraDeals = L * CR * uplift;
      const extraRev = extraDeals * ACV;
      out.textContent = formatUSD(extraRev);
    }
    [leads, cr, acv].forEach(i=> i.addEventListener('input', calc));
    calc();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-sw-section="roi"]').forEach(initROI);
  });
})();
