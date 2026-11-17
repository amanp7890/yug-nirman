import React from "react";
import { Activity, AlertTriangle, ArrowRight, CircleHelp, Droplet, Leaf, Wind, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCity } from "../../context/CityContext";
import { getCityDiagnosis } from "../../utils/cityDiagnosis";

const SEVERITY_STYLE = {
  HIGH: "border-rose-800/60 bg-rose-950/40 text-rose-300 font-mono",
  MODERATE: "border-amber-800/60 bg-amber-950/40 text-amber-300 font-mono",
};
const PROBLEM_ICONS = {
  traffic: Activity,
  air: Wind,
  energy: Zap,
  water: Droplet,
  green: Leaf,
};

const EVIDENCE_STYLE = {
  "LIVE FEED": "border-emerald-800/60 bg-emerald-950/40 text-emerald-300 font-mono",
  "LIVE MODEL": "border-teal-800/60 bg-teal-950/40 text-teal-300 font-mono",
  "ILLUSTRATIVE PROFILE": "border-slate-800 bg-slate-900 text-slate-400 font-mono",
};

function ProblemCard({ problem }) {
  const Icon = PROBLEM_ICONS[problem.id] || CircleHelp;
  return (
    <article className="rounded-xl border border-slate-800 fieldwork-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="rounded-lg border border-slate-700/80 bg-slate-800/80 p-2 text-teal-400">
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-mono font-semibold text-white tracking-wide">{problem.title}</h3>
            <p className="mt-0.5 text-xs font-mono text-slate-400">{problem.value}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`rounded border px-2 py-0.5 text-[10px] ${SEVERITY_STYLE[problem.severity]}`}>
            {problem.severity} · SCREEN
          </span>
          <span className={`rounded border px-2 py-0.5 text-[10px] ${EVIDENCE_STYLE[problem.evidenceClass]}`}>
            {problem.evidenceClass}
          </span>
        </div>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-mono text-[10px] text-slate-500">LOCATION</dt>
          <dd className="mt-0.5 text-slate-300 font-mono text-[11px]">{problem.location}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] text-slate-500">AFFECTED SECTORS</dt>
          <dd className="mt-0.5 text-slate-300 font-mono text-[11px]">{problem.systems}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] text-slate-500">EVIDENCE · {problem.source}</dt>
          <dd className="mt-0.5 leading-relaxed text-slate-300">{problem.evidence}</dd>
          {problem.updatedAt && <dd className="mt-1 text-[10px] font-mono text-slate-500">Retrieval time: {problem.updatedAt}</dd>}
        </div>
        <div>
          <dt className="font-mono text-[10px] text-slate-500">ATTRIBUTION / CONSTRAINTS</dt>
          <dd className="mt-0.5 leading-relaxed text-slate-300">{problem.cause}</dd>
        </div>
        <div className="sm:col-span-2 border-t border-slate-800 pt-2">
          <dt className="font-mono text-[10px] text-teal-400">RECOMMENDED ACTION</dt>
          <dd className="mt-0.5 leading-relaxed text-slate-300">{problem.nextCheck}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function CityDiagnosis({ onExplain }) {
  const { city, liveAirQuality, liveTrafficFlow } = useCity();
  const context = { city, liveAirQuality, liveTrafficFlow };
  const problems = getCityDiagnosis(context);

  return (
    <section id="city-diagnosis" aria-labelledby="city-diagnosis-title" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            <span>INDICATOR AUDIT · {city.name.toUpperCase()}</span>
          </div>
          <h2 id="city-diagnosis-title" className="mt-1 text-lg font-semibold text-white">
            Screening Diagnostics
          </h2>
          <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-slate-400">
            Identifies systemic stress across transport, air dispersion, green canopy, and municipal grid proxies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onExplain}
          <Link to="/transportation" className="inline-flex items-center gap-1 text-xs font-mono text-teal-300 hover:text-white">
            Mobility telemetry <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {problems.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {problems.map((problem) => <ProblemCard key={problem.id} problem={problem} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/55 p-4 text-xs text-slate-300">
          No available metric currently crosses these screening thresholds. This is not evidence that the city has no problems.
        </div>
      )}

      <details className="rounded-xl border border-slate-800 bg-slate-950/45 p-3">
        <summary className="cursor-pointer text-[11px] font-bold text-slate-300">
          Screening thresholds and limitations
        </summary>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          Demo congestion: moderate at 50%, high at 70%. AQI: moderate above 100,
          high above 150 on the US/profile scale; for European AQI, moderate
          above 40, high above 60. Energy and water profile indices: moderate at
          70%, high at 85%. Green-cover estimate: moderate below 20%, high below
          10%. These illustrative thresholds are not official standards. No
          location-level root cause is inferred from city-level profile values.
          Evidence labels distinguish live provider feeds, coordinate-level
          model output, and bundled profile proxies. Recommended next checks are
          validation steps, not quantified intervention or impact forecasts.
        </p>
      </details>
    </section>
  );
}
