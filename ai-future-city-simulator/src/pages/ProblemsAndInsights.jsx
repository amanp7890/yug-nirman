import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Waves,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Info,
  Plus,
  X,
  Building2,
  Trash2,
  Car,
  Wind,
  Droplet,
  Zap,
} from "lucide-react";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import { getCityDiagnosis } from "../utils/cityDiagnosis";
import { classifyUsAqi, calculateScreeningScore } from "../utils/climateRiskEngine";
import {
  getUrbanProblems,
  addUrbanProblem,
  resolveUrbanProblem,
  subscribeUrbanProblems,
  URBAN_SECTORS,
} from "../utils/urbanProblemsStore";

const SEVERITY_COLORS = {
  high: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  HIGH: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  MODERATE: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  low: "border-slate-700 bg-slate-800 text-slate-300",
  LOW: "border-slate-700 bg-slate-800 text-slate-300",
};

export default function ProblemsAndInsights() {
  const { city, liveAirQuality, liveTrafficFlow, alertsState } = useCity();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("field-issues");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedSectorFilter, setSelectedSectorFilter] = useState("all");

  // Urban Problems Reactive Store
  const [urbanProblems, setUrbanProblems] = useState(() => getUrbanProblems(city.id));
  const [showReportModal, setShowReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New problem form state
  const [formData, setFormData] = useState({
    title: "",
    sector: "traffic",
    severity: "HIGH",
    location: "",
    metricValue: "",
    evidence: "",
    impactedResidents: 45000,
  });

  useEffect(() => {
    setUrbanProblems(getUrbanProblems(city.id));
    const unsubscribe = subscribeUrbanProblems(() => {
      setUrbanProblems(getUrbanProblems(city.id));
    });
    return unsubscribe;
  }, [city.id]);

  // Run explainable diagnostic evaluation from telemetry
  const diagnosedProblems = useMemo(() => {
    return getCityDiagnosis({
      city,
      liveAirQuality,
      liveTrafficFlow,
    });
  }, [city, liveAirQuality, liveTrafficFlow]);

  // Run climate risk screening
  const climateAssessment = useMemo(() => {
    const currentAqi = liveAirQuality?.current?.usAqi ?? city.metrics?.aqi?.value ?? 50;
    const aqiLevel = classifyUsAqi(currentAqi);
    const score = calculateScreeningScore([aqiLevel, "MODERATE"]) ?? 42;
    return {
      overallScore: score,
      aqiLevel,
    };
  }, [city, liveAirQuality]);

  const activeUrbanProblems = useMemo(() => {
    return urbanProblems.filter((p) => p.status !== "resolved");
  }, [urbanProblems]);

  const filteredUrbanProblems = useMemo(() => {
    return activeUrbanProblems.filter((p) => {
      const matchSev = severityFilter === "all" || p.severity.toLowerCase() === severityFilter.toLowerCase();
      const matchSec = selectedSectorFilter === "all" || p.sector.toLowerCase() === selectedSectorFilter.toLowerCase();
      return matchSev && matchSec;
    });
  }, [activeUrbanProblems, severityFilter, selectedSectorFilter]);

  const handlePlanAction = (problem) => {
    // Map diagnosed or reported problem key to action planner problem ID
    const mapping = {
      traffic: "traffic-congestion",
      air: "air-quality",
      aqi: "air-quality",
      green: "green-space",
      water: "water-stress",
      energy: "energy-demand",
      waste: "waste-management",
      road: "road-damage",
      drainage: "drainage-bottlenecks",
      infrastructure: "infrastructure-gaps",
    };
    const targetId = mapping[problem.sector] || mapping[problem.id] || problem.id || "air-quality";
    navigate("/action-planner", {
      state: { problemId: targetId },
    });
  };

  const handleResolveProblem = (problemId) => {
    resolveUrbanProblem(problemId);
    setToastMessage("Issue successfully resolved and archived.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateProblem = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addUrbanProblem({
      ...formData,
      cityId: city.id,
      coordinates: [city.coordinates[0] + (Math.random() - 0.5) * 0.04, city.coordinates[1] + (Math.random() - 0.5) * 0.04],
    });

    setShowReportModal(false);
    setFormData({
      title: "",
      sector: "traffic",
      severity: "HIGH",
      location: "",
      metricValue: "",
      evidence: "",
      impactedResidents: 45000,
    });

    setToastMessage("New urban incident logged. Dashboard counters, map markers, and evidence cards updated!");
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <PageHeader
        title="Problems & Insights"
        subtitle="Consolidated evidence hub: review active municipal indicators, field incident reports, screening threshold breaches, and recommended interventions."
        icon={AlertTriangle}
        badge="Evidence Hub"
        badgeStyle="amber"
        whyFeatureIds={["infrastructure-risk", "climate-risk-screening"]}
      />

      {/* Real-time Notification Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Switcher Tabs & Quick Action */}
      <div className="fieldwork-card p-2 rounded-xl border border-slate-800 bg-[#121824] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("field-issues")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "field-issues"
                ? "bg-teal-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Field Incidents &amp; Issues ({activeUrbanProblems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "diagnostics"
                ? "bg-teal-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Telemetry Diagnostics ({diagnosedProblems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("climate")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "climate"
                ? "bg-teal-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Waves className="h-4 w-4" />
            <span>Climate &amp; Hazard Screening</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === "alerts"
                ? "bg-teal-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Operational Alerts ({alertsState?.length || 0})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Report Urban Issue</span>
        </button>
      </div>

      {/* TAB 1: Field Incidents & Issues */}
      {activeTab === "field-issues" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Showing {filteredUrbanProblems.length} active municipal issue(s) for <strong>{city.name}</strong>.
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-500">Severity:</span>
                {["all", "high", "moderate", "low"].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverityFilter(sev)}
                    className={`rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition ${
                      severityFilter === sev
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <Link to="/action-planner" className="text-teal-400 hover:underline font-bold inline-flex items-center gap-1">
              Open Action Planner <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredUrbanProblems.map((prob) => {
              const sevClass = SEVERITY_COLORS[prob.severity] || SEVERITY_COLORS.low;

              return (
                <article
                  key={prob.id}
                  className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold bg-teal-950/60 border border-teal-800/80 px-1.5 py-0.5 rounded">
                            {prob.sector}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">ID: {prob.id}</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{prob.title}</h3>
                      </div>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase shrink-0 ${sevClass}`}>
                        {prob.severity} Priority
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-300">
                      {prob.evidence}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="rounded-md border border-slate-800 bg-[#0e141f] p-2.5">
                        <span className="text-slate-500 block uppercase">Location / Ward</span>
                        <span className="text-white font-bold text-xs truncate block">{prob.location}</span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0e141f] p-2.5">
                        <span className="text-slate-500 block uppercase">Telemetry Metric</span>
                        <span className="text-amber-300 font-bold text-xs truncate block">{prob.metricValue}</span>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-800/80 bg-[#0e141f] p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reported: {new Date(prob.reportedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">
                        ~{(prob.impactedResidents || 50000).toLocaleString()} residents affected
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleResolveProblem(prob.id)}
                      className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlanAction(prob)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                    >
                      Plan Action <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredUrbanProblems.length === 0 && (
            <div className="fieldwork-card p-12 text-center rounded-xl border border-slate-800 bg-[#121824] text-slate-400">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-white">No active issues match this filter.</p>
              <p className="text-xs mt-1">Click "Report Urban Issue" to log a field finding or incident.</p>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Telemetry Diagnostics */}
      {activeTab === "diagnostics" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {diagnosedProblems.length} issue(s) diagnosed for {city.name} from live and profile telemetry thresholds.
            </span>
            <Link to="/action-planner" className="text-teal-400 hover:underline font-bold inline-flex items-center gap-1">
              Open Action Planner <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {diagnosedProblems.map((prob) => {
              const sevClass = SEVERITY_COLORS[prob.severity] || SEVERITY_COLORS.low;

              return (
                <article
                  key={prob.id || prob.title}
                  className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">{prob.sector || "Urban System"}</span>
                        <h3 className="text-base font-bold text-white">{prob.title}</h3>
                      </div>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${sevClass}`}>
                        {prob.severity} Priority
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-300">
                      {prob.evidence || prob.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="rounded-md border border-slate-800 bg-[#0e141f] p-2.5">
                        <span className="text-slate-500 block uppercase">Observed Signal</span>
                        <span className="text-white font-bold text-xs">{prob.value ?? prob.observedValue ?? "N/A"}</span>
                      </div>
                      <div className="rounded-md border border-slate-800 bg-[#0e141f] p-2.5">
                        <span className="text-slate-500 block uppercase">Evidence Tier</span>
                        <span className="text-amber-300 font-bold text-xs">{prob.evidenceClass || prob.threshold || "Screening Threshold"}</span>
                      </div>
                    </div>

                    {prob.nextCheck && (
                      <p className="rounded-md border border-slate-800/80 bg-[#0e141f] p-2.5 text-[11px] text-slate-400">
                        <strong className="text-teal-400">Next Verification:</strong> {prob.nextCheck}
                      </p>
                    )}

                    <div className="rounded-md border border-slate-800/80 bg-[#0e141f] p-2.5 text-[11px] text-slate-400 space-y-1">
                      <span className="text-slate-300 font-bold">Data Provenance:</span>
                      <p>{prob.source || "Municipal Telemetry & Open-Meteo"}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">Ready for intervention planning</span>
                    <button
                      type="button"
                      onClick={() => handlePlanAction(prob)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      Plan Action <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: Climate & Hazard Screening */}
      {activeTab === "climate" && (
        <section className="space-y-4">
          <div className="fieldwork-card p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400">Screening Index</span>
              <h3 className="text-lg font-bold text-white">Cumulative Hazard Vulnerability Score</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Composite screening based on temperature extremes, precipitation intensity, and atmospheric stagnation.
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-black text-amber-300">
                {climateAssessment.overallScore ?? 42}
                <span className="text-xs text-slate-400 font-normal ml-1">/ 90</span>
              </span>
              <span className="block text-[10px] font-mono uppercase text-slate-400">Moderate Screening Band</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Thermal Extreme</span>
              <h4 className="mt-1 text-sm font-bold text-white">Heat Stress Risk</h4>
              <p className="mt-1 text-xs text-slate-400">
                Evaluates maximum feels-like temperature against public health advisory thresholds (&gt; 38°C).
              </p>
            </div>
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Precipitation Surge</span>
              <h4 className="mt-1 text-sm font-bold text-white">Pluvial Flood Exposure</h4>
              <p className="mt-1 text-xs text-slate-400">
                Hourly monsoonal accumulation rates tested against city outfall clearance capacities.
              </p>
            </div>
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">Stagnation Index</span>
              <h4 className="mt-1 text-sm font-bold text-white">Inversion &amp; Dispersion</h4>
              <p className="mt-1 text-xs text-slate-400">
                Low surface wind velocities (&lt; 6 km/h) compound particulate trapping in central corridors.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: Operational Alerts */}
      {activeTab === "alerts" && (
        <section className="space-y-3">
          {(alertsState || []).map((alert, index) => (
            <div
              key={alert.id || index}
              className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824] flex items-start justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                  <p className="mt-1 text-xs text-slate-300">{alert.message || alert.description}</p>
                  <span className="mt-2 block text-[10px] font-mono text-slate-500">
                    Source: {alert.source || "Municipal Sensor Alert Dispatch"}
                  </span>
                </div>
              </div>
              <Link
                to="/action-planner"
                className="shrink-0 text-xs font-semibold text-teal-400 hover:text-white"
              >
                Plan Action →
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* Modal: Report Urban Issue */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowReportModal(false);
          }}
        >
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                  Field Dispatch Intake
                </span>
                <h3 className="text-lg font-bold text-white">Log Urban Issue for {city.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Arterial Gridlock on North Ring"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Domain / Sector *</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {URBAN_SECTORS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority Severity *</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    <option value="HIGH">High Priority (Urgent)</option>
                    <option value="MODERATE">Moderate Priority</option>
                    <option value="LOW">Low Priority (Monitoring)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Ward *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ward 14, Sector 7 Junction"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Metric Telemetry</label>
                  <input
                    type="text"
                    placeholder="e.g. 78% delay vs free flow"
                    value={formData.metricValue}
                    onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence &amp; Field Observations *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe field findings, queue lengths, overflow volumes, or sensor readings..."
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Log &amp; Dispatch Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
