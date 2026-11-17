import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Clock3, Gauge } from "lucide-react";
import { useCity } from "../../context/CityContext";
import { TRAFFIC_DATA } from "../../data/trafficData";
import { buildTrafficSimulation } from "../../data/trafficSimulation";

const SimulationTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-[#0e141f] p-3 text-xs shadow-xl">
      <div className="mb-1 font-mono text-slate-300 border-b border-slate-800 pb-1">T: {label} · simulated</div>
      <div className="text-rose-300 font-mono">Congestion: {point.congestion}%</div>
      <div className="text-teal-300 font-mono">Est speed: {point.speed} km/h</div>
      <div className="text-slate-400 font-mono">Flow index: {point.vehicles.toLocaleString()}</div>
    </div>
  );
};

export const TrafficSimulationPanel = () => {
  const { city } = useCity();
  const profile = TRAFFIC_DATA[city.id];
  const [simulation, setSimulation] = useState(() => buildTrafficSimulation(city, profile));

  useEffect(() => {
    const update = () => setSimulation(buildTrafficSimulation(city, profile));
    update();
    const interval = window.setInterval(update, 15_000);
    return () => window.clearInterval(interval);
  }, [city, profile]);

  return (
    <section className="rounded-xl border border-slate-800 p-5 fieldwork-card" aria-label="Live traffic simulation">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Activity className="h-4 w-4 text-teal-400" />
            <h2 className="text-sm font-semibold tracking-tight text-white">ROLLING CORRIDOR SIMULATION</h2>
            <span className="rounded border border-teal-800/80 bg-teal-950/40 px-2 py-0.5 text-[10px] font-mono font-medium text-teal-300">
              SIMULATED DYNAMICS
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Locally generated rolling velocity estimates for {city.name} corridors. Sample: {new Date(simulation.current.timestamp).toLocaleTimeString()}.
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Refreshed: {new Date(simulation.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Activity size={13} />Congestion Index</span>
          <strong className="mt-1 block font-mono text-xl text-rose-300">{simulation.current.congestion}%</strong>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Gauge size={13} />Corridor Velocity</span>
          <strong className="mt-1 block font-mono text-xl text-emerald-300">{simulation.current.speed} km/h</strong>
        </div>
        <div className="col-span-2 rounded-lg border border-slate-800 bg-[#0e141f] p-3 sm:col-span-1">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock3 size={13} />Model Step</span>
          <strong className="mt-1 block font-mono text-xl text-teal-300">15s Step</strong>
        </div>
      </div>

      <div className="mt-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={simulation.points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="trafficSimulationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimulationTooltip />} />
            <Area
              type="monotone"
              dataKey="congestion"
              stroke="#0d9488"
              strokeWidth={2}
              fill="url(#trafficSimulationGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[10px] font-mono text-slate-500" role="note">
        PROVENANCE: Rolling 3-minute synthetic series calculated deterministically from baseline corridor capacity. Values are not real-time GPS telemetry.
      </p>
    </section>
  );
};

export default TrafficSimulationPanel;
