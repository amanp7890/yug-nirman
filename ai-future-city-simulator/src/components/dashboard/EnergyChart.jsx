import React, { useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Zap, Thermometer, AlertTriangle } from "lucide-react";
import { useCity } from "../../context/CityContext";
import { ENERGY_DATA } from "../../data/energyData";

const CustomEnergyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-2.5 rounded-lg bg-[#0e141f] border border-slate-700 shadow-xl text-xs">
        <div className="font-mono text-slate-300 mb-0.5">{data.name || data.dataKey}</div>
        <div className="text-teal-300 font-mono font-semibold">
          {data.value} {data.dataKey === "actual" || data.dataKey === "solar" || data.dataKey === "wind" ? "MW" : "%"}
        </div>
      </div>
    );
  }
  return null;
};

export const EnergyChart = () => {
  const { energy, city, selectedCity, liveWeather } = useCity();
  const [view, setView] = useState("demand");
  const usesReferenceProfile = !Object.prototype.hasOwnProperty.call(ENERGY_DATA, selectedCity);
  const sectorBreakdown = energy.breakdown || [];
  const hourlyGridLoad = energy.hourlyGridLoad || [];
  const supplySources = energy.sources || [];

  // Live weather-based energy demand estimation
  const liveTemp = liveWeather?.temperature_2m != null ? Number(liveWeather.temperature_2m) : null;
  const hasLiveTemp = liveTemp != null && Number.isFinite(liveTemp);

  let energyAdjustmentPct = 0;
  let energyAdjustmentNote = "";
  let energyAdjustmentColor = "text-emerald-400";
  if (hasLiveTemp) {
    if (liveTemp > 25) {
      energyAdjustmentPct = Math.round((liveTemp - 25) * 1.2);
      energyAdjustmentNote = `+${energyAdjustmentPct}% est. cooling load (${liveTemp.toFixed(1)}°C)`;
      energyAdjustmentColor = energyAdjustmentPct > 15 ? "text-rose-400" : "text-amber-400";
    } else if (liveTemp < 15) {
      energyAdjustmentPct = Math.round((15 - liveTemp) * 0.8);
      energyAdjustmentNote = `+${energyAdjustmentPct}% est. heating load (${liveTemp.toFixed(1)}°C)`;
      energyAdjustmentColor = "text-sky-400";
    } else {
      energyAdjustmentNote = `Neutral range (${liveTemp.toFixed(1)}°C) · normal load`;
      energyAdjustmentColor = "text-emerald-400";
    }
  }

  return (
    <div className="p-5 rounded-xl fieldwork-card border border-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>ENERGY LOAD PROFILE</span>
              <span className="px-2 py-0.5 text-[9px] font-mono rounded border bg-amber-950/40 text-amber-300 border-amber-800/60">
                REFERENCE PROFILE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-teal-300 border border-slate-700">
                {energy.totalConsumption}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Illustrative grid profile for {city.name}{usesReferenceProfile ? " (Mumbai reference model)" : ""} · Renewable mix: <span className="text-emerald-400 font-mono">{energy.renewableMix}</span>
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          Peak: {energy.peakDemand}
        </span>
      </div>

      {/* Live Weather Energy Signal */}
      {hasLiveTemp && (
        <div className="mt-3 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0e141f] border border-slate-800">
          <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-mono block">LIVE WEATHER INPUT → ESTIMATED THERMAL LOAD</span>
            <p className={`text-xs font-mono font-bold mt-0.5 ${energyAdjustmentColor}`}>{energyAdjustmentNote}</p>
          </div>
          <span className="ml-auto text-[9px] font-mono text-slate-500 shrink-0">Open-Meteo</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-[#0e141f] p-1" role="group" aria-label="Energy grid views">
        {[
          ["demand", "Hourly grid load"],
          ["sectors", "Load by sector"],
          ["sources", "Grid & microgrids"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
              view === key ? "bg-slate-800 text-teal-300 font-semibold border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "demand" && (
        hourlyGridLoad.length > 0 ? (
          <div className="mt-3 h-52 w-full" aria-label="Illustrative hourly energy demand in megawatts">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyGridLoad} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit=" MW" />
                <Tooltip content={<CustomEnergyTooltip />} />
                <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                <Line type="monotone" dataKey="actual" name="Grid demand" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="solar" name="Solar output" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="wind" name="Wind output" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
            Hourly demand profile is not available for this city.
          </p>
        )
      )}

      {view === "sectors" && (
        sectorBreakdown.length > 0 ? (
          <div className="my-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
            <div className="relative flex h-44 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={4} dataKey="value">
                    {sectorBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomEnergyTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-slate-400">SECTOR LOAD</span>
                <span className="font-mono text-sm font-bold text-white">100%</span>
              </div>
            </div>
            <div className="space-y-2">
              {sectorBreakdown.map((item) => (
                <div key={item.name} className="rounded-lg border border-slate-800 bg-[#0e141f] p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
            Sector load breakdown is not available for this city.
          </p>
        )
      )}

      {view === "sources" && (
        supplySources.length > 0 ? (
          <div className="my-3 space-y-2">
            {supplySources.map((source) => (
              <div key={source.type} className="rounded-lg border border-slate-800 bg-[#0e141f] p-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-200">{source.type}</span>
                  <span className="shrink-0 font-mono font-bold text-teal-300">{source.capacity}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, Math.max(0, Number(source.percentage) || 0))}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-[10px] text-teal-300">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
            Grid supply sources are not available for this city.
          </p>
        )
      )}

      <p className="mt-1 text-[10px] font-mono text-slate-500">
        {hasLiveTemp
          ? "PROVENANCE: Bundled reference load profile. Live temperature adjustment is computed as a thermal impedance proxy."
          : "PROVENANCE: Bundled illustrative profile values. Direct municipal grid telemetry is not connected."}
      </p>
    </div>
  );
};

export default EnergyChart;
