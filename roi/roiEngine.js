// sections/roiEngine.js
// Pure math engine for ROI calculations – no DOM, no HTML.
// 2025 version: single source of truth for ALL math.
//
// Design:
//  - Per-location inputs (leads, deal value, close rate)
//  - Network-level, peak-adjusted direct ROI
//  - Extended "value stack" (speed-to-lead, workflows, channels, SLA, add-ons)
//  - Normalized block mirrors direct network metrics for UI use

/**
 * Clamp a value between min and max.
 */
function swClamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ---------------------------------------------------------------------------
// GLOBAL & VERTICAL DEFAULTS
// ---------------------------------------------------------------------------

/**
 * Global defaults (fallbacks) – vertical configs override where applicable.
 */
var SW_ROI_DEFAULTS = {
  conversionLiftFactor: 1,                // default 1x; extended uses response-time logic
  retentionImprovement: 0.67,             // 3-year retention multiplier (if used)
  workflowSavingsPerWorkflowMonthly: 400, // fallback per-workflow/month if industry unknown
  channelBoostPerChannel: 0.10,           // fallback: +10% per extra channel
  downtimeRiskPerHour: 350,               // fallback: $350/hour downtime risk
  annualDiscount: 0.15,                   // 15% off for annual prepay
  sixMonthDiscount: 0.10,                 // 10% off for 6-month
  baselineSupportHours: 48                // Baseline "bad" SLA for risk comparison
};

/**
 * Per-vertical economic multipliers – from 2025 research.
 *
 * All workflow amounts are PER WORKFLOW PER MONTH.
 * All channel lifts are PER ADDED CHANNEL beyond 2, as a FRACTION of recovered revenue.
 * All downtimeRiskPerHour values are per hour of downtime avoided.
 */
var SW_VERTICAL_DEFAULTS = {
  dental: {
    workflowSavingsPerWorkflowMonthly: 355,   // ~$4,257/year per workflow
    channelBoostPerChannel: 0.0625,          // +6.25% per extra channel
    downtimeRiskPerHour: 350                 // $350/hour of downtime
  },
  legal: {
    workflowSavingsPerWorkflowMonthly: 661,   // ~$7,928/year per workflow
    channelBoostPerChannel: 0.1875,          // +18.75% per extra channel
    downtimeRiskPerHour: 650                 // $650/hour of downtime
  },
  hvac: {
    workflowSavingsPerWorkflowMonthly: 564,   // ~$6,762/year per workflow
    channelBoostPerChannel: 0.10,            // +10% per extra channel
    downtimeRiskPerHour: 400                 // $400/hour of downtime
  },
  plumbing: {
    workflowSavingsPerWorkflowMonthly: 389,   // ~$4,662/year per workflow
    channelBoostPerChannel: 0.1125,          // +11.25% per extra channel
    downtimeRiskPerHour: 350                 // $350/hour of downtime
  },
  medspa: {
    workflowSavingsPerWorkflowMonthly: 319,   // ~$3,828/year per workflow
    channelBoostPerChannel: 0.10,            // +10% per extra channel
    downtimeRiskPerHour: 350                 // $350/hour of downtime
  },
  pest: {
    workflowSavingsPerWorkflowMonthly: 352,   // ~$4,224/year per workflow
    channelBoostPerChannel: 0.125,           // +12.5% per extra channel
    downtimeRiskPerHour: 500                 // $500/hour of downtime
  },
  _default: {
    workflowSavingsPerWorkflowMonthly: SW_ROI_DEFAULTS.workflowSavingsPerWorkflowMonthly,
    channelBoostPerChannel: SW_ROI_DEFAULTS.channelBoostPerChannel,
    downtimeRiskPerHour: SW_ROI_DEFAULTS.downtimeRiskPerHour
  }
};

function swGetVerticalDefaults(industryKey) {
  var key = (industryKey || '').toLowerCase();
  return SW_VERTICAL_DEFAULTS[key] || SW_VERTICAL_DEFAULTS._default;
}

/**
 * Volume-based per-location pricing brackets by tier.
 *
 * Interpretation:
 *  - Location 1 always pays monthlyBase (from monthlyInvestment input).
 *  - Locations in [from, to] pay the given "rate" per location per month.
 */
var SW_VOLUME_PRICING_BRACKETS = {
  core: [
    { from: 2,  to: 4,   rate: 1500 },
    { from: 5,  to: 9,   rate: 1200 },
    { from: 10, to: 24,  rate: 1000 },
    { from: 25, to: Infinity, rate: 850 }
  ],
  growth: [
    { from: 2,  to: 4,   rate: 3000 },
    { from: 5,  to: 9,   rate: 2500 },
    { from: 10, to: 24,  rate: 2100 },
    { from: 25, to: Infinity, rate: 1800 }
  ],
  scale: [
    { from: 2,  to: 4,   rate: 4500 },
    { from: 5,  to: 9,   rate: 3800 },
    { from: 10, to: 24,  rate: 3200 },
    { from: 25, to: Infinity, rate: 2700 }
  ],
  enterprise: [
    { from: 2,  to: 4,   rate: 6000 },
    { from: 5,  to: 9,   rate: 5200 },
    { from: 10, to: 24,  rate: 4500 },
    { from: 25, to: Infinity, rate: 3800 }
  ]
};

/**
 * Compute additional monthly cost for locations 2..N using the
 * volume pricing brackets above. Falls back to linear when no
 * brackets are defined for a tier.
 */
function swComputeVolumeAdditionalMonthly(tierKey, numLocations, perLocationFee) {
  var n = Math.max(1, Number(numLocations) || 1);
  if (n <= 1) return 0;

  var brackets = SW_VOLUME_PRICING_BRACKETS[tierKey];
  if (!brackets || !brackets.length) {
    // Fallback: linear pricing
    return (n - 1) * perLocationFee;
  }

  var additionalMonthly = 0;
  // We index by "location number": 2..n
  for (var i = 0; i < brackets.length; i++) {
    var b = brackets[i];
    var from = b.from;
    var to   = b.to;
    if (n >= from) {
      var end    = Math.min(n, to);
      var count  = Math.max(0, end - from + 1);
      additionalMonthly += count * b.rate;
    }
  }
  return additionalMonthly;
}

/**
 * Vertical-specific recovery adjustment factors.
 *
 * These calibrate effective AI recovery so default "Revenue AI / realistic"
 * scenarios line up with 2025 recovery benchmarks instead of overstating.
 */
var SW_VERTICAL_RECOVERY_ADJUSTMENT = {
  dental:   1.00,
  legal:    0.74,
  hvac:     0.91,
  plumbing: 0.97,
  medspa:   0.98,
  pest:     0.97,
  _default: 1.00
};

function swGetVerticalRecoveryAdjustment(industryKey) {
  var key = (industryKey || '').toLowerCase();
  if (SW_VERTICAL_RECOVERY_ADJUSTMENT.hasOwnProperty(key)) {
    return SW_VERTICAL_RECOVERY_ADJUSTMENT[key];
  }
  return SW_VERTICAL_RECOVERY_ADJUSTMENT._default;
}

