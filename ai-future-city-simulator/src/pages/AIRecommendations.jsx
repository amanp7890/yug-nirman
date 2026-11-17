import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Check,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
  Filter,
  CheckSquare,
  Activity,
  Layers
} from "lucide-react";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import AIInsightsPanel from "../components/dashboard/AIInsightsPanel";
import confetti from "canvas-confetti";

export const AIRecommendations = () => {
  const { aiInsights, city } = useCity();
  const [approvedItems, setApprovedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");

  const handleApprove = (id) => {
    setApprovedItems((prev) => ({ ...prev, [id]: true }));
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#00f0ff", "#10b981", "#8b5cf6", "#38bdf8"]
    });
  };

  const categories = ["all", ...new Set(aiInsights.map((r) => r.category))];

  const filteredInsights = activeCategory === "all"
    ? aiInsights
    : aiInsights.filter((r) => r.category === activeCategory);

  const approvedCount = Object.keys(approvedItems).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning Suggestions"
        subtitle="Example ideas for city planning. Review them before use."
        icon={Bot}
        badge="Sample templates"
        whyFeatureIds={["ai-urban-planner", "city-optimization"]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{approvedCount} of {aiInsights.length} Reviewed</span>
            </span>
          </div>
        }
      />

      <div className="p-3.5 rounded-lg bg-[#101622] border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-amber-300">DISCLOSURE:</span>
        <p className="flex-1 text-slate-400">
          Recommendation templates are parameterized heuristics from local city planning baselines. Review and approval statuses are retained only within this local browser session.
        </p>
      </div>

      <AIInsightsPanel />

      {/* ── Interactive Category Filters ── */}
      <div className="p-3 rounded-xl fieldwork-card border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            SECTOR FILTER:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer border ${
                activeCategory === cat
                  ? "bg-slate-800 text-teal-300 border-teal-600/80 font-semibold shadow-sm"
                  : "bg-[#0e141f] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {cat === "all" ? "All Recommendations" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((rec) => {
          const isDone = approvedItems[rec.id];

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-xl fieldwork-card border transition-all ${
                isDone
                  ? "border-emerald-800/80 bg-[#0d171b]"
                  : "border-slate-800 hover:border-slate-700"
              } flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded border bg-slate-800 text-teal-300 border-slate-700">
                    {rec.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Sample heuristic
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        rec.impact === "Critical"
                          ? "bg-rose-950/40 text-rose-300 border border-rose-800/60"
                          : "bg-amber-950/40 text-amber-300 border border-amber-800/60"
                      }`}
                    >
                      {rec.impact}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mt-3">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  "{rec.insight}"
                </p>

                <div className="mt-4 p-3 rounded-lg bg-[#0e141f] border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Implementation Horizon:</span>
                    <span className="text-slate-300">{rec.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Digital Twin:</span>
                    <span className="text-teal-300 font-semibold">{city.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {isDone ? "Session audit: Reviewed" : "Audit: Pending review"}
                </span>

                <button
                  onClick={() => handleApprove(rec.id)}
                  disabled={isDone}
                  className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDone
                      ? "bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 cursor-default"
                      : "bg-teal-600 hover:bg-teal-500 text-white border border-teal-500/60 shadow-sm"
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reviewed</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Acknowledge Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;
