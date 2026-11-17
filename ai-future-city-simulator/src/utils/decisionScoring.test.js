import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CRITERIA_WEIGHTS,
  normalizeWeights,
  normalizeCriterionScore,
  calculateActionScore,
  rankActions,
  generateRankingExplanation,
} from "./decisionScoring.js";

describe("decisionScoring engine", () => {
  it("normalizes weights to sum to 1.0", () => {
    const raw = {
      expectedBenefit: 50,
      cost: 50,
      urgency: 0,
      feasibility: 0,
      environmentalImpact: 0,
      evidenceConfidence: 0,
    };
    const normalized = normalizeWeights(raw);
    const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1.0) < 0.0001);
    assert.strictEqual(Number(normalized.expectedBenefit.toFixed(2)), 0.5);
    assert.strictEqual(Number(normalized.cost.toFixed(2)), 0.5);
  });

  it("falls back to uniform distribution when all weights are zero or missing", () => {
    const normalized = normalizeWeights({});
    const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1.0) < 0.0001);
    const count = Object.keys(DEFAULT_CRITERIA_WEIGHTS).length;
    for (const key of Object.keys(DEFAULT_CRITERIA_WEIGHTS)) {
      assert.strictEqual(Number(normalized[key].toFixed(4)), Number((1 / count).toFixed(4)));
    }
  });

  it("normalizes criteria scores and inverts cost properly", () => {
    // expectedBenefit (higher is better): 80 -> 80
    assert.strictEqual(normalizeCriterionScore("expectedBenefit", 80), 80);
    // cost (lower is better): raw cost 30 -> affordability score 70
    assert.strictEqual(normalizeCriterionScore("cost", 30), 70);
    // null or invalid -> null
    assert.strictEqual(normalizeCriterionScore("expectedBenefit", null), null);
    assert.strictEqual(normalizeCriterionScore("cost", "invalid"), null);
    // clamps within 0-100
    assert.strictEqual(normalizeCriterionScore("expectedBenefit", 150), 100);
    assert.strictEqual(normalizeCriterionScore("cost", -20), 100);
  });

  it("calculates weighted action score and handles missing criteria without silent zeroing", () => {
    const completeAction = {
      id: "action-1",
      title: "Low Emission Zone",
      scores: {
        expectedBenefit: 80,
        cost: 40,            // Inverted -> 60
        urgency: 70,
        feasibility: 90,
        environmentalImpact: 85,
        evidenceConfidence: 80,
      },
    };

    const evaluation = calculateActionScore(completeAction, DEFAULT_CRITERIA_WEIGHTS);
    assert.strictEqual(evaluation.status, "SCORED");
    assert.strictEqual(evaluation.isProvisional, false);
    assert.strictEqual(evaluation.missingCriteria.length, 0);
    assert.ok(evaluation.score > 70 && evaluation.score < 85);

    // With 1 missing criterion: should be marked PROVISIONAL and rescaled, not penalized to zero
    const actionWithMissing = {
      id: "action-2",
      title: "Green Corridor",
      scores: {
        expectedBenefit: 80,
        cost: 40,
        urgency: 70,
        feasibility: 90,
        environmentalImpact: 85,
        evidenceConfidence: null, // missing
      },
    };

    const evalWithMissing = calculateActionScore(actionWithMissing, DEFAULT_CRITERIA_WEIGHTS);
    assert.strictEqual(evalWithMissing.status, "PROVISIONAL");
    assert.strictEqual(evalWithMissing.isProvisional, true);
    assert.deepStrictEqual(evalWithMissing.missingCriteria, ["evidenceConfidence"]);
    // Score should be close to completeAction since remaining criteria are the same
    assert.ok(Math.abs(evalWithMissing.score - evaluation.score) < 5);

    // With more than half criteria missing: should be UNAVAILABLE
    const sparseAction = {
      id: "action-3",
      title: "Sparse Policy",
      scores: {
        expectedBenefit: 80,
        cost: null,
        urgency: null,
        feasibility: null,
        environmentalImpact: null,
      },
    };

    const sparseEval = calculateActionScore(sparseAction, DEFAULT_CRITERIA_WEIGHTS);
    assert.strictEqual(sparseEval.status, "UNAVAILABLE");
    assert.strictEqual(sparseEval.score, null);
  });

  it("ranks actions and generates an explainable justification", () => {
    const actions = [
      {
        id: "act-a",
        title: "BRT Signal Prioritization",
        scores: {
          expectedBenefit: 85,
          cost: 20, // Inverted -> 80
          urgency: 75,
          feasibility: 90,
          environmentalImpact: 80,
          evidenceConfidence: 85,
        },
      },
      {
        id: "act-b",
        title: "Highway Widening",
        scores: {
          expectedBenefit: 50,
          cost: 95, // Inverted -> 5
          urgency: 40,
          feasibility: 45,
          environmentalImpact: 20,
          evidenceConfidence: 60,
        },
      },
    ];

    const result = rankActions(actions, DEFAULT_CRITERIA_WEIGHTS);
    assert.strictEqual(result.rankedActions.length, 2);
    assert.strictEqual(result.topAction.id, "act-a");
    assert.ok(result.topAction.evaluation.score > result.rankedActions[1].evaluation.score);
    assert.ok(result.explanation.includes("BRT Signal Prioritization ranks highest"));
    assert.ok(result.explanation.includes("Highway Widening"));
  });
});
