import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Droplet, CloudRain, Thermometer } from "lucide-react";
import { useCity } from "../../context/CityContext";

export const WaterChart = () => {
  const { water, liveWeather } = useCity();

  // Live weather-based water demand estimation
  const liveTemp = liveWeather?.temperature_2m != null ? Number(liveWeather.temperature_2m) : null;
  const livePrecip = liveWeather?.precipitation != null ? Number(liveWeather.precipitation) : null;
  const hasLiveWeather = liveTemp != null && Number.isFinite(liveTemp);

  let waterNote = "";
  let waterAdjColor = "text-emerald-400";

  if (hasLiveWeather) {
    const rain = Number.isFinite(livePrecip) ? livePrecip : null;
    if (rain != null && rain >= 10) {
      waterNote = `−15% est. demand (heavy rain ${rain} mm)`;
      waterAdjColor = "text-blue-400";
    } else if (rain != null && rain >= 2) {
      waterNote = `−8% est. demand (rain ${rain} mm)`;
      waterAdjColor = "text-cyan-400";
    } else if (liveTemp > 30) {
      waterNote = `+20% heuristic demand adjustment (${liveTemp.toFixed(1)}°C)`;
      waterAdjColor = "text-rose-400";
    } else if (liveTemp > 25) {
      waterNote = `+10% heuristic demand adjustment (${liveTemp.toFixed(1)}°C)`;
      waterAdjColor = "text-amber-400";
    } else {
      waterNote = `Normal conditions (${liveTemp.toFixed(1)}°C)`;
      waterAdjColor = "text-emerald-400";
    }
  }

  return (
    <div className="p-5 rounded-xl fieldwork-card border border-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-sky-400">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>WATER CONSUMPTION &amp; STORAGE</span>
              <span className="px-2 py-0.5 text-[9px] font-mono rounded border bg-amber-950/40 text-amber-300 border-amber-800/60">
                REFERENCE PROFILE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-sky-300 border border-slate-700">
                {water.currentDemand}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Bundled reservoir profile · Wastewater recovery rate: <span className="text-teal-300 font-mono">{water.recycleRate}</span>
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {water.reservoirCapacity}
        </span>
      </div>

      {/* Live Weather Water Signal */}
      {hasLiveWeather && (
        <div className="mt-3 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0e141f] border border-slate-800">
          {Number.isFinite(livePrecip) && livePrecip >= 2
            ? <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            : <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-mono block">LIVE METEOROLOGY → HYDROLOGICAL DEMAND SIGNAL</span>
            <p className={`text-xs font-mono font-bold mt-0.5 ${waterAdjColor}`}>{waterNote}</p>
          </div>
          <span className="ml-auto text-[9px] font-mono text-slate-500 shrink-0">Open-Meteo</span>
        </div>
      )}

      {/* Reservoir Capacity Gauges */}
      <div className="my-4 space-y-2.5">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>RESERVOIR STORAGE TIERS</span>
          <span className="text-[10px] font-mono text-slate-500">Static Reference</span>
        </div>
        <div className="space-y-2.5">
          {(water.lakes || []).map((lake, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium">{lake.name}</span>
                <span className="text-teal-300 font-mono font-semibold">{lake.level}% <span className="text-slate-500">({lake.capacity})</span></span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500"
                  style={{ width: `${lake.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Consumption Bar Chart */}
      <div className="mt-2">
        <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>WEEKLY DEMAND (MLD)</span>
          {hasLiveWeather && (
            <span className="text-[9px] font-mono text-slate-400">
              WEATHER ADJUSTED HEURISTIC
            </span>
          )}
        </div>
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={water.weeklyTrend || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0e141f", borderColor: "#334155", borderRadius: "0.5rem", fontSize: "11px", color: "#f8fafc" }}
              />
              <Bar dataKey="consumption" name="Profile (MLD)" fill="#0d9488" radius={[2, 2, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-1 text-[10px] font-mono text-slate-500">
        {hasLiveWeather
          ? "PROVENANCE: Bundled weekly profile. Weather input provides heuristic variance, not direct flow meter readings."
          : "PROVENANCE: Bundled reference profile data. Verified SCADA utility feeds are not connected."}
      </p>
    </div>
  );
};

export default WaterChart;
