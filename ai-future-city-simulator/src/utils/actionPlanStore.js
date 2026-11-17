/**
 * YUG NIRMAN — Implementation Tracker & Action Plan Store
 * Persists urban planning interventions to localStorage with rich audit fields:
 * - 6 Lifecycle Phases: "proposed" | "approved" | "planned" | "in-progress" | "completed" | "on-hold"
 * - Responsible Municipal Department / Lead Agency
 * - Target Milestones with completion checks
 * - Timeline (Start date & Target completion date)
 * - Quantitative progress (0–100%)
 * - Before & After KPI impact tracking
 * - Data provenance & supporting evidence links
 */

const STORE_KEY = "yug_action_plan_v2";

/**
 * @typedef {Object} Milestone
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 * @property {string} targetDate
 */

/**
 * @typedef {Object} ActionPlanEntry
 * @property {string} id
 * @property {string} problemId
 * @property {string} problemTitle
 * @property {string} actionId
 * @property {string} actionTitle
 * @property {string} actionSector
 * @property {number} score                   — MCDA score at time of saving (0–100)
 * @property {number} capexMillion            — Estimated cost in million USD
 * @property {"proposed"|"approved"|"planned"|"in-progress"|"completed"|"on-hold"} status
 * @property {string} department              — Responsible agency / authority
 * @property {number} progress                — Completion percentage (0–100)
 * @property {string} startDate
 * @property {string} targetDate
 * @property {Milestone[]} milestones
 * @property {string} notes
 * @property {string|null} baselineMeasurement
 * @property {string|null} afterMeasurement
 * @property {string} evidenceSource
 * @property {number} createdAt
 * @property {number} updatedAt
 */

