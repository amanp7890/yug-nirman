import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Car,
  Wind,
  Droplet,
  Zap,
  Waves,
  Leaf,
  Info,
  BarChart3,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import { SUPPORTED_PROBLEMS } from "../../data/actionPlannerData";

/**
 * Rule-based analysis templates for each problem type.
 * Clearly labeled as rule-based, not AI-generated predictions.
 */
const ANALYSIS_TEMPLATES = {
  "air-quality": {
    icon: Wind,
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/10",
    whatItIs:
      "Elevated concentrations of fine particulate matter (PM2.5 / PM10) and nitrogen oxides in ambient air, typically exceeding WHO guideline thresholds of 15 µg/m³ (annual PM2.5) during peak traffic and industrial emission hours.",
    potentialImpact:
      "Respiratory illness, school absenteeism, reduced outdoor productivity, premature mortality in vulnerable groups, and regulatory non-compliance with environmental protection standards.",
    likelyCauses: [
      "Diesel vehicle exhaust from congested arterial roads",
      "Coal and biomass combustion from industrial zones",
      "Construction dust and unpaved road surfaces",
      "Cross-boundary pollution transport during winter inversion events",
    ],
    evidenceQuality: "Threshold-based screening from municipal AQI profile",
    suggestedInterventions: [
      "Introduce Low Emission Zones (LEZ) on main arterials",
      "Deploy electric bus rapid transit (eBRT) on key corridors",
      "Enforce construction dust suppression protocols",
      "Install green buffer plantings along arterial roads",
    ],
    successMetrics: [
      "24-hour PM2.5 average < 60 µg/m³",
      "AQI 'Good' days exceeding 40% of calendar year",
      "Stack emission violations reduced by 30%",
    ],
    dataGaps: "Sub-district source apportionment unavailable. Seasonal variation not modeled.",
  },
  "traffic-congestion": {
    icon: Car,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    whatItIs:
      "Arterial road delays significantly above free-flow travel time, indicating that vehicle throughput exceeds road capacity during peak hours, increasing travel times, fuel consumption, and emissions.",
    potentialImpact:
      "Reduced commercial mobility, increased logistics costs, higher vehicular emissions, productivity losses from commuter delay, and emergency vehicle response time degradation.",
    likelyCauses: [
      "Insufficient public transit capacity pushing car dependency",
      "Uncoordinated traffic signal timing along arterials",
      "On-street parking encroaching on moving lanes",
      "Mixed freight and passenger vehicle movements at peak hours",
    ],
    evidenceQuality: "TomTom speed segment telemetry or profile baseline estimate",
    suggestedInterventions: [
      "Adaptive traffic signal optimization (ATSO)",
      "Bus priority lanes on key arterials",
      "Congestion pricing on central business district access roads",
      "Park-and-ride facilities at outer transit interchange nodes",
    ],
    successMetrics: [
      "Peak delay ratio < 1.3× free-flow travel time",
      "Public transport modal share increased from baseline",
      "Average arterial speed ≥ 30 km/h during peak hours",
    ],
    dataGaps: "Origin-destination demand data unavailable. Intersection-level counts not connected.",
  },
  "green-space": {
    icon: Leaf,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    whatItIs:
      "Low urban tree canopy and permeable surface coverage, typically below 25% of municipal area, reducing the city's heat absorption capacity, air filtration, stormwater retention, and biodiversity corridors.",
    potentialImpact:
      "Elevated urban heat island temperatures (+2–4°C), increased stormwater runoff, reduced mental well-being, loss of biodiversity, and long-term climate resilience deficit.",
    likelyCauses: [
      "Historical urban development prioritizing built floor area over public green space",
      "Land-use zoning that under-allocates park and open space buffers",
      "Construction activities removing mature trees without replacement mandates",
      "Inadequate urban forestry maintenance budgets",
    ],
    evidenceQuality: "Bundled city profile estimate — sub-district GIS data not connected",
    suggestedInterventions: [
      "Urban forestry program targeting 10,000 tree plantings per year",
      "Mandatory developer green space contributions for new projects",
      "Green rooftop and vertical wall incentives for commercial buildings",
      "Restoration of degraded riparian and corridor vegetation",
    ],
    successMetrics: [
      "Canopy cover ≥ 25% of total municipal area",
      "No new high-density development without 15% green space",
      "Urban Heat Island temperature differential reduced by 1.5°C",
    ],
    dataGaps: "Parcel-level GIS survey unavailable. Net loss vs gain tracking not established.",
  },
  "flood-risk": {
    icon: Waves,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    whatItIs:
      "Inadequate stormwater drainage capacity resulting in surface inundation during peak precipitation events, particularly in low-lying areas, riverine corridors, and historically problematic urban underpasses.",
    potentialImpact:
      "Property damage, displacement of residents, disruption of arterial roads, contamination of potable water infrastructure, and long-term climate vulnerability for coastal settlements.",
    likelyCauses: [
      "Legacy drainage infrastructure designed for lower rainfall intensity",
      "Encroachment of natural floodplains by informal settlements",
      "Reduced natural infiltration due to high impervious surface coverage",
      "Blocked outfalls and inadequate maintenance of stormwater conveyances",
    ],
    evidenceQuality: "Climate risk screening based on precipitation thresholds — actual flood mapping not integrated",
    suggestedInterventions: [
      "Upgrade and de-silt primary stormwater outfalls",
      "Construct retention ponds and wetland buffers at flood-prone catchments",
      "Enforce no-build zones in 1-in-25-year flood extent areas",
      "Community early warning system linked to rainfall gauges",
    ],
    successMetrics: [
      "Inundation duration during 50mm/hour events < 2 hours",
      "Zero habitations in highest-risk flood zones",
      "Stormwater outfall capacity certified at 75mm/hour",
    ],
    dataGaps: "Real-time gauge network and digital elevation model (DEM) not connected.",
  },
  "water-stress": {
    icon: Droplet,
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/10",
    whatItIs:
      "Municipal water demand approaching or exceeding reservoir replenishment rates, exacerbated by distribution network leakage (non-revenue water), seasonal variation, and population growth beyond planned supply capacity.",
    potentialImpact:
      "Scheduled supply rationing, inequitable access in peripheral settlements, groundwater over-extraction, economic disruption to water-intensive industries, and public health risks during extended dry periods.",
    likelyCauses: [
      "Aging distribution infrastructure with high leakage rates (15–30% NRW)",
      "Seasonal variation in reservoir inflow during lean months",
      "Unmetered or under-metered bulk consumers",
      "Rapid population growth outpacing supply augmentation plans",
    ],
    evidenceQuality: "Profile capacity estimate — actual NRW audit and reservoir telemetry not connected",
    suggestedInterventions: [
      "District Metered Area (DMA) program to isolate and repair leaks",
      "Real-time SCADA monitoring of reservoir levels and pump stations",
      "Rainwater harvesting mandates for large institutional buildings",
      "Recycled water supply for industrial and non-potable uses",
    ],
    successMetrics: [
      "Non-revenue water (NRW) < 20% of total production",
      "Per capita supply ≥ 135 LPCD across all zones",
      "Reservoir dead storage utilization < 10% even in peak summer",
    ],
    dataGaps: "SCADA and utility billing data unavailable. Groundwater extraction not tracked.",
  },
  "energy-demand": {
    icon: Zap,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/10",
    whatItIs:
      "Grid demand during summer HVAC cooling peaks approaching substation rated capacity, risking unplanned load shedding, transformer stress, and inability to absorb additional renewable energy generation.",
    potentialImpact:
      "Business disruption, residential discomfort, grid reliability failures, increased fossil fuel peaking generation, and barriers to renewable energy integration.",
    likelyCauses: [
      "High cooling demand from poorly insulated building stock",
      "Simultaneous industrial, commercial, and residential peak loads",
      "Limited demand-response capability among large consumers",
      "Insufficient distributed energy storage buffering",
    ],
    evidenceQuality: "Profile estimate from city energy baseline — smart meter data not integrated",
    suggestedInterventions: [
      "Building energy performance standards for commercial stock",
      "Demand response program with industrial and large commercial consumers",
      "Battery energy storage at major substations",
      "Solar rooftop mandates for new developments",
    ],
    successMetrics: [
      "Peak demand growth < 2% annually",
      "Renewable share ≥ 30% of annual grid supply",
      "Zero unplanned load shedding days",
    ],
    dataGaps: "Smart meter penetration data unavailable. Distribution loss factor not modeled.",
  },
};

