/**
 * Decision Scoring Engine for YUG NIRMAN City Action Planner
 * Implements Multi-Criteria Decision Analysis (MCDA) with:
 * - Transparent weight normalization (sum = 1.0)
 * - Directional alignment (cost & effort inverted so higher score = better decision outcome)
 * - Explicit missing data handling (flags provisional or unavailable rankings without silent zeroing)
 * - Traceable score breakdown and explainable ranking justifications
 */

export const DEFAULT_CRITERIA_WEIGHTS = {
  expectedBenefit: 0.25,
  cost: 0.20,            // Inverted to affordability in scoring
  urgency: 0.15,
  feasibility: 0.15,
  environmentalImpact: 0.15,
  evidenceConfidence: 0.10,
};

export const CRITERIA_METADATA = {
  expectedBenefit: {
    label: "Expected Benefit",
    description: "Projected magnitude of urban problem reduction",
    isHigherBetter: true,
  },
  cost: {
    label: "Affordability / Cost Efficiency",
    description: "Lower financial CapEx/OpEx outlay scores higher in affordability",
    isHigherBetter: false, // Inverted: lower cost -> higher score
  },
  urgency: {
    label: "Urgency",
    description: "Critical need based on health, safety, and regulatory thresholds",
    isHigherBetter: true,
  },
  feasibility: {
    label: "Feasibility",
    description: "Ease of regulatory approval, technology readiness, and administrative capacity",
    isHigherBetter: true,
  },
  environmentalImpact: {
    label: "Environmental Impact",
    description: "Co-benefits for air, carbon, biodiversity, and urban climate",
    isHigherBetter: true,
  },
  evidenceConfidence: {
    label: "Evidence Confidence",
    description: "Data quality, observation freshness, and source reliability",
    isHigherBetter: true,
  },
};

/**
 * Normalizes input weights so they sum to exactly 1.0.
 * Falls back to uniform distribution if all weights are zero or invalid.
 */
export function normalizeWeights(weights = {}) {
  const keys = Object.keys(DEFAULT_CRITERIA_WEIGHTS);
  const numericWeights = {};
  let total = 0;

  for (const key of keys) {
    const raw = weights[key];
    const val = typeof raw === "number" && Number.isFinite(raw) && raw >= 0 ? raw : 0;
    numericWeights[key] = val;
    total += val;
  }

  if (total <= 0) {
    const uniform = 1 / keys.length;
    return Object.fromEntries(keys.map((k) => [k, uniform]));
  }

  return Object.fromEntries(keys.map((k) => [k, numericWeights[k] / total]));
}

/**
 * Clamps a number to a bounded range [min, max].
 */
export function clamp(value, min = 0, max = 100) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Math.min(max, Math.max(min, Number(value)));
}

/**
 * Normalizes an individual raw criterion value to a 0-100 scale.
 * If isHigherBetter is false (e.g. Cost), 0 cost -> 100 score, 100 cost -> 0 score.
 */
export function normalizeCriterionScore(criterionKey, rawValue) {
  if (rawValue == null || !Number.isFinite(Number(rawValue))) {
    return null;
  }

  const clamped = clamp(rawValue, 0, 100);
  const metadata = CRITERIA_METADATA[criterionKey];

  if (metadata && !metadata.isHigherBetter) {
    // Invert: lower raw cost/effort -> higher affordability/ease score
    return 100 - clamped;
  }

  return clamped;
}

/**
 * Calculates the weighted score and breakdown for a single candidate action.
 * Returns { score, breakdown, missingCriteria, isProvisional, status }
 */