/**
 * Tier + Scenario monthly recovery benchmarks (USD/month),
 * based on VERIFIED 2024-2025 client results from actual AI deployments.
 *
 * Methodology: Analyzed real case studies, client testimonials, and performance data
 * to establish realistic performance ranges:
 *  - underperforming: 30th percentile (early ramp, partial adoption)
 *  - typical: 60th percentile (steady-state, well-executed deployment)
 *  - topPerformer: 90th percentile (optimized systems, high engagement)
 *
 * UI should generally use `.typical` as "what similar businesses usually see"
 * and treat `topPerformer` as upside, not baseline.
 */
var SW_TIER_RECOVERY_BENCHMARKS = {
  dental: {
    core: {
      underperforming: 5500,
      typical:         9000,
      topPerformer:    15000
    },
    growth: {
      underperforming: 7000,
      typical:         12000,
      topPerformer:    20000
    },
    scale: {
      underperforming: 8500,
      typical:         15000,
      topPerformer:    25000
    },
    enterprise: {
      underperforming: 9500,
      typical:         17000,
      topPerformer:    28000
    }
  },

  hvac: {
    core: {
      underperforming: 8000,
      typical:         15000,
      topPerformer:    35000
    },
    growth: {
      underperforming: 10500,
      typical:         20000,
      topPerformer:    45000
    },
    scale: {
      underperforming: 13000,
      typical:         25000,
      topPerformer:    55000
    },
    enterprise: {
      underperforming: 15000,
      typical:         28000,
      topPerformer:    60000
    }
  },

  legal: {
    core: {
      underperforming: 12000,
      typical:         25000,
      topPerformer:    50000
    },
    growth: {
      underperforming: 16000,
      typical:         33000,
      topPerformer:    65000
    },
    scale: {
      underperforming: 20000,
      typical:         42000,
      topPerformer:    80000
    },
    enterprise: {
      underperforming: 23000,
      typical:         48000,
      topPerformer:    90000
    }
  },

  plumbing: {
    core: {
      underperforming: 10000,
      typical:         18000,
      topPerformer:    33000
    },
    growth: {
      underperforming: 13000,
      typical:         24000,
      topPerformer:    43000
    },
    scale: {
      underperforming: 16000,
      typical:         30000,
      topPerformer:    53000
    },
    enterprise: {
      underperforming: 18500,
      typical:         34000,
      topPerformer:    60000
    }
  },

  medspa: {
    core: {
      underperforming: 8000,
      typical:         13000,
      topPerformer:    24000
    },
    growth: {
      underperforming: 10500,
      typical:         17000,
      topPerformer:    31000
    },
    scale: {
      underperforming: 13000,
      typical:         22000,
      topPerformer:    40000
    },
    enterprise: {
      underperforming: 15000,
      typical:         25000,
      topPerformer:    45000
    }
  },

  pest: {
    core: {
      underperforming: 6000,
      typical:         10000,
      topPerformer:    20000
    },
    growth: {
      underperforming: 8000,
      typical:         13000,
      topPerformer:    26000
    },
    scale: {
      underperforming: 10000,
      typical:         17000,
      topPerformer:    33000
    },
    enterprise: {
      underperforming: 11500,
      typical:         19000,
      topPerformer:    38000
    }
  }
};

/**
 * Get benchmark monthly recovery ranges for a vertical + tier.
 *
 * @param {string} industryKey - e.g. 'dental', 'legal', 'hvac'
 * @param {string} tierKey - 'core' | 'growth' | 'scale' | 'enterprise'
 * @returns {object|null} { underperforming, typical, topPerformer } or null
 */
function getTierRecoveryBenchmarks(industryKey, tierKey) {
  var ind = (industryKey || '').toLowerCase();
  var tier = (tierKey || '').toLowerCase();

  if (!SW_TIER_RECOVERY_BENCHMARKS[ind]) return null;
  if (!SW_TIER_RECOVERY_BENCHMARKS[ind][tier]) return null;

  return SW_TIER_RECOVERY_BENCHMARKS[ind][tier];
}

/**
 * Minimum viable lead volume per location for positive ROI on Response AI tier.
 */
var SW_MIN_VIABLE_LEADS = {
  dental:   140,
  hvac:     95,
  legal:    30,
  plumbing: 65,
  medspa:   175,
  pest:     200,
  _default: 150
};

function swGetMinViableLeads(industryKey) {
  var key = (industryKey || '').toLowerCase();
  if (SW_MIN_VIABLE_LEADS.hasOwnProperty(key)) {
    return SW_MIN_VIABLE_LEADS[key];
  }
  return SW_MIN_VIABLE_LEADS._default;
}

// ---------------------------------------------------------------------------
// PEAK-SEASON MODELING → ANNUALIZED FACTOR
// ---------------------------------------------------------------------------

/**
 * Approximate number of "peak" months per vertical.
 */
var SW_PEAK_MONTHS_BY_VERTICAL = {
  dental:   3,   // Jan & Aug–Sept
  hvac:     7,   // May–Sept & Nov–Feb
  legal:    0,
  plumbing: 3,   // Dec–Feb
  medspa:   6,   // Nov–Jan & Apr–Jun
  pest:     8,   // Mar–Oct
  _default: 0
};

function swGetPeakMonths(industryKey) {
  var key = (industryKey || '').toLowerCase();
  if (SW_PEAK_MONTHS_BY_VERTICAL.hasOwnProperty(key)) {
    return SW_PEAK_MONTHS_BY_VERTICAL[key];
  }
  return SW_PEAK_MONTHS_BY_VERTICAL._default;
}

// ---------------------------------------------------------------------------
// RESPONSE-TIME ADVANTAGE → ECONOMIC CONVERSION LIFT
// ---------------------------------------------------------------------------

/**
 * Map current response time into a coarse "speed tier".
 *
 *  - 0: very slow (>= 24h)
 *  - 1: slow (1–24h)
 *  - 2: okay (5 min – 1h)
 *  - 3: fast (< 5 min)
 *
 * Shockwave AI is assumed to operate effectively in tier 3.
 */
function swGetSpeedTier(responseTimeHours) {
  var h = Number(responseTimeHours) || 0;

  if (h >= 24) {
    return 0; // very slow
  } else if (h >= 1) {
    return 1; // slow
  } else if (h >= 0.083) { // ~5 minutes
    return 2; // okay
  } else {
    return 3; // fast (<5 min)
  }
}

/**
 * Compute a conservative conversion lift factor based on how much
 * faster Shockwave (<5 min) is than the current response time.
 *
 * This affects ONLY the extended value stack, NOT direct recovered revenue.
 */
function swGetEconomicConversionLift(responseTimeHours) {
  var currentTier = swGetSpeedTier(responseTimeHours);
  var aiTier = 3; // Shockwave AI: fastest bucket
  var advantageSteps = aiTier - currentTier;

  switch (advantageSteps) {
    case 0:
      return 1.00;
    case 1:
      return 1.10;
    case 2:
      return 1.25;
    case 3:
      return 1.40;
    default:
      return 1.00;
  }
}

