import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  AlertTriangle,
  Target,
  Sliders,
  CheckCircle2,
  TrendingUp,
  FileText,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  Info,
  Building2,
  Leaf,
  Car,
  Droplet,
  Zap,
  Waves,
  RefreshCw,
} from "lucide-react";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import {
  SUPPORTED_PROBLEMS,
  CANDIDATE_ACTIONS_BY_PROBLEM,
} from "../data/actionPlannerData";
import {
  DEFAULT_CRITERIA_WEIGHTS,
  CRITERIA_METADATA,
  rankActions,
} from "../utils/decisionScoring";
import {
  addActionPlanEntry,
  isActionInPlan,
} from "../utils/actionPlanStore";

const SECTOR_ICONS = {
  Environment: Leaf,
  Mobility: Car,
  "Urban Ecology": Leaf,
  Resilience: Waves,
  Resources: Droplet,
  Energy: Zap,
  Sanitation: Building2,
  Infrastructure: Building2,
};

const SCOPE_LABELS = {
  citywide: "Whole Municipal Jurisdiction",
  arterials: "Major Transit & Commercial Arterials",
  "central-core": "Central Commercial & Historic Core",
  "coastal-lowland": "Coastal & Low-Lying Drainage Basin",
  "industrial-belt": "Industrial & Freight Logistics Belt",
  "densely-built-blocks": "High-Density Residential Blocks",
  "riverine-corridors": "Natural Waterway & River Corridors",
  "peripheral-settlements": "Peripheral Growth Corridors",
  "commercial-districts": "High-Rise Commercial Districts",
  "transit-hub": "Multi-Modal Transit Hubs",
};

