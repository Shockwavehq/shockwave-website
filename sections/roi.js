(function(){
  const fmtCurrency = (n)=> new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.max(0,Math.round(n||0)));
  const fmtPercent = (n)=> Math.max(0, Math.round(n)) + '%';

  function compute(inputs){
    const L = Math.max(0, +inputs.monthly_leads || 0);
    const V = Math.max(0, +inputs.avg_job_value || 0);
    const M = Math.min(100, Math.max(0, +inputs.missed_response_rate || 0));
    const A = Math.min(100, Math.max(0, +inputs.lead_to_appt_rate || 0));
    const N = Math.min(100, Math.max(0, +inputs.no_show_rate || 0));
    const missedReduction = 0.7, apptLift = 0.2, noShowReduction = 0.3, minPostMissed = 5, minPostNoShow = 5;

    const baseline_effective_appt_rate = (1 - M/100) * (A/100);
    const post_missed_percent = Math.max(M * (1 - missedReduction), minPostMissed);
    const post_appt_rate = (A/100) * (1 + apptLift);
    const post_effective_appt_rate = (1 - post_missed_percent/100) * post_appt_rate;

    const baseline_appts = L * baseline_effective_appt_rate;
    const post_appts = L * post_effective_appt_rate;

    const baseline_kept = baseline_appts * (1 - N/100);
    const post_no_show_percent = Math.max(N * (1 - noShowReduction), minPostNoShow);
    const post_kept = post_appts * (1 - post_no_show_percent/100);

    const baseline_rev = baseline_kept * V;
    const post_rev = post_kept * V;
    const recovered_revenue = Math.max(0, post_rev - baseline_rev);
    const recovered_jobs = Math.max(0, Math.round(post_kept - baseline_kept));

    let suggested = 'Core';
    if (recovered_revenue >= 9000) suggested = 'Scale';
    else if (recovered_revenue >= 6000) suggested = 'Growth';

    return { recovered_revenue, recovered_jobs, post_missed_percent, post_no_show_percent, suggested_tier: suggested };
  }

  function countUp(el, to, dur=800){
    const from = parseInt((el.textContent||'0').replace(/[^\d]/g,''),10) || 0;
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start)/dur);
      const eased = t < .5 ? 2*t*t : -1 + (4-2*t)*t;
      const val = Math.round(from + (to - from) * eased);
      el.textContent = fmtCurrency(val);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const Module = {
    id:'roi-calculator',
    init(el){
      if (!el) return;
      const form = el.querySelector('form');
      const results = el.querySelector('[data-results]');
      const out = {
        revenue: el.querySelector('[data-field="recovered_revenue"]'),
        jobs: el.querySelector('[data-field="recovered_jobs"]'),
        missed: el.querySelector('[data-field="post_missed_percent"]'),
        noshow: el.querySelector('[data-field="post_no_show_percent"]'),
        tier: el.querySelector('[data-field="suggested_tier"]')
      };
      const dl = (n,d={})=>{ window.dataLayer = window.dataLayer || []; window.dataLayer.push({event:n, ...d}); };

      // Validation
      function validate(){
        let ok = true;
        el.querySelectorAll('input').forEach(inp=>{
          const val = +inp.value;
          if (isNaN(val) || val < 0){ ok = false; inp.setAttribute('aria-invalid','true'); }
          else inp.removeAttribute('aria-invalid');
        });
        return ok;
      }

      function getInputs(){
        return {
          monthly_leads: el.querySelector('[name="monthly_leads"]')?.value || 0,
          avg_job_value: el.querySelector('[name="avg_job_value"]')?.value || 0,
          missed_response_rate: el.querySelector('[name="missed_response_rate"]')?.value || 0,
          lead_to_appt_rate: el.querySelector('[name="lead_to_appt_rate"]')?.value || 0,
          no_show_rate: el.querySelector('[name="no_show_rate"]')?.value || 0
        };
      }

      function render(r){
        results?.classList.add('visible');
        if (out.revenue) countUp(out.revenue, r.recovered_revenue);
        if (out.jobs) out.jobs.textContent = String(r.recovered_jobs);
        if (out.missed) out.missed.textContent = fmtPercent(r.post_missed_percent);
        if (out.noshow) out.noshow.textContent = fmtPercent(r.post_no_show_percent);
        if (out.tier) out.tier.textContent = r.suggested_tier;
        dl('roi_result_view', {section:'roi-calculator'});
      }

      form?.addEventListener('submit', (e)=>{
        e.preventDefault();
        if (!validate()) return;
        const r = compute(getInputs());
        render(r);
        dl('roi_submit', {section:'roi-calculator'});
        try{ localStorage.setItem('roi_last', JSON.stringify({inputs:getInputs(), results:r})); }catch(_){}
      });

      // Book CTA bridge
      el.querySelectorAll('[data-action="book"]').forEach(b=>{
        b.addEventListener('click', ()=>{
          const opener = document.querySelector('[data-sw-open="calendar"]');
          if (opener) opener.click();
          dl('roi_book_demo_click',{section:'roi-calculator'});
        });
      });

      // Prefill from URL
      const params = new URLSearchParams(location.search);
      const map = { leads:'monthly_leads', value:'avg_job_value', missed:'missed_response_rate', appt:'lead_to_appt_rate', noshow:'no_show_rate' };
      Object.entries(map).forEach(([q,name])=>{
        const v = params.get(q); if (v!=null){ const f=el.querySelector(`[name="${name}"]`); if (f) f.value = v; }
      });

      // Fade-up
      const animated = el.querySelectorAll('.fade-up');
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!rm && animated.length){
        const obs = new IntersectionObserver((entries,o)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); o.unobserve(e.target); }}); }, { rootMargin:'0px 0px -10% 0px', threshold:0.2 });
        animated.forEach(n=>obs.observe(n));
      } else animated.forEach(n=>n.classList.add('is-visible'));
    },
    destroy(){}
  };

  if (window.SHOCKWAVE_LIVE && window.SHOCKWAVE_LIVE.register){
    window.SHOCKWAVE_LIVE.register(Module.id, Module);
  } else {
    document.addEventListener('DOMContentLoaded', ()=> Module.init(document.querySelector('#roi-calculator')));
  }
})();