// ---------------------------------------------------------------------------
// BASE ROI (PER LOCATION, NO LOCATIONS/PEAK YET)
// ---------------------------------------------------------------------------

/**
 * Base ROI calculation for a single location & scenario.
 *
 * inputs = {
 *   industryKey: string,
 *   leadsPerMonth: number,
 *   dealValue: number,
 *   missedRatePct: number,
 *   closeRatePct: number,
 *   responseTimeHours: number,
 *   employeeCostPerHour?: number,
 *   callDurationMinutes?: number,
 *   monthlyInvestment: number,   // list price for ONE location
 *   aiRecoveryRate: number       // 0–1, pre-vertical-calibration
 * }
 */
function calculateBaseROI(inputs) {
  var warnings = [];

  // 1) Sanitize & clamp inputs
  var industryKey        = inputs.industryKey || 'unknown';
  var leadsPerMonth      = Math.max(0, Number(inputs.leadsPerMonth) || 0);
  var dealValue          = Math.max(0, Number(inputs.dealValue) || 0);
  var missedRatePct      = swClamp(Number(inputs.missedRatePct) || 0, 0, 100);
  var closeRatePct       = swClamp(Number(inputs.closeRatePct) || 0, 0, 100);
  var responseTimeHours  = Math.max(0, Number(inputs.responseTimeHours) || 0);
  var monthlyInvestment  = Math.max(0, Number(inputs.monthlyInvestment) || 0);
  var aiRecoveryRateRaw  = Number(inputs.aiRecoveryRate) || 0;
  var aiRecoveryRate     = swClamp(aiRecoveryRateRaw, 0, 1);

  var employeeCostPerHour = inputs.employeeCostPerHour != null
    ? Math.max(0, Number(inputs.employeeCostPerHour) || 0)
    : null;

  var callDurationMinutes = inputs.callDurationMinutes != null
    ? Math.max(0, Number(inputs.callDurationMinutes) || 0)
    : null;

  // Vertical recovery calibration
  var vRecoveryAdj = swGetVerticalRecoveryAdjustment(industryKey);
  aiRecoveryRate = swClamp(aiRecoveryRate * vRecoveryAdj, 0, 1);

  // 2) Convert percentages to decimals
  var missedRate = missedRatePct / 100;
  var closeRate  = closeRatePct / 100;

  // 3) Missed leads & revenue (per month) – PER LOCATION
  var monthlyMissedLeads    = leadsPerMonth * missedRate;
  var monthlyMissedRevenue  = monthlyMissedLeads * dealValue * closeRate;
  var revenueAtRiskAnnual   = monthlyMissedRevenue * 12;

  // 4) AI recovery (annual & monthly) – PER LOCATION
  var revenueRecoveredAnnual = revenueAtRiskAnnual * aiRecoveryRate;
  var monthlyRecovered       = revenueRecoveredAnnual / 12;

  // 5) Investment & profitability (base, list price only, PER LOCATION)
  var annualInvestment = monthlyInvestment * 12;
  var monthlyNetProfit = monthlyRecovered - monthlyInvestment;
  var annualNetProfit  = revenueRecoveredAnnual - annualInvestment;

  // ROI% (allow negatives, guard zero investment)
  var roiPercent = 0;
  if (annualInvestment > 0) {
    roiPercent = (annualNetProfit / annualInvestment) * 100;
  }

  // 6) Profitability classification (base)
  var eps = Math.max(50, 0.02 * monthlyInvestment); // ≥ $50 or ≥2% of fee
  var profitabilityState;
  if (monthlyNetProfit > eps) {
    profitabilityState = 'profitable';
  } else if (monthlyNetProfit < -eps) {
    profitabilityState = 'unprofitable';
  } else {
    profitabilityState = 'breakeven';
  }

  // 7) Break-even helpers (base, using list-price cost)
  var breakEvenLeadsPerMonth = null;
  var breakEvenDealValue     = null;
  var breakEvenCloseRatePct  = null;

  // $ recovered per lead per month
  var valuePerLead = missedRate * dealValue * closeRate * aiRecoveryRate;

  // Leads to cover monthly investment
  if (valuePerLead > 0) {
    breakEvenLeadsPerMonth = Math.ceil(monthlyInvestment / valuePerLead);
  }

  // Deal value needed at current volume to cover fee
  var denomDeal = leadsPerMonth * missedRate * closeRate * aiRecoveryRate;
  if (denomDeal > 0) {
    breakEvenDealValue = monthlyInvestment / denomDeal;
    if (breakEvenDealValue > 1000000) {
      warnings.push('Break-even deal value is extremely high. Inputs may be unrealistic.');
      breakEvenDealValue = null;
    }
  }

  // Close rate needed at current volume & deal value
  var denomClose = leadsPerMonth * missedRate * dealValue * aiRecoveryRate;
  if (denomClose > 0) {
    var neededCloseRate = monthlyInvestment / denomClose; // fraction
    var pct = neededCloseRate * 100;
    if (pct > 100) {
      warnings.push('Required close rate to break even exceeds 100%. Tier is not viable at current inputs.');
      pct = null;
    } else if (pct < 0) {
      pct = null;
    }
    breakEvenCloseRatePct = pct;
  }

  // 8) Time savings (optional, per location)
  var recoveredCallsAnnual   = 0;
  var timeSavedHoursAnnual   = 0;
  var timeSavedValueAnnual   = 0;

  if (employeeCostPerHour != null && callDurationMinutes != null) {
    recoveredCallsAnnual  = monthlyMissedLeads * aiRecoveryRate * 12;
    var callDurationHrs = callDurationMinutes / 60;
    timeSavedHoursAnnual  = recoveredCallsAnnual * callDurationHrs;
    timeSavedValueAnnual  = timeSavedHoursAnnual * employeeCostPerHour;
  }

  // 9) Conversion lift tiers (research-stat only based on response time)
  var conversionLiftFactor;
  if (responseTimeHours >= 24) {
    conversionLiftFactor = 21;
  } else if (responseTimeHours >= 1) {
    conversionLiftFactor = 9;
  } else if (responseTimeHours >= 0.083) { // ~5 minutes
    conversionLiftFactor = 4;
  } else {
    conversionLiftFactor = 2;
  }

  // 10) Cost of waiting (revenue-based, per location)
  var perMonth = monthlyRecovered;
  var costOfWaiting = {
    perMonth:    Math.round(perMonth),
    threeMonths: Math.round(perMonth * 3),
    sixMonths:   Math.round(perMonth * 6),
    twelveMonths: Math.round(perMonth * 12)
  };

  // 11) Cash flow (base)
  var cashFlow = {
    netMonthly: Math.round(monthlyNetProfit),
    year1Net:   Math.round(annualNetProfit)
  };

  return {
    // core revenue math (per location)
    industryKey: industryKey,
    leadsPerMonth: leadsPerMonth,
    dealValue: dealValue,
    missedRatePct: missedRatePct,
    closeRatePct: closeRatePct,
    responseTimeHours: responseTimeHours,
    aiRecoveryRate: aiRecoveryRate,

    monthlyMissedLeads: monthlyMissedLeads,
    monthlyMissedRevenue: monthlyMissedRevenue,
    revenueAtRiskAnnual: revenueAtRiskAnnual,
    revenueRecoveredAnnual: revenueRecoveredAnnual,
    monthlyRecovered: monthlyRecovered,
    annualInvestment: annualInvestment,

    // profitability (per location)
    monthlyNetProfit: monthlyNetProfit,
    annualNetProfit: annualNetProfit,
    roiPercent: roiPercent,
    profitabilityState: profitabilityState,

    // break-even helpers (per location)
    breakEvenLeadsPerMonth: breakEvenLeadsPerMonth,
    breakEvenDealValue: breakEvenDealValue,
    breakEvenCloseRatePct: breakEvenCloseRatePct,

    // time savings (per location)
    recoveredCallsAnnual: recoveredCallsAnnual,
    timeSavedHoursAnnual: timeSavedHoursAnnual,
    timeSavedValueAnnual: timeSavedValueAnnual,

    // response time effect (research stat)
    conversionLiftFactor: conversionLiftFactor,

    // cost of waiting (per location, revenue-based)
    costOfWaiting: costOfWaiting,

    // cash flow (per location)
    cashFlow: cashFlow,

    // warnings
    warnings: warnings
  };
}

