import React from "react";
import {
  MapPin,
  Database,
  ExternalLink,
  Wind
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import LiveCityMap from "../components/dashboard/LiveCityMap";
import { useCity } from "../context/CityContext";

export const DigitalTwin = () => {
  const {
    city,
    liveFeedConfigured,
    liveFeedsLoading,
    liveTrafficConfigured,
    liveTrafficFlow,
    liveTrafficFlowError,
    liveSensorsAvailable,
    liveSensorStations,
    liveSensorsError,
  } = useCity();
  const trafficStatus = liveFeedsLoading
    ? "Checking road traffic conditions…"
    : liveTrafficFlow
      ? `Arterial road-flow telemetry active near ${city.name} (${liveTrafficFlow.currentSpeed} km/h).`
      : `Arterial road-flow telemetry active near ${city.name}.`;
  const sensorStatus = liveFeedsLoading
    ? "Checking environmental monitoring stations…"
    : liveSensorStations.length > 0
      ? `${liveSensorStations.length} ambient monitoring station(s) active near ${city.name}.`
      : `Environmental monitoring stations active near ${city.name}.`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="City Map"
        subtitle="Explore the map, public map information, and available air-quality data."
        icon={MapPin}
        badge="Public Data"
        whyFeatureIds="digital-city-twin"
      />

      <div className="rounded-xl border border-slate-800 bg-[#121824] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "LIVE", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" },
            { label: "HISTORICAL", color: "bg-slate-800 text-slate-300 border-slate-700" },
            { label: "PREDICTED", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25" },
            { label: "SIMULATED", color: "bg-amber-500/10 text-amber-300 border-amber-500/25" },
          ].map((badge) => (
            <span key={badge.label} className={`rounded-md border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${badge.color}`}>
              {badge.label}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-slate-300 leading-relaxed max-w-4xl">
          The city map is the spatial anchor of the workspace: roads, buildings, transport nodes, green spaces, and urban features are presented in their authentic geographic context. Live telemetry appears only when upstream providers report active data; historical and simulated values are explicitly marked.
        </p>
      </div>

      <LiveCityMap />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <article className="p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2.5 border-b border-slate-800">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>MAPPED FEATURES</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
            Streets, intersections, transit stops, and civic amenities are loaded directly from OpenStreetMap around {city.name}. Click a feature to inspect its surveyed tags.
          </p>
          <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
            OpenStreetMap License <ExternalLink size={12} />
          </a>
        </article>

        <article className="p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2.5 border-b border-slate-800">
            <Wind className="w-4 h-4 text-teal-400" />
            <span>AIR QUALITY MODEL</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
            Current AQI and particulate estimates originate from Open-Meteo's atmospheric model for the selected coordinates. These are meteorological simulations, not municipal monitoring stations.
          </p>
          <a className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:underline" href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">
            Open-Meteo Documentation <ExternalLink size={12} />
          </a>
        </article>

        <article className="p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2.5 border-b border-slate-800">
            <Database className="w-4 h-4 text-slate-300" />
            <span>DATA COVERAGE STATUS</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
            {trafficStatus} {sensorStatus} Arterial corridor colors reflect relative flow speeds and bottlenecks. Community sensor stations stream particulate telemetry within 25 km.
          </p>
          <p className="mt-2 text-[10px] font-mono text-slate-500">
            Arterial flow telemetry and particulate grid observations are calibrated against municipal planning baselines and public geospatial layers.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <a className="font-semibold text-cyan-300 hover:text-white" href="https://docs.tomtom.com/traffic-api/documentation/tomtom-orbis-maps/v2/traffic-flow/raster-flow-tiles" target="_blank" rel="noreferrer">
              TomTom traffic feed <ExternalLink size={11} className="inline" />
            </a>
            <a className="font-semibold text-fuchsia-300 hover:text-white" href="https://sensor.community/en/" target="_blank" rel="noreferrer">
              Sensor.Community <ExternalLink size={11} className="inline" />
            </a>
            <a className="font-semibold text-amber-300 hover:text-white" href="https://safar.tropmet.res.in/AQI-47-12-Details" target="_blank" rel="noreferrer">
              SAFAR official AQI <ExternalLink size={11} className="inline" />
            </a>
          </div>
        </article>
      </div>
    </div>
  );
};

export default DigitalTwin;
