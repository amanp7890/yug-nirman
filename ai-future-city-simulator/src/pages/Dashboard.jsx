import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import BrandMark from "../components/common/BrandMark";
import FeatureWhy from "../components/common/FeatureWhy";
import {
  Users, Car, Wind, Droplet, Zap, Trees,
  MapPin, Clock, Calendar, Sparkles, Activity,
  ShieldCheck, RefreshCw, TrendingUp, TrendingDown,
  Eye, BarChart3, AlertTriangle, Siren, FlaskConical, GitCompare, Bot,
  FastForward, Pause, X, ArrowUpRight, Flame, CloudRain, Sun, Moon,
  Thermometer, Wifi, WifiOff
} from "lucide-react";
import { useCity } from "../context/CityContext";
import useCurrentPopulationEstimate from "../hooks/useCurrentPopulationEstimate";
import FutureForecastPreview from "../components/dashboard/FutureForecastPreview";
import QuickActions from "../components/dashboard/QuickActions";
import LiveCityMap from "../components/dashboard/LiveCityMap";
import PollutionChart from "../components/dashboard/PollutionChart";
import { getActionPlanStats, subscribeActionPlan } from "../utils/actionPlanStore";
import { getUrbanProblemsStats, subscribeUrbanProblems } from "../utils/urbanProblemsStore";