const PROBLEM_ICONS = {
  "air-quality": Wind,
  "traffic-congestion": Car,
  "green-space": Leaf,
  "flood-risk": Waves,
  "water-stress": Droplet,
  "energy-demand": Zap,
};

const SEVERITY_MAP = {
  "air-quality": (v) => (v > 150 ? "HIGH" : v > 100 ? "MODERATE" : "LOW"),
  "traffic-congestion": (v) => (v > 70 ? "HIGH" : v > 50 ? "MODERATE" : "LOW"),
  "green-space": (v) => (v < 10 ? "HIGH" : v < 20 ? "MODERATE" : "LOW"),
  "flood-risk": () => "MODERATE",
  "water-stress": (v) => (v > 85 ? "HIGH" : v > 75 ? "MODERATE" : "LOW"),
  "energy-demand": (v) => (v > 90 ? "HIGH" : v > 80 ? "MODERATE" : "LOW"),
};

const SEVERITY_STYLE = {
  HIGH: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  MODERATE: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  LOW: "border-slate-600 bg-slate-800 text-slate-400",
};

export default function CityProblemAnalyzer() {
  const { city, liveAirQuality, liveTrafficFlow } = useCity();
  const navigate = useNavigate();

  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState("citywide");
  const [showResult, setShowResult] = useState(false);

  const zones = useMemo(() => {
    const cityZones = (city.zones || []).map((z) => ({ id: z.id, name: z.name }));
    return [{ id: "citywide", name: "Entire City (Citywide)" }, ...cityZones];
  }, [city.zones]);

  const selectedZoneName = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId)?.name || "Entire City";
  }, [zones, selectedZoneId]);

  const metricValue = useMemo(() => {
    if (!selectedProblemId) return null;
    const problem = SUPPORTED_PROBLEMS.find((p) => p.id === selectedProblemId);
    if (!problem) return null;
    switch (selectedProblemId) {
      case "air-quality":
        return liveAirQuality?.us_aqi ?? city.metrics?.aqi?.value ?? 142;
      case "traffic-congestion":
        if (liveTrafficFlow && !liveTrafficFlow.isSimulated && liveTrafficFlow.freeFlowTravelTime > 0) {
          return Math.round(((liveTrafficFlow.currentTravelTime / liveTrafficFlow.freeFlowTravelTime) - 1) * 100);
        }
        return city.metrics?.traffic?.value ?? 68;
      case "green-space":
        return city.metrics?.greenCover?.value ?? 18;
      case "water-stress":
        return city.metrics?.waterDemand?.value ?? 78;
      case "energy-demand":
        return city.metrics?.energyUsage?.value ?? 82;
      case "flood-risk":
        return null;
      default:
        return null;
    }
  }, [selectedProblemId, city, liveAirQuality, liveTrafficFlow]);

  const severity = useMemo(() => {
    if (!selectedProblemId) return null;
    const calc = SEVERITY_MAP[selectedProblemId];
    return calc ? calc(metricValue ?? 0) : "MODERATE";
  }, [selectedProblemId, metricValue]);

  const template = selectedProblemId ? ANALYSIS_TEMPLATES[selectedProblemId] : null;
  const problem = selectedProblemId ? SUPPORTED_PROBLEMS.find((p) => p.id === selectedProblemId) : null;

  const handleAnalyze = () => {
    if (!selectedProblemId) return;
    setShowResult(true);
  };

  const handleReset = () => {
    setShowResult(false);
    setSelectedProblemId(null);
  };

  return (
    <div className="fieldwork-card rounded-xl border border-slate-800 bg-[#121824] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0e141f] px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-2 text-teal-400">
            <FlaskConical className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">City Problem Analyzer</h3>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              RULE-BASED ANALYSIS ENGINE — Not AI prediction
            </p>
          </div>
        </div>
        {showResult && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 transition"
          >
            ← New Analysis
          </button>
        )}
      </div>

      {!showResult ? (
        /* Selector Panel */
        <div className="p-5 space-y-5">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
            <Info className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              Select a problem type and zone to generate a structured analysis: what the issue is, where it is occurring,
              what evidence supports it, its likely causes, suggested interventions, and how to measure success.
              All outputs are based on transparent rules applied to available city data — not machine learning predictions.
            </span>
          </div>

          {/* Problem type selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-2">
              Step 1 — Select a Problem Type
            </label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SUPPORTED_PROBLEMS.map((prob) => {
                const Icon = PROBLEM_ICONS[prob.id] || AlertTriangle;
                const isSelected = selectedProblemId === prob.id;
                return (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => setSelectedProblemId(prob.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
                      isSelected
                        ? "border-teal-500/60 bg-teal-500/10 text-white"
                        : "border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isSelected ? "text-teal-400" : "text-slate-500"}`} />
                    <div>
                      <p className="text-xs font-bold">{prob.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{prob.sector}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zone selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-2">
              Step 2 — Select Location / Zone
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0e141f] pl-9 pr-4 py-2.5 text-sm text-white appearance-none focus:border-teal-500 focus:outline-none cursor-pointer"
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedProblemId}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold transition ${
              selectedProblemId
                ? "bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Search className="h-4 w-4" />
            Analyze Problem
          </button>
        </div>
      ) : (
        /* Analysis Result Panel */
        <div className="p-5 space-y-5">
          {/* Location + Severity Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1">
                <MapPin className="h-3 w-3" />
                {city.name} · {selectedZoneName}
              </div>
              <h4 className="text-base font-bold text-white">{problem?.name}</h4>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{problem?.sector} · RULE-BASED ANALYSIS</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {metricValue !== null && (
                <div className="text-right mr-3">
                  <p className="font-mono text-xl font-black text-white">{metricValue}</p>
                  <p className="text-[10px] text-slate-500">{problem?.unit}</p>
                </div>
              )}
              <span className={`rounded-md border px-2 py-1 text-[10px] font-mono font-bold uppercase ${SEVERITY_STYLE[severity]}`}>
                {severity} Severity
              </span>
            </div>
          </div>

          {/* What it is */}
          <div className={`rounded-xl border p-4 space-y-1 ${template.borderColor} ${template.bgColor}`}>
            <p className="text-[10px] font-mono font-bold uppercase text-slate-400">What is the Problem?</p>
            <p className="text-xs leading-relaxed text-slate-200">{template.whatItIs}</p>
          </div>

          {/* Evidence + Potential Impact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-[#0e141f] p-4 space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase text-teal-400 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> Evidence Quality
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{template.evidenceQuality}</p>
              <p className="text-[10px] text-slate-500 mt-1">Threshold: {problem?.thresholdLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-[#0e141f] p-4 space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Potential Impact
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{template.potentialImpact}</p>
            </div>
          </div>

          {/* Likely Causes */}
          <div className="rounded-xl border border-slate-700 bg-[#0e141f] p-4 space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Likely Root Causes</p>
            <ul className="space-y-1">
              {template.likelyCauses.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-teal-400 font-mono font-bold shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Interventions */}
          <div className="rounded-xl border border-slate-700 bg-[#0e141f] p-4 space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Suggested Interventions</p>
            <ul className="space-y-1">
              {template.suggestedInterventions.map((intervention, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  {intervention}
                </li>
              ))}
            </ul>
          </div>

          {/* Success Metrics */}
          <div className="rounded-xl border border-slate-700 bg-[#0e141f] p-4 space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Success Metrics (Measurable Targets)</p>
            <ul className="space-y-1">
              {template.successMetrics.map((metric, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-indigo-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">KPI</span>
                  {metric}
                </li>
              ))}
            </ul>
          </div>

          {/* Data Gaps Disclosure */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[11px] text-amber-200">
            <span className="font-bold text-amber-300">Data Gaps: </span>{template.dataGaps}
          </div>

          {/* Action Bridges */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate("/action-planner", { state: { problemId: selectedProblemId } })}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-3 text-sm font-bold text-white transition cursor-pointer"
            >
              Plan an Intervention <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <MapPin className="h-4 w-4" /> View on City Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
