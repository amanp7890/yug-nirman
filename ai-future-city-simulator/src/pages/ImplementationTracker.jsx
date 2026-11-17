import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Plus,
  Download,
  Trash2,
  Building2,
  TrendingUp,
  RefreshCw,
  Layers,
  Calendar,
  BarChart3,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Sliders,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  ShieldCheck,
  Compass,
  DollarSign,
  Activity,
  X,
  FileText,
} from "lucide-react";
import { useCity } from "../context/CityContext";
import PageHeader from "../components/common/PageHeader";
import {
  getActionPlan,
  addActionPlanEntry,
  updateActionPlanEntry,
  removeActionPlanEntry,
  getActionPlanStats,
  exportActionPlanJson,
  exportActionPlanCsv,
  resetActionPlanToDefaults,
} from "../utils/actionPlanStore";

const STATUS_CONFIG = {
  proposed: { label: "Proposed", color: "border-slate-600 bg-slate-800 text-slate-300", dot: "bg-slate-400" },
  approved: { label: "Approved", color: "border-blue-500/40 bg-blue-500/10 text-blue-300", dot: "bg-blue-400" },
  planned: { label: "Planned", color: "border-purple-500/40 bg-purple-500/10 text-purple-300", dot: "bg-purple-400" },
  "in-progress": { label: "In Progress", color: "border-teal-500/40 bg-teal-500/10 text-teal-300", dot: "bg-teal-400" },
  completed: { label: "Completed", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
  "on-hold": { label: "On Hold", color: "border-amber-500/40 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" },
};

const SECTORS = ["All", "Mobility", "Environment", "Infrastructure", "Sanitation", "Urban Ecology", "Resources", "Energy"];

export default function ImplementationTracker() {
  const { city } = useCity();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(getActionPlan);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeSectorFilter, setActiveSectorFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [expandedCards, setExpandedCards] = useState(() => new Set(["ap-seed-01", "ap-seed-02"]));
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for new intervention
  const [formData, setFormData] = useState({
    actionTitle: "",
    problemTitle: "Arterial Road Congestion & Delay",
    problemId: "traffic-congestion",
    actionSector: "Mobility",
    department: "Directorate of Urban Mobility",
    capexMillion: 20,
    score: 85,
    status: "planned",
    progress: 0,
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    baselineMeasurement: "",
    afterMeasurement: "",
    notes: "",
  });

  const refreshPlan = () => {
    setPlan(getActionPlan());
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const stats = useMemo(() => {
    const total = plan.length;
    const completed = plan.filter((e) => e.status === "completed").length;
    const inProgress = plan.filter((e) => e.status === "in-progress").length;
    const totalCapex = plan.reduce((sum, e) => sum + (Number(e.capexMillion) || 0), 0);
    const avgProgress = total > 0 ? Math.round(plan.reduce((sum, e) => sum + (Number(e.progress) || 0), 0) / total) : 0;
    return { total, completed, inProgress, totalCapex, avgProgress };
  }, [plan]);

  const filteredPlan = useMemo(() => {
    return plan.filter((entry) => {
      const matchStatus = activeStatusFilter === "all" || entry.status === activeStatusFilter;
      const matchSector = activeSectorFilter === "All" || entry.actionSector?.toLowerCase() === activeSectorFilter.toLowerCase();
      const matchSearch =
        searchQuery.trim() === "" ||
        (entry.actionTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.problemTitle || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSector && matchSearch;
    });
  }, [plan, activeStatusFilter, activeSectorFilter, searchQuery]);

  const toggleCardExpand = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = (id, newStatus) => {
    updateActionPlanEntry(id, {
      status: newStatus,
      progress: newStatus === "completed" ? 100 : newStatus === "proposed" ? 0 : undefined,
    });
    refreshPlan();
    showToast(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
  };

  const handleProgressChange = (id, newProgress) => {
    const p = Math.min(100, Math.max(0, Number(newProgress)));
    updateActionPlanEntry(id, {
      progress: p,
      status: p === 100 ? "completed" : p > 0 ? "in-progress" : undefined,
    });
    refreshPlan();
  };

  const handleToggleMilestone = (entryId, milestoneId) => {
    const entry = plan.find((e) => e.id === entryId);
    if (!entry || !entry.milestones) return;

    const nextMilestones = entry.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = nextMilestones.filter((m) => m.completed).length;
    const computedProgress = Math.round((completedCount / nextMilestones.length) * 100);

    updateActionPlanEntry(entryId, {
      milestones: nextMilestones,
      progress: computedProgress,
      status: computedProgress === 100 ? "completed" : computedProgress > 0 ? "in-progress" : entry.status,
    });
    refreshPlan();
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from tracking?`)) {
      removeActionPlanEntry(id);
      refreshPlan();
      showToast("Intervention removed from tracking register");
    }
  };

  const handleExportJson = () => {
    const dataStr = exportActionPlanJson();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${city.name.toLowerCase()}-implementation-tracker.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Implementation register exported as JSON");
  };

  const handleExportCsv = () => {
    const csvStr = exportActionPlanCsv();
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${city.name.toLowerCase()}-implementation-tracker.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Implementation register exported as CSV");
  };

  const handleReset = () => {
    if (window.confirm("Reset implementation tracker to standard municipal seed interventions for " + city.name + "?")) {
      resetActionPlanToDefaults();
      refreshPlan();
      showToast("Reset to default municipal interventions");
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.actionTitle.trim()) return;

    addActionPlanEntry({
      ...formData,
      capexMillion: Number(formData.capexMillion) || 10,
      score: Number(formData.score) || 80,
      progress: Number(formData.progress) || 0,
      milestones: [
        { id: "m1", title: "Preliminary feasibility and ward surveys", completed: false, targetDate: "M+3" },
        { id: "m2", title: "Statutory tender & agency onboarding", completed: false, targetDate: "M+6" },
        { id: "m3", title: "Ground execution and physical deployment", completed: false, targetDate: "M+9" },
        { id: "m4", title: "Audit verification and handover", completed: false, targetDate: "M+12" },
      ],
    });

    setShowAddModal(false);
    refreshPlan();
    showToast(`Added "${formData.actionTitle}" to tracking register`);
    setFormData({
      actionTitle: "",
      problemTitle: "Arterial Road Congestion & Delay",
      problemId: "traffic-congestion",
      actionSector: "Mobility",
      department: "Directorate of Urban Mobility",
      capexMillion: 20,
      score: 85,
      status: "planned",
      progress: 0,
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      baselineMeasurement: "",
      afterMeasurement: "",
      notes: "",
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-16">
      <PageHeader
        title="Implementation Tracker"
        subtitle={`Municipal project registry for ${city.name}: track approved capital interventions from proposal through execution, verify milestone delivery, and monitor before-and-after KPI shifts.`}
        icon={CheckCircle2}
        badge="Decision Delivery Workspace"
        badgeStyle="teal"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Log Intervention
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <FileJson className="h-3.5 w-3.5 text-teal-400" /> JSON
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset to sample municipal seeds"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0e141f] hover:border-slate-700 p-2 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-teal-500/40 bg-[#0e1724] px-4 py-3 text-xs font-semibold text-teal-300 shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── KPI Summary Strip ── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tracked Interventions</span>
            <Layers className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">active projects</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-teal-400 flex items-center gap-2">
            <span>{stats.inProgress} In Progress</span> · <span>{stats.completed} Completed</span>
          </div>
        </div>

        <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Committed CapEx Budget</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">${stats.totalCapex}M</span>
            <span className="text-[11px] text-slate-400">allocated</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Multi-criteria prioritized outlay
          </div>
        </div>

        <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Delivery Progress</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">{stats.avgProgress}%</span>
            <span className="text-[11px] text-slate-400">weighted completion</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${stats.avgProgress}%` }} />
          </div>
        </div>

        <div className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Decision Linkage</span>
            <Compass className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">100%</span>
            <span className="text-[11px] text-slate-400">traceable</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Connected to Action Planner & Evidence
          </div>
        </div>
      </section>

      {/* ── Filter & Search Control Bar ── */}
      <section className="fieldwork-card p-4 rounded-xl border border-slate-800 bg-[#121824] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by intervention title, department, or problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#0e141f] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Sector:</span>
            <select
              value={activeSectorFilter}
              onChange={(e) => setActiveSectorFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* View switcher */}
            <div className="flex rounded-lg border border-slate-800 bg-[#0e141f] p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                  viewMode === "cards" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                  viewMode === "table" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Audit Table
              </button>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-500 mr-2">Lifecycle Phase:</span>
          <button
            type="button"
            onClick={() => setActiveStatusFilter("all")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-mono transition cursor-pointer ${
              activeStatusFilter === "all"
                ? "bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold"
                : "border border-slate-800 bg-[#0e141f] text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({plan.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = plan.filter((e) => e.status === key).length;
            const isSelected = activeStatusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveStatusFilter(key)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono transition cursor-pointer ${
                  isSelected
                    ? "border ring-1 ring-teal-500/50 " + cfg.color
                    : "border border-slate-800 bg-[#0e141f] text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                <span>{cfg.label}</span>
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Content: Cards View ── */}
      {viewMode === "cards" && (
        <section className="space-y-4">
          {filteredPlan.length === 0 ? (
            <div className="fieldwork-card rounded-xl border border-slate-800 bg-[#121824] p-12 text-center space-y-3">
              <AlertTriangle className="mx-auto h-8 w-8 text-slate-600" />
              <h3 className="text-sm font-bold text-white">No Interventions Match Your Filter</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try resetting your filters or select a recommended policy action from the City Action Planner.
              </p>
              <Link
                to="/action-planner"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition"
              >
                Go to Action Planner <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredPlan.map((item) => {
                const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.planned;
                const isExpanded = expandedCards.has(item.id);
                const completedMilestones = (item.milestones || []).filter((m) => m.completed).length;
                const totalMilestones = (item.milestones || []).length;

                return (
                  <article
                    key={item.id}
                    className="fieldwork-card rounded-xl border border-slate-800 bg-[#121824] p-5 shadow-sm space-y-4 hover:border-slate-700 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                            {item.actionSector}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            MCDA Score: <strong className="text-teal-400">{item.score}/100</strong>
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug pt-1">{item.actionTitle}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{item.department || "Municipal Authority"}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.actionTitle)}
                        title="Delete from tracker"
                        className="text-slate-600 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Problem link & Evidence statement */}
                    <div className="rounded-lg border border-slate-800/80 bg-[#0e141f] p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-teal-300 font-semibold">Addressing: {item.problemTitle}</span>
                        <span>${item.capexMillion}M CapEx</span>
                      </div>
                      {item.baselineMeasurement && (
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-slate-800/60">
                          <div>
                            <span className="text-slate-500 block">Baseline KPI:</span>
                            <span className="text-slate-300 font-semibold">{item.baselineMeasurement}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Target / Achieved:</span>
                            <span className="text-emerald-400 font-semibold">{item.afterMeasurement || "In measurement phase"}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-teal-400" /> Physical Completion
                        </span>
                        <span className="font-mono font-bold text-teal-300">{item.progress}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={item.progress}
                        onChange={(e) => handleProgressChange(item.id, e.target.value)}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Start: {item.startDate}</span>
                        <span>Target: {item.targetDate}</span>
                      </div>
                    </div>

                    {/* Status select dropdown */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 text-[11px]">Lifecycle Phase:</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="rounded-md border border-slate-700 bg-[#0e141f] px-2.5 py-1 text-xs font-semibold text-slate-200 focus:border-teal-500 focus:outline-none"
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                            <option key={k} value={k}>{cfg.label}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCardExpand(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition cursor-pointer"
                      >
                        <span>Milestones ({completedMilestones}/{totalMilestones})</span>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Collapsible Milestones Checklist */}
                    {isExpanded && (
                      <div className="space-y-2 rounded-lg border border-slate-800/80 bg-[#0c121c] p-3 text-xs animate-in fade-in">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Delivery Milestones & Quality Gates
                        </p>
                        <div className="space-y-1.5">
                          {(item.milestones || []).map((m) => (
                            <label
                              key={m.id}
                              className="flex items-start gap-2.5 rounded p-1.5 hover:bg-slate-800/40 cursor-pointer transition"
                            >
                              <input
                                type="checkbox"
                                checked={m.completed}
                                onChange={() => handleToggleMilestone(item.id, m.id)}
                                className="mt-0.5 accent-teal-500 rounded cursor-pointer"
                              />
                              <div className="flex-1 text-[11px] leading-tight">
                                <span className={m.completed ? "line-through text-slate-500" : "text-slate-200"}>
                                  {m.title}
                                </span>
                                {m.targetDate && (
                                  <span className="block text-[9px] font-mono text-slate-500 mt-0.5">
                                    Target: {m.targetDate}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>

                        {item.notes && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                            Notes: "{item.notes}"
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>Evidence: {item.evidenceSource || "Municipal Register"}</span>
                          <Link
                            to="/scenario-planner"
                            className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            Simulate Impact <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Content: Audit Table View ── */}
      {viewMode === "table" && (
        <section className="fieldwork-card overflow-hidden rounded-xl border border-slate-800 bg-[#121824] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0e141f] text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-4">Intervention Title</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Responsible Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">CapEx</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredPlan.map((item) => {
                  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.planned;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-sans font-bold text-slate-200 max-w-xs">
                        <div className="line-clamp-1">{item.actionTitle}</div>
                        <span className="text-[10px] text-slate-500 block font-mono font-normal">
                          Score: {item.score}/100 · {item.problemTitle}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400">{item.actionSector}</td>
                      <td className="py-3 px-4 font-sans text-slate-300 text-[11px]">{item.department || "Municipal Board"}</td>
                      <td className="py-3 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border focus:outline-none ${statusCfg.color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                            <option key={k} value={k}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-slate-200">${item.capexMillion}M</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-teal-500" style={{ width: `${item.progress}%` }} />
                          </div>
                          <span className="text-slate-300 font-bold text-[10px]">{item.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{item.targetDate}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.actionTitle)}
                          className="text-slate-500 hover:text-rose-400 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Modal: Add Intervention ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="fieldwork-card w-full max-w-lg rounded-2xl border border-slate-700 bg-[#121c2b] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Log New Municipal Intervention</h3>
                <p className="text-xs text-slate-400">Register a project into the decision tracking manifest</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Intervention Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Signal Telemetry on Western Expressway"
                  value={formData.actionTitle}
                  onChange={(e) => setFormData({ ...formData, actionTitle: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sector</label>
                  <select
                    value={formData.actionSector}
                    onChange={(e) => setFormData({ ...formData, actionSector: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {SECTORS.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                      <option key={k} value={k}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Responsible Department / Agency</label>
                <input
                  type="text"
                  placeholder="e.g. Directorate of Urban Mobility & Police Traffic Wing"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Estimated CapEx ($M)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capexMillion}
                    onChange={(e) => setFormData({ ...formData, capexMillion: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Initial Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Target Completion Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-[#0e141f] px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 font-bold text-white transition cursor-pointer"
                >
                  Save Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