// ---------------------------------------------------------------------------
// FULL ROI (EXTENDED + NORMALIZED, NETWORK-LEVEL)
// ---------------------------------------------------------------------------

/**
 * Full ROI calculation with extended economic value and normalized ROI.
 *
 * This is the SINGLE source of truth for:
 *  - Direct recovered revenue (network + peak)
 *  - True Year‑1 cost (after discounts & credits)
 *  - Direct ROI, net, break-even, cost-of-waiting, cash flow
 *  - Extended economic value stack
 */
function calculateROI(inputs) {
  // 1) Compute base ROI (per location, vertically calibrated)
  var base = calculateBaseROI(inputs);

  // 1a) Vertical defaults based on industry
  var vDefaults = swGetVerticalDefaults(base.industryKey || inputs.industryKey);

  var tierKey = (inputs.tierKey || '').toLowerCase();

  // 2) Extended inputs (sanitized)
  var numLocations = Math.max(1, Number(inputs.numLocations) || 1);
  var perLocationFee = Math.max(0, Number(inputs.perLocationFee) || 0);

  var commitmentType = inputs.commitmentType === '6month' || inputs.commitmentType === 'annual'
    ? inputs.commitmentType
    : 'monthly';

  var setupFee = Math.max(0, Number(inputs.setupFee) || 0);

  var commAllowanceMonthly = inputs.commAllowanceMonthly != null
    ? Math.max(0, Number(inputs.commAllowanceMonthly) || 0)
    : 0;

  var isPeakSeason = !!inputs.isPeakSeason;

  var peakSurgeInput = inputs.peakSurgeMultiplier != null
    ? Math.max(0, Number(inputs.peakSurgeMultiplier) || 1)
    : 1;

  var peakMonthsCount = swGetPeakMonths(base.industryKey || inputs.industryKey);
  var peakAnnualFactor = 1;
  if (isPeakSeason && peakMonthsCount > 0 && peakSurgeInput > 0) {
    var s = peakSurgeInput - 1;
    if (s < 0) s = 0;
    peakAnnualFactor = 1 + (peakMonthsCount / 12) * s;
  }

  var conversionLiftFactor = inputs.conversionLiftFactorOverride != null
    ? Math.max(1, Number(inputs.conversionLiftFactorOverride) || 1)
    : swGetEconomicConversionLift(base.responseTimeHours);

  var retentionImprovement = inputs.retentionImprovement != null
    ? Math.max(0, Number(inputs.retentionImprovement) || 0)
    : SW_ROI_DEFAULTS.retentionImprovement;

  var workflowCount = Math.max(0, Number(inputs.workflowCount) || 0);

  var workflowSavingsPerMonth = inputs.workflowSavingsPerMonth != null
    ? Math.max(0, Number(inputs.workflowSavingsPerMonth) || 0)
    : (vDefaults.workflowSavingsPerWorkflowMonthly != null
        ? vDefaults.workflowSavingsPerWorkflowMonthly
        : SW_ROI_DEFAULTS.workflowSavingsPerWorkflowMonthly);

  var channelCount = Math.max(0, Number(inputs.channelCount) || 0);

  var channelBoostPerChannel = inputs.channelBoostPerChannel != null
    ? Math.max(0, Number(inputs.channelBoostPerChannel) || 0)
    : (vDefaults.channelBoostPerChannel != null
        ? vDefaults.channelBoostPerChannel
        : SW_ROI_DEFAULTS.channelBoostPerChannel);

  var supportHours = inputs.supportHours != null
    ? Math.max(0, Number(inputs.supportHours) || 0)
    : SW_ROI_DEFAULTS.baselineSupportHours;

  var downtimeRiskPerHour = inputs.downtimeRiskPerHour != null
    ? Math.max(0, Number(inputs.downtimeRiskPerHour) || 0)
    : (vDefaults.downtimeRiskPerHour != null
        ? vDefaults.downtimeRiskPerHour
        : SW_ROI_DEFAULTS.downtimeRiskPerHour);

  var annualDiscount = inputs.annualDiscount != null
    ? swClamp(Number(inputs.annualDiscount) || 0, 0, 1)
    : SW_ROI_DEFAULTS.annualDiscount;

  var sixMonthDiscount = inputs.sixMonthDiscount != null
    ? swClamp(Number(inputs.sixMonthDiscount) || 0, 0, 1)
    : SW_ROI_DEFAULTS.sixMonthDiscount;

  var timeHorizon = inputs.timeHorizon === '3year' ? '3year' : '1year';

  var addOns = Array.isArray(inputs.addOns) ? inputs.addOns : [];

  // 3) Extended at-risk & recovered values (network + annualized peak)
  var atRiskPerLocationAnnual = base.revenueAtRiskAnnual;
  var adjustedAtRiskAnnual = atRiskPerLocationAnnual * numLocations * peakAnnualFactor;

  var effectiveAiRate = 0;
  if (base.revenueAtRiskAnnual > 0) {
    effectiveAiRate = base.revenueRecoveredAnnual / base.revenueAtRiskAnnual;
  } else if (inputs.aiRecoveryRate != null) {
    effectiveAiRate = swClamp(Number(inputs.aiRecoveryRate) || 0, 0, 1);
  }

  var extendedBaseRecoveredAnnual = adjustedAtRiskAnnual * effectiveAiRate;

  // Conversion-lifted recovered value (economic lift only)
  var liftedRecoveredAnnual = extendedBaseRecoveredAnnual * (conversionLiftFactor || 1);

  // 4) 3-year retention LTV (optional, extended)
  var retentionLTV = null;
  if (timeHorizon === '3year' && liftedRecoveredAnnual > 0 && retentionImprovement > 0) {
    var year1 = liftedRecoveredAnnual;
    var year2 = year1 * retentionImprovement;
    var year3 = year2 * retentionImprovement;
    retentionLTV = {
      year1: year1,
      year2: year2,
      year3: year3,
      total3Year: year1 + year2 + year3
    };
  }

  // 5) Workflow savings (network-level)
  var annualWorkflowSavings = workflowCount * workflowSavingsPerMonth * 12;

  // 6) Channel advantage (network-level)
  var additionalChannels = Math.max(0, channelCount - 2);
  var reachabilityBoost = additionalChannels * channelBoostPerChannel;
  var channelBoostValue = extendedBaseRecoveredAnnual * reachabilityBoost;

  // 7) SLA risk mitigation (network-level)
  var baselineHours = SW_ROI_DEFAULTS.baselineSupportHours;
  var riskHoursReduced = Math.max(0, baselineHours - supportHours);
  var annualSLAValue = riskHoursReduced * downtimeRiskPerHour;

  // 8) Add-ons value & cost (network-level) — MUST come before direct metrics
var totalAddOnCost = 0;
var totalAddOnValue = 0;
var directAddOnRecovery = 0;

for (var i = 0; i < addOns.length; i++) {
  var addon = addOns[i] || {};
  var annualCost = Math.max(0, Number(addon.annualCost) || 0);
  
  var monthlyRecovery = Number(addon.monthlyRecovery) || 0;
  if (monthlyRecovery > 0) {
    directAddOnRecovery += monthlyRecovery * 12;
  } else {
    var convBoost = Math.max(0, Number(addon.conversionBoost) || 0);
    totalAddOnValue += extendedBaseRecoveredAnnual * convBoost;
  }
  
  totalAddOnCost += annualCost;
}

// Canonical direct (network + peak) metrics — NOW INCLUDES direct add-on recovery
var directAtRiskAnnual     = adjustedAtRiskAnnual;
var directRecoveredAnnual  = extendedBaseRecoveredAnnual + directAddOnRecovery;
var directRecoveredMonthly = directRecoveredAnnual / 12;

  // 9) Investment with locations, commitment, setup, comm allowance
  var monthlyBase = base.annualInvestment / 12; // list price for first location

  var monthlyAdditional = swComputeVolumeAdditionalMonthly(
    tierKey,
    numLocations,
    perLocationFee
  );

  var totalMonthly = monthlyBase + monthlyAdditional;

  var annualRecurring = totalMonthly * 12;
  if (commitmentType === 'annual') {
    annualRecurring = annualRecurring * (1 - annualDiscount);
  } else if (commitmentType === '6month') {
    annualRecurring = annualRecurring * (1 - sixMonthDiscount);
  }

  var finalSetupFee = commitmentType === 'annual' ? 0 : setupFee;
  var annualCommAllowance = commAllowanceMonthly * 12;

  var totalInvestmentYear1 = annualRecurring + finalSetupFee + totalAddOnCost;
  var effectiveInvestmentYear1 = totalInvestmentYear1 - annualCommAllowance;

  var investment3Y = null;
  if (timeHorizon === '3year') {
    var base3Y = annualRecurring * 3 + finalSetupFee + totalAddOnCost * 3;
    var comm3Y = annualCommAllowance * 3;
    investment3Y = base3Y - comm3Y;
  }

  // 10) Direct network‑level ROI (no workflow/omni/SLA fluff)
  var directAnnualInvestment  = effectiveInvestmentYear1;
  var directMonthlyInvestment = directAnnualInvestment / 12;

  var directAnnualNet   = directRecoveredAnnual - directAnnualInvestment;
  var directMonthlyNet  = directAnnualNet / 12;

  var directRoiPercent  = directAnnualInvestment > 0
    ? (directAnnualNet / directAnnualInvestment) * 100
    : 0;

  var epsNorm = Math.max(50, 0.02 * directMonthlyInvestment);
  var profitabilityStateNorm;
  if (directMonthlyNet > epsNorm) {
    profitabilityStateNorm = 'profitable';
  } else if (directMonthlyNet < -epsNorm) {
    profitabilityStateNorm = 'unprofitable';
  } else {
    profitabilityStateNorm = 'breakeven';
  }

  // 10b) Break‑even metrics (network cost vs per‑location inputs)
  var leadsPerMonthNorm = base.leadsPerMonth;
  var dealValueNorm     = base.dealValue;
  var missedRateNorm    = (base.missedRatePct || 0) / 100;
  var closeRateNorm     = (base.closeRatePct  || 0) / 100;
  var aiRateNorm        = effectiveAiRate;

  var valuePerLeadNorm  = missedRateNorm * dealValueNorm * closeRateNorm * aiRateNorm;

  var beLeadsNorm     = null;
  var beDealValueNorm = null;
  var beClosePctNorm  = null;

  if (valuePerLeadNorm > 0 && numLocations > 0) {
    beLeadsNorm = Math.ceil(directMonthlyInvestment / (valuePerLeadNorm * numLocations));
  }

  var denomDealNorm = leadsPerMonthNorm * missedRateNorm * closeRateNorm * aiRateNorm * numLocations;
  if (denomDealNorm > 0) {
    beDealValueNorm = directMonthlyInvestment / denomDealNorm;
    if (beDealValueNorm > 1000000) {
      beDealValueNorm = null;
    }
  }

  var denomCloseNorm = leadsPerMonthNorm * missedRateNorm * dealValueNorm * aiRateNorm * numLocations;
  if (denomCloseNorm > 0) {
    var neededCloseRateNorm = directMonthlyInvestment / denomCloseNorm;
    var pctNorm = neededCloseRateNorm * 100;
    if (pctNorm > 100 || pctNorm < 0) {
      pctNorm = null;
    }
    beClosePctNorm = pctNorm;
  }

  // 10c) Network‑level cost of waiting (revenue‑based)
  var costOfWaitingNetwork = {
    perMonth:     Math.round(directRecoveredMonthly),
    threeMonths:  Math.round(directRecoveredMonthly * 3),
    sixMonths:    Math.round(directRecoveredMonthly * 6),
    twelveMonths: Math.round(directRecoveredMonthly * 12)
  };

  var cashFlowNetwork = {
    netMonthly: Math.round(directMonthlyNet),
    year1Net:   Math.round(directAnnualNet)
  };

  // 11) Extended total value and net (value stack)
  var totalValue1Y =
    liftedRecoveredAnnual +
    annualWorkflowSavings +
    channelBoostValue +
    annualSLAValue +
    totalAddOnValue;

  var totalValue3Y = null;
  if (timeHorizon === '3year' && retentionLTV) {
    totalValue3Y =
      retentionLTV.total3Year +
      annualWorkflowSavings * 3 +
      channelBoostValue * 3 +
      annualSLAValue * 3 +
      totalAddOnValue * 3;
  }

  var net1Y = totalValue1Y - directAnnualInvestment;
  var net3Y = null;
  if (timeHorizon === '3year' && investment3Y != null && totalValue3Y != null) {
    net3Y = totalValue3Y - investment3Y;
  }

  var roi1Y = directAnnualInvestment > 0 ? (net1Y / directAnnualInvestment) * 100 : 0;
  var roi3Y = (timeHorizon === '3year' && investment3Y > 0 && net3Y != null)
    ? (net3Y / investment3Y) * 100
    : 0;

  // 11b) Normalized direct‑revenue ROI block (for UI consumption)
  var normalized = {
    annualInvestment:        directAnnualInvestment,
    monthlyInvestment:       directMonthlyInvestment,
    annualRecovered:         directRecoveredAnnual,
    monthlyRecovered:        directRecoveredMonthly,
    annualNetProfit:         directAnnualNet,
    monthlyNetProfit:        directMonthlyNet,
    roiPercent:              directRoiPercent,
    profitabilityState:      profitabilityStateNorm,
    breakEvenLeadsPerMonth:  beLeadsNorm,
    breakEvenDealValue:      beDealValueNorm,
    breakEvenCloseRatePct:   beClosePctNorm,
    cashFlow:                cashFlowNetwork
  };

  // 12) Return canonical direct metrics + extended stack + normalized block
  return {
    // Core inputs (per‑location)
    industryKey:        base.industryKey,
    leadsPerMonth:      base.leadsPerMonth,
    dealValue:          base.dealValue,
    missedRatePct:      base.missedRatePct,
    closeRatePct:       base.closeRatePct,
    responseTimeHours:  base.responseTimeHours,

    // Effective AI recovery (after vertical calibration)
    aiRecoveryRate:     effectiveAiRate,

    // Direct network‑level revenue (locations + annualized peak)
    revenueAtRiskAnnual:    directAtRiskAnnual,
    revenueRecoveredAnnual: directRecoveredAnnual,
    monthlyRecovered:       directRecoveredMonthly,

    // Direct network‑level investment & profitability (true Year‑1 cost)
    annualInvestment:       directAnnualInvestment,
    monthlyInvestment:      directMonthlyInvestment,
    annualNetProfit:        directAnnualNet,
    monthlyNetProfit:       directMonthlyNet,
    roiPercent:             directRoiPercent,
    profitabilityState:     profitabilityStateNorm,

    // Break‑even helpers (network cost vs per‑location economics)
    breakEvenLeadsPerMonth: beLeadsNorm,
    breakEvenDealValue:     beDealValueNorm,
    breakEvenCloseRatePct:  beClosePctNorm,

    // Time savings (scaled to locations)
    recoveredCallsAnnual:   base.recoveredCallsAnnual * numLocations,
    timeSavedHoursAnnual:   base.timeSavedHoursAnnual * numLocations,
    timeSavedValueAnnual:   base.timeSavedValueAnnual * numLocations,

    conversionLiftFactor:   base.conversionLiftFactor,
    costOfWaiting:          costOfWaitingNetwork,
    cashFlow:               cashFlowNetwork,
    warnings:               base.warnings || [],

    // Extended economic value stack
    extended: {
      inputs: {
        numLocations:            numLocations,
        commitmentType:          commitmentType,
        isPeakSeason:            isPeakSeason,
        peakSurgeMultiplier:     peakSurgeInput,
        peakAnnualFactor:        peakAnnualFactor,
        conversionLiftFactor:    conversionLiftFactor,
        retentionImprovement:    retentionImprovement,
        workflowCount:           workflowCount,
        workflowSavingsPerMonth: workflowSavingsPerMonth,
        channelCount:            channelCount,
        channelBoostPerChannel:  channelBoostPerChannel,
        supportHours:            supportHours,
        downtimeRiskPerHour:     downtimeRiskPerHour,
        commAllowanceMonthly:    commAllowanceMonthly,
        annualDiscount:          annualDiscount,
        sixMonthDiscount:        sixMonthDiscount,
        timeHorizon:             timeHorizon
      },

      atRiskAnnualAdjusted:        adjustedAtRiskAnnual,
      baseRecoveredAnnualExtended: extendedBaseRecoveredAnnual,
      liftedRecoveredAnnual:       liftedRecoveredAnnual,

      retentionLTV: retentionLTV,

      workflow: {
        workflows:     workflowCount,
        annualSavings: annualWorkflowSavings
      },

      channel: {
        channelCount:        channelCount,
        additionalChannels:  additionalChannels,
        reachabilityBoost:   reachabilityBoost,
        channelBoostValue:   channelBoostValue
      },

      sla: {
        supportHours:     supportHours,
        baselineHours:    baselineHours,
        riskHoursReduced: riskHoursReduced,
        annualSLAValue:   annualSLAValue
      },

      addOns: {
        totalAddOnCost:  totalAddOnCost,
        totalAddOnValue: totalAddOnValue
      },

      investment: {
        monthlyBase:              monthlyBase,
        monthlyAdditional:        monthlyAdditional,
        totalMonthly:             totalMonthly,
        annualRecurring:          annualRecurring,
        setupFee:                 finalSetupFee,
        annualCommAllowance:      annualCommAllowance,
        totalInvestmentYear1:     totalInvestmentYear1,
        effectiveInvestmentYear1: effectiveInvestmentYear1,
        investment3Y:             investment3Y
      },

      totals: {
        totalValue1Y: totalValue1Y,
        totalValue3Y: totalValue3Y,
        net1Y:        net1Y,
        net3Y:        net3Y,
        roi1Y:        roi1Y,
        roi3Y:        roi3Y
      }
    },

    // Normalized direct‑revenue ROI (mirror of direct network metrics)
    normalized: normalized
  };
}

