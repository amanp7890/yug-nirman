import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDelta,
  calculateScenarioOutcome,
  calculateCombinedScenario,
  runScenarioMatrix,
} from "./scenarioCalculator.js";

describe("scenarioCalculator engine", () => {
  it("computes safe absolute and percentage deltas", () => {
    // Traffic improvement (lower is better): 70 -> 56 (-14 pts, -20.0%)
    const delta1 = calculateDelta(70, 56, true);
    assert.strictEqual(delta1.absolute, -14);
    assert.strictEqual(delta1.percent, -20.0);
    assert.strictEqual(delta1.isImprovement, true);

    // Green cover improvement (higher is better): 15 -> 18 (+3 pts, +20.0%)
    const delta2 = calculateDelta(15, 18, false);
    assert.strictEqual(delta2.absolute, 3);
    assert.strictEqual(delta2.percent, 20.0);
    assert.strictEqual(delta2.isImprovement, true);

    // Division by zero baseline protection
    const deltaZero = calculateDelta(0, 10, false);
    assert.strictEqual(deltaZero.absolute, 10);
    assert.strictEqual(deltaZero.percent, null);

    // Null safety
    const deltaNull = calculateDelta(null, 50, true);
    assert.strictEqual(deltaNull.status, "UNAVAILABLE");
    assert.strictEqual(deltaNull.absolute, null);
  });

  it("evaluates scenario outcome and clamps physical minimums to zero", () => {
    const baseline = {
      traffic: 65,
      aqi: 140,
      pm25: 75,
      greenCover: 18,
      energyDemand: 2400,
      waterDemand: 820,
    };

    const action = {
      id: "act-bus",
      title: "Bus Fleet Electrification",
      capexMillion: 85,
      implementationYears: 3,
      levers: {
        traffic: -8,
        aqi: -22,
        pm25: -16,
      },
    };

    const outcome = calculateScenarioOutcome(baseline, action);
    assert.strictEqual(outcome.actionTitle, "Bus Fleet Electrification");
    assert.strictEqual(outcome.capexOutlayMillion, 85);

    // Traffic changed
    assert.strictEqual(outcome.metrics.traffic.outcome, 57);
    assert.strictEqual(outcome.metrics.traffic.delta.absolute, -8);
    assert.strictEqual(outcome.metrics.traffic.delta.isImprovement, true);

    // AQI changed
    assert.strictEqual(outcome.metrics.aqi.outcome, 118);
    assert.strictEqual(outcome.metrics.aqi.delta.absolute, -22);

    // Green cover unchanged
    assert.strictEqual(outcome.metrics.greenCover.outcome, 18);
    assert.strictEqual(outcome.metrics.greenCover.delta.status, "UNCHANGED");
  });

  it("calculates combined scenario with synergy diminishing returns", () => {
    const baseline = { traffic: 70, aqi: 150 };
    const actionA = { id: "a", title: "Action A", capexMillion: 40, levers: { traffic: -10 } };
    const actionB = { id: "b", title: "Action B", capexMillion: 60, levers: { traffic: -10 } };

    // With 0.85 synergy: combined traffic shift = (-10 + -10) * 0.85 = -17
    const combined = calculateCombinedScenario(baseline, actionA, actionB, 0.85);
    assert.strictEqual(combined.capexOutlayMillion, 100);
    assert.strictEqual(combined.metrics.traffic.outcome, 53); // 70 - 17
    assert.strictEqual(combined.metrics.traffic.delta.absolute, -17);
  });

  it("runs full scenario matrix cleanly", () => {
    const baseline = { traffic: 70, aqi: 150, greenCover: 15 };
    const actionA = { id: "a", title: "Action A", levers: { traffic: -5 } };
    const actionB = { id: "b", title: "Action B", levers: { aqi: -20 } };

    const matrix = runScenarioMatrix(baseline, actionA, actionB);
    assert.ok(matrix.actionA);
    assert.ok(matrix.actionB);
    assert.ok(matrix.combined);
    assert.ok(matrix.timestamp);
    assert.strictEqual(matrix.actionA.metrics.traffic.outcome, 65);
    assert.strictEqual(matrix.actionB.metrics.aqi.outcome, 130);
  });
});
