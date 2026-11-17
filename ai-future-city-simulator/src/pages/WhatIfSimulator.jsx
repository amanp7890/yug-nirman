import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  Car,
  Wind,
  Trees,
  Droplet,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import CityTransformation from "../components/common/CityTransformation";
import { buildWhatIfTransformation } from "../utils/cityTransformation";
import confetti from "canvas-confetti";

export const WhatIfSimulator = () => {
  const { city } = useCity();
  const navigate = useNavigate();

  // Policy sliders
  const [evAdoption, setEvAdoption] = useState(40); // 0 - 100%
  const [metroExpansion, setMetroExpansion] = useState(30); // 0 - 80 km
  const [greenCanopy, setGreenCanopy] = useState(32); // 10 - 60%
  const [congestionTax, setCongestionTax] = useState(150); // 0 - 500 INR
  const [solarMandate, setSolarMandate] = useState(50); // 0 - 100%
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePreset, setActivePreset] = useState("custom");
  const [simulationResult, setSimulationResult] = useState(null);
  const visibleSimulationResult = simulationResult?.cityId === city.id ? simulationResult : null;

  // Dynamic simulation computations
  const trafficReduction = Math.round(
    (metroExpansion * 0.38) + (congestionTax * 0.045) + (evAdoption * 0.06)
  );

  const aqiImprovement = Math.round(
    (evAdoption * 0.5) + (greenCanopy * 0.65) + (congestionTax * 0.05) + (solarMandate * 0.35)
  );

  const carbonAbated = (
    (evAdoption * 0.026) + (metroExpansion * 0.035) + (greenCanopy * 0.02) + (solarMandate * 0.028)
  ).toFixed(2);

  const budgetImpact = Math.round(
    (congestionTax * 2.1) - (metroExpansion * 4.4) - (greenCanopy * 1.1) - (solarMandate * 1.5)
  );

  const baselineHealthValue = city.healthScore?.overall;
  const baselineHealthScore = baselineHealthValue != null
    && baselineHealthValue !== ""
    && Number.isFinite(Number(baselineHealthValue))
    ? Number(baselineHealthValue)
    : null;
  const projectedHealthScore = baselineHealthScore == null
    ? null
    : Math.min(
      99,
      Math.round(baselineHealthScore + (aqiImprovement * 0.14) + (trafficReduction * 0.09) + (greenCanopy * 0.1))
    );

  // Dynamic Multi-Year Projection Data based on current slider values
  const projectionTimeline = [
    { year: "2026", baselineAQI: city.metrics.aqi.value, simulatedAQI: city.metrics.aqi.value, baselineTraffic: city.metrics.traffic.value, simulatedTraffic: city.metrics.traffic.value },
    { year: "2028", baselineAQI: Math.round(city.metrics.aqi.value * 1.05), simulatedAQI: Math.max(30, Math.round(city.metrics.aqi.value - (aqiImprovement * 0.35))), baselineTraffic: Math.min(95, Math.round(city.metrics.traffic.value + 4)), simulatedTraffic: Math.max(25, Math.round(city.metrics.traffic.value - (trafficReduction * 0.4))) },
    { year: "2031", baselineAQI: Math.round(city.metrics.aqi.value * 1.12), simulatedAQI: Math.max(28, Math.round(city.metrics.aqi.value - (aqiImprovement * 0.7))), baselineTraffic: Math.min(98, Math.round(city.metrics.traffic.value + 8)), simulatedTraffic: Math.max(22, Math.round(city.metrics.traffic.value - (trafficReduction * 0.75))) },
    { year: "2035", baselineAQI: Math.round(city.metrics.aqi.value * 1.2), simulatedAQI: Math.max(24, Math.round(city.metrics.aqi.value - aqiImprovement)), baselineTraffic: 99, simulatedTraffic: Math.max(18, Math.round(city.metrics.traffic.value - trafficReduction)) },
    { year: "2040", baselineAQI: Math.round(city.metrics.aqi.value * 1.3), simulatedAQI: Math.max(20, Math.round(city.metrics.aqi.value - (aqiImprovement * 1.25))), baselineTraffic: 100, simulatedTraffic: Math.max(15, Math.round(city.metrics.traffic.value - (trafficReduction * 1.2))) },
  ];

  // Presets
  const applyPreset = (presetKey) => {
    setSimulationResult(null);
    setActivePreset(presetKey);
    if (presetKey === "utopia") {
      setEvAdoption(90);
      setMetroExpansion(65);
      setGreenCanopy(52);
      setCongestionTax(300);
      setSolarMandate(85);
    } else if (presetKey === "transit") {
      setEvAdoption(50);
      setMetroExpansion(75);
      setGreenCanopy(35);
      setCongestionTax(400);
      setSolarMandate(40);
    } else if (presetKey === "budget") {
      setEvAdoption(25);
      setMetroExpansion(15);
      setGreenCanopy(28);
      setCongestionTax(250);
      setSolarMandate(30);
    } else if (presetKey === "defaults") {
      setEvAdoption(40);
      setMetroExpansion(30);
      setGreenCanopy(32);
      setCongestionTax(150);
      setSolarMandate(50);
      setActivePreset("custom");
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationResult(buildWhatIfTransformation({
        city,
        trafficReduction,
        aqiImprovement,
        projectedHealthScore,
        baselineHealthScore,
        carbonAbated,
        budgetImpact,
        inputs: { evAdoption, metroExpansion, greenCanopy, congestionTax, solarMandate },
      }));
      setIsSimulating(false);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.65 },
        colors: ["#00f0ff", "#10b981", "#a855f7", "#38bdf8"]
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-If Simulation"
        subtitle="Test changes like expanding the metro or planting trees to see estimated results."
        icon={FlaskConical}
        badge="Scenario test"
        whyFeatureIds="what-if-scenarios"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset("defaults")}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 border border-teal-500/60 text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "Computing…" : "Run Policy Model"}</span>
            </button>
          </div>
        }
      />

      {/* ── Preset Scenarios Bar ── */}
      <div className="p-3 rounded-xl fieldwork-card border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            POLICY BENCHMARKS:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "utopia", label: "Green Corridors", desc: "Canopy expansion & distributed clean generation" },
            { key: "transit", label: "Transit Prioritization", desc: "Arterial BRT, metro links, cordon pricing" },
            { key: "budget", label: "Fiscal Discipline", desc: "Targeted low-capital demand management" },
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset.key)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer border ${
                activePreset === preset.key
                  ? "bg-slate-800 text-teal-300 border-teal-600/80 font-semibold shadow-sm"
                  : "bg-[#0e141f] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#101622] p-3 text-xs leading-relaxed text-slate-400 flex items-start gap-2.5">
        <span className="font-mono text-amber-300 font-semibold shrink-0">MODEL NOTE:</span>
        <p>
          Simulated outcome indicators update in real-time via parameterized elasticity formulas. Changes represent synthetic directionality, not an official municipal environmental impact assessment.
        </p>
      </div>

      {visibleSimulationResult ? (
        <div className="space-y-3">
          <CityTransformation transformation={visibleSimulationResult} />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#0e141f] p-3">
            <p className="text-[11px] font-mono text-slate-400">
              Snapshot recorded at current lever state. Re-run after altering sliders to record an updated benchmark.
            </p>
            <button
              type="button"
              onClick={() => navigate("/report-generation", { state: { cityTransformation: visibleSimulationResult } })}
              className="inline-flex min-h-8 items-center gap-2 rounded border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 text-xs font-mono font-medium text-teal-300 hover:bg-teal-900/50 transition-colors"
            >
              Export to Intelligence Report
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#0e141f] p-5 text-center">
          <p className="text-xs font-mono font-semibold text-slate-300">Run model to capture comparison ledger</p>
          <p className="mt-1 text-xs text-slate-500">Calculates baseline vs projected outcomes across traffic load, AQI, carbon mitigation, and fiscal balance.</p>
        </div>
      )}

      {/* ── Simulated Outcomes KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Traffic Relief */}
        <div className="p-3.5 rounded-lg fieldwork-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Traffic Pressure</span>
            <Car className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
            -{trafficReduction} pts
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Corridor load index
          </p>
        </div>

        {/* 2. AQI Improvement */}
        <div className="p-3.5 rounded-lg fieldwork-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">AQI Dispersion</span>
            <Wind className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
            -{aqiImprovement} pts
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Proj AQI: {Math.max(25, (city.metrics.aqi.value - aqiImprovement))}
          </p>
        </div>

        {/* 3. Carbon Saved */}
        <div className="p-3.5 rounded-lg fieldwork-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Carbon Offset</span>
            <Trees className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-teal-300">
            {carbonAbated}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            MtCO₂e synthetic proxy
          </p>
        </div>

        {/* 4. Municipal Fiscal Impact */}
        <div className="p-3.5 rounded-lg fieldwork-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Fiscal Balance</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div
            className={`mt-2 text-xl font-bold font-mono ${
              budgetImpact >= 0 ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {budgetImpact >= 0 ? `+${budgetImpact}` : `-${Math.abs(budgetImpact)}`}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Arbitrary fiscal units
          </p>
        </div>

        {/* 5. Projected Health Score */}
        <div className="p-3.5 rounded-lg fieldwork-card border border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Livability Rating</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-teal-300">
            {projectedHealthScore == null ? "N/A" : `${projectedHealthScore} / 100`}
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            {projectedHealthScore == null || baselineHealthScore == null
              ? "No baseline rating"
              : `${projectedHealthScore - baselineHealthScore >= 0 ? "+" : ""}${projectedHealthScore - baselineHealthScore} pts vs baseline`}
          </p>
        </div>
      </div>

      {/* ── Interactive Comparative Projection Chart ── */}
      <div className="p-5 rounded-xl fieldwork-card border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white tracking-wide">
                POLICY HORIZON PROJECTIONS (2026–2040)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative dispersion trajectory: Status quo reference vs modeled policy interventions
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-rose-500 inline-block rounded" /> Status Quo Baseline
            </span>
            <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
              <span className="w-3 h-1 bg-teal-400 inline-block rounded" /> Modeled Scenario
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="simulatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e141f",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  fontSize: "11px",
                  color: "#f8fafc"
                }}
              />
              <Area type="monotone" dataKey="baselineAQI" name="Status Quo" stroke="#f43f5e" strokeWidth={1.5} fill="url(#baselineGrad)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="simulatedAQI" name="Intervention Target" stroke="#0d9488" strokeWidth={2} fill="url(#simulatedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Interactive Sliders Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Mobility & Energy Levers */}
        <div className="p-5 rounded-xl fieldwork-card border border-slate-800 space-y-5">
          <h3 className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Car className="w-4 h-4 text-teal-400" />
            <span>MOBILITY &amp; TRANSIT INFRASTRUCTURE LEVERS</span>
          </h3>

          {/* Slider 1: EV Adoption */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">
                1. Electric Vehicle Fleet Transition
              </span>
              <span className="font-mono font-bold text-teal-300">{evAdoption}% of Vehicles</span>
            </div>
            <input
              type="range" min="0" max="100" step="5" value={evAdoption}
              onChange={(e) => { setEvAdoption(parseInt(e.target.value, 10)); setActivePreset("custom"); setSimulationResult(null); }}
              className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% Baseline</span>
              <span>50%</span>
              <span>100% Zero-Emission</span>
            </div>
          </div>

          {/* Slider 2: Metro Rail Extension */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">
                2. Dedicated BRT &amp; Metro Network Expansion
              </span>
              <span className="font-mono font-bold text-sky-400">+{metroExpansion} km Added</span>
            </div>
            <input
              type="range" min="0" max="80" step="5" value={metroExpansion}
              onChange={(e) => { setMetroExpansion(parseInt(e.target.value, 10)); setActivePreset("custom"); setSimulationResult(null); }}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>+0 km</span>
              <span>+40 km</span>
              <span>+80 km Core Corridors</span>
            </div>
          </div>

          {/* Slider 3: Peak Congestion Pricing */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">
                3. Central Cordon Congestion Tariff
              </span>
              <span className="font-mono font-bold text-amber-400">₹{congestionTax} / Entry</span>
            </div>
            <input
              type="range" min="0" max="500" step="25" value={congestionTax}
              onChange={(e) => { setCongestionTax(parseInt(e.target.value, 10)); setActivePreset("custom"); setSimulationResult(null); }}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹0 (Unrestricted)</span>
              <span>₹250</span>
              <span>₹500 (Peak Demand Cordon)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Ecology & Resources Levers */}
        <div className="p-5 rounded-xl fieldwork-card border border-slate-800 space-y-5">
          <h3 className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Trees className="w-4 h-4 text-emerald-400" />
            <span>ECOLOGICAL CANOPY &amp; CLEAN ENERGY LEVERS</span>
          </h3>

          {/* Slider 4: Green Canopy Target */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">
                4. Urban Canopy &amp; Biosphere Target
              </span>
              <span className="font-mono font-bold text-emerald-400">{greenCanopy}% Green Cover</span>
            </div>
            <input
              type="range" min="15" max="60" step="1" value={greenCanopy}
              onChange={(e) => { setGreenCanopy(parseInt(e.target.value, 10)); setActivePreset("custom"); setSimulationResult(null); }}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>15% (Deficit)</span>
              <span>35% (Optimal)</span>
              <span>60% (Biosphere Matrix)</span>
            </div>
          </div>

          {/* Slider 5: Solar Microgrid Mandate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">
                5. Decentralized Rooftop Clean Generation
              </span>
              <span className="font-mono font-bold text-amber-400">{solarMandate}% Grid Share</span>
            </div>
            <input
              type="range" min="10" max="100" step="5" value={solarMandate}
              onChange={(e) => { setSolarMandate(parseInt(e.target.value, 10)); setActivePreset("custom"); setSimulationResult(null); }}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% Baseline</span>
              <span>50%</span>
              <span>100% Fully Distributed</span>
            </div>
          </div>

          {/* Simulation Sensitivity Callout */}
          <div className="p-3.5 rounded-lg bg-[#0e141f] border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>ELASTICITY CALCULATION DISCLOSURE:</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Active policy inputs (₹{congestionTax} toll, +{metroExpansion} km rapid transit, {evAdoption}% EV adoption) yield a synthetic traffic index offset of {trafficReduction} points and AQI abatement of {aqiImprovement} points. Fixed cross-elasticity coefficients are parameterized for comparative review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
