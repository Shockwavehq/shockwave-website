/* Alive counters plugin (optional). Toggle via <body data-live="off"> or ?live=off */
(function () {
  'use strict';

  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const STORE = 'sw_live_data_v1';
  const ENABLED = (document.body.getAttribute('data-live') || 'on') !== 'off' && !/live=off/i.test(location.search);

  const DEFAULT_CFG = {
    roi_avg:           { base: 247, var: 20, min: 200, max: 400, dec: 0, trend:  1 },
    deployments:       { base:   8, var:  3, min:   5, max:  15, dec: 0, trend:  1 },
    revenue:           { base: 2.4, var: 0.2, min: 2.0, max: 3.5, dec: 1, trend:  1 },
    spots_remaining:   { base:   7, var:  1, min:   3, max:  12, dec: 0, trend: -1 },
    response_seconds:  { base: 47, var: 15, min: 25, max: 90, dec: 0, trend: -1 },
    hourly_revenue:    { base: 247, var: 30, min: 180, max: 350, dec: 0, trend:  1 },
    roi_guarantee:     { base:   5, var:  0, min:   5, max:   5, dec: 0, trend:  0 },
    payback_days:      { base:  60, var: 15, min:  30, max:  90, dec: 0, trend: -1 },
    avg_opportunity:   { base: 127, var: 25, min:  75, max: 200, dec: 0, trend:  1 },
    calculator_users:  { base:  23, var:  8, min:  15, max:  45, dec: 0, trend:  1 }
  };
  const CFG = Object.assign({}, DEFAULT_CFG, window.SW_LIVE_CONFIG || {});

  const getData = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; } };
  const setData = (obj) => { try { localStorage.setItem(STORE, JSON.stringify(obj)); } catch {} };

  function genValue(key) {
    const c = CFG[key]; if (!c) return null;
    const data = getData();
    const last = Number(data[key] ?? c.base);
    const drift = (Math.random() - 0.5) * c.var + (c.var * 0.1 * c.trend);
    let v = last + drift;
    v = Math.max(c.min, Math.min(c.max, v));
    data[key] = v; setData(data);
    return c.dec ? Number(v.toFixed(c.dec)) : Math.round(v);
  }

  const fmtCurrency = (n, locale) => {
    try { return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n); }
    catch { return '$' + String(Math.round(n)); }
  };
  const fmtPercent = (n) => Math.max(0, Math.round(n)) + '%';

  function formatForEl(el, value) {
    const format = (el.getAttribute('data-format') || 'int').toLowerCase();
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const locale = el.getAttribute('data-locale') || undefined;

    let out = value;
    if (format === 'currency') out = fmtCurrency(value, locale);
    else if (format === 'percent') out = fmtPercent(value);
    else if (format === 'float') out = Number(value).toFixed(Number(el.getAttribute('data-precision') || 1));
    else out = String(Math.round(value));
    return prefix + out + suffix;
  }

  function animate(el, to, ms = 900) {
    const fromText = el.textContent.replace(/[^\d.-]/g,'');
    const from = parseFloat(fromText) || 0;
    const end = parseFloat(to);
    const start = performance.now();
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { el.textContent = formatForEl(el, end); return; }
    el.classList.add('sw-updating');
    function step(t) {
      const p = Math.min((t - start) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = from + (end - from) * e;
      el.textContent = formatForEl(el, cur);
      if (p < 1) requestAnimationFrame(step);
      else el.classList.remove('sw-updating');
    }
    requestAnimationFrame(step);
  }

  function updateAll() {
    if (!ENABLED) return;

    $$('[data-sw-metric]').forEach(el => {
      const key = el.getAttribute('data-sw-metric');
      const val = genValue(key);
      if (val !== null) {
        const current = el.textContent.trim();
        const formatted = formatForEl(el, val);
        if (current !== formatted) animate(el, val);
      }
    });
  }

  function bump(key, delta = 1) {
    const c = CFG[key]; if (!c) return;
    const data = getData();
    const cur = Number(data[key] ?? c.base ?? 0);
    const next = cur + delta;
    data[key] = Math.max(c.min, Math.min(c.max, next));
    setData(data);
    updateAll();
  }

  function bindEvents() {

    $$('[data-sw-scroll-to="#roi-calculator"], a[href="#roi-calculator"]').forEach(el => {
      el.addEventListener('click', () => { bump('calculator_users', 1); }, { passive: true });
    });

    $$('[data-sw-open="calendar"]').forEach(el => {
      el.addEventListener('click', () => { bump('avg_opportunity', Math.round(Math.random() * 3)); }, { passive: true });
    });

    document.addEventListener('sw:roi_submit', () => bump('calculator_users', 1));
    document.addEventListener('sw:calendar_opened', () => bump('avg_opportunity', Math.round(Math.random() * 3)));
  }

  window.SW_LIVE = { bump, updateAll, set: (k,v)=>{ const d=getData(); d[k]=v; setData(d); updateAll(); }, config: CFG };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(window.__swLiveTimer);
    else { updateAll(); window.__swLiveTimer = setInterval(updateAll, 45000); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!ENABLED) return;
    bindEvents();
    updateAll();
    window.__swLiveTimer = setInterval(updateAll, 45000);
  });
})();
