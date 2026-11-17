import React from "react";
import { Recycle, SunMedium, Wind, Droplet, Trees, Zap, CheckCircle2 } from "lucide-react";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import EnergyChart from "../components/dashboard/EnergyChart";
import WaterChart from "../components/dashboard/WaterChart";

export const Sustainability = () => {
  const { city } = useCity();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy & Sustainability"
        subtitle="Explore example energy and water information and climate actions."
        icon={Recycle}
        badge="Scenario data"
        whyFeatureIds={["city-resources", "energy-intelligence", "water-intelligence", "waste-management"]}
      />

      <div className="p-3.5 rounded-lg bg-[#101622] border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-amber-300">DISCLOSURE:</span>
        <p className="flex-1 text-slate-400">
          Utility telemetry, carbon offsets, and decarbonization milestones are planning scenario baselines. Municipal grid and watershed APIs are disconnected.
        </p>
      </div>

      {/* Resource Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EnergyChart />
        <div id="water-consumption" className="scroll-mt-24">
          <WaterChart />
        </div>
      </div>

      {/* Decarbonization Roadmap */}
      <div className="p-5 rounded-xl fieldwork-card border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
              <Trees className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              MUNICIPAL DECARBONIZATION PATHWAY (2026 → 2040)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            Modelled Baseline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-lg bg-[#0e141f] border border-slate-800">
            <span className="text-[10px] font-mono text-teal-400 font-semibold block">01 / TARGET 2028</span>
            <h4 className="text-xs font-semibold text-white mt-1">100% Fleet Electrification</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Transition of municipal buses and first-responder light vehicles to pure electric powertrains.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0e141f] border border-slate-800">
            <span className="text-[10px] font-mono text-sky-400 font-semibold block">02 / TARGET 2032</span>
            <h4 className="text-xs font-semibold text-white mt-1">50% Renewable Integration</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Decentralized commercial solar mandates and regional wind interconnection contracts.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0e141f] border border-slate-800">
            <span className="text-[10px] font-mono text-amber-400 font-semibold block">03 / TARGET 2036</span>
            <h4 className="text-xs font-semibold text-white mt-1">Circular Water Recovery</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Zero untreated municipal wastewater discharge with tertiary closed-loop industrial recycling.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0e141f] border border-slate-800">
            <span className="text-[10px] font-mono text-emerald-400 font-semibold block">04 / TARGET 2040</span>
            <h4 className="text-xs font-semibold text-white mt-1">Net-Zero GHG Metropolis</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Scope 1 &amp; 2 carbon neutrality achieved through native forest canopy biosequestration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sustainability;
