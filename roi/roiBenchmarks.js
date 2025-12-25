(function () {
  'use strict';
  // Keep this aligned with the ROI calculator defaults (INDUSTRIES in roi-calculator.js)
  window.ShockwaveROIBenchmarks = {
    dental:   { dealValue: 400,  closeRatePct: 33, missedRatePct: 34, responseTimeHours: 4.5 },
    hvac:     { dealValue: 1200, closeRatePct: 28, missedRatePct: 43, responseTimeHours: 8.2 },
    legal:    { dealValue: 12000,closeRatePct: 12, missedRatePct: 45, responseTimeHours: 4.5 },
    plumbing: { dealValue: 600,  closeRatePct: 35, missedRatePct: 42, responseTimeHours: 1.5 },
    medspa:   { dealValue: 550,  closeRatePct: 35, missedRatePct: 30, responseTimeHours: 3.5 },
    pest:     { dealValue: 200,  closeRatePct: 35, missedRatePct: 38, responseTimeHours: 5.0 },
    other:    { dealValue: 500,  closeRatePct: 30, missedRatePct: 30, responseTimeHours: 4.0 }
  };
})();
