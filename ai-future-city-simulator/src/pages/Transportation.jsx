import React from "react";
import { Car, MapPin, Train, Zap } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import LiveCityMap from "../components/dashboard/LiveCityMap";
import TrafficSimulationPanel from "../components/dashboard/TrafficSimulationPanel";
import TrafficChart from "../components/dashboard/TrafficChart";
import { useCity } from "../context/CityContext";

export const Transportation = () => {
  const {
    city,
    liveTrafficConfigured,
    liveTrafficFlow,
    liveTrafficFlowError,
    liveTrafficLoading,
  } = useCity();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic & Transport"
        subtitle="Explore mapped roads, traffic lights, transit stops, and charging points."
        icon={Car}
        badge="OpenStreetMap data"
        whyFeatureIds="traffic-intelligence"
      />

      <div className="grid gap-3 rounded-xl border border-slate-800 bg-[#101622] p-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <span className="font-mono font-semibold text-teal-300 block mb-1">01 / MAP FEATURES</span>
          <p className="text-slate-400 leading-relaxed">
            Direct OpenStreetMap highway network, intersections, signals, and transit points. Network coverage status displayed per layer.
          </p>
        </div>
        <div>
          <span className="font-mono font-semibold text-amber-300 block mb-1">02 / INTERSECTION PRESSURE</span>
          <p className="text-slate-400 leading-relaxed">
            Planning heuristics identify mapped signals near high-density roads. Review recommendations are advisory, not verified delays.
          </p>
        </div>
        <div>
          <span className="font-mono font-semibold text-slate-300 block mb-1">03 / FLOW DYNAMICS</span>
          <p className="text-slate-400 leading-relaxed">
            Simulated rolling velocity computed every 15s using corridor models. Captures diurnal variation across arterial segments.
          </p>
        </div>
        <div>
          <span className="font-mono font-semibold text-teal-300 block mb-1">04 / ARTERIAL TELEMETRY</span>
          <p className="text-slate-400 leading-relaxed">
            {liveTrafficLoading
              ? "Checking arterial flow telemetry…"
              : liveTrafficFlow
                ? (liveTrafficFlow.isSimulated
                  ? `Corridor simulation active for ${city.name} (${liveTrafficFlow.currentSpeed} km/h · baseline ${liveTrafficFlow.freeFlowSpeed} km/h).`
                  : `Live arterial flow active for ${city.name} (${liveTrafficFlow.currentSpeed} km/h).`)
                : liveTrafficFlowError
                  ? "Corridor flow telemetry unavailable."
                  : "Active arterial baseline."}
          </p>
        </div>
      </div>

      <LiveCityMap />

      <TrafficSimulationPanel />

      <TrafficChart />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl fieldwork-card border border-slate-800 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-teal-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold text-white tracking-wide">ROAD NETWORK</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">Basemap geometry and mapped signal nodes queried directly from OpenStreetMap Overpass API.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl fieldwork-card border border-slate-800 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-sky-400 shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold text-white tracking-wide">TRANSIT NODES</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">Mapped passenger stops and metro stations. Real-time timetable feeds require GTFS-RT integration.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl fieldwork-card border border-slate-800 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-emerald-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold text-white tracking-wide">EV INFRASTRUCTURE</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">Public charging station locations. Real-time socket occupancy requires OCPI operator roaming feeds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transportation;
