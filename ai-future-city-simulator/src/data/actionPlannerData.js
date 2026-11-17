/**
 * Action Planner Problems & Candidate Actions Catalog
 * Directly supports the 6-question decision intelligence journey:
 * 1. What is the problem?
 * 2. Where is it happening?
 * 3. What evidence supports it?
 * 4. What actions could address it?
 * 5. Which action should be prioritized, and why?
 * 6. How can we measure whether the action worked?
 */

export const SUPPORTED_PROBLEMS = [
  {
    id: "air-quality",
    name: "Elevated Particulate & Air Pollution",
    sector: "Environment",
    metricKey: "aqi",
    thresholdLabel: "AQI > 100 (Unhealthy for sensitive groups)",
    thresholdValue: 100,
    unit: "US AQI / PM2.5 µg/m³",
    evidenceStatement: "Observed atmospheric concentrations exceed ambient air quality guideline thresholds during diurnal peak hours.",
    geoScopes: ["citywide", "arterials", "industrial-belt"],
  },
  {
    id: "traffic-congestion",
    name: "Arterial Road Congestion & Delay",
    sector: "Mobility",
    metricKey: "traffic",
    thresholdLabel: "Delay Index > 50% above free-flow travel time",
    thresholdValue: 50,
    unit: "% delay",
    evidenceStatement: "Corridor travel times exceed free-flow baseline, concentrating emissions and reducing commercial mobility throughput.",
    geoScopes: ["arterials", "central-core", "transit-hub"],
  },
  {
    id: "green-space",
    name: "Deficient Urban Tree Canopy & Public Greenery",
    sector: "Urban Ecology",
    metricKey: "greenCover",
    thresholdLabel: "Canopy Cover < 25% of municipal surface area",
    thresholdValue: 25,
    unit: "% surface area",
    evidenceStatement: "Low permeable surface and sparse canopy intensify the urban heat island effect and stormwater surface runoff.",
    geoScopes: ["central-core", "densely-built-blocks", "citywide"],
  },
  {
    id: "flood-risk",
    name: "Stormwater Inundation & Drainage Bottlenecks",
    sector: "Resilience",
    metricKey: "floodRisk",
    thresholdLabel: "Precipitation Accumulation > 40 mm/h against constrained outfalls",
    thresholdValue: 40,
    unit: "mm/h runoff",
    evidenceStatement: "Peak monsoonal precipitation overwhelms legacy stormwater outfalls and low-lying arterial underpasses.",
    geoScopes: ["coastal-lowland", "riverine-corridors", "central-core"],
  },
  {
    id: "drainage-bottlenecks",
    name: "Drainage Siltation & Outfall Bottlenecks",
    sector: "Infrastructure",
    metricKey: "drainageCapacity",
    thresholdLabel: "Drain Siltation > 45% of cross-sectional volume",
    thresholdValue: 45,
    unit: "% cross-section blocked",
    evidenceStatement: "Uncleaned arterial stormwater drains and sediment accumulation choke discharge rates into coastal and river outfalls.",
    geoScopes: ["coastal-lowland", "central-core", "densely-built-blocks"],
  },
  {
    id: "waste-management",
    name: "Solid Waste Overflow & Segregation Deficit",
    sector: "Sanitation",
    metricKey: "wasteDiversion",
    thresholdLabel: "Landfill Diversion < 40% of generated tonnage",
    thresholdValue: 40,
    unit: "% diverted from landfill",
    evidenceStatement: "Unsegregated municipal solid waste overburdens peripheral dumping grounds, releasing leachate and methane emissions.",
    geoScopes: ["densely-built-blocks", "peripheral-settlements", "commercial-districts"],
  },
  {
    id: "road-damage",
    name: "Pavement Degradation & Structural Pothole Hazards",
    sector: "Infrastructure",
    metricKey: "roadQualityIndex",
    thresholdLabel: "Pavement Condition Index (PCI) < 55/100",
    thresholdValue: 55,
    unit: "PCI rating",
    evidenceStatement: "Subsurface water intrusion and heavy axle freight loads accelerate asphalt cracking, creating severe road safety and speed bottlenecks.",
    geoScopes: ["arterials", "industrial-belt", "peripheral-settlements"],
  },
  {
    id: "water-stress",
    name: "Municipal Water Supply Deficit & Distribution Losses",
    sector: "Resources",
    metricKey: "waterDemand",
    thresholdLabel: "Capacity Load > 75% of reservoir replenishment rate",
    thresholdValue: 75,
    unit: "MLD / % capacity",
    evidenceStatement: "Peak summer drawdowns outpace seasonal replenishment, exacerbated by non-revenue distribution leakage.",
    geoScopes: ["citywide", "peripheral-settlements"],
  },
  {
    id: "energy-demand",
    name: "Peak Electricity Grid Strain & Thermal Overload",
    sector: "Energy",
    metricKey: "energyUsage",
    thresholdLabel: "Grid Load > 80% of substation rated capacity",
    thresholdValue: 80,
    unit: "MW peak demand",
    evidenceStatement: "HVAC cooling spikes during heat extremes push distribution transformers near thermal capacity thresholds.",
    geoScopes: ["central-core", "commercial-districts", "citywide"],
  },
  {
    id: "infrastructure-gaps",
    name: "Public Transit Gaps & Last-Mile Connectivity Deficit",
    sector: "Mobility",
    metricKey: "transitAccess",
    thresholdLabel: "Transit Catchment Coverage < 65% within 10-min walk",
    thresholdValue: 65,
    unit: "% population with walkable transit",
    evidenceStatement: "Inadequate feeder feeder services and high private vehicle dependence create severe arterial choke points during commute hours.",
    geoScopes: ["peripheral-settlements", "densely-built-blocks", "transit-hub"],
  },
];