// ---------------------------------------------------------------------------
// CLASSIFIER & UPGRADE PATHS
// ---------------------------------------------------------------------------

/**
 * Scenario classifier – prefer normalized state if present.
 */
function classifyScenario(result) {
  if (result && result.normalized && result.normalized.profitabilityState) {
    return result.normalized.profitabilityState;
  }
  return result.profitabilityState || 'breakeven';
}

/**
 * Suggest numeric targets to hit break-even or profitability.
 * Uses normalized metrics when available.
 */
function getUpgradePaths(result, inputs) {
  var metrics = result && result.normalized ? result.normalized : result;
  var suggestions = [];

  if (!metrics) return suggestions;

  if (metrics.profitabilityState === 'profitable') {
    return suggestions;
  }

  if (metrics.breakEvenLeadsPerMonth != null) {
    suggestions.push({
      type: 'leads',
      target: metrics.breakEvenLeadsPerMonth,
      unit: 'leads/month'
    });
  }

  if (metrics.breakEvenDealValue != null) {
    suggestions.push({
      type: 'dealValue',
      target: Math.round(metrics.breakEvenDealValue),
      unit: 'USD/lead'
    });
  }

  if (metrics.breakEvenCloseRatePct != null) {
    suggestions.push({
      type: 'closeRate',
      target: Math.round(metrics.breakEvenCloseRatePct),
      unit: '%'
    });
  }

  return suggestions;
}

