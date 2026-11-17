import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Wind } from "lucide-react";
import { useCity } from "../../context/CityContext";
import { AQI_LEVELS } from "../../data/pollutionData";

const toTimestamp = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : timestamp;
  }
  return null;
};

const formatHourlyTime = (value) => {
  if (typeof value === "string") return value.split("T")[1]?.slice(0, 5) || "";
  const timestamp = toTimestamp(value);
  return timestamp == null
    ? ""
    : new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const readFiniteNumber = (value) => {
  if (value == null || (typeof value === "string" && value.trim() === "")) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const CustomPollutionTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-lg bg-[#0e141f] border border-slate-700 shadow-xl text-xs">
        <div className="text-slate-300 font-semibold mb-1 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
          <span className="font-mono">T: {label}</span>
          <span className="text-[10px] text-slate-500">Hourly Atmospheric Model</span>
        </div>
        <div className="space-y-1 mt-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">AQI Index:</span>
            <span className="font-mono font-bold text-amber-400">{data.aqi}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">PM 2.5:</span>
            <span className="font-mono font-semibold text-rose-300">{data.pm25} µg/m³</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">PM 10:</span>
            <span className="font-mono font-semibold text-teal-300">{data.pm10} µg/m³</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PollutionChart = () => {
  const { pollution, city, liveAirQuality, liveAirQualityHourly, liveAirQualityUnits } = useCity();
  const usAqi = readFiniteNumber(liveAirQuality?.us_aqi);
  const europeanAqi = readFiniteNumber(liveAirQuality?.european_aqi);
  const liveAqiKey = usAqi != null ? "us_aqi" : "european_aqi";
  const liveAqi = usAqi ?? europeanAqi;
  const isUsingLiveModel = liveAqi != null;
  const aqiScale = liveAqiKey === "us_aqi" ? "US AQI" : "European AQI";
  const currentAqi = isUsingLiveModel ? Math.round(liveAqi) : pollution.currentAQI;

  const pollutantValues = isUsingLiveModel
    ? [
        { name: "PM 2.5", key: "pm2_5", standard: "", fallbackUnit: "µg/m³" },
        { name: "PM 10", key: "pm10", standard: "", fallbackUnit: "µg/m³" },
        { name: "NO₂", key: "nitrogen_dioxide", standard: "", fallbackUnit: "µg/m³" },
        { name: "O₃", key: "ozone", standard: "", fallbackUnit: "µg/m³" },
      ]
        .filter(({ key }) => readFiniteNumber(liveAirQuality[key]) != null)
        .map(({ name, key, standard, fallbackUnit }) => ({
          name,
          value: liveAirQuality[key],
          standard,
          unit: liveAirQualityUnits?.[key] || fallbackUnit,
        }))
    : (pollution.pollutants || []).slice(0, 4);

  const hourlyTimes = liveAirQualityHourly?.time || [];
  const currentTimestamp = toTimestamp(liveAirQuality?.time);
  const currentHourlyIndex = currentTimestamp == null
    ? -1
    : hourlyTimes.findIndex((time) => toTimestamp(time) === currentTimestamp);
  const currentTimeIndex = currentHourlyIndex >= 0
    ? currentHourlyIndex
    : hourlyTimes.reduce((lastIndex, time, index) => {
        const timestamp = toTimestamp(time);
        return currentTimestamp != null && timestamp != null && timestamp <= currentTimestamp
          ? index
          : lastIndex;
      }, -1);
  const timelineEnd = currentTimeIndex >= 0 ? currentTimeIndex + 1 : hourlyTimes.length;
  const liveTimeline = liveAirQuality && liveAirQualityHourly && timelineEnd > 0
    ? Array.from({ length: Math.max(0, Math.min(25, timelineEnd)) }, (_, index) => {
        const pointIndex = Math.max(0, timelineEnd - 25) + index;
        return {
          time: formatHourlyTime(hourlyTimes[pointIndex]),
          aqi: liveAirQualityHourly[liveAqiKey]?.[pointIndex],
          pm25: liveAirQualityHourly.pm2_5?.[pointIndex],
          pm10: liveAirQualityHourly.pm10?.[pointIndex],
        };
      }).filter((point) => point.aqi != null && Number.isFinite(Number(point.aqi)))
    : [];
  const chartData = liveTimeline.length > 1 ? liveTimeline : pollution.timeline;

  const getStatusColor = (status) => {
    switch (status) {
      case "GOOD":
        return { text: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
      case "MODERATE":
        return { text: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" };
      case "POOR":
      case "UNHEALTHY":
        return { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" };
      case "DANGEROUS":
      case "SEVERE":
        return { text: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" };
      default:
        return { text: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/30" };
    }
  };
  const statusStyle = getStatusColor(isUsingLiveModel ? "MODEL" : pollution.status);

  return (
    <div className="p-5 rounded-xl fieldwork-card border border-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-amber-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>AIR QUALITY CONDITIONS</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {currentAqi} {isUsingLiveModel ? aqiScale : "AQI"} • {isUsingLiveModel ? "OPEN-METEO MODEL" : "SAMPLE PROFILE"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isUsingLiveModel
                ? `Open-Meteo/CAMS ${aqiScale} atmospheric dispersion model for ${city.name} · Not direct municipal sensor telemetry`
                : `Bundled reference air-quality profile${city.dataMode === "illustrative" ? " (reference values)" : ""} · Live model data is currently unavailable`}
            </p>
          </div>
        </div>

        {/* Categories Legend */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {AQI_LEVELS.map((level, idx) => (
            <span
              key={idx}
              title={`AQI ${level.range}`}
              className={`px-2 py-0.5 text-[10px] font-mono rounded border whitespace-nowrap cursor-default ${level.bg} ${level.color} ${level.border}`}
            >
              {level.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Hourly pollutant concentration progression (24-hour cycle)</span>
        <span className="font-mono text-[11px] text-slate-500">Resolution: 1h step</span>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
        {pollutantValues.map((p, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[#0e141f] border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-medium text-slate-300">{p.name}</span>
              {p.standard && <span className="text-[9px] font-mono text-slate-500">Std: {p.standard}</span>}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-white">{p.value}</span>
              <span className="text-[10px] font-mono text-slate-400">{p.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="h-56 w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomPollutionTooltip />} />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1.5, stroke: "#0b0f15" }}
              activeDot={{ r: 5, fill: "#38bdf8", stroke: "#0b0f15", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] font-mono text-slate-500">
        {liveTimeline.length > 1
          ? `PROVENANCE: Recent hourly Open-Meteo/CAMS ${aqiScale} output. Station coverage varies across city sectors.`
          : "PROVENANCE: Bundled reference city profile. Hourly public model feed is currently unavailable."}
      </p>
    </div>
  );
};

export default PollutionChart;