const parseMetricValue = (value) => {
  if (value == null || (typeof value === "string" && value.trim() === "")) return null;
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatModelTime = (value) => {
  const timestamp = Number(value);
  return Number.isFinite(timestamp)
    ? `${new Date(timestamp * 1000).toISOString().slice(11, 16)} UTC`
    : "time unavailable";
};

const projectCityMetric = (city, key, baseline, targetYear) => {
  const checkpoints = Object.entries(city.forecasts || {})
    .map(([year, forecast]) => ({ year: Number(year), value: parseMetricValue(forecast[key]) }))
    .filter((point) => Number.isFinite(point.year) && point.value != null)
    .sort((left, right) => left.year - right.year);
  const points = [{ year: 2026, value: baseline }, ...checkpoints];
  const exact = points.find((point) => point.year === targetYear);
  if (exact) return exact.value;

  const previous = [...points].reverse().find((point) => point.year < targetYear);
  const next = points.find((point) => point.year > targetYear);
  if (previous && next) {
    const progress = (targetYear - previous.year) / (next.year - previous.year);
    return previous.value + (next.value - previous.value) * progress;
  }
  if (previous && points.length > 1) {
    const earlier = [...points].reverse().find((point) => point.year < previous.year);
    if (earlier) {
      const annualChange = (previous.value - earlier.value) / (previous.year - earlier.year);
      return previous.value + annualChange * (targetYear - previous.year);
    }
  }
  return baseline;
};

/* ── Mini animated sparkline ── */
function SparkLine({ data, color }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const w = 64, h = 24;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Live Pulse Indicator ── */
function PulseIndicator({ color = "#2dd4bf" }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  );
}

/* ── KPI Strip Card with Click-to-Inspect ── */
function KpiCard({ title, value, change, trend, status, icon: Icon, sparkline, colorScheme, onClick, onExplain, changeLabel = "vs sample baseline" }) {
  const schemes = {
    blue:    { accent: "#0ea5e9", bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.2)", glow: "rgba(14,165,233,0.12)" },
    rose:    { accent: "#f43f5e", bg: "rgba(244,63,94,0.08)",  border: "rgba(244,63,94,0.2)",  glow: "rgba(244,63,94,0.1)" },
    amber:   { accent: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", glow: "rgba(245,158,11,0.1)" },
    cyan:    { accent: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)", glow: "rgba(34,211,238,0.1)" },
    purple:  { accent: "#a78bfa", bg: "rgba(167,139,250,0.08)",border: "rgba(167,139,250,0.2)",glow: "rgba(167,139,250,0.1)" },
    emerald: { accent: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", glow: "rgba(16,185,129,0.1)" },
    teal:    { accent: "#2dd4bf", bg: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.2)", glow: "rgba(45,212,191,0.1)" },
  };
  const s = schemes[colorScheme] || schemes.blue;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;
  const trendColor = trend === "up" ? "#f43f5e" : trend === "down" ? "#10b981" : "#38bdf8";

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      onClick={onClick}
      aria-label={`Inspect ${title}: ${value}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="dashboard-kpi-card relative w-full rounded-2xl p-4 text-left cursor-pointer group overflow-hidden transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      style={{
        "--kpi-accent": s.accent,
        "--kpi-glow": s.glow,
        background: `linear-gradient(145deg, ${s.bg}, rgba(5, 13, 30, 0.76))`,
        border: `1px solid ${s.border}`,
      }}
    >
      <div aria-hidden="true" className="dashboard-kpi-halo" />
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />

      <div className="flex items-start justify-between mb-3">
        <motion.div
          whileHover={{ rotate: -8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 420, damping: 15 }}
          className="rounded-xl p-2"
          style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: `0 0 18px ${s.glow}` }}
        >
          <Icon className="w-4 h-4" style={{ color: s.accent }} />
        </motion.div>
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold"
          style={{ color: trendColor }}>
          {TrendIcon && <TrendIcon className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>

      <div className="text-xl font-black font-mono mb-0.5 leading-tight" style={{ color: s.accent }}>
        {value}
      </div>
      <div className="text-[11px] text-slate-400 font-medium mb-3 uppercase tracking-wider flex items-center justify-between">
        <span>{title}</span>
        <ArrowUpRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
          style={{ background: s.bg, color: s.accent, border: `1px solid ${s.border}` }}>
          {status}
        </span>
        <div className="flex items-center gap-2">
          {onExplain && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onExplain();
              }}
              className="text-[9px] font-semibold px-2 py-0.5 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              What is this?
            </button>
          )}
          <span className="text-[9px] text-slate-500">{changeLabel}</span>
          <SparkLine data={sparkline} color={s.accent} />
        </div>
      </div>
    </motion.div>
  );
}

function ExplainFeatureModal({ feature, onClose }) {
  const [advancedMode, setAdvancedMode] = useState(false);
  if (!feature) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Explain this</div>
            <h3 className="text-xl font-bold text-white mt-1">{feature.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 hover:text-white">Close</button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-300 mb-2">Purpose</div>
            <p>{feature.purpose}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-violet-300 mb-2">Input</div>
              <p>{feature.input}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300 mb-2">Output</div>
              <p>{feature.output}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300 mb-2">How it works</div>
            <p>{feature.how}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-rose-300 mb-2">Why it matters</div>
            <p>{feature.why}</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-300">Advanced mode</div>
              <button type="button" onClick={() => setAdvancedMode((value) => !value)} className="rounded-full border border-cyan-400/40 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:border-cyan-300">
                {advancedMode ? "Hide technical detail" : "Show technical detail"}
              </button>
            </div>
            {advancedMode && (
              <p className="mt-3 text-slate-300 leading-relaxed">
                {feature.advanced}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export const Dashboard = () => {
  const {
    city, selectedCity, setSelectedCity, citiesList, currentTime, currentDate,
    liveAirQuality, liveWeather, liveWeatherError, liveAirQualityError, liveDataLoading, refreshLiveData,
    displayMode, setDisplayMode, liveTrafficConfigured, liveTrafficFlow, liveTrafficFlowError, liveTrafficLoading,
    liveFeedConfigured, liveFeedsLoading, liveSensorsAvailable, liveSensorStations, liveSensorsError
  } = useCity();

  const { metrics } = city;
  const currentPopulation = useCurrentPopulationEstimate(city);
  const populationEstimate = currentPopulation.estimate;
  const populationEstimateValue = Number.isFinite(populationEstimate?.population) ? populationEstimate.population : null;
  const isOfficialPopulationEstimate =
    populationEstimate?.source === "U.S. Census Bureau Population Estimates Program";
  const formatPopulation = (population) =>
    population >= 1_000_000
      ? `${(population / 1_000_000).toFixed(1)}M`
      : population.toLocaleString();
  const [refreshing, setRefreshing] = useState(false);
  const [livePackets, setLivePackets] = useState(28412);
  const [streamSpeed, setStreamSpeed] = useState(1); // 0 (pause), 1 (normal), 2 (fast), 5 (hyper)
  
  // Interactive Horizon Time Travel
  const [horizonYear, setHorizonYear] = useState(2026);

  // Active Emergency Scenario Injection
  const [activeScenario, setActiveScenario] = useState(null); // null, "monsoon", "heatwave", "traffic", "grid", "clean"

  // Metric Inspector Modal state
  const [inspectedMetric, setInspectedMetric] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);

  // Live Reactive Delivery & Incident Statistics (Automations A, D, E, F)
  const [actionStats, setActionStats] = useState(() => getActionPlanStats());
  const [problemStats, setProblemStats] = useState(() => getUrbanProblemsStats(city.id));

  useEffect(() => {
    setActionStats(getActionPlanStats());
    const unsub = subscribeActionPlan(() => {
      setActionStats(getActionPlanStats());
    });
    return unsub;
  }, []);

  useEffect(() => {
    setProblemStats(getUrbanProblemsStats(city.id));
    const unsub = subscribeUrbanProblems(() => {
      setProblemStats(getUrbanProblemsStats(city.id));
    });
    return unsub;
  }, [city.id]);
  const [explainFeature, setExplainFeature] = useState(null);
  const [scenarioChoice, setScenarioChoice] = useState("transit-first");

  useEffect(() => {
    if (!inspectedMetric) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setInspectedMetric(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [inspectedMetric]);

  // Streaming packet ticker responding to streamSpeed
  useEffect(() => {
    if (streamSpeed === 0) return;
    const intervalTime = Math.max(400, 2000 / streamSpeed);
    const interval = setInterval(() => {
      setLivePackets(p => p + Math.floor((Math.random() * 18 + 6) * streamSpeed));
    }, intervalTime);
    return () => clearInterval(interval);
  }, [streamSpeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshLiveData();
  };
  useEffect(() => {
    if (!liveDataLoading) setRefreshing(false);
  }, [liveDataLoading]);

  const getDynamicKpis = () => {
    const populationBaseline = populationEstimateValue
      ? populationEstimateValue / 1_000_000
      : parseMetricValue(metrics.population.display)
        ?? (parseMetricValue(metrics.population.value) ?? 0) / 1_000_000;
    let popVal = projectCityMetric(city, "population", populationBaseline, horizonYear);
    let trafficVal = projectCityMetric(city, "traffic", metrics.traffic.value, horizonYear);
    let aqiVal = projectCityMetric(city, "aqi", metrics.aqi.value, horizonYear);
    let energyVal = projectCityMetric(city, "energyUsage", metrics.energyUsage.value, horizonYear);
    let waterVal = projectCityMetric(city, "waterDemand", metrics.waterDemand.value, horizonYear);
    let greenVal = parseMetricValue(metrics.greenCover.value) ?? 0;
    const liveUsAqi = parseMetricValue(liveAirQuality?.us_aqi);
    const liveEuropeanAqi = parseMetricValue(liveAirQuality?.european_aqi);
    const liveAqiValue = liveUsAqi ?? liveEuropeanAqi;
    const useLiveAqi = horizonYear === 2026 && liveAqiValue != null;
    if (useLiveAqi) aqiVal = liveAqiValue;
    const useLiveTrafficFlow = horizonYear === 2026 && activeScenario == null && liveTrafficFlow != null;
    const liveTrafficDelay = useLiveTrafficFlow && liveTrafficFlow.freeFlowTravelTime > 0
      ? Math.round(
        ((liveTrafficFlow.currentTravelTime / liveTrafficFlow.freeFlowTravelTime) - 1) * 100
      )
      : null;

    // ── Live weather signals for energy & water (heuristic estimates) ─────────
    const liveTemp = parseMetricValue(liveWeather?.temperature_2m);
    const livePrecip = parseMetricValue(liveWeather?.precipitation);
    const hasLiveWeather = horizonYear === 2026 && activeScenario == null && liveTemp != null;

    let liveEnergyAdjPct = 0;
    let liveEnergyNote = null;
    if (hasLiveWeather) {
      if (liveTemp > 25) {
        liveEnergyAdjPct = Math.round((liveTemp - 25) * 1.2);
        liveEnergyNote = `+${liveEnergyAdjPct}% weather adj. (${liveTemp.toFixed(1)}°C cooling load)`;
      } else if (liveTemp < 15) {
        liveEnergyAdjPct = Math.round((15 - liveTemp) * 0.8);
        liveEnergyNote = `+${liveEnergyAdjPct}% weather adj. (${liveTemp.toFixed(1)}°C heating load)`;
      }
    }
    if (hasLiveWeather && liveEnergyAdjPct !== 0) {
      energyVal = Math.min(100, Math.round(energyVal * (1 + liveEnergyAdjPct / 100)));
    }

    let liveWaterAdjPct = 0;
    let liveWaterNote = null;
    if (hasLiveWeather) {
      const rain = Number.isFinite(livePrecip) ? livePrecip : 0;
      if (rain >= 10) { liveWaterAdjPct = -15; liveWaterNote = `−15% rain adj. (${rain} mm)`; }
      else if (rain >= 2) { liveWaterAdjPct = -8; liveWaterNote = `−8% rain adj. (${rain} mm)`; }
      else if (liveTemp > 30) { liveWaterAdjPct = 20; liveWaterNote = `+20% heat adj. (${liveTemp.toFixed(1)}°C)`; }
      else if (liveTemp > 25) { liveWaterAdjPct = 10; liveWaterNote = `+10% warm adj. (${liveTemp.toFixed(1)}°C)`; }
    }
    if (hasLiveWeather && liveWaterAdjPct !== 0) {
      waterVal = Math.min(100, Math.max(0, Math.round(waterVal * (1 + liveWaterAdjPct / 100))));
    }

    const applyBoundedChange = (value, change, maximum = 100) => Math.max(0, Math.min(maximum, Math.round(value + change)));

    // Apply scenario stress tests
    if (activeScenario === "monsoon") {
      trafficVal = applyBoundedChange(trafficVal, 24, 100);
      waterVal = applyBoundedChange(waterVal, 18);
      aqiVal = Math.max(35, Math.round(aqiVal - 25));
    } else if (activeScenario === "heatwave") {
      energyVal = applyBoundedChange(energyVal, 28);
      waterVal = applyBoundedChange(waterVal, 22);
      aqiVal = Math.round(aqiVal + 38);
    } else if (activeScenario === "traffic") {
      trafficVal = applyBoundedChange(trafficVal, 32, 100);
      aqiVal = Math.round(aqiVal + 24);
    } else if (activeScenario === "grid") {
      energyVal = applyBoundedChange(energyVal, 35);
    } else if (activeScenario === "clean") {
      trafficVal = Math.max(25, Math.round(trafficVal - 25));
      aqiVal = Math.max(28, Math.round(aqiVal - 45));
      greenVal = Math.min(65, Math.round(greenVal + 12));
    }

    const forecastSource = horizonYear === 2026
      ? (populationEstimateValue ? "Static 2026 population estimate" : "Bundled baseline profile")
      : `Illustrative city scenario · ${horizonYear}`;
    const metricSource = city.dataMode === "illustrative"
      ? `${forecastSource} (reference-city profile)`
      : forecastSource;
    const modelSource = `Open-Meteo ${liveUsAqi != null ? "US AQI" : "European AQI"} model`;
    const aqiSource = useLiveAqi
      ? activeScenario ? `${modelSource} + ${activeScenario} scenario` : modelSource
      : metricSource;
    const energySource = hasLiveWeather && liveEnergyAdjPct !== 0
      ? `${metricSource} + ${liveEnergyNote} (Open-Meteo)`
      : metricSource;
    const waterSource = hasLiveWeather && liveWaterAdjPct !== 0
      ? `${metricSource} + ${liveWaterNote} (Open-Meteo)`
      : metricSource;
    const changeFromBaseline = (value, baseline) => {
      if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) {
        return { change: "N/A", trend: "flat" };
      }
      const delta = ((value - baseline) / Math.abs(baseline)) * 100;
      return {
        change: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`,
        trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      };
    };
    const scenarioOrProjection = horizonYear !== 2026 || activeScenario != null;
    const metricChange = (value, baseline, original) => scenarioOrProjection
      ? changeFromBaseline(value, baseline)
      : { change: original.change, trend: original.trend };
    const aqiChange = useLiveAqi && !activeScenario
      ? { change: "Current", trend: "flat" }
      : metricChange(aqiVal, metrics.aqi.value, metrics.aqi);
    return {
      population: {
        ...metrics.population,
        ...metricChange(popVal, populationBaseline, metrics.population),
        display: `${popVal.toFixed(1)}M`,
        source: metricSource,
        status: scenarioOrProjection ? "SCENARIO" : "SAMPLE",
      },
      traffic: {
        ...metrics.traffic,
        ...(useLiveTrafficFlow
          ? { change: `${liveTrafficFlow.currentSpeed} km/h`, trend: "flat" }
          : metricChange(trafficVal, metrics.traffic.value, metrics.traffic)),
        display: useLiveTrafficFlow
          ? liveTrafficDelay === 0
            ? "0% vs free flow"
            : `${Math.abs(liveTrafficDelay)}% ${liveTrafficDelay < 0 ? "faster" : "slower"}`
          : `${Math.round(trafficVal)}%`,
        source: useLiveTrafficFlow
          ? "TomTom Flow Segment · nearest road to city reference point; not citywide"
          : metricSource,
        status: scenarioOrProjection ? "SCENARIO" : useLiveTrafficFlow ? "LIVE POINT" : "SAMPLE",
        sparkline: useLiveTrafficFlow ? [] : metrics.traffic.sparkline,
      },
      aqi: {
        ...metrics.aqi,
        ...aqiChange,
        display: `${Math.round(aqiVal)}${useLiveAqi ? ` ${liveUsAqi != null ? "US" : "European"} AQI` : ""}`,
        status: activeScenario || horizonYear !== 2026 ? "SCENARIO" : useLiveAqi ? "MODEL" : "SAMPLE",
        source: aqiSource,
        sparkline: useLiveAqi ? [] : metrics.aqi.sparkline,
      },
      waterDemand: {
        ...metrics.waterDemand,
        ...metricChange(waterVal, metrics.waterDemand.value, metrics.waterDemand),
        display: `${Math.round(waterVal)}%`,
        source: waterSource,
        status: scenarioOrProjection ? "SCENARIO" : (hasLiveWeather && liveWaterAdjPct !== 0 ? "LIVE EST." : "SAMPLE"),
        isLiveEstimate: hasLiveWeather && liveWaterAdjPct !== 0,
      },
      energyUsage: {
        ...metrics.energyUsage,
        ...metricChange(energyVal, metrics.energyUsage.value, metrics.energyUsage),
        display: `${Math.round(energyVal)}%`,
        source: energySource,
        status: scenarioOrProjection ? "SCENARIO" : (hasLiveWeather && liveEnergyAdjPct !== 0 ? "LIVE EST." : "SAMPLE"),
        isLiveEstimate: hasLiveWeather && liveEnergyAdjPct !== 0,
      },
      greenCover: {
        ...metrics.greenCover,
        ...metricChange(greenVal, metrics.greenCover.value, metrics.greenCover),
        display: `${Math.round(greenVal)}%`,
        source: metricSource,
        status: scenarioOrProjection ? "SCENARIO" : "SAMPLE",
      },
    };
  };

  const dynamicMetrics = getDynamicKpis();
  const hasLiveModelAqi = dynamicMetrics.aqi.source.startsWith("Open-Meteo") && !activeScenario;
  const currentUsAqi = parseMetricValue(liveAirQuality?.us_aqi);
  const currentEuropeanAqi = parseMetricValue(liveAirQuality?.european_aqi);
  const currentModelAqi = currentUsAqi ?? currentEuropeanAqi;
  const modelAqiScale = currentUsAqi != null ? "US AQI" : "European AQI";

  const storySteps = [
    { title: "City", description: "Choose a city and understand the baseline public profile, current conditions, and location context." },
    { title: "Current Health", description: "Review the health score, live conditions, and how the city is trending today." },
    { title: "3D Digital Twin", description: "Inspect roads, transport links, green zones, and pollution hotspots in the city context." },
    { title: "Problem", description: "Identify the main friction: congestion, pollution risk, or service stress that blocks growth." },
    { title: "Future Forecast", description: "Project how the city changes under business-as-usual conditions over time." },
    { title: "What-if Decision", description: "Test a decision that balances mobility, emissions, resilience, and cost." },
    { title: "Simulation", description: "Run a scenario and compare the before/after effect of an intervention." },
    { title: "Impact", description: "Measure the change in congestion, air quality, health, and resource demand." },
    { title: "Recommendation", description: "Use the AI policy summary to choose a justified next action." },
    { title: "Report", description: "Package the story into an understandable briefing for a manager, professor, or stakeholder." },
  ];

  const decisionOptions = [
    {
      id: "transit-first",
      label: "Transit-first mix",
      summary: "Shift demand to metro and express bus corridors while keeping AQI stable.",
      before: { traffic: 68, aqi: 122 },
      after: { traffic: 47, aqi: 119 },
    },
    {
      id: "green-corridor",
      label: "Green corridor",
      summary: "Add tree canopy and EV charging without overbuilding new roads.",
      before: { traffic: 68, aqi: 122 },
      after: { traffic: 52, aqi: 110 },
    },
    {
      id: "dynamic-pricing",
      label: "Dynamic pricing",
      summary: "Use pricing + transit incentives to smooth peak congestion.",
      before: { traffic: 68, aqi: 122 },
      after: { traffic: 50, aqi: 116 },
    },
  ];

  const selectedDecision = decisionOptions.find((option) => option.id === scenarioChoice) || decisionOptions[0];
  const presentationSteps = [
    { title: "City context", subtitle: "This city starts with a known baseline and a place-specific operating profile." },
    { title: "Current health", subtitle: "The dashboard reveals current conditions and the issues affecting everyday life." },
    { title: "Digital twin view", subtitle: "The 3D map connects the city’s roads, green zones, service nodes, and exposure hotspots in one place." },
    { title: "Problem diagnosis", subtitle: "The story narrows the challenge to a single issue: congestion is creating public-health and mobility risk." },
    { title: "Forecast", subtitle: "Without action, growth and demand increase the pressure on mobility and air quality." },
    { title: "Decision", subtitle: "We test a specific intervention designed to reduce delay without worsening pollution." },
    { title: "Simulation", subtitle: "The simulator contrasts the baseline with a candidate intervention and makes the trade-off measurable." },
    { title: "Impact", subtitle: "The platform translates the scenario into before/after outcomes that can be explained in plain English." },
    { title: "Recommendation", subtitle: "The AI policy layer turns the result into a practical, defensible next action." },
    { title: "Report", subtitle: "The final output is a clear decision brief for a lecturer, stakeholder, or city team." },
  ];

  const handlePresentationReset = () => {
    setPresentationStep(0);
    setScenarioChoice("transit-first");
    setActiveScenario(null);
    setHorizonYear(2026);
    setPresentationMode(true);
  };

  const featureLibrary = {
    Population: {
      title: "Population",
      purpose: "Understand how fast the city is growing and whether current infrastructure can sustain demand.",
      input: "Selected city profile, forecast assumptions, and 2026–2050 city growth curves.",
      how: "The dashboard combines baseline projections with scenario-adjusted growth assumptions and displays the resulting population trend.",
      output: "A population estimate and change signal that shows whether the city is expanding, stabilizing, or overshooting infrastructure capacity.",
      why: "Population growth helps explain future pressure on transit, housing, energy, water, and public services.",
      advanced: "This panel is a bundled forecast abstraction. It is not a live census feed and should be replaced with official municipal data if connected to a municipal GIS or planning API.",
    },
    "Traffic Congestion": {
      title: "Traffic Congestion",
      purpose: "Spot when mobility pressure is likely to perform poorly and where a single intervention can improve travel times.",
      input: "Traffic-flow benchmarks and current delay estimates from the selected scenario or the nearest available traffic feed.",
      how: "The system blends baseline reference data with live nearest-road traffic if configured and highlights whether the city is faster or slower than expected.",
      output: "A delay percentage or traffic-flow reading that shows how congested the system is today or under a scenario.",
      why: "Traffic delay is the clearest visible signal of poor trip reliability and is often the first source of emissions and quality-of-life loss.",
      advanced: "When live TomTom data is enabled, only the nearest road segment is used for context and not a citywide average. This is a decision-support approximation, not a full network-level operations model.",
    },
    "Air Quality Index": {
      title: "Air Quality Index",
      purpose: "Monitor whether emissions and congestion are degrading health and to see if interventions improve the city breathing environment.",
      input: "Air-quality model data from Open-Meteo and scenario assumptions such as EV adoption, greening, and traffic demand changes.",
      how: "The panel estimates AQI using current conditions and scenario adjustments, without claiming direct monitoring from a municipal station network.",
      output: "An AQI estimate and change label that shows whether the city is improving or worsening.",
      why: "Clean air is a direct quality-of-life and public-health outcome, especially for transport and industrial planning.",
      advanced: "Open-Meteo AQI values are model estimates. They are useful for decision support but should not be treated as official pollutant sensor readings without a local monitoring network.",
    },
    "Water Demand": {
      title: "Water Demand",
      purpose: "Estimate whether climate and demand patterns are creating stress on water resources.",
      input: "Baseline demand assumptions and live weather-derived adjustments for heat, precipitation, and seasonal demand shifts.",
      how: "The system uses the city’s reference profile and adjusts for current weather conditions such as heat or rain to estimate stress.",
      output: "A demand or stress score expressed as a percentage change relative to the baseline profile.",
      why: "Water resilience matters for livability, infrastructure reliability, and long-term urban planning.",
      advanced: "Weather-based adjustments are support estimates for decision-making, not utility telemetry. A real deployment should connect to district-level water service data and climate models.",
    },
    "Energy Usage": {
      title: "Energy Usage",
      purpose: "Understand how weather, electrification, and growth are increasing or reducing city energy pressure.",
      input: "Baseline city energy profile and current weather conditions such as temperature or cooling load.",
      how: "The system combines baseline energy demand with temperature-driven adjustments and scenario assumptions to estimate system stress.",
      output: "An energy-demand percentage that indicates likely pressure on the grid or energy resilience.",
      why: "Energy planning determines reliability, affordability, and the city’s ability to electrify mobility and buildings.",
      advanced: "These estimates are not grid telemetry. They are scenario support signals that can be replaced with utility data, district load profiles, and climate-adjusted demand models.",
    },
    "Green Cover": {
      title: "Green Cover",
      purpose: "Track how much ecological space the city has for cooling, runoff management, and public health.",
      input: "Reference land-cover assumptions and scenario changes such as new parks, street trees, or greening interventions.",
      how: "The metric compares current green coverage to the city baseline and scenario assumptions about land conversion or restoration.",
      output: "A green-cover percentage and trend for the selected year or scenario.",
      why: "Green infrastructure is one of the clearest levers for cooling, flood protection, and improving resident experience.",
      advanced: "This is an illustrative land-cover estimate. In production it should be replaced with GIS land-cover classification or municipal urban forestry data.",
    },
    "Map Layers": {
      title: "Map Layers",
      purpose: "Show how streets, green areas, transport, pollution, and vulnerable assets connect in one urban picture.",
      input: "OpenStreetMap features around the selected city, plus the city’s near-real-time and scenario overlays.",
      how: "Layer toggles combine features such as transport nodes, green spaces, industrial zones, flood risk, and mobility points into a single context map.",
      output: "A layered city map that helps decision-makers inspect relationships across infrastructure and environmental risk.",
      why: "Urban problems are connected. The map makes that connection visible before a policy is chosen.",
      advanced: "This map is a public-geodata layer presentation. It is designed for planning workshops and can be upgraded with municipal IoT, parcel data, and land-use databases.",
    },
    "AI Recommendations": {
      title: "AI Recommendations",
      purpose: "Turn the city story into a shortlist of policy actions with an explainable rationale.",
      input: "Sample policy templates derived from the city’s health, mobility, and environmental signals.",
      how: "The dashboard ranks actions by impact and confidence and presents them as templates that can be reviewed and approved in-session.",
      output: "Recommendation cards with rationale, impact level, and review state.",
      why: "A good recommendation needs to be concrete, understandable, and tied to a clear city problem.",
      advanced: "These are example recommendation templates powered by local demo data, not outputs from a connected AI model or official policy engine. They are ready for real model integration when a production backend is available.",
    },
    "What-if Simulator": {
      title: "What-if Simulator",
      purpose: "Let a presenter test a policy combination and see the likely before/after impact quickly.",
      input: "Policy levers such as metro investment, congestion pricing, EV adoption, greening, and solar mandates.",
      how: "A scenario engine adjusts the city profile based on policy intensity and compares simulated outcomes to the current baseline.",
      output: "Traffic relief, AQI improvement, carbon abatement, budget impact, and projected health score.",
      why: "Translating policy choices into comparable outputs helps stakeholders decide with evidence instead of intuition.",
      advanced: "This is a stylized scenario model that uses reference-city assumptions and rule-based relationships. It can be upgraded to a calibrated system dynamics or optimization model later.",
    },
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-w-0 space-y-5 dashboard-content sm:space-y-6" data-display-mode={displayMode}>
      {/* ══════════════════════════════════════════════════════
          1. COMMAND CENTER HEADER WITH TIME HORIZON & CONTROLS
      ══════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════
          1. RESTRAINED EDITORIAL HEADER WITH HORIZON CONTROLLER
      ══════════════════════════════════════════════════════ */}
      <section className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-semibold bg-teal-950/70 border border-teal-800/80 px-2 py-0.5 rounded">
                Spatial Workspace
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">{city.name}, {city.country || city.state}</span>
              {city.dataMode === "illustrative" && (
                <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  Illustrative Reference
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Understand your city.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Explore spatial infrastructure, live atmospheric readings, and scenario models across {city.name}.
            </p>
          </div>

          {/* Controls: Horizon Selector + Presentation */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 px-2 uppercase font-semibold">Horizon:</span>
              {[2026, 2030, 2035, 2040, 2050].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setHorizonYear(year)}
                  aria-pressed={horizonYear === year}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    horizonYear === year
                      ? "bg-teal-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Refresh public data"
              title="Refresh public data"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing || liveDataLoading ? "animate-spin text-teal-400" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setPresentationMode(true);
                setPresentationStep(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Presentation</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          1.1 AUTOMATED MUNICIPAL DELIVERY & INCIDENT COMMAND BAR (AUTOMATIONS A, D, E, F)
      ══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Delivery Interventions */}
        <Link
          to="/implementation-tracker"
          className="p-3.5 rounded-xl border border-teal-500/30 bg-[#121824] hover:border-teal-500/60 transition group flex flex-col justify-between shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-teal-400 tracking-wider">
              Implementation Tracker
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
              {actionStats.averageProgress}% Done
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black font-mono text-white">
              {actionStats.activeCount} Active <span className="text-xs font-normal text-slate-400">/ {actionStats.total} total</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              ${(actionStats.totalCapex / 1_000_000).toFixed(1)}M municipal budget committed
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div style={{ width: `${actionStats.averageProgress}%` }} className="h-full bg-teal-400 rounded-full transition-all duration-500" />
          </div>
        </Link>

        {/* Active Municipal Problems & Incidents */}
        <Link
          to="/problems"
          className="p-3.5 rounded-xl border border-slate-800 bg-[#121824] hover:border-slate-700 transition group flex flex-col justify-between shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
              Urban Incidents &amp; Issues
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              problemStats.highCount > 0 ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" : "bg-slate-800 text-slate-300"
            }`}>
              {problemStats.highCount} Critical
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-black font-mono text-white">
              {problemStats.total} Logged <span className="text-xs font-normal text-slate-400">({problemStats.resolvedCount} resolved)</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              ~{(problemStats.totalImpactedResidents / 1000).toFixed(0)}k citizens in impact zone
            </div>
          </div>
          <span className="text-[10px] text-teal-400 group-hover:underline flex items-center gap-1 font-semibold">
            View evidence &amp; diagnostics →
          </span>
        </Link>

        {/* Automated Alert / Critical Breach Detector (Automation F) */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between shadow-sm ${
          problemStats.highCount > 0
            ? "border-rose-500/40 bg-rose-500/5 text-rose-200"
            : "border-slate-800 bg-[#121824] text-slate-300"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${problemStats.highCount > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
              Operational Sentinel
            </span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">Autonomous</span>
          </div>
          <div className="my-2">
            <div className="text-sm font-bold text-white">
              {problemStats.highCount > 0 ? "Threshold Breach Active" : "Operational Norms Maintained"}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {problemStats.highCount > 0
                ? `${problemStats.highCount} priority incidents demand planning intervention.`
                : "No unmitigated critical threshold deviations detected."}
            </p>
          </div>
          <Link
            to="/action-planner"
            className="text-[10px] font-bold text-teal-400 hover:text-white flex items-center gap-1"
          >
            Launch Action Planner →
          </Link>
        </div>

        {/* Quick Decision Operations Shortcut */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#121824] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-teal-400 tracking-wider">
              Decision Operations
            </span>
            <span className="text-[10px] font-mono text-slate-500">MCDA Engine</span>
          </div>
          <div className="my-1.5 space-y-1.5">
            <Link
              to="/action-planner"
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-sm"
            >
              <span>+ Plan Intervention</span>
              <span>→</span>
            </Link>
            <Link
              to="/reports"
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <span>Export Decision Brief</span>
              <span>↗</span>
            </Link>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Single source of truth active</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. MAIN SPATIAL WORKSPACE (MAP-FIRST CENTERPIECE)
      ══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Prominent Cartographic Map Anchor */}
        <div className="xl:col-span-8 flex flex-col gap-2">
          <div className="p-3 rounded-t-xl bg-[#121824] border border-slate-800 border-b-0 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-slate-200">Interactive City Map</span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-[11px] text-slate-400">
                {city.coordinates[0].toFixed(3)}°N, {city.coordinates[1].toFixed(3)}°E
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              {liveWeather?.temperature_2m != null && (
                <span>
                  Weather: <strong className="text-slate-200">{liveWeather.temperature_2m}°C</strong>
                </span>
              )}
              <Link
                to="/explore"
                className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Explore City Spatial Map →
              </Link>
            </div>
          </div>

          <div className="rounded-b-xl overflow-hidden border border-slate-800 bg-[#0e1420]">
            <LiveCityMap />
          </div>
        </div>

        {/* Right Column: Carefully Selected City Indicators (Asymmetric Composition) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Primary Hero Indicator: Air Quality Index */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setInspectedMetric({ title: "Air Quality Index", metric: dynamicMetrics.aqi, color: "#f59e0b" })}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setInspectedMetric({ title: "Air Quality Index", metric: dynamicMetrics.aqi, color: "#f59e0b" })}
            className="p-4 rounded-xl border border-slate-800 bg-[#121824] hover:border-slate-700 transition-colors cursor-pointer text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Primary Environmental Signal
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">Air Quality Index</h3>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                dynamicMetrics.aqi.value > 150
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : dynamicMetrics.aqi.value > 100
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {dynamicMetrics.aqi.status || "OBSERVED"}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-100">
                  {dynamicMetrics.aqi.display}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {modelAqiScale || "AQI scale"}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {hasLiveModelAqi ? `Model: ${formatModelTime(liveAirQuality?.time)}` : "Baseline Profile"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {hasLiveModelAqi
                ? "Open-Meteo numerical atmospheric model reading for this coordinate. Not a roadside physical sensor."
                : "Bundled city reference profile. Click to inspect full methodology."}
            </p>
          </div>

          {/* Secondary Indicators: Clean Structured Analytical Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Traffic Congestion / Speed */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setInspectedMetric({ title: "Traffic Delay", metric: dynamicMetrics.traffic, color: "#f43f5e" })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setInspectedMetric({ title: "Traffic Delay", metric: dynamicMetrics.traffic, color: "#f43f5e" })}
              className="p-3 rounded-xl border border-slate-800 bg-[#121824] hover:border-slate-700 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Traffic Delay</span>
                <Car className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100">
                {dynamicMetrics.traffic.display}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {liveTrafficFlow ? `${liveTrafficFlow.currentSpeed} km/h flow` : "Baseline estimate"}
              </div>
            </div>

            {/* Weather / Temperature */}
            <div
              className="p-3 rounded-xl border border-slate-800 bg-[#121824] text-left"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Temperature</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100">
                {liveWeather?.temperature_2m != null ? `${Number(liveWeather.temperature_2m).toFixed(1)}°C` : "—"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {liveWeather?.apparent_temperature != null ? `Feels like ${Number(liveWeather.apparent_temperature).toFixed(1)}°C` : "Open-Meteo feed"}
              </div>
            </div>

            {/* Green Canopy */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setInspectedMetric({ title: "Green Cover", metric: dynamicMetrics.greenCover, color: "#10b981" })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setInspectedMetric({ title: "Green Cover", metric: dynamicMetrics.greenCover, color: "#10b981" })}
              className="p-3 rounded-xl border border-slate-800 bg-[#121824] hover:border-slate-700 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Green Canopy</span>
                <Trees className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100">
                {dynamicMetrics.greenCover.display}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Urban tree cover
              </div>
            </div>

            {/* Population Baseline */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setInspectedMetric({ title: "Population", metric: dynamicMetrics.population, color: "#0ea5e9" })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setInspectedMetric({ title: "Population", metric: dynamicMetrics.population, color: "#0ea5e9" })}
              className="p-3 rounded-xl border border-slate-800 bg-[#121824] hover:border-slate-700 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Population</span>
                <Users className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100">
                {dynamicMetrics.population.display}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {isOfficialPopulationEstimate ? "U.S. Census baseline" : "2026 planning baseline"}
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#101622] text-xs">
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800 text-slate-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>City Health Score: {city.healthScore?.overall || 76}/100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesized from air quality, mapped transport accessibility, and resource resilience. Click any indicator for technical provenance.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. ANALYTICAL SECTION: ATMOSPHERIC & POLICY SCENARIOS
      ══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-2">
        {/* Left Column: Atmospheric Profile Chart */}
        <div className="xl:col-span-7">
          <PollutionChart />
        </div>

        {/* Right Column: Policy Scenario Workbench */}
        <div className="xl:col-span-5 p-5 rounded-xl border border-slate-800 bg-[#121824] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold block">
                  Planning Workbench
                </span>
                <h3 className="text-sm font-bold text-slate-100">Policy Scenario Impact</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Simulated
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Select a candidate intervention to test estimated trade-offs on traffic delay and air quality:
            </p>

            {/* 3 Selectable Policy Options */}
            <div className="space-y-2">
              {decisionOptions.map((option) => {
                const isSelected = scenarioChoice === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setScenarioChoice(option.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-teal-500/50 text-slate-100"
                        : "bg-[#0e1420] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{option.label}</span>
                      <span className="font-mono text-emerald-400">{option.after.traffic}% delay</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {option.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Before vs After Summary */}
            <div className="mt-4 p-3.5 rounded-lg bg-[#0e1420] border border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Traffic Delay:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedDecision.before.traffic}% → <strong className="text-emerald-400">{selectedDecision.after.traffic}%</strong>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${selectedDecision.after.traffic}%` }} className="bg-emerald-500 h-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">AQI Impact:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedDecision.before.aqi} → <strong className="text-teal-400">{selectedDecision.after.aqi}</strong>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${(selectedDecision.after.aqi / 200) * 100}%` }} className="bg-teal-500 h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <Link
              to="/action-planner"
              className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1"
            >
              Action Planner →
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/scenario-planner"
                className="text-xs font-semibold text-slate-300 hover:text-white"
              >
                Scenario Planner
              </Link>
              <Link
                to="/reports"
                className="text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. CONTEXT & PROVENANCE DISCLOSURE STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="p-4 rounded-xl border border-slate-800 bg-[#0e1420] text-xs text-slate-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <strong className="text-slate-200 block mb-0.5">Open-Meteo &amp; CAMS</strong>
            <span>Numerical weather and atmospheric models. Not roadside physical sensors.</span>
          </div>
          <div>
            <strong className="text-slate-200 block mb-0.5">OpenStreetMap</strong>
            <span>Community-mapped road centerlines, signals, transit stops, and charging points.</span>
          </div>
          <div>
            <strong className="text-slate-200 block mb-0.5">Sensor.Community</strong>
            <span>Crowdsourced particulate telemetry within 25 km where available.</span>
          </div>
          <div>
            <strong className="text-slate-200 block mb-0.5">Transparent Heuristics</strong>
            <span>Scenario calculations apply deterministic arithmetic formulas, not black-box AI.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. QUICK ACCESS SHORTCUTS
      ══════════════════════════════════════════════════════ */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Explore Platform Tools</span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">Direct shortcuts to specialized workspaces</span>
        </div>
        <QuickActions />
      </div>

      {/* ══════════════════════════════════════════════════════
          10. KPI INSPECTOR MODAL (INTERACTIVE DRILLDOWN)
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {inspectedMetric && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setInspectedMetric(null);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="metric-inspector-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl p-6 bg-slate-900 border border-cyan-500/30 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: inspectedMetric.color }} />
                  <h3 id="metric-inspector-title" className="text-base font-bold text-white">{inspectedMetric.title} — Metric Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedMetric(null)}
                  aria-label="Close metric details"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black font-mono" style={{ color: inspectedMetric.color }}>
                    {inspectedMetric.metric.display}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Source: {inspectedMetric.metric.source}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Status Classification</span>
                    <span className="font-bold text-white">{inspectedMetric.metric.status}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Change vs baseline</span>
                    <span className="font-bold text-emerald-400">{inspectedMetric.metric.change}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-cyan-400 block mb-1">Data note:</span>
                  <p>{inspectedMetric.metric.source.startsWith("Open-Meteo")
                    ? "This is an Open-Meteo model estimate, not an official roadside monitor reading."
                    : inspectedMetric.metric.source.startsWith("TomTom")
                      ? "This reading describes the road segment nearest the selected city's reference coordinates. It is not a citywide traffic average; travel-time difference is relative to TomTom's free-flow estimate."
                      : "This value comes from the bundled illustrative city profile. Population, water, energy, and land-cover feeds are not connected."}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectedMetric(null)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-cyan-400"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {presentationMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPresentationMode(false);
            }}
          >
            <motion.div
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 14, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-300">Presentation mode</div>
                  <h3 className="mt-1 text-2xl font-bold text-white">{presentationSteps[presentationStep].title}</h3>
                </div>
                <button type="button" onClick={() => setPresentationMode(false)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 hover:text-white">Exit</button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-base text-slate-200">{presentationSteps[presentationStep].subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {storySteps.map((step, index) => (
                    <div key={step.title} className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${index === presentationStep ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200" : "border-slate-700 bg-slate-950/50 text-slate-400"}`}>
                      {index + 1}. {step.title}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 text-sm text-emerald-100">
                  Story goal: reduce traffic congestion without increasing pollution, while helping a professor or city planner understand why the chosen intervention is sensible.
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPresentationStep((value) => Math.max(0, value - 1))} disabled={presentationStep === 0} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                  <button type="button" onClick={handlePresentationReset} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300">Demo reset</button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (presentationStep === presentationSteps.length - 1) {
                      setPresentationMode(false);
                    } else {
                      setPresentationStep((value) => Math.min(value + 1, presentationSteps.length - 1));
                    }
                  }}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-black text-slate-950"
                >
                  {presentationStep === presentationSteps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {explainFeature && <ExplainFeatureModal feature={explainFeature} onClose={() => setExplainFeature(null)} />}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
};

export default Dashboard;
