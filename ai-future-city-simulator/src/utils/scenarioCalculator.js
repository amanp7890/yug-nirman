/**
 * Scenario Calculation Engine for YUG NIRMAN
 * Provides transparent, testable multi-scenario comparisons:
 * - Current Baseline
 * - Action A
 * - Action B
 * - Combined Action (with realistic synergy and diminishing returns)
 * Computes absolute and percentage changes, directionality checks, and limits.
 */

export const METRIC_DIRECTIONS = {
  traffic: { label: "Traffic Congestion", unit: "points", lowerIsBetter: true },
  aqi: { label: "Air Quality Index", unit: "AQI pts", lowerIsBetter: true },
  pm25: { label: "Particulate Matter PM2.5", unit: "µg/m³", lowerIsBetter: true },
  greenCover: { label: "Green Canopy Cover", unit: "%", lowerIsBetter: false },
  energyDemand: { label: "Energy Grid Load", unit: "MW", lowerIsBetter: true },
  waterDemand: { label: "Water Consumption", unit: "MLD", lowerIsBetter: true },
};

/**
 * Calculates absolute and percentage difference safely.
 * Avoids division by zero or NaN.
 */
export function calculateDelta(baseline, outcome, lowerIsBetter = true) {
  if (baseline == null || outcome == null || !Number.isFinite(baseline) || !Number.isFinite(outcome)) {
    return {
      absolute: null,
      percent: null,
      isImprovement: null,
      status: "UNAVAILABLE",
    };
  }

  const absolute = Number((outcome - baseline).toFixed(2));
  let percent = null;

  if (baseline !== 0) {
    percent = Number(((absolute / Math.abs(baseline)) * 100).toFixed(1));
  }

  const isImprovement = lowerIsBetter ? absolute < 0 : absolute > 0;

  return {
    absolute,
    percent,
    isImprovement,
    status: "CALCULATED",
  };
}

/**
 * Evaluates an action effect on baseline metrics.
 * actionLevers format: { traffic: -12, aqi: -15, greenCover: +4, capex: 45 }
 */
export function calculateScenarioOutcome(baseline = {}, action = {}) {
  const levers = action.levers || {};
  const metrics = {};

  for (const [key, meta] of Object.entries(METRIC_DIRECTIONS)) {
    const baseVal = baseline[key];
    const deltaShift = levers[key];

    if (baseVal == null || !Number.isFinite(baseVal)) {
      metrics[key] = {
        baseline: null,
        outcome: null,
        delta: { absolute: null, percent: null, isImprovement: null, status: "UNAVAILABLE" },
        unit: meta.unit,
        label: meta.label,
      };
      continue;
    }

    if (deltaShift == null || !Number.isFinite(deltaShift)) {
      // Metric unchanged by this action
      metrics[key] = {
        baseline: baseVal,
        outcome: baseVal,
        delta: { absolute: 0, percent: 0, isImprovement: false, status: "UNCHANGED" },
        unit: meta.unit,
        label: meta.label,
      };
      continue;
    }

    // Apply lever clamp (non-negative outcomes for physical metrics)
    const rawOutcome = baseVal + deltaShift;
    const clampedOutcome = Math.max(0, Number(rawOutcome.toFixed(2)));
    const delta = calculateDelta(baseVal, clampedOutcome, meta.lowerIsBetter);

    metrics[key] = {
      baseline: baseVal,
      outcome: clampedOutcome,
      delta,
      unit: meta.unit,
      label: meta.label,
    };
  }

  return {
    actionId: action.id || "action",
    actionTitle: action.title || "Proposed Action",
    capexOutlayMillion: action.capexMillion ?? null,
    implementationYears: action.implementationYears ?? null,
    metrics,
    assumptions: action.assumptions || ["Linear policy elasticity calibrated to municipal profile data."],
    limitations: action.limitations || ["Illustrative simulation estimate, not a guaranteed empirical guarantee."],
  };
}

/**
 * Calculates a combined scenario of two actions with non-linear diminishing returns.
 * In municipal planning, combining two traffic interventions yields ~85% of combined additive effect.
 */
export function calculateCombinedScenario(baseline = {}, actionA = {}, actionB = {}, synergyFactor = 0.85) {
  const combinedLevers = {};
  const allKeys = new Set([
    ...Object.keys(actionA.levers || {}),
    ...Object.keys(actionB.levers || {}),
  ]);

  for (const key of allKeys) {
    const shiftA = actionA.levers?.[key] ?? 0;
    const shiftB = actionB.levers?.[key] ?? 0;

    if (shiftA !== 0 && shiftB !== 0) {
      // Diminishing returns on overlapping interventions
      combinedLevers[key] = Number(((shiftA + shiftB) * synergyFactor).toFixed(2));
    } else {
      combinedLevers[key] = shiftA !== 0 ? shiftA : shiftB;
    }
  }

  const combinedAction = {
    id: `combined-${actionA.id || "a"}-${actionB.id || "b"}`,
    title: `Combined: ${actionA.title || "Action A"} + ${actionB.title || "Action B"}`,
    capexMillion: (actionA.capexMillion ?? 0) + (actionB.capexMillion ?? 0),
    implementationYears: Math.max(actionA.implementationYears ?? 1, actionB.implementationYears ?? 1),
    levers: combinedLevers,
    assumptions: [
      `Applies ${Math.round(synergyFactor * 100)}% synergy factor to account for overlapping policy interactions.`,
      "Cumulative capital outlay aggregated across both intervention budgets.",
    ],
    limitations: [
      "Simultaneous execution introduces scheduling and administrative coordination risks.",
    ],
  };

  return calculateScenarioOutcome(baseline, combinedAction);
}

/**
 * Runs complete scenario matrix: Baseline vs Action A vs Action B vs Combined
 */
export function runScenarioMatrix(baseline = {}, actionA = {}, actionB = {}) {
  const evalA = calculateScenarioOutcome(baseline, actionA);
  const evalB = calculateScenarioOutcome(baseline, actionB);
  const evalCombined = calculateCombinedScenario(baseline, actionA, actionB);

  return {
    baseline,
    actionA: evalA,
    actionB: evalB,
    combined: evalCombined,
    timestamp: new Date().toISOString(),
  };
}
