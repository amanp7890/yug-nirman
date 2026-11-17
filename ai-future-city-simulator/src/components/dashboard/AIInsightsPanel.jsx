import React, { useState } from "react";
import { Bot, ArrowRight, Check, ClipboardCheck, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCity } from "../../context/CityContext";

export const AIInsightsPanel = () => {
  const { aiInsights, city, liveAirQuality, liveWeather } = useCity();
  const navigate = useNavigate();
  const [appliedPolicies, setAppliedPolicies] = useState({});

  const handleReviewPolicy = (insightId) => {
    setAppliedPolicies((prev) => ({ ...prev, [insightId]: true }));
  };

  // Generate dynamic live-triggered insights based on Open-Meteo
  const liveUsAqi = liveAirQuality?.us_aqi != null && Number.isFinite(Number(liveAirQuality.us_aqi))
    ? Number(liveAirQuality.us_aqi)
    : null;
  const liveEuropeanAqi = liveAirQuality?.european_aqi != null && Number.isFinite(Number(liveAirQuality.european_aqi))
    ? Number(liveAirQuality.european_aqi)
    : null;
  const liveAqi = liveUsAqi ?? liveEuropeanAqi;
  const liveAqiScale = liveUsAqi != null ? "US AQI" : "European AQI";
  const liveTemp = liveWeather?.temperature_2m != null ? Number(liveWeather.temperature_2m) : null;
  const livePrecip = liveWeather?.precipitation != null ? Number(liveWeather.precipitation) : null;

  const liveTriggeredInsights = [];
  if ((liveUsAqi != null && liveUsAqi >= 150) || (liveEuropeanAqi != null && liveEuropeanAqi >= 80)) {
    liveTriggeredInsights.push({
      id: "live-aqi-trigger",
      category: "Model threshold prompt",
      timeframe: "Current model value",
      title: `Review modeled ${liveAqiScale} ${Math.round(liveAqi)}`,
      insight: `Open-Meteo reports modeled ${liveAqiScale} ${Math.round(liveAqi)} at the selected coordinates. This is a threshold prompt, not an official alert; compare with a local monitoring station before taking action.`,
      isLiveTrigger: true,
    });
  } else if (liveTemp != null && liveTemp >= 30) {
    liveTriggeredInsights.push({
      id: "live-heat-trigger",
      category: "Weather threshold prompt",
      timeframe: "Current model value",
      title: `Review warm conditions: ${liveTemp.toFixed(1)}°C`,
      insight: `Open-Meteo reports ${liveTemp.toFixed(1)}°C for the selected coordinates. Check local weather and utility load data before planning a response.`,
      isLiveTrigger: true,
    });
  } else if (livePrecip != null && livePrecip >= 5) {
    liveTriggeredInsights.push({
      id: "live-rain-trigger",
      category: "Weather threshold prompt",
      timeframe: "Current model value",
      title: `Review precipitation: ${livePrecip.toFixed(1)} mm/h`,
      insight: `Open-Meteo reports ${livePrecip.toFixed(1)} mm/h for the selected coordinates. This is not a flood alert; compare with local rainfall and drainage observations.`,
      isLiveTrigger: true,
    });
  }

  // Combine live triggered with base insights
  const displayInsights = [...liveTriggeredInsights, ...aiInsights.slice(0, 4 - liveTriggeredInsights.length)];

  return (
    <div className="p-5 rounded-xl fieldwork-card border border-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-teal-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>POLICY DECISION SUPPORT</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#0e141f] text-teal-300 border border-slate-800 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                Templates + model thresholds
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic planning templates and coordinate-level model prompts for {city.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/ai-recommendations")}
          className="text-xs font-mono text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
        >
          <span>Policy Suite</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
        {displayInsights.map((insight) => {
          const isApplied = appliedPolicies[insight.id];
          const isLive = insight.isLiveTrigger;

          return (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between group ${
                isLive
                  ? "bg-[#16121a] border-amber-800/80 shadow-sm"
                  : "bg-[#0e141f] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                    isLive
                      ? "bg-amber-950/40 text-amber-300 border-amber-800/60 flex items-center gap-1"
                      : "bg-slate-800 text-teal-300 border-slate-700"
                  }`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {insight.category}
                  </span>
                  <span className="rounded border border-slate-800 px-1.5 py-0.5 text-[9px] font-mono uppercase text-slate-500">
                    {isLive ? "Rule triggered" : "Sample template"}
                  </span>
                </div>

                <h4 className={`text-xs font-semibold ${isLive ? "text-amber-200" : "text-white group-hover:text-teal-300 transition-colors"}`}>
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  "{insight.insight}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Horizon: {insight.timeframe}
                </span>

                <button
                  onClick={() => handleReviewPolicy(insight.id)}
                  disabled={isApplied}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                    isApplied
                      ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 cursor-default"
                      : isLive
                        ? "bg-amber-950/50 hover:bg-amber-900/50 text-amber-200 border border-amber-700/60"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400 inline mr-1" />
                      <span>Reviewed locally</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-3 h-3 inline mr-1" />
                      <span>Mark reviewed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>PROVENANCE: Screening triggers activate on US AQI ≥150, temperature ≥30°C, or precip ≥5 mm/h. Policy cards are bundled planning heuristics.</span>
        <span className="text-teal-400">Fieldwork Heuristics</span>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
