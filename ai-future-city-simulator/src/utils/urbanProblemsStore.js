/**
 * YUG NIRMAN - Urban Problems & Municipal Incident Store
 * Single source of truth for city problems, incident reports, and field issues.
 * Implements Automation A (Data-to-Dashboard) and cross-module synchronization.
 */

const STORAGE_KEY = "yug_urban_problems_v1";
const EVENT_NAME = "yug_problems_updated";

export const URBAN_SECTORS = [
  { id: "traffic", label: "Mobility & Congestion", icon: "Car", color: "rose" },
  { id: "air", label: "Air Quality & Emissions", icon: "Wind", color: "amber" },
  { id: "waste", label: "Solid Waste & Overflow", icon: "Trash2", color: "emerald" },
  { id: "water", label: "Water Stress & Distribution", icon: "Droplet", color: "cyan" },
  { id: "road", label: "Road Damage & Potholes", icon: "AlertTriangle", color: "orange" },
  { id: "drainage", label: "Drainage Siltation & Flooding", icon: "CloudRain", color: "blue" },
  { id: "energy", label: "Energy Grid & Peak Load", icon: "Zap", color: "yellow" },
  { id: "infrastructure", label: "Civic Infrastructure Gaps", icon: "Building", color: "purple" },
];

const INITIAL_PROBLEMS = [
  {
    id: "prob-del-01",
    cityId: "delhi",
    sector: "traffic",
    title: "Severe Corridor Bottleneck on Ring Road Junction",
    severity: "HIGH",
    location: "Ring Road - Moti Bagh Intersection, Ward 12",
    coordinates: [28.583, 77.172],
    reportedAt: "2026-11-15T08:30:00Z",
    status: "active",
    metricValue: "84% travel time delay vs free-flow",
    impactedResidents: 185000,
    evidence: "Peak hour delay index exceeded 80% for 5 consecutive workdays; intersection queues spill into feeding arterials.",
    source: "Municipal Traffic Camera Telemetry",
    linkedActionId: "act-del-01",
  },
  {
    id: "prob-del-02",
    cityId: "delhi",
    sector: "air",
    title: "Severe Particulate Hotspot (PM2.5 Spikes)",
    severity: "HIGH",
    location: "Anand Vihar Transit Node & ISBT Border",
    coordinates: [28.650, 77.315],
    reportedAt: "2026-11-16T06:15:00Z",
    status: "active",
    metricValue: "340 µg/m³ PM2.5 (US AQI 390)",
    impactedResidents: 320000,
    evidence: "Continuous sensor breach above 300 µg/m³ threshold. High density inter-state diesel bus movement and unpaved dust re-suspension.",
    source: "Continuous Ambient Air Quality Station",
    linkedActionId: null,
  },
  {
    id: "prob-del-03",
    cityId: "delhi",
    sector: "waste",
    title: "Illegal Secondary Dumping & Commercial Overflow",
    severity: "MODERATE",
    location: "Okhla Industrial Area Phase-II",
    coordinates: [28.528, 77.275],
    reportedAt: "2026-11-14T11:45:00Z",
    status: "active",
    metricValue: "42 metric tons unsegregated accumulation",
    impactedResidents: 74000,
    evidence: "Transfer station capacity overwhelmed by 160%; secondary dumping encroaching upon service lane.",
    source: "Zone Sanitation Inspector Dispatch",
    linkedActionId: "act-del-02",
  },
  {
    id: "prob-del-04",
    cityId: "delhi",
    sector: "drainage",
    title: "Major Trunk Drain Siltation & Backflow Risk",
    severity: "HIGH",
    location: "Barapullah Basin Trunk Channel 3",
    coordinates: [28.577, 77.240],
    reportedAt: "2026-11-13T14:20:00Z",
    status: "active",
    metricValue: "68% cross-section silt accumulation",
    impactedResidents: 110000,
    evidence: "Acoustic profiling indicates 1.4m solid debris and silt bed, reducing monsoon discharge capacity by over half.",
    source: "Stormwater Engineering Survey",
    linkedActionId: null,
  },
  {
    id: "prob-del-05",
    cityId: "delhi",
    sector: "road",
    title: "Extensive Pavement Settlement & Corrugation",
    severity: "MODERATE",
    location: "Mehrauli-Gurgaon Road Corridor, Sector 4",
    coordinates: [28.505, 77.160],
    reportedAt: "2026-11-12T16:00:00Z",
    status: "active",
    metricValue: "28 deep defects across 1.8km stretch",
    impactedResidents: 95000,
    evidence: "Pavement condition index dropped to 38/100 due to subsurface utility settlement and heavy vehicle axle loading.",
    source: "Mobile Road Surface Profiler",
    linkedActionId: null,
  },
  {
    id: "prob-del-06",
    cityId: "delhi",
    sector: "water",
    title: "Terminal Distribution Pressure Drop & Non-Revenue Loss",
    severity: "MODERATE",
    location: "Dwarka Sector 18 Feeder Network",
    coordinates: [28.591, 77.045],
    reportedAt: "2026-11-10T09:10:00Z",
    status: "active",
    metricValue: "0.4 bar delivery pressure (42% NRW loss)",
    impactedResidents: 130000,
    evidence: "Telemetry indicates 42% differential between bulk water inlet meter and household consumption aggregates.",
    source: "District Metered Area (DMA) Telemetry",
    linkedActionId: null,
  },
  {
    id: "prob-mum-01",
    cityId: "mumbai",
    sector: "drainage",
    title: "High Tide Storm Surge & Culvert Inundation Bottleneck",
    severity: "HIGH",
    location: "Hindmata Junction & Gandhi Market Culverts",
    coordinates: [19.018, 72.842],
    reportedAt: "2026-11-15T09:00:00Z",
    status: "active",
    metricValue: "Waterlogging depth > 45cm during 4.2m tide",
    impactedResidents: 240000,
    evidence: "Gravity outfalls submerged during astronomical high tides, causing reverse flow and backwater stagnation across transit corridor.",
    source: "Disaster Management Cell Sensors",
    linkedActionId: null,
  },
  {
    id: "prob-mum-02",
    cityId: "mumbai",
    sector: "traffic",
    title: "Western Express Highway Choke Point",
    severity: "HIGH",
    location: "Kalanagar Junction / Bandra Kurla Complex Connector",
    coordinates: [19.058, 72.851],
    reportedAt: "2026-11-16T08:15:00Z",
    status: "active",
    metricValue: "76% delay vs free flow speed",
    impactedResidents: 290000,
    evidence: "Merge conflict between commercial feeder flyover and arterial spine yields 4.2 km vehicular tailback.",
    source: "Traffic Police CCTV & Radar Flow",
    linkedActionId: null,
  },
  {
    id: "prob-blr-01",
    cityId: "bengaluru",
    sector: "traffic",
    title: "Outer Ring Road Tech Corridor Severe Jam",
    severity: "HIGH",
    location: "Silk Board to Marathahalli IT Corridor",
    coordinates: [12.924, 77.650],
    reportedAt: "2026-11-15T18:00:00Z",
    status: "active",
    metricValue: "88% delay vs free flow (avg 7 km/h speed)",
    impactedResidents: 310000,
    evidence: "Arterial capacity oversubscribed by 220% during evening commute peak; public transport dwell times doubled.",
    source: "Bangalore Traffic Command Center",
    linkedActionId: null,
  },
  {
    id: "prob-sf-01",
    cityId: "san-francisco",
    sector: "infrastructure",
    title: "Transit Stop Accessibility & Curb Conflict",
    severity: "MODERATE",
    location: "Mission St & 16th St Transit Hub",
    coordinates: [37.765, -122.420],
    reportedAt: "2026-11-14T10:00:00Z",
    status: "active",
    metricValue: "62 delivery curb obstructions / day",
    impactedResidents: 45000,
    evidence: "Ride-hail and commercial delivery double-parking forces buses into through-lanes and blocks ADA boarding ramps.",
    source: "SFMTA Field Inspection",
    linkedActionId: null,
  },
];

const emitProblemsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
};

const readStorage = () => {
  if (typeof window === "undefined") return INITIAL_PROBLEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROBLEMS));
      return INITIAL_PROBLEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROBLEMS;
  } catch (err) {
    console.error("Failed to read urban problems from storage:", err);
    return INITIAL_PROBLEMS;
  }
};

const writeStorage = (problems) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
    emitProblemsUpdated();
  } catch (err) {
    console.error("Failed to write urban problems to storage:", err);
  }
};

/**
 * Get urban problems filtered by cityId. If no cityId provided, returns all.
 */
export const getUrbanProblems = (cityId = null) => {
  const all = readStorage();
  if (!cityId) return all;
  const filtered = all.filter((p) => p.cityId.toLowerCase() === cityId.toLowerCase());
  // If no city-specific problems, fallback to global or synthesize
  if (filtered.length === 0) {
    // Generate context-aware fallback problems for any unlisted city
    return all.filter((p) => p.cityId === "delhi").map((p, idx) => ({
      ...p,
      id: `prob-${cityId}-${idx + 1}`,
      cityId,
      location: p.location.replace("Ward 12", `Ward ${idx + 4}`),
    }));
  }
  return filtered;
};

/**
 * Add a new urban problem / incident report
 */
export const addUrbanProblem = (problemData) => {
  const current = readStorage();
  const id = problemData.id || `prob-rep-${Date.now()}`;
  const newProblem = {
    id,
    cityId: problemData.cityId || "delhi",
    sector: problemData.sector || "traffic",
    title: problemData.title || "Unspecified Urban Issue",
    severity: (problemData.severity || "MODERATE").toUpperCase(),
    location: problemData.location || "Central Municipal District",
    coordinates: Array.isArray(problemData.coordinates) && problemData.coordinates.length === 2
      ? problemData.coordinates
      : [28.6139, 77.2090],
    reportedAt: problemData.reportedAt || new Date().toISOString(),
    status: problemData.status || "active",
    metricValue: problemData.metricValue || "Threshold deviation recorded",
    impactedResidents: Number(problemData.impactedResidents) || 50000,
    evidence: problemData.evidence || "Direct field dispatch observation entered by municipal operator.",
    source: problemData.source || "Citizen Dispatch Portal",
    linkedActionId: problemData.linkedActionId || null,
  };

  const updated = [newProblem, ...current];
  writeStorage(updated);
  return newProblem;
};

