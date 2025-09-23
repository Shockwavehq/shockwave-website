/* shockwave-live.js — ShockwaveHQ "alive" counters (no backend) */
(function () {
  'use strict';

  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const STORE = 'sw_live_data_v1';

  // Tunable metrics (keep believable; match on-page copy)
  const CFG = {
    roi_avg:           { base: 247, var: 20, min: 200, max: 400, dec: 0, trend:  1 },
    deployments:       { base:   8, var:  3, min:   5, max:  15, dec: 0, trend:  1 },
    revenue:           { base: 2.4, var: 0.2, min: 2.0, max: 3.5, dec: 1, trend:  1 },
    spots_remaining:   { base:   7, var:  1, min:   3, max:  12, dec: 0, trend: -1 },
    hourly_revenue:    { base: 247, var: 30, min: 180, max: 350, dec: 0, trend:  1 },
    roi_guarantee:     { base:   5, var:  0, min:   5, max:   5, dec: 0, trend:  0 },
    payback_days:      { base:  60, var: 15, min:  30, max:  90, dec: 0, trend: -1 },
    avg_opportunity:   { base: 127, var: 25, min:  75, max: 200, dec: 0, trend:  1 },
    calculator_users:  { base:  23, var:  8, min:  15, max:  45, dec: 0, trend:  1 }
  };

  const getData = () => {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
    catch { return {}; }
  };
  const setData = (obj) => {
    try { localStorage.setItem(STORE, JSON.stringify(obj)); }
    catch {}
  };

  function genValue(key) {
    const c = CFG[key]; if (!c) return null;
    const data = getData();
    const last = Number(data[key] ?? c.base);
    const drift = (Math.random() - 0.5) * c.var + (c.var * 0.1 * c.trend);
    let v = last + drift;
    v = Math.max(c.min, Math.min(c.max, v));
    data[key] = v; setData(data);
    return c.dec ? v.toFixed(c.dec) : Math.round(v);
  }

  function animate(el, to, ms = 900) {
    const from = parseFloat(el.textContent) || 0;
    const end = parseFloat(to);
    const start = performance.now();
    const isDec = String(to).includes('.');
    el.classList.add('sw-updating');

    function step(t) {
      const p = Math.min((t - start) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const cur = from + (end - from) * e;
      el.textContent = isDec ? cur.toFixed(1) : Math.round(cur);
      if (p < 1) requestAnimationFrame(step);
      else el.classList.remove('sw-updating');
    }
    requestAnimationFrame(step);
  }

  function updateAll() {

    $$('[data-sw-metric]').forEach(el => {
      const key = el.getAttribute('data-sw-metric');
      const val = genValue(key);
      if (val !== null && el.textContent.trim() !== String(val)) animate(el, val);
    });
  }

  function bump(key, delta = 1) {
    const data = getData();
    const cur = Number(data[key] ?? CFG[key]?.base ?? 0);
    data[key] = cur + delta;
    setData(data);
  }

  function bindEvents() {
    // ROI calculator usage bumps

    $$('[data-sw-scroll-to="#sw-roi"], a[href="#sw-roi"]').forEach(el => {
      el.addEventListener('click', () => { bump('calculator_users', 1); updateAll(); }, { passive: true });
    });

    // Optional: bump avg opportunity on calendar open

    $$('[data-sw-open="calendar"]').forEach(el => {
      el.addEventListener('click', () => { bump('avg_opportunity', Math.round(Math.random() * 3)); updateAll(); }, { passive: true });
    });
  }

  // Respect visibility (save CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(window.__swLiveTimer);
    else { updateAll(); window.__swLiveTimer = setInterval(updateAll, 45000); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    updateAll();
    window.__swLiveTimer = setInterval(updateAll, 45000);
  });
})();