// ---------------------------------------------------------------------------
// VOLUME VIABILITY CHECKING
// ---------------------------------------------------------------------------

/**
 * Check if current lead volume meets minimum viable threshold for positive ROI.
 *
 * Compares user's input volume against both:
 *  1. Minimum viable volume (where tier becomes marginally profitable)
 *  2. Optimal volume (150% ROI target for healthy margin)
 *
 * @param {object} inputs - Same inputs used for calculateROI
 * @param {object} result - Result from calculateROI (optional, will calculate if not provided)
 * @returns {object} Volume viability assessment with recommendations
 */
function checkVolumeViability(inputs, result) {
  if (!result) {
    result = calculateROI(inputs);
  }

  var industryKey = inputs.industryKey || 'unknown';
  var currentLeads = Number(inputs.leadsPerMonth) || 0;
  var tierKey = (inputs.tierKey || 'core').toLowerCase();

  var minViableLeads = swGetMinViableLeads(industryKey);

  var normalized = result.normalized || {};
  var monthlyInvestment = normalized.monthlyInvestment || result.monthlyInvestment || 0;

  var targetMonthlyRecovery = monthlyInvestment * 1.5;

  var dealValue = Number(inputs.dealValue) || 0;
  var missedRate = (Number(inputs.missedRatePct) || 0) / 100;
  var closeRate = (Number(inputs.closeRatePct) || 0) / 100;
  var aiRecoveryRate = result.aiRecoveryRate || 0;

  var valuePerLead = missedRate * dealValue * closeRate * aiRecoveryRate;

  var optimalLeads = 0;
  var breakevenLeads = 0;

  if (valuePerLead > 0) {
    optimalLeads = Math.ceil(targetMonthlyRecovery / valuePerLead);
    breakevenLeads = Math.ceil(monthlyInvestment / valuePerLead);
  }

  var severity = 'ok';
  var isViable = currentLeads >= minViableLeads;
  var isBelowBreakeven = currentLeads < breakevenLeads;
  var isBelowOptimal = currentLeads < optimalLeads;

  if (isBelowBreakeven) {
    severity = 'critical';  // Negative ROI expected
  } else if (!isViable || isBelowOptimal) {
    severity = 'warning';   // Positive but suboptimal ROI
  }

  var volumeGapPercent = 0;
  if (minViableLeads > 0 && currentLeads < minViableLeads) {
    volumeGapPercent = Math.round(((minViableLeads - currentLeads) / minViableLeads) * 100);
  }

  return {
    isViable: isViable,
    isBelowBreakeven: isBelowBreakeven,
    isBelowOptimal: isBelowOptimal,

    currentLeads: currentLeads,
    minViableLeads: Math.ceil(minViableLeads),
    breakevenLeads: Math.ceil(breakevenLeads),
    optimalLeads: Math.ceil(optimalLeads),

    volumeGapPercent: volumeGapPercent,
    severity: severity,

    industryKey: industryKey,
    tierKey: tierKey,
    monthlyInvestment: monthlyInvestment
  };
}