/**
 * Update an existing problem
 */
export const updateUrbanProblem = (id, updates) => {
  const current = readStorage();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...current];
  nextList[index] = updatedItem;
  writeStorage(nextList);
  return updatedItem;
};

/**
 * Resolve an urban problem
 */
export const resolveUrbanProblem = (id) => {
  return updateUrbanProblem(id, { status: "resolved" });
};

/**
 * Link an action plan to a problem
 */
export const linkProblemToAction = (problemId, actionId) => {
  return updateUrbanProblem(problemId, { linkedActionId: actionId, status: "intervening" });
};

/**
 * Delete a problem
 */
export const deleteUrbanProblem = (id) => {
  const current = readStorage();
  const nextList = current.filter((p) => p.id !== id);
  writeStorage(nextList);
};

/**
 * Calculate statistical aggregates for a city
 */
export const getUrbanProblemsStats = (cityId = null) => {
  const problems = getUrbanProblems(cityId);
  const active = problems.filter((p) => p.status !== "resolved");
  const highSeverity = active.filter((p) => p.severity === "HIGH");
  const moderateSeverity = active.filter((p) => p.severity === "MODERATE");
  const lowSeverity = active.filter((p) => p.severity === "LOW");
  const resolved = problems.filter((p) => p.status === "resolved");

  const bySector = {};
  for (const p of active) {
    bySector[p.sector] = (bySector[p.sector] || 0) + 1;
  }

  const totalImpactedResidents = active.reduce((sum, p) => sum + (p.impactedResidents || 0), 0);

  return {
    total: active.length,
    highCount: highSeverity.length,
    moderateCount: moderateSeverity.length,
    lowCount: lowSeverity.length,
    resolvedCount: resolved.length,
    bySector,
    totalImpactedResidents,
  };
};

/**
 * Reactive subscription hook helper
 */
export const subscribeUrbanProblems = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    callback(readStorage());
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
};

/**
 * Reset back to factory default problems
 */
export const resetUrbanProblems = () => {
  writeStorage(INITIAL_PROBLEMS);
};
