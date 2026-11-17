import React, { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Boxes,
  Car,
  Leaf,
  Zap,
  Users,
  Compass,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
} from "lucide-react";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import LiveCityMap from "../components/dashboard/LiveCityMap";
import PollutionChart from "../components/dashboard/PollutionChart";
import TrafficChart from "../components/dashboard/TrafficChart";
import TrafficSimulationPanel from "../components/dashboard/TrafficSimulationPanel";
import EnergyChart from "../components/dashboard/EnergyChart";
import WaterChart from "../components/dashboard/WaterChart";

const City3D = lazy(() => import("./City3D"));

export default function ExploreCity() {
  const { city } = useCity();
  const [activeTab, setActiveTab] = useState("map2d");

  const tabs = [
    { id: "map2d", label: "2D Spatial Map", icon: MapPin },
    { id: "city3d", label: "3D Procedural View", icon: Boxes },
    { id: "traffic", label: "Mobility & Traffic", icon: Car },
    { id: "environment", label: "Air & Weather", icon: Leaf },
    { id: "infrastructure", label: "Energy & Water", icon: Zap },
    { id: "demographics", label: "Population", icon: Users },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <PageHeader
        title={`Explore ${city.name}`}
        subtitle="Unified spatial workstation: investigate geographic layers, procedural 3D blocks, arterial flow speeds, and municipal infrastructure."
        icon={Compass}
        badge="Spatial Workspace"
        badgeStyle="teal"
        whyFeatureIds={["digital-city-twin", "city-3d-model"]}
      />

      {/* Sub-navigation Tabs */}
      <div className="fieldwork-card p-1.5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm flex flex-wrap gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? "bg-teal-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Decision Bridge Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-teal-500/30 bg-teal-500/10 p-3.5 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-teal-400 shrink-0" />
          <span>
            Spotted an urban hotspot or corridor bottleneck in <strong>{city.name}</strong>?
          </span>
        </div>
        <Link
          to="/action-planner"
          className="inline-flex items-center gap-1.5 font-bold text-teal-300 hover:text-white"
        >
          Open City Action Planner <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Tab 1: 2D Spatial Map */}
      {activeTab === "map2d" && (
        <section className="space-y-4">
          <LiveCityMap />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400">Layer Integrity</span>
              <h4 className="mt-1 text-sm font-bold text-white">OpenStreetMap Live Features</h4>
              <p className="mt-1 text-xs text-slate-400">
                Streets, traffic signals, transit stops, and public amenities are queried dynamically from OpenStreetMap mirrors for {city.name}.
              </p>
            </div>
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400">Flow Telemetry</span>
              <h4 className="mt-1 text-sm font-bold text-white">Nearest Road Speeds</h4>
              <p className="mt-1 text-xs text-slate-400">
                Arterial speeds and travel delay ratios query TomTom Traffic API when configured, with transparent local baseline fallback.
              </p>
            </div>
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <span className="text-[10px] font-mono font-bold uppercase text-teal-400">Community Grid</span>
              <h4 className="mt-1 text-sm font-bold text-white">Citizen Air Sensors</h4>
              <p className="mt-1 text-xs text-slate-400">
                Sensor.Community and OpenAQ ambient monitoring stations stream local particulate readings within municipal radius.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: 3D Procedural Scene */}
      {activeTab === "city3d" && (
        <section className="space-y-4">
          <Suspense fallback={
            <div className="h-96 w-full rounded-2xl border border-slate-800 bg-[#121824] flex items-center justify-center text-slate-400 text-xs">
              Loading 3D Procedural Engine…
            </div>
          }>
            <City3D />
          </Suspense>
        </section>
      )}

      {/* Tab 3: Mobility & Traffic */}
      {activeTab === "traffic" && (
        <section className="space-y-5">
          <TrafficSimulationPanel />
          <TrafficChart />
        </section>
      )}

      {/* Tab 4: Environment & Air */}
      {activeTab === "environment" && (
        <section className="space-y-5">
          <PollutionChart />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <p className="text-[10px] font-mono uppercase text-slate-400">Current Temperature</p>
              <p className="mt-1 font-mono text-xl font-bold text-white">
                {city.metrics?.weather?.temperature ?? 28}°C
              </p>
              <span className="text-[10px] text-slate-500">Open-Meteo Hourly Model</span>
            </div>
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <p className="text-[10px] font-mono uppercase text-slate-400">Relative Humidity</p>
              <p className="mt-1 font-mono text-xl font-bold text-white">
                {city.metrics?.weather?.humidity ?? 62}%
              </p>
              <span className="text-[10px] text-slate-500">Atmospheric Moisture</span>
            </div>
            <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
              <p className="text-[10px] font-mono uppercase text-slate-400">Wind Velocity</p>
              <p className="mt-1 font-mono text-xl font-bold text-white">
                {city.metrics?.weather?.windSpeed ?? 14} km/h
              </p>
              <span className="text-[10px] text-slate-500">Surface Wind Vector</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 5: Infrastructure & Resources */}
      {activeTab === "infrastructure" && (
        <section className="grid gap-5 lg:grid-cols-2">
          <EnergyChart />
          <WaterChart />
        </section>
      )}

      {/* Tab 6: Demographics */}
      {activeTab === "demographics" && (
        <section className="fieldwork-card p-6 rounded-xl border border-slate-800 bg-[#121824] space-y-4">
          <h3 className="text-base font-bold text-white">Municipal Population & Urban Density</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {city.name} population projections are anchored to official 2026 census benchmarks with transparent annual compound growth models.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">2026 Planning Estimate</span>
              <p className="mt-1 font-mono text-2xl font-black text-white">
                {city.metrics?.population?.display || `${((city.metrics?.population?.value || 12000000) / 1000000).toFixed(1)}M`}
              </p>
              <span className="text-[10px] text-slate-400">Official Census Projection</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">Annual Growth Assumption</span>
              <p className="mt-1 font-mono text-2xl font-black text-teal-300">+1.4%</p>
              <span className="text-[10px] text-slate-400">Compound Annual Rate</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0e141f] p-4">
              <span className="text-[10px] font-mono uppercase text-slate-500">2035 Horizon Projection</span>
              <p className="mt-1 font-mono text-2xl font-black text-white">
                {(((city.metrics?.population?.value || 12000000) * (1.014 ** 9)) / 1000000).toFixed(1)}M
              </p>
              <span className="text-[10px] text-slate-400">Estimated Municipal Scale</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