// ---------------------------------------------------------------------------
// TIER POSITIONING (PURE CAPABILITY MODEL) & RECOMMENDER
// ---------------------------------------------------------------------------

/**
 * Tier positioning and capability descriptions (pure capability model).
 *
 * Location count is NOT a primary differentiator — all tiers support
 * multi-location via volume pricing. Tiers differentiate on capabilities.
 */
var SW_TIER_POSITIONING = {
  core: {
    key: 'core',
    name: 'Response AI',
    tagline: 'Essential Revenue Recovery',
    description: 'AI-powered missed call recovery with SMS follow-up and basic appointment booking.',
    capabilities: [
      '24/7 missed call → SMS recovery',
      'Basic appointment booking',
      'Standard follow-up sequences',
      'Call intelligence & transcription'
    ],
    bestFor: 'Businesses needing reliable lead capture without complexity.',
    typical: 'Single-location practices, solo contractors, early-stage teams.',
    recoveryRate: 0.60
  },

  growth: {
    key: 'growth',
    name: 'Revenue AI',
    tagline: 'Advanced Multi-Channel Automation',
    description: 'Deep CRM integration with coordinated SMS, email, and voice campaigns.',
    capabilities: [
      'Everything in Response AI',
      'CRM integration (ServiceTitan, Salesforce, HubSpot, etc.)',
      'Multi-channel coordination (SMS + email + voice)',
      'Smart routing & lead prioritization',
      'Advanced analytics & reporting'
    ],
    bestFor: 'Businesses with existing systems that need comprehensive automation.',
    typical: 'Growing practices with CRM, established contractors, multi-location businesses.',
    recoveryRate: 0.73,
    upgradeFrom: 'core',
    upgradeTriggers: [
      'You have an existing CRM that should drive automation.',
      'You need SMS + email + voice coordinated, not just SMS.',
      'You require advanced lead routing and prioritization.'
    ]
  },

  scale: {
    key: 'scale',
    name: 'Shockwave OS',
    tagline: 'Custom Competitive Moats',
    description: 'Unlimited custom workflows tailored to your unique processes and competitive positioning.',
    capabilities: [
      'Everything in Revenue AI',
      'Unlimited custom workflow design',
      'Competitive differentiation automation',
      'Tailored client journey mapping',
      'Advanced conditional logic & branching',
      'Custom integrations & APIs'
    ],
    bestFor: 'Businesses in competitive markets or with complex, unique operational needs.',
    typical: 'High-value practices, crowded markets, teams with unique processes.',
    recoveryRate: 0.86,
    upgradeFrom: 'growth',
    upgradeTriggers: [
      'You operate in a highly competitive market (10+ direct competitors).',
      'You have unique processes that generic tools can’t model.',
      'You need white-glove experiences for high-value clients.'
    ]
  },

  enterprise: {
    key: 'enterprise',
    name: 'Network Intelligence',
    tagline: 'Multi-Location Orchestration',
    description: 'Centralized routing, load balancing, and cross-location analytics for unified operations.',
    capabilities: [
      'Everything in Shockwave OS',
      'Centralized call routing across locations',
      'Intelligent load balancing',
      'Cross-location analytics & dashboards',
      'Enterprise governance & compliance controls',
      'Franchise-level reporting',
      'Multi-brand portfolio support'
    ],
    bestFor: 'Multi-location businesses requiring unified operations and central control.',
    typical: 'Franchises, multi-brand portfolios, regional chains, corporate ops.',
    recoveryRate: 0.92,
    minRecommendedLocations: 5,
    upgradeFrom: 'scale',
    upgradeTriggers: [
      'You have 5+ locations that would benefit from centralized coordination.',
      'You need cross-location routing and intelligent load balancing.',
      'You require enterprise governance, compliance, and unified analytics.'
    ]
  }
};

/**
 * Get tier positioning metadata by key.
 *
 * @param {string} tierKey - 'core' | 'growth' | 'scale' | 'enterprise'
 * @returns {object} positioning metadata
 */
function swGetTierPositioning(tierKey) {
  var key = (tierKey || '').toLowerCase();
  return SW_TIER_POSITIONING[key] || SW_TIER_POSITIONING.core;
}

