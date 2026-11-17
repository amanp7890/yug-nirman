import React from "react";
import { Sparkles, Activity } from "lucide-react";
import { useCity } from "../../context/CityContext";
import FeatureWhy from "./FeatureWhy";

export const PageHeader = ({ title, subtitle, icon: Icon, badge, actions, whyFeatureIds }) => {
  const { city } = useCity();

  return (
    <div className="relative mb-5 p-4 sm:p-5 rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {Icon && (
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-teal-400 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                {title}
              </h1>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{subtitle}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">{city.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/80 text-slate-300 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span>Public &amp; Scenario Data</span>
          </div>
          {whyFeatureIds && <FeatureWhy featureIds={whyFeatureIds} />}
          {actions}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
