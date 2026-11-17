import React, { useState, useMemo, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  FlaskConical,
  GitCompare,
  TrendingUp,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import { CANDIDATE_ACTIONS_BY_PROBLEM } from "../data/actionPlannerData";
import {
  METRIC_DIRECTIONS,
  runScenarioMatrix,
} from "../utils/scenarioCalculator";

export default function ScenarioPlanner() {
  const { city } = useCity();
  const location = useLocation();
  const navigate = useNavigate();

  // Baseline metrics derived from city context
  const baseline = useMemo(() => ({
    traffic: city.metrics?.traffic?.value ?? 68,
    aqi: city.metrics?.aqi?.value ?? 142,
    pm25: Math.round((city.metrics?.aqi?.value ?? 142) * 0.58),
    greenCover: city.metrics?.greenCover?.value ?? 18,
    energyDemand: city.metrics?.energyUsage?.value ?? 84,
    waterDemand: city.metrics?.waterDemand?.value ?? 78,
  }), [city]);

  // Flatten all available candidate actions for selection
  const allActions = useMemo(() => {
    return Object.values(CANDIDATE_ACTIONS_BY_PROBLEM).flat();
  }, []);

  // Pre-load from Action Planner if navigated with state
  const initialActionA = location.state?.preselectedAction || allActions[0];
  const initialActionB = allActions.find((a) => a.id !== initialActionA?.id) || allActions[1];

  const [selectedActionAId, setSelectedActionAId] = useState(initialActionA?.id || "act-lez");
  const [selectedActionBId, setSelectedActionBId] = useState(initialActionB?.id || "act-adaptive-signals");
  const [investmentMultiplier, setInvestmentMultiplier] = useState(1.0);

  const actionA = useMemo(() => {
    return allActions.find((a) => a.id === selectedActionAId) || allActions[0];
  }, [allActions, selectedActionAId]);

  const actionB = useMemo(() => {
    return allActions.find((a) => a.id === selectedActionBId) || allActions[1];
  }, [allActions, selectedActionBId]);

  // Scaled actions according to investment multiplier
  const scaledActionA = useMemo(() => {
    if (investmentMultiplier === 1.0) return actionA;
    const scaledLevers = {};
    for (const [k, v] of Object.entries(actionA.levers || {})) {
      scaledLevers[k] = Number((v * investmentMultiplier).toFixed(2));
    }
    return {
      ...actionA,
      capexMillion: Math.round((actionA.capexMillion || 20) * investmentMultiplier),
      levers: scaledLevers,
    };
  }, [actionA, investmentMultiplier]);

  const scaledActionB = useMemo(() => {
    if (investmentMultiplier === 1.0) return actionB;
    const scaledLevers = {};
    for (const [k, v] of Object.entries(actionB.levers || {})) {
      scaledLevers[k] = Number((v * investmentMultiplier).toFixed(2));
    }
    return {
      ...actionB,
      capexMillion: Math.round((actionB.capexMillion || 20) * investmentMultiplier),
      levers: scaledLevers,
    };
  }, [actionB, investmentMultiplier]);

  // Run the multi-scenario matrix
  const matrix = useMemo(() => {
    return runScenarioMatrix(baseline, scaledActionA, scaledActionB);
  }, [baseline, scaledActionA, scaledActionB]);

  // Prepare chart comparison data
  const chartData = useMemo(() => {
    return [
      {
        metric: "Traffic Delay",
        Baseline: baseline.traffic,
        "Action A": matrix.actionA.metrics.traffic?.outcome ?? baseline.traffic,
        "Action B": matrix.actionB.metrics.traffic?.outcome ?? baseline.traffic,
        Combined: matrix.combined.metrics.traffic?.outcome ?? baseline.traffic,
      },
      {
        metric: "Air Quality (AQI)",
        Baseline: baseline.aqi,
        "Action A": matrix.actionA.metrics.aqi?.outcome ?? baseline.aqi,
        "Action B": matrix.actionB.metrics.aqi?.outcome ?? baseline.aqi,
        Combined: matrix.combined.metrics.aqi?.outcome ?? baseline.aqi,
      },
      {
        metric: "Green Cover (%)",
        Baseline: baseline.greenCover,
        "Action A": matrix.actionA.metrics.greenCover?.outcome ?? baseline.greenCover,
        "Action B": matrix.actionB.metrics.greenCover?.outcome ?? baseline.greenCover,
        Combined: matrix.combined.metrics.greenCover?.outcome ?? baseline.greenCover,
      },
    ];
  }, [baseline, matrix]);

  const handleExportReport = () => {
    navigate("/report-generation", {
      state: {
        cityTransformation: {
          id: "scenario-intervention",
          name: matrix.combined.actionTitle,
          category: "Scenario Simulation",
          metrics: {
            traffic: `${matrix.combined.metrics.traffic?.outcome ?? baseline.traffic} pts`,
            aqi: `${matrix.combined.metrics.aqi?.outcome ?? baseline.aqi} AQI`,
            capex: `$${matrix.combined.capexOutlayMillion}M`,
            health: "Simulated",
          },
          baseline: {
            traffic: `${baseline.traffic} pts`,
            aqi: `${baseline.aqi} AQI`,
          },
          after: {
            traffic: `${matrix.combined.metrics.traffic?.outcome ?? baseline.traffic} pts`,
            aqi: `${matrix.combined.metrics.aqi?.outcome ?? baseline.aqi} AQI`,
          },
        },
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <PageHeader
        title="Scenario Planner & Impact Comparison"
        subtitle="Test and compare urban interventions: evaluate Baseline vs Action A vs Action B vs Combined Strategy with verified mathematical deltas."
        icon={FlaskConical}
        badge="Multi-Scenario Matrix"
        badgeStyle="teal"
        whyFeatureIds={["future-forecasts", "scenario-comparison"]}
      />

      {/* ── Action Selectors & Investment Scale Bar ── */}
      <section className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Action A selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
              Candidate Action A
            </span>
            <select
              value={selectedActionAId}
              onChange={(e) => setSelectedActionAId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-xs font-semibold text-white focus:border-teal-500 focus:outline-none"
            >
              {allActions.map((act) => (
                <option key={`a-${act.id}`} value={act.id}>
                  {act.title} (${act.capexMillion}M)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 line-clamp-1">{actionA.summary}</p>
          </div>

          {/* Action B selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
              Candidate Action B
            </span>
            <select
              value={selectedActionBId}
              onChange={(e) => setSelectedActionBId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
            >
              {allActions.map((act) => (
                <option key={`b-${act.id}`} value={act.id}>
                  {act.title} (${act.capexMillion}M)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 line-clamp-1">{actionB.summary}</p>
          </div>

          {/* Investment scale multiplier */}
          <div className="space-y-1.5 rounded-lg border border-slate-800 bg-[#0e141f] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Investment Scaling</span>
              <span className="font-mono text-teal-300 font-bold">{Math.round(investmentMultiplier * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={investmentMultiplier}
              onChange={(e) => setInvestmentMultiplier(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 leading-snug">Scales CapEx and policy intervention elasticity proportionally.</p>
          </div>
        </div>
      </section>

      {/* ── 4-Way Scenario Comparison Table ── */}
      <section className="fieldwork-card overflow-hidden rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
        <div className="border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Projected Outcomes & Elasticity Deltas</h3>
            <p className="text-[11px] text-slate-400">Comparing Current Baseline against proposed interventions</p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-0.5 font-mono text-[10px] text-slate-300">
            {city.name} Simulation Horizon: 2030
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e141f] text-[10px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4">Urban Indicator</th>
                <th className="py-3 px-4">Baseline</th>
                <th className="py-3 px-4 text-teal-300">Action A ({actionA.title.split(" ")[0]})</th>
                <th className="py-3 px-4 text-indigo-300">Action B ({actionB.title.split(" ")[0]})</th>
                <th className="py-3 px-4 text-emerald-300">Combined Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {Object.keys(METRIC_DIRECTIONS).map((key) => {
                const meta = METRIC_DIRECTIONS[key];
                const baseVal = baseline[key];
                const resA = matrix.actionA.metrics[key];
                const resB = matrix.actionB.metrics[key];
                const resComb = matrix.combined.metrics[key];

                return (
                  <tr key={key} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                      {meta.label}
                      <span className="block text-[10px] font-mono text-slate-500 font-normal">{meta.unit}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {baseVal}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white">{resA?.outcome}</span>
                      {resA?.delta.absolute !== 0 && (
                        <span className={`ml-2 text-[10px] ${resA?.delta.isImprovement ? "text-emerald-400" : "text-rose-400"}`}>
                          ({resA?.delta.absolute > 0 ? "+" : ""}{resA?.delta.absolute} · {resA?.delta.percent}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white">{resB?.outcome}</span>
                      {resB?.delta.absolute !== 0 && (
                        <span className={`ml-2 text-[10px] ${resB?.delta.isImprovement ? "text-emerald-400" : "text-rose-400"}`}>
                          ({resB?.delta.absolute > 0 ? "+" : ""}{resB?.delta.absolute} · {resB?.delta.percent}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-300">{resComb?.outcome}</span>
                      {resComb?.delta.absolute !== 0 && (
                        <span className={`ml-2 text-[10px] font-bold ${resComb?.delta.isImprovement ? "text-emerald-400" : "text-rose-400"}`}>
                          ({resComb?.delta.absolute > 0 ? "+" : ""}{resComb?.delta.absolute} · {resComb?.delta.percent}%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* Financial Outlay Row */}
              <tr className="bg-[#0e141f]/70 font-sans font-semibold">
                <td className="py-3 px-4 text-slate-300">Capital Outlay (CapEx)</td>
                <td className="py-3 px-4 font-mono text-slate-500">$0M</td>
                <td className="py-3 px-4 font-mono font-bold text-teal-300">${matrix.actionA.capexOutlayMillion}M</td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-300">${matrix.actionB.capexOutlayMillion}M</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-300">${matrix.combined.capexOutlayMillion}M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Comparative Chart ── */}
      <section className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
        <h3 className="text-sm font-bold text-white mb-1">Visual Metric Comparison</h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Lower is better for Traffic and Air Quality; higher is better for Green Cover.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#0e141f",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Action A" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Action B" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Combined" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Assumptions, Trade-offs & Export Bar ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
            Model Assumptions & Calculation Logic
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {matrix.combined.assumptions.map((assump, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Known Uncertainty & Limitations
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Outputs reflect stylized municipal elasticity equations calibrated to historical reference profiles. They provide comparative directional guidance for planning discussion, not guaranteed empirical predictions.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">Capture this scenario in municipal records</span>
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <FileText className="h-3.5 w-3.5" />
              Include in City Report →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
