import React from "react";
import { motion } from "framer-motion";
import { Compass, AlertTriangle, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    {
      title: "Explore City Spatial Map",
      subtitle: "Investigate 2D/3D arterial flow speeds, public transit lines, and sensor grids.",
      icon: MapPin,
      path: "/explore",
      color: "from-cyan-500/15 to-blue-600/10",
      border: "border-cyan-500/30 hover:border-cyan-400",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
    },
    {
      title: "Diagnose Active Problems",
      subtitle: "Screen municipal threshold breaches across mobility, air quality, flooding, and energy.",
      icon: AlertTriangle,
      path: "/problems",
      color: "from-amber-500/15 to-rose-600/10",
      border: "border-amber-500/30 hover:border-amber-400",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "City Action Planner (MCDA)",
      subtitle: "Rank candidate interventions using transparent multi-criteria decision analysis.",
      icon: Compass,
      path: "/action-planner",
      color: "from-teal-500/15 to-emerald-600/10",
      border: "border-teal-500/30 hover:border-teal-400",
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/10 border-teal-500/30",
    },
    {
      title: "Implementation Tracker",
      subtitle: "Track committed capital projects from approval to milestone delivery and KPI verification.",
      icon: CheckCircle2,
      path: "/implementation-tracker",
      color: "from-indigo-500/15 to-purple-600/10",
      border: "border-indigo-500/30 hover:border-indigo-400",
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/10 border-indigo-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            to={action.path}
            aria-label={`${action.title}: ${action.subtitle}`}
            className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className={`cursor-pointer p-4 rounded-2xl glass-panel border bg-gradient-to-br ${action.color} ${action.border} transition-all duration-200 group relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${action.iconBg} ${action.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {action.subtitle}
                </p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