export const CANDIDATE_ACTIONS_BY_PROBLEM = {
  "air-quality": [
    {
      id: "act-lez",
      title: "Low-Emission Freight Zone (LEZ) with Time-of-Day Restrictions",
      problemId: "air-quality",
      scope: "arterials",
      summary: "Restrict heavy diesel freight vehicles from arterial corridors during peak commuter windows (07:00-11:00 & 17:00-21:00).",
      scores: {
        expectedBenefit: 82,
        cost: 28,            // Low capital cost (signage + ANPR cameras) -> high affordability
        urgency: 85,
        feasibility: 88,
        environmentalImpact: 86,
        evidenceConfidence: 90,
      },
      capexMillion: 18,
      implementationYears: 1,
      levers: {
        aqi: -18,
        pm25: -14,
        traffic: -12,
      },
      assumptions: [
        "Enforced via automated number plate recognition (ANPR) and traffic police checkpoints.",
        "Freight operators utilize designated outer ring roads during restricted hours.",
      ],
      limitations: [
        "May shift delivery timing to night hours, requiring municipal logistics hub coordination.",
      ],
      kpis: ["Continuous roadside PM2.5 monitor delta", "Arterial freight volume percentage"],
      nextSteps: [
        "Conduct freight route origin-destination survey with regional transport authority.",
        "Establish 60-day stakeholder consultation with logistics federations.",
      ],
    },
    {
      id: "act-dust",
      title: "Mechanical Street Sweeping & Mandatory Construction Mist Canons",
      problemId: "air-quality",
      scope: "citywide",
      summary: "Deploy electric regenerative-air sweepers and enforce dust-suppression mist canons across registered construction sites.",
      scores: {
        expectedBenefit: 70,
        cost: 42,
        urgency: 78,
        feasibility: 85,
        environmentalImpact: 74,
        evidenceConfidence: 80,
      },
      capexMillion: 32,
      implementationYears: 1.5,
      levers: {
        aqi: -14,
        pm25: -12,
      },
      assumptions: [
        "Fleet covers major arterial corridors on twice-weekly schedules.",
        "Construction sites > 500 sq.m mandated to self-finance continuous PM sensors.",
      ],
      limitations: [
        "Effectiveness drops during severe regional agricultural biomass burning periods.",
      ],
      kpis: ["Coarse PM10 re-suspension levels", "Municipal sweeper route completion logs"],
      nextSteps: [
        "Procure initial tranche of 24 EV sweeping units.",
        "Update municipal building bylaws for mandatory anti-smog misting.",
      ],
    },
    {
      id: "act-green-barriers",
      title: "Multi-Tier Vegetative Buffers along Heavy Transit Corridors",
      problemId: "air-quality",
      scope: "arterials",
      summary: "Install dense multi-canopy green hedges and roadside trees to intercept particulate matter and reduce pedestrian exposure.",
      scores: {
        expectedBenefit: 64,
        cost: 35,
        urgency: 60,
        feasibility: 80,
        environmentalImpact: 92,
        evidenceConfidence: 75,
      },
      capexMillion: 24,
      implementationYears: 2,
      levers: {
        aqi: -8,
        pm25: -7,
        greenCover: 3.5,
      },
      assumptions: [
        "Species selected for high particulate capture indices (Ficus, Conocarpus, Neem).",
        "Drip irrigation tied into treated secondary municipal wastewater.",
      ],
      limitations: [
        "Requires 24-36 months for vegetative canopy maturation before maximum particulate filtration.",
      ],
      kpis: ["Pedestrian curb-level air quality comparison", "Canopy survival rate"],
      nextSteps: [
        "Identify candidate arterial segments with median widths > 2.5 meters.",
        "Coordinate with urban forestry division for native nursery sapling reservation.",
      ],
    },
  ],

  "traffic-congestion": [
    {
      id: "act-adaptive-signals",
      title: "Coordinated Adaptive Traffic Signal Control System (ATCS)",
      problemId: "traffic-congestion",
      scope: "arterials",
      summary: "Upgrade 48 key intersections with radar/camera actuated signal timing to dynamically minimize queue delays.",
      scores: {
        expectedBenefit: 86,
        cost: 36,
        urgency: 82,
        feasibility: 90,
        environmentalImpact: 76,
        evidenceConfidence: 88,
      },
      capexMillion: 42,
      implementationYears: 1.5,
      levers: {
        traffic: -16,
        aqi: -9,
      },
      assumptions: [
        "Real-time sensor feeds integrate into Central Traffic Management Center.",
        "Signal cycle lengths dynamically adjust between 60s and 140s based on queue lengths.",
      ],
      limitations: [
        "Does not resolve systemic congestion when downstream corridors are completely saturated.",
      ],
      kpis: ["Average intersection wait time (seconds)", "TomTom arterial travel speed (km/h)"],
      nextSteps: [
        "Publish competitive RFP for intersection sensor telemetry and controller hardware.",
        "Benchmark baseline queue lengths across the priority arterial corridors.",
      ],
    },
    {
      id: "act-brt-priority",
      title: "Dedicated Bus Priority Corridors & Signal Preemption",
      problemId: "traffic-congestion",
      scope: "central-core",
      summary: "Implement physically separated bus lanes and GPS signal preemption along high-capacity transit routes.",
      scores: {
        expectedBenefit: 84,
        cost: 58,
        urgency: 75,
        feasibility: 76,
        environmentalImpact: 84,
        evidenceConfidence: 85,
      },
      capexMillion: 95,
      implementationYears: 2.5,
      levers: {
        traffic: -14,
        aqi: -12,
      },
      assumptions: [
        "Bus fleet frequency increased to 3-5 minute headways during peak periods.",
        "Automated camera enforcement deters mixed-traffic lane encroachment.",
      ],
      limitations: [
        "Reduces mixed-traffic lane capacity temporarily during construction phases.",
      ],
      kpis: ["Bus ridership modal share (%)", "Transit travel time reliability (+/- 2 mins)"],
      nextSteps: [
        "Complete geometric road cross-section feasibility study.",
        "Secure funding allocation from central sustainable urban transport program.",
      ],
    },
    {
      id: "act-congestion-pricing",
      title: "Cordon-Based Congestion Management & Parking Rationalization",
      problemId: "traffic-congestion",
      scope: "central-core",
      summary: "Deploy dynamic curbside parking tariffs and peak-period cordon charges for single-occupancy private vehicles entering the business core.",
      scores: {
        expectedBenefit: 78,
        cost: 32,
        urgency: 70,
        feasibility: 62,
        environmentalImpact: 78,
        evidenceConfidence: 72,
      },
      capexMillion: 28,
      implementationYears: 2,
      levers: {
        traffic: -18,
        aqi: -11,
      },
      assumptions: [
        "Revenue earmarked directly for suburban feeder transit services.",
        "High-frequency park-and-ride facilities established outside the cordon zone.",
      ],
      limitations: [
        "High public and merchant resistance without pre-existing robust public transit alternatives.",
      ],
      kpis: ["Cordon vehicle entry count", "Parking turnover rate in central business district"],
      nextSteps: [
        "Conduct public willingness-to-pay and equity impact study.",
        "Formulate municipal legislative ordinance for congestion charging.",
      ],
    },
  ],

  "green-space": [
    {
      id: "act-pocket-parks",
      title: "Pocket Park Creation & Vacant Municipal Plot Reclamation",
      problemId: "green-space",
      scope: "central-core",
      summary: "Transform 35 underutilized municipal plots and alleyways into accessible micro-parks with permeable surfaces and shade canopies.",
      scores: {
        expectedBenefit: 80,
        cost: 25,
        urgency: 72,
        feasibility: 92,
        environmentalImpact: 88,
        evidenceConfidence: 85,
      },
      capexMillion: 16,
      implementationYears: 1.5,
      levers: {
        greenCover: 4.2,
        aqi: -6,
      },
      assumptions: [
        "Land titles already held under municipal jurisdiction.",
        "Local neighborhood ward associations co-manage ongoing maintenance.",
      ],
      limitations: [
        "Individual sites are small (< 800 sq.m) and provide localized rather than regional cooling.",
      ],
      kpis: ["Proportion of residents living within a 5-minute walk (400m) of green space", "Surface temperature drop on thermal imagery"],
      nextSteps: [
        "Audit municipal GIS land bank for non-contentious vacant plots.",
        "Hold participatory design workshops with ward resident welfare associations.",
      ],
    },
    {
      id: "act-urban-forest",
      title: "Miyawaki High-Density Native Urban Reforestation",
      problemId: "green-space",
      scope: "citywide",
      summary: "Establish dense native micro-forests along highway verges, lake perimeters, and institutional campuses using the Miyawaki method.",
      scores: {
        expectedBenefit: 85,
        cost: 40,
        urgency: 68,
        feasibility: 84,
        environmentalImpact: 96,
        evidenceConfidence: 88,
      },
      capexMillion: 38,
      implementationYears: 2,
      levers: {
        greenCover: 6.5,
        aqi: -10,
      },
      assumptions: [
        "Sapling density of 3-5 trees per sq.m with soil microbial enrichment.",
        "Growth rate 10x faster and 30x denser than conventional monoculture plantations.",
      ],
      limitations: [
        "Requires intensive soil preparation and watering for the first 24 months.",
      ],
      kpis: ["Total canopy area added (hectares)", "Native bird and pollinator biodiversity index"],
      nextSteps: [
        "Partner with environmental forestry institutes for native species seed sourcing.",
        "Identify 10 flagship institutional plots for initial pilot planting.",
      ],
    },
    {
      id: "act-green-roofs",
      title: "Commercial Green Roof & Cool Roof Mandate",
      problemId: "green-space",
      scope: "central-core",
      summary: "Incentivize high-albedo cool roofs and mandate vegetative rooftop gardens for all new commercial builds over 2,000 sq.m.",
      scores: {
        expectedBenefit: 68,
        cost: 45,
        urgency: 64,
        feasibility: 78,
        environmentalImpact: 82,
        evidenceConfidence: 78,
      },
      capexMillion: 22,
      implementationYears: 2,
      levers: {
        greenCover: 2.8,
        energyDemand: -45,
      },
      assumptions: [
        "Subsidized via 5% property tax rebate for certified green roof structures.",
        "Reduces commercial building HVAC cooling loads by 12-18%.",
      ],
      limitations: [
        "Retrofitting older structures requires structural load engineering assessments.",
      ],
      kpis: ["Total square meters of certified green roof", "Rooftop surface temperature delta"],
      nextSteps: [
        "Draft green roof amendment in municipal building development control regulations.",
        "Launch demonstration cool-roof installation on city hall complex.",
      ],
    },
  ],

  "flood-risk": [
    {
      id: "act-drainage-desilting",
      title: "Comprehensive Stormwater Outfall Desilting & Channel Widening",
      problemId: "flood-risk",
      scope: "coastal-lowland",
      summary: "Clean, desilt, and widen primary natural nullahs and coastal discharge sluice gates prior to monsoon onset.",
      scores: {
        expectedBenefit: 88,
        cost: 32,
        urgency: 95,
        feasibility: 88,
        environmentalImpact: 78,
        evidenceConfidence: 90,
      },
      capexMillion: 26,
      implementationYears: 1,
      levers: {
        traffic: -8, // Prevents road waterlogging closures
      },
      assumptions: [
        "Work executed during dry season with geotagged drone volumetric silt verification.",
        "Tidal flap gates refurbished at ocean outfalls.",
      ],
      limitations: [
        "Annual recurrent maintenance required; does not prevent flooding during extreme tidal surges.",
      ],
      kpis: ["Peak rainfall discharge flow rate (cumecs)", "Waterlogging duration at designated vulnerable spots (hours)"],
      nextSteps: [
        "Deploy LiDAR bathymetry to map silt deposition in major drainage channels.",
        "Issue pre-monsoon desilting tenders with performance-linked penalties.",
      ],
    },
    {
      id: "act-bioswales",
      title: "Sponge City Bioswales & Permeable Infiltration Basins",
      problemId: "flood-risk",
      scope: "central-core",
      summary: "Retrofit roadside medians, public plazas, and parking areas with bioswales and permeable interlocking pavers to absorb runoff.",
      scores: {
        expectedBenefit: 78,
        cost: 48,
        urgency: 74,
        feasibility: 82,
        environmentalImpact: 90,
        evidenceConfidence: 82,
      },
      capexMillion: 54,
      implementationYears: 2.5,
      levers: {
        greenCover: 3.0,
      },
      assumptions: [
        "Soil percolation tests confirm infiltration capacity > 25 mm/h.",
        "Runoff filtered through gravel-sand layers before reaching sub-surface water table.",
      ],
      limitations: [
        "Ineffective in areas with clayey soil or already saturated high groundwater tables.",
      ],
      kpis: ["Surface runoff coefficient reduction (%)", "Groundwater table recharge depth (meters)"],
      nextSteps: [
        "Map soil infiltration permeability across the central municipal wards.",
        "Select 5 high-runoff commercial corridors for permeable paving retrofits.",
      ],
    },
  ],

  "water-stress": [
    {
      id: "act-nrw-leakage",
      title: "Acoustic Non-Revenue Water (NRW) Leak Detection & District Metering",
      problemId: "water-stress",
      scope: "citywide",
      summary: "Segment distribution network into District Metered Areas (DMAs) with acoustic loggers to reduce pipe loss from 35% to under 15%.",
      scores: {
        expectedBenefit: 86,
        cost: 38,
        urgency: 84,
        feasibility: 86,
        environmentalImpact: 84,
        evidenceConfidence: 88,
      },
      capexMillion: 48,
      implementationYears: 2,
      levers: {
        waterDemand: -85,
      },
      assumptions: [
        "DMA flow sensors relay real-time telemetry to municipal water SCADA system.",
        "Rapid repair squads dispatched within 4 hours of anomalous night-flow detection.",
      ],
      limitations: [
        "Underground road excavation needed to replace rusted cast-iron pipes.",
      ],
      kpis: ["Non-revenue water loss percentage", "Daily volume of potable water saved (MLD)"],
      nextSteps: [
        "Procure satellite and acoustic correlator leak detection service.",
        "Establish first 10 DMAs in the highest-loss distribution zones.",
      ],
    },
    {
      id: "act-wastewater-reuse",
      title: "Tertiary Sewage Treatment & Industrial Graywater Mandate",
      problemId: "water-stress",
      scope: "citywide",
      summary: "Build tertiary wastewater recycling plants to supply industrial estates, construction, and horticultural irrigation, freeing potable water.",
      scores: {
        expectedBenefit: 82,
        cost: 65,
        urgency: 76,
        feasibility: 78,
        environmentalImpact: 90,
        evidenceConfidence: 85,
      },
      capexMillion: 110,
      implementationYears: 3,
      levers: {
        waterDemand: -120,
      },
      assumptions: [
        "Recycled water priced at 60% of potable commercial tariff to incentivize uptake.",
        "Dual plumbing mandated for industrial consumers.",
      ],
      limitations: [
        "High initial capital outlay for secondary distribution pipelines.",
      ],
      kpis: ["Volume of tertiary treated water utilized (MLD)", "Industrial potable water substitution rate (%)"],
      nextSteps: [
        "Finalize power and water purchase agreements with local industrial federations.",
        "Initiate detailed engineering project report for tertiary filtration plant.",
      ],
    },
  ],

  "energy-demand": [
    {
      id: "act-solar-civic",
      title: "Rooftop Solar on Civic Buildings & Microgrid Resiliency",
      problemId: "energy-demand",
      scope: "citywide",
      summary: "Install 45 MW of distributed solar photovoltaic arrays across municipal schools, hospitals, water pumping stations, and administrative offices.",
      scores: {
        expectedBenefit: 84,
        cost: 44,
        urgency: 78,
        feasibility: 90,
        environmentalImpact: 94,
        evidenceConfidence: 92,
      },
      capexMillion: 58,
      implementationYears: 1.5,
      levers: {
        energyDemand: -95,
        aqi: -6,
      },
      assumptions: [
        "Net metering agreements secured with state distribution utilities.",
        "Battery energy storage systems (BESS) installed at critical civic hospitals.",
      ],
      limitations: [
        "Generation peaks at mid-day, requiring storage to offset night-time residential cooling peaks.",
      ],
      kpis: ["Installed civic solar capacity (MWp)", "Annual municipal electricity bill savings (Million ₹/$)"],
      nextSteps: [
        "Conduct structural shadow analysis and roof load surveys across 150 municipal buildings.",
        "Aggregate tender under RESCO model to minimize initial municipal capital outlay.",
      ],
    },
    {
      id: "act-smart-led",
      title: "Smart Centralized LED Streetlight Retrofit with Dimming Schedules",
      problemId: "energy-demand",
      scope: "citywide",
      summary: "Replace 65,000 sodium-vapor streetlights with smart connected LEDs programmed to dim by 40% after midnight.",
      scores: {
        expectedBenefit: 76,
        cost: 26,
        urgency: 68,
        feasibility: 94,
        environmentalImpact: 82,
        evidenceConfidence: 90,
      },
      capexMillion: 22,
      implementationYears: 1,
      levers: {
        energyDemand: -40,
      },
      assumptions: [
        "Mesh IoT wireless controllers enable automatic fault reporting and lux-level adjustments.",
        "Saves 55% of municipal public lighting electricity expenditure.",
      ],
      limitations: [
        "Dimming protocols must maintain pedestrian and traffic safety standards on high-speed arterials.",
      ],
      kpis: ["Lighting energy consumption (kWh/pole/year)", "Municipal streetlight uptime (%)"],
      nextSteps: [
        "Issue energy performance contract (ESCO model) where vendor is paid from verified savings.",
        "Set up central streetlight monitoring dashboard in municipal headquarters.",
      ],
    },
  ],

  "drainage-bottlenecks": [
    {
      id: "act-desilt-telemetry",
      title: "Desilting Campaign & Acoustic Pipe Sensor Telemetry",
      problemId: "drainage-bottlenecks",
      scope: "central-core",
      summary: "Deploy vacuum extraction units across 420 km of primary storm drains and install acoustic depth sensors at critical culverts.",
      scores: {
        expectedBenefit: 85,
        cost: 32,
        urgency: 88,
        feasibility: 86,
        environmentalImpact: 84,
        evidenceConfidence: 89,
      },
      capexMillion: 24,
      implementationYears: 1,
      levers: {
        drainageCapacity: 45,
        floodRisk: -28,
      },
      assumptions: [
        "Pre-monsoon mechanical desilting achieves 85% volumetric clearance.",
        "Acoustic telemetry feeds city flood control operations in real time.",
      ],
      limitations: [
        "Requires active municipal enforcement against construction debris dumping.",
      ],
      kpis: ["Volumetric discharge rate (m³/sec)", "Culvert clearance ratio (%)"],
      nextSteps: [
        "Procure high-capacity super-sucker vacuum equipment.",
        "Commission IoT telemetry loggers at 45 arterial culverts.",
      ],
    },
    {
      id: "act-permeable-pavements",
      title: "Pervious Concrete Sidewalks & Bioswale Infiltration Corridors",
      problemId: "drainage-bottlenecks",
      scope: "densely-built-blocks",
      summary: "Retrofit 120 km of pedestrian sidewalks with porous asphalt and engineered roadside bioswales to absorb peak surface runoff.",
      scores: {
        expectedBenefit: 78,
        cost: 45,
        urgency: 74,
        feasibility: 82,
        environmentalImpact: 92,
        evidenceConfidence: 86,
      },
      capexMillion: 38,
      implementationYears: 2,
      levers: {
        drainageCapacity: 30,
        floodRisk: -20,
      },
      assumptions: [
        "Subsoil percolation rates support minimum infiltration velocity of 25 mm/h.",
      ],
      limitations: [
        "Requires biennial high-pressure washing to avoid pore clogging by silt.",
      ],
      kpis: ["Surface runoff reduction (%)", "Permeable surface area added (sq m)"],
      nextSteps: [
        "Standardize engineering specifications for urban pervious pavements.",
        "Pilot bioswales along 5 high-density pilot avenue sectors.",
      ],
    },
  ],

  "waste-management": [
    {
      id: "act-decentralized-mrf",
      title: "Decentralized Material Recovery Facilities (MRF) & RFID Bin Tracking",
      problemId: "waste-management",
      scope: "densely-built-blocks",
      summary: "Construct 12 localized micro-sorting and composting centers with RFID-tagged collection vehicles and digital compliance tracking.",
      scores: {
        expectedBenefit: 88,
        cost: 36,
        urgency: 84,
        feasibility: 82,
        environmentalImpact: 95,
        evidenceConfidence: 91,
      },
      capexMillion: 32,
      implementationYears: 1.5,
      levers: {
        wasteDiversion: 52,
        aqi: -8,
      },
      assumptions: [
        "Household two-bin one-bag segregation achieved via citizen incentive program.",
        "Compost utilized directly by municipal parks and horticulture departments.",
      ],
      limitations: [
        "Requires neighborhood-level land allocation of 500 sq m per facility.",
      ],
      kpis: ["Tonnage diverted from landfills (tons/day)", "Source segregation compliance rate (%)"],
      nextSteps: [
        "Notify municipal ward zoning for decentralized recovery sites.",
        "Issue citizen segregation guidelines with civic collection mobile app.",
      ],
    },
    {
      id: "act-waste-to-energy",
      title: "Engineered Bio-Methanation & Waste-to-Energy Processing Facility",
      problemId: "waste-management",
      scope: "peripheral-settlements",
      summary: "Commission a 600 TPD anaerobic digestion facility producing compressed bio-gas (CBG) for municipal transit fleet refueling.",
      scores: {
        expectedBenefit: 82,
        cost: 65,
        urgency: 79,
        feasibility: 76,
        environmentalImpact: 88,
        evidenceConfidence: 85,
      },
      capexMillion: 75,
      implementationYears: 2.5,
      levers: {
        wasteDiversion: 38,
        energyDemand: -30,
      },
      assumptions: [
        "Guaranteed minimum organic feedstock supply agreement with municipal corporation.",
      ],
      limitations: [
        "High capital expenditure requires public-private partnership (PPP) structure.",
      ],
      kpis: ["Bio-methane produced (kg/day)", "Transit fleet diesel displacement (%)"],
      nextSteps: [
        "Execute transaction advisory tender for DBFOT private operator.",
        "Secure environmental clearance and grid injection permissions.",
      ],
    },
  ],

  "road-damage": [
    {
      id: "act-ai-pothole-rapid-repair",
      title: "Vehicle-Mounted AI Surface Defect Detection & Jet-Patcher Fleet",
      problemId: "road-damage",
      scope: "arterials",
      summary: "Equip municipal inspection vehicles with computer-vision pavement profilers and deploy velocity-spray injection repair trucks for 24-hr turnaround.",
      scores: {
        expectedBenefit: 89,
        cost: 22,
        urgency: 92,
        feasibility: 90,
        environmentalImpact: 74,
        evidenceConfidence: 93,
      },
      capexMillion: 14,
      implementationYears: 0.5,
      levers: {
        roadQualityIndex: 35,
        traffic: -15,
      },
      assumptions: [
        "Velocity spray patching reduces pothole repair time from 4 days to under 4 hours.",
        "Cold-mix polymers allow durable repairs during rainy monsoon periods.",
      ],
      limitations: [
        "Does not resolve base structural failures requiring complete sub-grade milling.",
      ],
      kpis: ["Average pothole repair turnaround time (hours)", "Corridor PCI improvement (%)"],
      nextSteps: [
        "Deploy camera profiler units on 20 city public transit buses.",
        "Procure 4 automated jet-patcher emulsion repair vehicles.",
      ],
    },
    {
      id: "act-mastic-asphalt-overlay",
      title: "Heavy-Duty Mastic Asphalt Resurfacing on Freight Corridors",
      problemId: "road-damage",
      scope: "industrial-belt",
      summary: "Apply dense impermeable mastic asphalt wearing courses designed for heavy multi-axle freight traffic and thermal resistance.",
      scores: {
        expectedBenefit: 84,
        cost: 52,
        urgency: 80,
        feasibility: 85,
        environmentalImpact: 70,
        evidenceConfidence: 88,
      },
      capexMillion: 46,
      implementationYears: 1.5,
      levers: {
        roadQualityIndex: 45,
        traffic: -12,
      },
      assumptions: [
        "Mastic overlay extends corridor lifecycle from 3 years to 10 years without potholes.",
      ],
      limitations: [
        "Requires night-time arterial road diversions during laying.",
      ],
      kpis: ["Pavement lifespan without rutting (years)", "Annual road maintenance cost reduction (%)"],
      nextSteps: [
        "Conduct core-sample density testing along primary freight corridors.",
        "Issue performance-based maintenance contracts with 5-year warranty clauses.",
      ],
    },
  ],

  "infrastructure-gaps": [
    {
      id: "act-electric-feeder-buses",
      title: "Electric Micro-Transit Feeders & Integrated Smart Mobility Cards",
      problemId: "infrastructure-gaps",
      scope: "peripheral-settlements",
      summary: "Deploy a fleet of 180 mini electric feeder buses connecting suburban residential neighborhoods to primary metro and rail stations.",
      scores: {
        expectedBenefit: 87,
        cost: 40,
        urgency: 85,
        feasibility: 88,
        environmentalImpact: 92,
        evidenceConfidence: 90,
      },
      capexMillion: 38,
      implementationYears: 1,
      levers: {
        transitAccess: 28,
        traffic: -18,
        aqi: -12,
      },
      assumptions: [
        "Common mobility smart card provides seamless free interchange between bus and rail.",
      ],
      limitations: [
        "Requires dedicated depot charging infrastructure on suburban peripheries.",
      ],
      kpis: ["Suburban transit modal share (%)", "Average passenger first/last mile commute time (min)"],
      nextSteps: [
        "Finalize 24 high-demand feeder routes using mobile location telemetry.",
        "Award electric midi-bus procurement under clean-fuel subsidies.",
      ],
    },
    {
      id: "act-multimodal-hubs",
      title: "Grade-Separated Multi-Modal Mobility Interchanges with Active Travel Lanes",
      problemId: "infrastructure-gaps",
      scope: "transit-hub",
      summary: "Redesign 4 major transit hubs with covered pedestrian skywalks, sheltered bike parking, and synchronized bus-metro arrival boards.",
      scores: {
        expectedBenefit: 83,
        cost: 58,
        urgency: 78,
        feasibility: 80,
        environmentalImpact: 86,
        evidenceConfidence: 87,
      },
      capexMillion: 62,
      implementationYears: 2,
      levers: {
        transitAccess: 35,
        traffic: -20,
      },
      assumptions: [
        "Universal accessibility standards (ramps, tactile paving, elevators) fully incorporated.",
      ],
      limitations: [
        "Complex construction staging required around active transit stations.",
      ],
      kpis: ["Daily transit passenger interchange volume (riders/day)", "Pedestrian safety index at hubs"],
      nextSteps: [
        "Complete architectural schematics with transit authorities.",
        "Issue global engineering and construction tender.",
      ],
    },
  ],
};