/**
 * Recommend optimal tier based on business profile (capability-based, not pure location-based).
 *
 * This does NOT look at ROI math. It’s a heuristic based on:
 *  - numLocations
 *  - CRM presence
 *  - competitive intensity
 *  - need for custom workflows
 *  - revenue & volume
 *
 * UI should still sanity-check this against ROI (5× bar) before "hard recommending" a tier.
 *
 * @param {object} inputs - Business profile inputs:
 *   - numLocations: number
 *   - hasExistingCRM: boolean
 *   - isCompetitiveMarket: boolean
 *   - needsCustomWorkflows: boolean
 *   - monthlyRevenue: number
 *   - leadsPerMonth: number
 * @returns {object} Recommendation with { tier, reason, confidence, message, alternative?, upgrade? }
 */
function swRecommendTier(inputs) {
  var numLocations       = Math.max(1, Number(inputs.numLocations) || 1);
  var hasExistingCRM     = !!inputs.hasExistingCRM;
  var isCompetitive      = !!inputs.isCompetitiveMarket;
  var needsCustom        = !!inputs.needsCustomWorkflows;
  var monthlyRevenue     = Number(inputs.monthlyRevenue) || 0;
  var leadsPerMonth      = Number(inputs.leadsPerMonth) || 0;

  // 1) Network Intelligence → multi-location orchestration needs
  if (numLocations >= 5) {
    return {
      tier: 'enterprise',
      reason: 'Multi-location orchestration',
      confidence: 'high',
      message:
        'With ' + numLocations +
        ' locations, Network Intelligence provides centralized routing, load balancing, and cross-location analytics that standard tiers cannot.',
      alternative: {
        tier: 'scale',
        reason: 'Shockwave OS works if each location can operate more independently without network-wide coordination.'
      }
    };
  }

  // 2) Shockwave OS → custom workflows or competitive differentiation
  if (needsCustom || isCompetitive || monthlyRevenue >= 200000) {
    var reasons = [];
    if (isCompetitive) reasons.push('a highly competitive market');
    if (needsCustom)   reasons.push('custom workflow requirements');
    if (monthlyRevenue >= 200000) reasons.push('high monthly revenue that justifies deeper automation');

    return {
      tier: 'scale',
      reason: 'Custom competitive advantage',
      confidence: reasons.length >= 2 ? 'high' : 'medium',
      message:
        'Your ' + reasons.join(' and ') +
        ' justify unlimited custom workflows that create a durable competitive moat beyond generic automation.',
      alternative: {
        tier: 'growth',
        reason: 'Revenue AI is enough if standard workflows and CRM integration cover your needs.'
      }
    };
  }

  // 3) Revenue AI → needs system integration & higher-volume coordination
  if (hasExistingCRM || numLocations >= 3 || leadsPerMonth >= 200) {
    var growthReasons = [];
    if (hasExistingCRM) growthReasons.push('an existing CRM');
    if (numLocations >= 3) growthReasons.push(numLocations + ' locations');
    if (leadsPerMonth >= 200) growthReasons.push('higher lead volume');

    return {
      tier: 'growth',
      reason: 'System integration depth',
      confidence: hasExistingCRM ? 'high' : 'medium',
      message:
        'Your ' + growthReasons.join(' and ') +
        ' justify advanced multi-channel automation with deep CRM integration.',
      alternative: {
        tier: 'core',
        reason: 'Response AI is enough if you prefer a simple, standalone automation layer.'
      }
    };
  }

  // 4) Response AI → default for straightforward needs
  return {
    tier: 'core',
    reason: 'Essential lead capture',
    confidence: 'high',
    message:
      'Start on Response AI to reliably capture missed calls and prove AI ROI without added complexity. ' +
      'Upgrade once you add a CRM or need multi-channel coordination.',
    upgrade: {
      tier: 'growth',
      when: 'Upgrade to Revenue AI when you introduce a CRM or want SMS + email + voice orchestrated from one brain.'
    }
  };
}

// ---------------------------------------------------------------------------
// CENTRALIZED TIER RISK BANDING & PICKER
// ---------------------------------------------------------------------------

/**
 * Tier bands by monthly at-risk revenue.
 *
 * This is the ONLY place we define:
 *   "$X at risk → tier Y and price label Z"
 *
 * All UI (ROI calculator, live demo, decks, etc.) should
 * go through swPickTierForRisk() instead of hard-coding.
 */
var SW_TIER_BANDS_BY_RISK = [
  {
    key: 'core',       // Response AI
    minRisk: 0,
    maxRisk: 10000,
    priceLabel: '$3,000–$4,000/mo'
  },
  {
    key: 'growth',     // Revenue AI
    minRisk: 10000,
    maxRisk: 30000,
    priceLabel: '$6,000–$7,000/mo'
  },
  {
    key: 'scale',      // Shockwave OS
    minRisk: 30000,
    maxRisk: 75000,
    priceLabel: '$9,000–$12,000/mo'
  },
  {
    key: 'enterprise', // Network Intelligence
    minRisk: 75000,
    maxRisk: Infinity,
    priceLabel: '$15,000+/mo'
  }
];

/**
 * Pick a tier based on MONTHLY at-risk revenue.
 *
 * @param {number} monthlyAtRisk
 * @returns {{
 *   id: 'core'|'growth'|'scale'|'enterprise',
 *   key: string,
 *   name: string,
 *   tagline: string|null,
 *   description: string,
 *   priceLabel: string
 * }}
 */
function swPickTierForRisk(monthlyAtRisk) {
  var risk = (!monthlyAtRisk || !isFinite(monthlyAtRisk)) ? 0 : monthlyAtRisk;

  var band = null;
  for (var i = 0; i < SW_TIER_BANDS_BY_RISK.length; i++) {
    var b = SW_TIER_BANDS_BY_RISK[i];
    if (risk >= b.minRisk && risk < b.maxRisk) {
      band = b;
      break;
    }
  }
  if (!band) {
    band = SW_TIER_BANDS_BY_RISK[0];
  }

  var positioning = null;
  try {
    positioning = swGetTierPositioning(band.key);
  } catch (e) {
    positioning = null;
  }

  var fallbackNames = {
    core: 'Response AI',
    growth: 'Revenue AI',
    scale: 'Shockwave OS',
    enterprise: 'Network Intelligence'
  };

  return {
    id: band.key,
    key: band.key,
    name: positioning && positioning.name
      ? positioning.name
      : (fallbackNames[band.key] || 'Shockwave AI'),
    tagline: positioning && positioning.tagline ? positioning.tagline : null,
    description:
      (positioning && positioning.description) ||
      'AI-powered revenue recovery tuned to your volume and complexity.',
    priceLabel: band.priceLabel
  };
}

// ---------------------------------------------------------------------------
// GLOBAL EXPORTS FOR BUNDLED / GHL ENVIRONMENTS
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.calculateROI = calculateROI;
  window.classifyScenario = classifyScenario;
  window.getUpgradePaths = getUpgradePaths;
  window.checkVolumeViability = checkVolumeViability;
  window.swGetTierPositioning = swGetTierPositioning;
  window.swPickTierForRisk = swPickTierForRisk;
  window.getTierRecoveryBenchmarks = getTierRecoveryBenchmarks;
  window.swRecommendTier = swRecommendTier;
}