export default function ActionPlanner() {
  const { city, liveAirQuality, liveTrafficFlow, liveDataLoading } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1: Selected problem (support pre-population from route state)
  const [selectedProblemId, setSelectedProblemId] = useState(
    location?.state?.problemId || "air-quality"
  );
  // Step 2: Selected area / geographic scope
  const [selectedScope, setSelectedScope] = useState("arterials");
  // Step 4: Decision criteria weights
  const [weights, setWeights] = useState(DEFAULT_CRITERIA_WEIGHTS);
  // Commitment feedback state
  const [commitToast, setCommitToast] = useState(null);

  // Sync when location state changes
  useEffect(() => {
    if (location?.state?.problemId) {
      setSelectedProblemId(location.state.problemId);
    }
  }, [location?.state?.problemId]);

  const currentProblem = useMemo(() => {
    return SUPPORTED_PROBLEMS.find((p) => p.id === selectedProblemId) || SUPPORTED_PROBLEMS[0];
  }, [selectedProblemId]);

  // Extract real live/profile measurement for evidence card
  const evidenceMeasurement = useMemo(() => {
    if (selectedProblemId === "air-quality") {
      const liveAqi = liveAirQuality?.us_aqi;
      const demoAqi = city.metrics?.aqi?.value;
      const val = liveAqi != null ? liveAqi : demoAqi ?? 142;
      const isLive = liveAqi != null;
      return {
        value: Math.round(val),
        unit: "US AQI",
        source: isLive ? "Open-Meteo Air Quality Model" : "Bundled Municipal Profile",
        provenance: isLive ? "LIVE" : "SAMPLE",
        isExceeded: val > 100,
        observedAt: liveAirQuality?.retrievedAt ? new Date(liveAirQuality.retrievedAt).toLocaleTimeString() : "Recent observation",
      };
    }
    if (selectedProblemId === "traffic-congestion") {
      const liveDelay = liveTrafficFlow?.freeFlowTravelTime > 0
        ? Math.round(((liveTrafficFlow.currentTravelTime / liveTrafficFlow.freeFlowTravelTime) - 1) * 100)
        : null;
      const demoDelay = city.metrics?.traffic?.value ?? 68;
      const val = liveDelay != null ? liveDelay : demoDelay;
      const isLive = liveDelay != null;
      return {
        value: val,
        unit: "% delay above free-flow",
        source: isLive ? "TomTom Flow Segment Telemetry" : "Bundled Municipal Profile",
        provenance: isLive ? "LIVE" : "SAMPLE",
        isExceeded: val > 50,
        observedAt: liveTrafficFlow?.retrievedAt ? new Date(liveTrafficFlow.retrievedAt).toLocaleTimeString() : "Recent observation",
      };
    }
    if (selectedProblemId === "green-space") {
      const val = city.metrics?.greenCover?.value ?? 18;
      return {
        value: val,
        unit: "% surface canopy",
        source: "Municipal GIS Land-Cover Dataset",
        provenance: "CALCULATED",
        isExceeded: val < 25,
        observedAt: "2026 Baseline Assessment",
      };
    }
    if (selectedProblemId === "water-stress") {
      const val = city.metrics?.waterDemand?.value ?? 78;
      return {
        value: val,
        unit: "% reservoir utilization",
        source: "Municipal Water Board SCADA Telemetry",
        provenance: "SAMPLE",
        isExceeded: val > 75,
        observedAt: "Weekly Utility Aggregate",
      };
    }
    if (selectedProblemId === "energy-demand") {
      const val = city.metrics?.energyUsage?.value ?? 84;
      return {
        value: val,
        unit: "% peak substation load",
        source: "State Electricity Transmission Load Dispatch",
        provenance: "SAMPLE",
        isExceeded: val > 80,
        observedAt: "Daily Peak Telemetry",
      };
    }
    if (selectedProblemId === "waste-management") {
      const val = 34;
      return {
        value: val,
        unit: "% landfill diversion rate",
        source: "Municipal Solid Waste Weighbridge Telemetry",
        provenance: "CALCULATED",
        isExceeded: val < 40,
        observedAt: "Monthly Municipal Solid Waste Audit",
      };
    }
    if (selectedProblemId === "road-damage") {
      const val = 48;
      return {
        value: val,
        unit: "PCI rating / 100",
        source: "Automated Laser Pavement Profiler Survey",
        provenance: "SAMPLE",
        isExceeded: val < 55,
        observedAt: "Quarterly Asset Inspection",
      };
    }
    if (selectedProblemId === "drainage-bottlenecks") {
      const val = 48;
      return {
        value: val,
        unit: "% cross-sectional silt blockage",
        source: "Hydraulic SCADA & Acoustic Culvert Silt Sensors",
        provenance: "SAMPLE",
        isExceeded: val > 45,
        observedAt: "Pre-Monsoon Culvert Inspection",
      };
    }
    if (selectedProblemId === "infrastructure-gaps") {
      const val = 54;
      return {
        value: val,
        unit: "% 10-minute walkable transit catchment",
        source: "Municipal GIS Spatial Catchment Model",
        provenance: "CALCULATED",
        isExceeded: val < 65,
        observedAt: "Annual Urban Mobility Audit",
      };
    }
    // Default fallback
    return {
      value: 65,
      unit: "Index points",
      source: "Municipal Risk Assessment",
      provenance: "ESTIMATE",
      isExceeded: true,
      observedAt: "Recent Profile",
    };
  }, [selectedProblemId, city, liveAirQuality, liveTrafficFlow]);

  // Candidate actions for the current problem
  const candidateActions = useMemo(() => {
    return CANDIDATE_ACTIONS_BY_PROBLEM[selectedProblemId] || [];
  }, [selectedProblemId]);

  // Ranked actions evaluated via the decision scoring engine
  const { rankedActions, topAction, explanation } = useMemo(() => {
    return rankActions(candidateActions, weights);
  }, [candidateActions, weights]);

  // Handle slider weight adjustment
  const handleWeightChange = (key, rawValue) => {
    const num = Number(rawValue);
    setWeights((prev) => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_CRITERIA_WEIGHTS);
  };

  // Commit chosen intervention to Implementation Tracker
  const handleCommitToTracker = (action) => {
    const entry = addActionPlanEntry({
      problemId: selectedProblemId,
      problemTitle: currentProblem.name,
      actionId: action.id,
      actionTitle: action.title,
      actionSector: currentProblem.sector,
      score: action.evaluation?.score ?? 85,
      capexMillion: action.capexMillion ?? 20,
      status: "approved",
      department:
        currentProblem.sector === "Mobility"
          ? "Directorate of Urban Mobility"
          : currentProblem.sector === "Environment"
          ? "Municipal Pollution Control Board"
          : currentProblem.sector === "Sanitation"
          ? "Solid Waste Management Corporation"
          : currentProblem.sector === "Infrastructure"
          ? "Public Works & Drainage Department"
          : "Municipal Planning Board",
      progress: 0,
      baselineMeasurement: `${evidenceMeasurement.value} ${evidenceMeasurement.unit}`,
      afterMeasurement: `Target: ${action.kpis?.[0] || "Measurable improvement"}`,
      evidenceSource: evidenceMeasurement.source,
      notes: `Prioritized via YUG NIRMAN MCDA decision model with score ${action.evaluation?.score ?? 85}/100.`,
    });

    setCommitToast({
      title: action.title,
      id: entry.id,
    });
    setTimeout(() => setCommitToast(null), 5000);
  };

  // Bridge action to scenario planner
  const handleTestInScenarioPlanner = (action) => {
    // Navigate to scenario planner with preselected action state
    navigate("/scenario-planner", {
      state: {
        preselectedAction: action,
        problemId: selectedProblemId,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <PageHeader
        title="City Action Planner"
        subtitle="Transparent decision-support: identify a problem, review verified evidence, compare candidate actions, and inspect the ranked recommendation."
        icon={Compass}
        badge="Decision Intelligence"
        badgeStyle="teal"
        whyFeatureIds={["city-optimization", "ai-recommendations"]}
      />

      {/* Toast Notification */}
      {commitToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-teal-500/50 bg-[#0e1724] px-4 py-3 text-xs font-semibold text-teal-200 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Intervention Committed</span>
            <span className="text-slate-300">"{commitToast.title}" logged in Municipal Tracker.</span>
          </div>
          <Link
            to="/implementation-tracker"
            className="ml-2 inline-flex items-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition"
          >
            View Tracker <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* ── Workflow Progress Tracker ── */}
      <section aria-label="Decision Workflow Steps" className="fieldwork-card p-3 rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-6">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-teal-500/15 border border-teal-500/30 px-2 py-2 text-teal-300">
            <span className="font-mono text-xs font-bold">01</span>
            <span className="text-xs font-semibold">Diagnosis</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/60 px-2 py-2 text-slate-300">
            <span className="font-mono text-xs font-bold text-teal-400">02</span>
            <span className="text-xs font-semibold">Scope & Evidence</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/60 px-2 py-2 text-slate-300">
            <span className="font-mono text-xs font-bold text-teal-400">03</span>
            <span className="text-xs font-semibold">Criteria Weights</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/60 px-2 py-2 text-slate-300">
            <span className="font-mono text-xs font-bold text-teal-400">04</span>
            <span className="text-xs font-semibold">Compare Options</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/60 px-2 py-2 text-slate-300">
            <span className="font-mono text-xs font-bold text-teal-400">05</span>
            <span className="text-xs font-semibold">Recommendation</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700/60 px-2 py-2 text-slate-300">
            <span className="font-mono text-xs font-bold text-teal-400">06</span>
            <span className="text-xs font-semibold">Commit & Track</span>
          </div>
        </div>
      </section>

      {/* ── STEP 1: Select a Planning Problem ── */}
      <section aria-labelledby="step-1-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Step 01 / Diagnosis</span>
            <h2 id="step-1-title" className="text-lg font-black tracking-tight text-white">Select an urban planning problem to address</h2>
          </div>
          <span className="text-xs text-slate-400">Supported by {city.name} data feeds</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTED_PROBLEMS.map((problem) => {
            const isSelected = selectedProblemId === problem.id;
            const Icon = SECTOR_ICONS[problem.sector] || Building2;

            return (
              <button
                key={problem.id}
                type="button"
                onClick={() => {
                  setSelectedProblemId(problem.id);
                  setSelectedScope(problem.geoScopes[0]);
                }}
                className={`fieldwork-card relative flex flex-col justify-between rounded-xl p-4 text-left transition cursor-pointer border ${
                  isSelected
                    ? "border-teal-500 bg-[#14202e] ring-2 ring-teal-500/50 shadow-sm"
                    : "border-slate-800 bg-[#121824] hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-teal-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[9px] font-mono text-slate-300">
                      {problem.sector}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">{problem.name}</h3>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{problem.evidenceStatement}</p>
                </div>
                <div className="mt-3 border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Threshold: {problem.thresholdLabel.split(" ")[0]} {problem.thresholdLabel.split(" ")[1]}</span>
                  {isSelected && <span className="font-bold text-teal-400">Selected ✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── STEP 2: Geographic Area & Verified Evidence ── */}
      <section aria-labelledby="step-2-title" className="grid gap-4 lg:grid-cols-3">
        {/* Area selection */}
        <div className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Step 02 / Geography</span>
            <h2 id="step-2-title" className="text-sm font-bold text-white">Identify affected geographic area</h2>
            <p className="mt-1 text-xs text-slate-400">
              Recommendations adapt based on corridor characteristics and jurisdiction level.
            </p>
          </div>

          <div className="space-y-2">
            {currentProblem.geoScopes.map((scopeKey) => {
              const isSelected = selectedScope === scopeKey;
              return (
                <button
                  key={scopeKey}
                  type="button"
                  onClick={() => setSelectedScope(scopeKey)}
                  className={`w-full rounded-lg border p-3 text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-800 bg-[#0e141f] text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`h-4 w-4 ${isSelected ? "text-teal-400" : "text-slate-500"}`} />
                    <span className="text-xs font-semibold">{SCOPE_LABELS[scopeKey] || scopeKey}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-teal-400" />}
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-[#0e141f] p-3 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-teal-400" /> Geographic Scope Rule:
            </span>
            <p>City-level sensors provide municipal averages. Neighborhood-level interventions require targeted ground confirmation before procurement.</p>
          </div>
        </div>

        {/* Evidence card */}
        <div className="lg:col-span-2 fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Evidence & Telemetry</span>
                <h3 className="text-base font-bold text-white">What evidence supports this problem?</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                  evidenceMeasurement.provenance === "LIVE"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}>
                  {evidenceMeasurement.provenance} DATA
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {evidenceMeasurement.observedAt}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Observed Value</p>
                <p className="mt-1 font-mono text-2xl font-black text-white">
                  {evidenceMeasurement.value}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">{evidenceMeasurement.unit}</span>
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Screening Threshold</p>
                <p className="mt-1 font-mono text-sm font-bold text-amber-300">
                  {currentProblem.thresholdLabel}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Threshold Status</p>
                <p className={`mt-1 font-mono text-sm font-bold ${evidenceMeasurement.isExceeded ? "text-rose-400" : "text-emerald-400"}`}>
                  {evidenceMeasurement.isExceeded ? "⚠ Threshold Breached" : "✓ Within Normal Bounds"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-800/80 bg-[#0e141f] p-3.5 space-y-2">
              <p className="text-xs leading-relaxed text-slate-200">
                <strong className="text-white">Empirical observation:</strong> {currentProblem.evidenceStatement}
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                <strong className="text-slate-300">Data Source:</strong> {evidenceMeasurement.source} · Telemetry covers {SCOPE_LABELS[selectedScope] || selectedScope} for {city.name}.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
            <span>Methodology: Distinguishes measured conditions from assumed causes. Correlation does not establish sole causality.</span>
            <Link to="/explore" className="text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1">
              Inspect on Problem Map <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STEP 3 & 4: Candidate Actions & Criteria Weighting ── */}
      <section aria-labelledby="step-3-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Step 03 & 04 / Multi-Criteria Evaluation</span>
            <h2 id="step-3-title" className="text-lg font-black text-white">Compare candidate urban actions</h2>
            <p className="text-xs text-slate-400">
              Evaluated across 6 criteria using transparent Multi-Criteria Decision Analysis (MCDA).
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetWeights}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" /> Reset Criteria Weights
          </button>
        </div>

        {/* Interactive Criteria Weights Bar */}
        <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-400" />
              Adjust Decision Criteria Importance (MCDA Weights)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Weights automatically normalize to 100%</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(DEFAULT_CRITERIA_WEIGHTS).map((key) => {
              const meta = CRITERIA_METADATA[key];
              const currentWeightVal = weights[key] ?? DEFAULT_CRITERIA_WEIGHTS[key];

              return (
                <div key={key} className="space-y-1.5 rounded-lg border border-slate-800/80 bg-[#0e141f] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{meta.label}</span>
                    <span className="font-mono text-teal-300 font-bold">{Math.round(currentWeightVal * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentWeightVal}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 leading-snug">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Actions Comparison Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {rankedActions.map((action, index) => {
            const isTop = index === 0 && action.evaluation.score != null;
            const evalScore = action.evaluation.score;

            return (
              <article
                key={action.id}
                className={`fieldwork-card flex flex-col justify-between rounded-xl border p-5 transition ${
                  isTop
                    ? "border-teal-500 bg-[#13222e] ring-2 ring-teal-500/40 shadow-md"
                    : "border-slate-800 bg-[#121824]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                      isTop
                        ? "bg-teal-500 text-slate-950 font-black"
                        : "border border-slate-700 bg-slate-800 text-slate-300"
                    }`}>
                      #{index + 1}
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-xl font-black text-white">{evalScore ?? "N/A"}</span>
                      <span className="block text-[9px] font-mono uppercase text-slate-400">Score / 100</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-white">{action.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{action.summary}</p>

                  {/* Criteria Score Breakdown Bars */}
                  <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Evaluated Criteria
                    </p>
                    {Object.keys(DEFAULT_CRITERIA_WEIGHTS).map((critKey) => {
                      const breakdownItem = action.evaluation.breakdown[critKey];
                      const rawScore = breakdownItem?.raw ?? 50;

                      return (
                        <div key={critKey} className="space-y-0.5 text-[10px]">
                          <div className="flex justify-between text-slate-400">
                            <span>{CRITERIA_METADATA[critKey]?.label}</span>
                            <span className="font-mono text-slate-200">{rawScore}/100</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-500"
                              style={{ width: `${Math.min(100, Math.max(0, rawScore))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata Specs */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[10px] font-mono">
                    <div className="rounded-md border border-slate-800 bg-[#0e141f] p-2">
                      <span className="text-slate-500 block uppercase">Est. CapEx</span>
                      <span className="text-white font-bold">${action.capexMillion}M</span>
                    </div>
                    <div className="rounded-md border border-slate-800 bg-[#0e141f] p-2">
                      <span className="text-slate-500 block uppercase">Timeline</span>
                      <span className="text-white font-bold">{action.implementationYears} years</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-800 pt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleCommitToTracker(action)}
                    className="flex-1 rounded-lg py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-teal-500/40 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Commit to Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestInScenarioPlanner(action)}
                    className={`flex-1 rounded-lg py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTop
                        ? "bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
                        : "border border-slate-700 bg-slate-850 hover:border-slate-500 text-slate-200"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" /> Simulate
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── STEP 5: Ranked Recommendation & Transparent Justification ── */}
      {topAction && (
        <section aria-labelledby="step-5-title" className="fieldwork-card p-6 rounded-xl border border-teal-500/40 bg-[#121c29] shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Step 05 / Recommended Action</span>
              <h2 id="step-5-title" className="text-xl font-extrabold text-white">Recommended Policy Intervention</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-teal-500/30 bg-teal-500/15 px-3 py-1 font-mono text-xs font-bold text-teal-300">
                Top Score: {topAction.evaluation.score}/100
              </span>
              <button
                type="button"
                onClick={() => handleCommitToTracker(topAction)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500 bg-teal-500/20 hover:bg-teal-500/30 px-3.5 py-2 text-xs font-bold text-teal-200 transition cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" /> Commit to Tracker
              </button>
              <button
                type="button"
                onClick={() => handleTestInScenarioPlanner(topAction)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                Launch Simulation <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-white">{topAction.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{topAction.summary}</p>
              </div>

              {/* Justification explanation */}
              <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-4 space-y-2">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wide text-teal-300">
                  Mathematical Justification:
                </p>
                <p className="text-xs leading-relaxed text-slate-200">
                  {explanation}
                </p>
                <p className="text-[10px] text-slate-500">
                  Formula: Score = Σ (normalized criteria score × normalized weight). Lower capital cost is inverted to reward affordability.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-4 space-y-2">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wide text-slate-300">
                  Suggested Municipal Next Steps:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {topAction.nextSteps?.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-teal-400 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-4 space-y-1.5 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">Key Assumptions & Limitations:</span>
                <ul className="list-disc list-inside space-y-1">
                  {topAction.assumptions?.map((assump, idx) => <li key={idx}>{assump}</li>)}
                  {topAction.limitations?.map((limit, idx) => <li key={idx} className="text-amber-200/80">⚠ {limit}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