export const DEFAULT_SEED_ACTIONS = [
  {
    id: "ap-seed-01",
    problemId: "traffic-congestion",
    problemTitle: "Arterial Road Congestion & Delay",
    actionId: "act-adaptive-signals",
    actionTitle: "Adaptive Traffic Signal Control (ATSC) on Arterial Corridors",
    actionSector: "Mobility",
    score: 87,
    capexMillion: 14,
    status: "in-progress",
    department: "Directorate of Urban Mobility & Traffic Police",
    progress: 65,
    startDate: "2026-02-15",
    targetDate: "2026-11-30",
    milestones: [
      { id: "m1", title: "Intersection camera & induction loop telemetry installed", completed: true, targetDate: "2026-04-10" },
      { id: "m2", title: "Centralized SCATS/SCOOT control center integration", completed: true, targetDate: "2026-07-20" },
      { id: "m3", title: "Dynamic corridor synchronization across 85 signals", completed: false, targetDate: "2026-10-15" },
      { id: "m4", title: "Post-commissioning travel time validation audit", completed: false, targetDate: "2026-11-30" },
    ],
    notes: "Corridor peak delay already down by 14% across Phase 1 pilot segments.",
    baselineMeasurement: "68% average delay index above free-flow",
    afterMeasurement: "Target: 48% delay index",
    evidenceSource: "TomTom Flow Telemetry & Municipal SCATS Sensors",
    createdAt: 1770000000000,
    updatedAt: 1772000000000,
  },
  {
    id: "ap-seed-02",
    problemId: "air-quality",
    problemTitle: "Elevated Particulate & Air Pollution",
    actionId: "act-lez",
    actionTitle: "Low-Emission Freight Zone (LEZ) with Time-of-Day Restrictions",
    actionSector: "Environment",
    score: 84,
    capexMillion: 18,
    status: "approved",
    department: "Municipal Pollution Control Board & Transport Authority",
    progress: 25,
    startDate: "2026-05-01",
    targetDate: "2027-04-30",
    milestones: [
      { id: "m1", title: "Statutory environmental notification issued", completed: true, targetDate: "2026-05-15" },
      { id: "m2", title: "ANPR enforcement camera deployment at 32 cordon gates", completed: false, targetDate: "2026-09-30" },
      { id: "m3", title: "Freight fleet green permit transition portal launch", completed: false, targetDate: "2026-12-15" },
      { id: "m4", title: "Active diurnal restriction enforcement commencement", completed: false, targetDate: "2027-04-30" },
    ],
    notes: "Cabinet approval secured; procurement tender for ANPR enforcement live.",
    baselineMeasurement: "142 US AQI (Annual diurnal peak)",
    afterMeasurement: "Target: 95 US AQI",
    evidenceSource: "Open-Meteo Air Quality Model & CPCB Reference Monitors",
    createdAt: 1771000000000,
    updatedAt: 1772100000000,
  },
  {
    id: "ap-seed-03",
    problemId: "drainage-bottlenecks",
    problemTitle: "Drainage Siltation & Outfall Bottlenecks",
    actionId: "act-desilt-telemetry",
    actionTitle: "Desilting Campaign & Acoustic Pipe Sensor Telemetry",
    actionSector: "Infrastructure",
    score: 89,
    capexMillion: 24,
    status: "in-progress",
    department: "Stormwater Drainage & Flood Disaster Management Wing",
    progress: 80,
    startDate: "2026-01-10",
    targetDate: "2026-07-31",
    milestones: [
      { id: "m1", title: "Mechanical super-sucker vacuum extraction (420 km)", completed: true, targetDate: "2026-03-31" },
      { id: "m2", title: "Acoustic telemetry logger installation at 45 outfalls", completed: true, targetDate: "2026-05-15" },
      { id: "m3", title: "Automated sluice gate synchronization test", completed: true, targetDate: "2026-06-15" },
      { id: "m4", title: "Monsoon emergency response drill with GIS telemetry", completed: false, targetDate: "2026-07-31" },
    ],
    notes: "Outfall clearance verified at 88% volumetric capacity. Pre-monsoon targets met.",
    baselineMeasurement: "48% cross-sectional silt blockage",
    afterMeasurement: "Current: 12% residual siltation",
    evidenceSource: "Municipal SCADA Hydraulic Sensors & Culvert Inspection Profiler",
    createdAt: 1769000000000,
    updatedAt: 1772200000000,
  },
  {
    id: "ap-seed-04",
    problemId: "green-space",
    problemTitle: "Deficient Urban Tree Canopy & Public Greenery",
    actionId: "act-urban-microforest",
    actionTitle: "Miyawaki Urban Micro-Forests in High-Density Wards",
    actionSector: "Urban Ecology",
    score: 82,
    capexMillion: 12,
    status: "completed",
    department: "Parks & Urban Biodiversity Board",
    progress: 100,
    startDate: "2025-06-01",
    targetDate: "2026-03-15",
    milestones: [
      { id: "m1", title: "Identify 40 underutilized municipal land parcels", completed: true, targetDate: "2025-08-30" },
      { id: "m2", title: "Native soil preparation and organic composting", completed: true, targetDate: "2025-11-15" },
      { id: "m3", title: "Plantation of 120,000 multi-layer native saplings", completed: true, targetDate: "2026-01-20" },
      { id: "m4", title: "IoT drip irrigation and survival monitoring handover", completed: true, targetDate: "2026-03-15" },
    ],
    notes: "94% sapling survival rate achieved across 40 urban micro-forest clusters.",
    baselineMeasurement: "18% municipal tree canopy cover",
    afterMeasurement: "Achieved: 22.4% localized canopy in targeted wards",
    evidenceSource: "Sentinel-2 NDVI Satellite Imagery & Municipal Ward Audits",
    createdAt: 1750000000000,
    updatedAt: 1771500000000,
  },
  {
    id: "ap-seed-05",
    problemId: "waste-management",
    problemTitle: "Solid Waste Overflow & Segregation Deficit",
    actionId: "act-decentralized-mrf",
    actionTitle: "Decentralized Material Recovery Facilities (MRF) & RFID Bin Tracking",
    actionSector: "Sanitation",
    score: 86,
    capexMillion: 32,
    status: "planned",
    department: "Solid Waste Management Corporation",
    progress: 10,
    startDate: "2026-08-01",
    targetDate: "2027-10-31",
    milestones: [
      { id: "m1", title: "Zoning clearance for 12 decentralized sorting centers", completed: true, targetDate: "2026-08-30" },
      { id: "m2", title: "RFID reader retrofits on 220 collection compactor vehicles", completed: false, targetDate: "2026-12-31" },
      { id: "m3", title: "Commissioning of automated optical conveyor sorters", completed: false, targetDate: "2027-05-30" },
      { id: "m4", title: "Citywide 2-stream citizen segregation enforcement", completed: false, targetDate: "2027-10-31" },
    ],
    notes: "Detailed Project Report approved by municipal council. Awaiting site handovers.",
    baselineMeasurement: "34% landfill diversion rate",
    afterMeasurement: "Target: 68% diversion rate",
    evidenceSource: "Weighbridge Manifest Records & Municipal Waste Audits",
    createdAt: 1771800000000,
    updatedAt: 1772250000000,
  },
];