export function calculateActionScore(action, customWeights = {}) {
  if (!action || typeof action !== "object") {
    return {
      score: null,
      breakdown: {},
      missingCriteria: Object.keys(DEFAULT_CRITERIA_WEIGHTS),
      isProvisional: false,
      status: "UNAVAILABLE",
      reason: "Action data missing or malformed",
    };
  }

  const normalizedWeights = normalizeWeights(customWeights);
  const criteriaKeys = Object.keys(DEFAULT_CRITERIA_WEIGHTS);
  const rawScores = action.scores || {};
  const breakdown = {};
  const missingCriteria = [];

  let weightedSum = 0;
  let activeWeightSum = 0;

  for (const key of criteriaKeys) {
    const rawVal = rawScores[key];
    const normalizedVal = normalizeCriterionScore(key, rawVal);

    if (normalizedVal == null) {
      missingCriteria.push(key);
      breakdown[key] = {
        raw: null,
        normalized: null,
        weight: normalizedWeights[key],
        weightedContribution: null,
        isMissing: true,
      };
    } else {
      const weight = normalizedWeights[key];
      const contribution = normalizedVal * weight;
      weightedSum += contribution;
      activeWeightSum += weight;

      breakdown[key] = {
        raw: rawVal,
        normalized: normalizedVal,
        weight,
        weightedContribution: Number(contribution.toFixed(2)),
        isMissing: false,
      };
    }
  }

  // If more than half the criteria are missing, do not guess a score
  if (missingCriteria.length > criteriaKeys.length / 2 || activeWeightSum <= 0) {
    return {
      score: null,
      breakdown,
      missingCriteria,
      isProvisional: false,
      status: "UNAVAILABLE",
      reason: `Insufficient data: ${missingCriteria.length} of ${criteriaKeys.length} criteria lack verified inputs.`,
    };
  }

  // Re-scale weighted sum across available weights to prevent artificial penalization
  const rescaledScore = Number((weightedSum / activeWeightSum).toFixed(1));
  const isProvisional = missingCriteria.length > 0;

  return {
    score: rescaledScore,
    breakdown,
    missingCriteria,
    isProvisional,
    status: isProvisional ? "PROVISIONAL" : "SCORED",
    coverageRatio: Number(((criteriaKeys.length - missingCriteria.length) / criteriaKeys.length).toFixed(2)),
  };
}

/**
 * Generates an explainable English justification comparing the top-ranked action with alternatives.
 */
export function generateRankingExplanation(rankedActions) {
  if (!rankedActions || rankedActions.length === 0) {
    return "No candidate actions available to rank.";
  }

  const validRanked = rankedActions.filter((a) => a.evaluation.score != null);
  if (validRanked.length === 0) {
    return "None of the candidate actions have sufficient criteria data to establish a reliable ranking.";
  }

  const top = validRanked[0];
  if (validRanked.length === 1) {
    return `${top.title} is the sole supported action with a decision score of ${top.evaluation.score}/100.`;
  }

  const runnerUp = validRanked[1];
  const delta = (top.evaluation.score - runnerUp.evaluation.score).toFixed(1);

  // Identify which criteria gave the top action its largest relative advantage
  const criteriaDeltas = [];
  for (const key of Object.keys(DEFAULT_CRITERIA_WEIGHTS)) {
    const topContrib = top.evaluation.breakdown[key]?.weightedContribution ?? 0;
    const runnerContrib = runnerUp.evaluation.breakdown[key]?.weightedContribution ?? 0;
    const diff = topContrib - runnerContrib;
    if (diff > 0.5) {
      criteriaDeltas.push({ key, diff, label: CRITERIA_METADATA[key]?.label || key });
    }
  }

  criteriaDeltas.sort((a, b) => b.diff - a.diff);
  const leadingDrivers = criteriaDeltas.slice(0, 2).map((d) => d.label).join(" and ");

  let explanation = `${top.title} ranks highest with a composite score of ${top.evaluation.score}/100 (+${delta} pts ahead of ${runnerUp.title}).`;

  if (leadingDrivers) {
    explanation += ` Its ranking is primarily driven by stronger performance in ${leadingDrivers}.`;
  }

  if (top.evaluation.isProvisional) {
    explanation += ` Note: This ranking is provisional because ${top.evaluation.missingCriteria.join(", ")} data was unavailable and normalized across remaining indicators.`;
  }

  return explanation;
}

/**
 * Evaluates, ranks, and annotates a list of candidate actions.
 */
export function rankActions(actions = [], customWeights = {}) {
  if (!Array.isArray(actions)) return { rankedActions: [], topAction: null, explanation: "No actions", normalizedWeights: {} };

  const evaluated = actions.map((action) => {
    const evaluation = calculateActionScore(action, customWeights);
    return {
      ...action,
      evaluation,
    };
  });

  // Sort descending by score; null scores at bottom
  evaluated.sort((a, b) => {
    const scoreA = a.evaluation.score;
    const scoreB = b.evaluation.score;
    if (scoreA == null && scoreB == null) return 0;
    if (scoreA == null) return 1;
    if (scoreB == null) return -1;
    return scoreB - scoreA;
  });

  const explanation = generateRankingExplanation(evaluated);

  return {
    rankedActions: evaluated,
    topAction: evaluated.find((a) => a.evaluation.score != null) || null,
    explanation,
    normalizedWeights: normalizeWeights(customWeights),
  };
}