function readPlan() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(STORE_KEY) : null;
    if (!raw) {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_SEED_ACTIONS));
      }
      return DEFAULT_SEED_ACTIONS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_SEED_ACTIONS;
  } catch {
    return DEFAULT_SEED_ACTIONS;
  }
}

const EVENT_NAME = "yug_action_plan_updated";

function writePlan(entries) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(entries));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns all action plan entries sorted newest first.
 * @returns {ActionPlanEntry[]}
 */
export function getActionPlan() {
  return [...readPlan()].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
}

/**
 * Adds a new entry to the action plan.
 * @param {Partial<ActionPlanEntry>} entry
 * @returns {ActionPlanEntry}
 */
export function addActionPlanEntry(entry) {
  const plan = readPlan();
  const now = Date.now();
  const newEntry = {
    id: `ap-${now}-${Math.random().toString(36).slice(2, 7)}`,
    problemId: entry.problemId || "air-quality",
    problemTitle: entry.problemTitle || "Urban Problem",
    actionId: entry.actionId || `act-${now}`,
    actionTitle: entry.actionTitle || "Municipal Intervention",
    actionSector: entry.actionSector || "Urban Planning",
    score: entry.score != null ? Math.round(entry.score) : 80,
    capexMillion: entry.capexMillion != null ? Number(entry.capexMillion) : 20,
    status: entry.status || "planned",
    department: entry.department || "Municipal Planning Authority",
    progress: entry.progress != null ? Math.min(100, Math.max(0, Number(entry.progress))) : 0,
    startDate: entry.startDate || new Date().toISOString().slice(0, 10),
    targetDate: entry.targetDate || new Date(now + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    milestones: Array.isArray(entry.milestones) && entry.milestones.length > 0
      ? entry.milestones
      : [
          { id: "m1", title: "Feasibility and engineering project report", completed: false, targetDate: "Q1" },
          { id: "m2", title: "Procurement tendering and contractor onboarding", completed: false, targetDate: "Q2" },
          { id: "m3", title: "Site civil works and technology deployment", completed: false, targetDate: "Q3" },
          { id: "m4", title: "Commissioning and operational handover", completed: false, targetDate: "Q4" },
        ],
    notes: entry.notes || "",
    baselineMeasurement: entry.baselineMeasurement || null,
    afterMeasurement: entry.afterMeasurement || null,
    evidenceSource: entry.evidenceSource || "Municipal Planning Register",
    createdAt: now,
    updatedAt: now,
  };

  writePlan([newEntry, ...plan.filter((e) => e.actionId !== newEntry.actionId)]);
  return newEntry;
}

/**
 * Updates an existing entry by id.
 * @param {string} id
 * @param {Partial<ActionPlanEntry>} updates
 * @returns {boolean}
 */
export function updateActionPlanEntry(id, updates) {
  const plan = readPlan();
  const index = plan.findIndex((e) => e.id === id);
  if (index === -1) return false;
  plan[index] = {
    ...plan[index],
    ...updates,
    updatedAt: Date.now(),
  };
  return writePlan(plan);
}

/**
 * Removes an entry from the plan.
 * @param {string} id
 * @returns {boolean}
 */
export function removeActionPlanEntry(id) {
  const plan = readPlan();
  const filtered = plan.filter((e) => e.id !== id);
  if (filtered.length === plan.length) return false;
  return writePlan(filtered);
}

/**
 * Returns total count of tracked actions.
 * @returns {number}
 */
export function getActionPlanCount() {
  return readPlan().length;
}

/**
 * Returns counts and aggregates by status.
 */
export function getActionPlanStats() {
  const plan = readPlan();
  const active = plan.filter((e) => ["approved", "planned", "in-progress"].includes(e.status));
  const totalCapex = plan.reduce((sum, e) => sum + (Number(e.capexMillion) || 0) * 1_000_000, 0);
  const averageProgress = plan.length > 0
    ? Math.round(plan.reduce((sum, e) => sum + (Number(e.progress) || 0), 0) / plan.length)
    : 0;

  return {
    proposed: plan.filter((e) => e.status === "proposed").length,
    approved: plan.filter((e) => e.status === "approved").length,
    planned: plan.filter((e) => e.status === "planned").length,
    "in-progress": plan.filter((e) => e.status === "in-progress").length,
    completed: plan.filter((e) => e.status === "completed").length,
    "on-hold": plan.filter((e) => e.status === "on-hold").length,
    total: plan.length,
    activeCount: active.length,
    totalCapex,
    averageProgress,
  };
}

/**
 * Subscribes to real-time action plan changes across components or browser tabs.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function subscribeActionPlan(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(readPlan());
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Checks if an action is already in the plan.
 * @param {string} actionId
 * @returns {boolean}
 */
export function isActionInPlan(actionId) {
  return readPlan().some((e) => e.actionId === actionId);
}

/**
 * Exports the full action plan as a formatted JSON string.
 * @returns {string}
 */
export function exportActionPlanJson() {
  return JSON.stringify(getActionPlan(), null, 2);
}

/**
 * Exports the full action plan as CSV formatted text.
 * @returns {string}
 */
export function exportActionPlanCsv() {
  const plan = getActionPlan();
  const headers = [
    "ID",
    "Action Title",
    "Urban Problem",
    "Sector",
    "Status",
    "Department",
    "Progress (%)",
    "MCDA Score",
    "CapEx ($M)",
    "Start Date",
    "Target Date",
    "Baseline",
    "Target Metric",
    "Evidence Source",
    "Notes",
  ];

  const rows = plan.map((p) => [
    `"${p.id}"`,
    `"${(p.actionTitle || "").replace(/"/g, '""')}"`,
    `"${(p.problemTitle || "").replace(/"/g, '""')}"`,
    `"${p.actionSector || ""}"`,
    `"${p.status}"`,
    `"${(p.department || "").replace(/"/g, '""')}"`,
    p.progress || 0,
    p.score || 0,
    p.capexMillion || 0,
    `"${p.startDate || ""}"`,
    `"${p.targetDate || ""}"`,
    `"${(p.baselineMeasurement || "").replace(/"/g, '""')}"`,
    `"${(p.afterMeasurement || "").replace(/"/g, '""')}"`,
    `"${(p.evidenceSource || "").replace(/"/g, '""')}"`,
    `"${(p.notes || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Resets the action plan back to default seeds.
 */
export function resetActionPlanToDefaults() {
  writePlan(DEFAULT_SEED_ACTIONS);
  return DEFAULT_SEED_ACTIONS;
}

