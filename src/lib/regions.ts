import type { StatKey } from "@/lib/game-store";

export interface CityInfo {
  name: string;
  isCapital?: boolean;
  population: string;
  specificThreat: string;
  airQualityIndex: number; // 0-500
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  primaryIssue: string;
}

export interface RealWorldProblem {
  id: string;
  category:
    | "Climate"
    | "Flood"
    | "Drought"
    | "Water"
    | "Food"
    | "Health"
    | "Energy"
    | "Economy"
    | "Air Quality"
    | "Natural Disasters";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  lastUpdated: string;
  dataType: "REAL DATA" | "AI PROJECTION" | "SIMULATION";
  affectedMetric: StatKey;
}

export interface CountryIntelligence {
  overview: string;
  historicalContext: string;
  whyItMatters: string;
  recommendedActions: string[];
}

export interface Region {
  id: string;
  name: string;
  country: string;
  city: string; // default capital/primary city
  cities: CityInfo[];
  flag: string;
  population: string;
  /** normalized -12..12 modifiers applied on top of global indicators */
  modifiers: Partial<Record<StatKey, number>>;
  riskProfile: string;
  primaryThreat: string;
  /** screen-space marker position in % (x, y) over the globe viewport */
  marker: { x: number; y: number };
  realProblems: RealWorldProblem[];
  intelligence: CountryIntelligence;
}

export const REGIONS: Region[] = [
  {
    id: "pakistan",
    name: "Pakistan (Indus Basin)",
    country: "Pakistan",
    city: "Islamabad",
    flag: "🇵🇰",
    population: "241.5M",
    modifiers: { water: -12, climate: -10, health: -6, economy: -5, food: -6 },
    riskProfile: "Glacial melt volatility · monsoon surges · Indus agricultural water stress",
    primaryThreat: "Severe Flooding & Heat Extremes",
    marker: { x: 65, y: 44 },
    cities: [
      {
        name: "Islamabad",
        isCapital: true,
        population: "1.2M",
        specificThreat: "Margalla watershed strain & urban heat anomalies",
        airQualityIndex: 168,
        riskLevel: "Moderate",
        primaryIssue: "Aquifer depletion & microclimate heating",
      },
      {
        name: "Karachi",
        population: "17.6M",
        specificThreat: "Arabian Sea storm surges, urban flooding & heat dome",
        airQualityIndex: 195,
        riskLevel: "Critical",
        primaryIssue: "Coastal flooding & potable water scarcity",
      },
      {
        name: "Lahore",
        population: "13.9M",
        specificThreat: "Severe winter hazardous smog & Ravi basin pollution",
        airQualityIndex: 320,
        riskLevel: "Critical",
        primaryIssue: "PM2.5 particulate crisis & thermal inversion",
      },
      {
        name: "Peshawar",
        population: "2.3M",
        specificThreat: "Kabul river basin flash floods & cross-border hydrology",
        airQualityIndex: 175,
        riskLevel: "High",
        primaryIssue: "Sedimentation & flash flood runoff",
      },
      {
        name: "Quetta",
        population: "1.1M",
        specificThreat: "Chaman seismic fault zone & deep arid groundwater drought",
        airQualityIndex: 140,
        riskLevel: "High",
        primaryIssue: "Groundwater depletion & seismic exposure",
      },
      {
        name: "Indus Valley (Sukkur/Hyderabad)",
        population: "35M Basin",
        specificThreat: "River embankment overflow & agrarian crop inundation",
        airQualityIndex: 130,
        riskLevel: "Critical",
        primaryIssue: "Monsoon deluge & agricultural yield destruction",
      },
    ],
    realProblems: [
      {
        id: "pk-1",
        category: "Flood",
        title: "Glacial Lake Outburst & Indus Monsoon Inundation",
        description:
          "Over 7,000 glaciers in Karakoram/Himalayas experiencing accelerated melt, threatening downstream floodplains across Sindh & Punjab.",
        severity: "critical",
        source: "NDMA Pakistan / Copernicus Climate Service",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
      {
        id: "pk-2",
        category: "Air Quality",
        title: "Hazardous Indus Smog & Winter Thermal Inversions",
        description:
          "Lahore-Faisalabad-Gujranwala industrial and agricultural crop-burning corridor exceeding WHO safe limits by 18x.",
        severity: "high",
        source: "Punjab EPA / AirVisual Global Index",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "health",
      },
      {
        id: "pk-3",
        category: "Water",
        title: "Per Capita Freshwater Scarcity & Groundwater Depletion",
        description:
          "Annual per capita water availability dropped below 900m³, putting 80% of agriculture under severe irrigation stress.",
        severity: "critical",
        source: "PCRWR / World Bank Water Data",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
      {
        id: "pk-4",
        category: "Climate",
        title: "Wet-Bulb Heatwaves Surpassing 35°C Thresholds",
        description:
          "Jacobabad and Sibi routinely record temperatures exceeding human physiological tolerance during pre-monsoon heat peaks.",
        severity: "critical",
        source: "Pakistan Meteorological Department (PMD)",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
      {
        id: "pk-5",
        category: "Food",
        title: "Wheat & Cotton Yield Vulnerability",
        description:
          "Unseasonal monsoon timing and pest vectors reducing staple crop yields by 14-22% across major agricultural districts.",
        severity: "high",
        source: "PARC / UN FAO Bulletin",
        lastUpdated: "Updated Q1 2026",
        dataType: "AI PROJECTION",
        affectedMetric: "food",
      },
      {
        id: "pk-6",
        category: "Energy",
        title: "Hydropower Seasonal Intermittency & Grid Strain",
        description:
          "Tarbela and Mangla reservoir low-water heads cause 4.5GW generation shortfall during seasonal transition months.",
        severity: "medium",
        source: "WAPDA / National Grid Telemetry",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "energy",
      },
    ],
    intelligence: {
      overview:
        "Pakistan ranks among the top 10 most climate-vulnerable nations globally despite contributing under 1% of global greenhouse emissions. The Indus River Basin serves as the vital lifeline for 240+ million people.",
      historicalContext:
        "The cataclysmic 2022 mega-floods submerged one-third of the country, displaced 33 million citizens, and caused over $30B in economic losses. Structural rebuilding continues to shape national policy.",
      whyItMatters:
        "Food and water security in the Indus Basin directly stabilize regional geopolitical equilibrium across South Asia and global textile/grain supply chains.",
      recommendedActions: [
        "Construct distributed retention basins and smart automated floodgates along the Indus riverbed.",
        "Implement drip irrigation subsidies to cut agricultural water waste by 35%.",
        "Deploy urban green corridors and electric transit mandates in Lahore to mitigate winter smog crises.",
        "Strengthen early-warning satellite telemetry for glacial lake outburst floods in Gilgit-Baltistan.",
      ],
    },
  },
  {
    id: "north-america",
    name: "United States (North America)",
    country: "United States",
    city: "Washington DC",
    flag: "🇺🇸",
    population: "340M",
    modifiers: { economy: 9, health: 6, energy: 5, climate: -4 },
    riskProfile: "Wildfire belts · hurricane corridors · high consumption rate",
    primaryThreat: "Wildfire & Extreme Storms",
    marker: { x: 24, y: 38 },
    cities: [
      {
        name: "Washington DC",
        isCapital: true,
        population: "712K",
        specificThreat: "Potomac tidal storm surges & federal grid resilience",
        airQualityIndex: 42,
        riskLevel: "Low",
        primaryIssue: "Governance continuity & critical infrastructure security",
      },
      {
        name: "Los Angeles",
        population: "3.9M",
        specificThreat: "Santa Ana wildfire winds & multi-year drought",
        airQualityIndex: 78,
        riskLevel: "High",
        primaryIssue: "Wildfire interface & water import dependence",
      },
      {
        name: "Miami",
        population: "442K (Metro 6.1M)",
        specificThreat: "Sunny day tidal flooding & Category 5 Atlantic hurricanes",
        airQualityIndex: 35,
        riskLevel: "Critical",
        primaryIssue: "Biscayne aquifer salinization & sea level rise",
      },
      {
        name: "New York",
        population: "8.3M",
        specificThreat: "Subway and subterranean coastal surge inundation",
        airQualityIndex: 55,
        riskLevel: "Moderate",
        primaryIssue: "Aging drainage infrastructure & heat island effect",
      },
      {
        name: "San Francisco",
        population: "808K",
        specificThreat: "San Andreas seismic hazard & wildfire smoke corridors",
        airQualityIndex: 48,
        riskLevel: "High",
        primaryIssue: "Seismic infrastructure retrofit & smoke filtration",
      },
    ],
    realProblems: [
      {
        id: "us-1",
        category: "Natural Disasters",
        title: "Western Megafires & Smoke Dispersion",
        description:
          "10+ million acres annually exposed to catastrophic wildfire risk in California, Oregon, and Washington state.",
        severity: "critical",
        source: "NIFC / NOAA Satellite Wildfire Telemetry",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
      {
        id: "us-2",
        category: "Flood",
        title: "Atlantic & Gulf Coast Mega-Hurricanes",
        description:
          "Rapid intensification of hurricanes fueled by warm Gulf waters threatening energy refining and coastal cities.",
        severity: "high",
        source: "National Hurricane Center (NHC)",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
      {
        id: "us-3",
        category: "Water",
        title: "Colorado River Basin Allocation Deficit",
        description:
          "Lake Mead and Lake Powell storage levels near critical power pool elevation affecting 40 million municipal users.",
        severity: "high",
        source: "US Bureau of Reclamation",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
      {
        id: "us-4",
        category: "Energy",
        title: "Extreme Temperature Grid Congestion",
        description:
          "Winter storms (ERCOT) and summer heat waves pushing inter-regional power transmission to maximum tolerances.",
        severity: "medium",
        source: "NERC Grid Assessment",
        lastUpdated: "Updated Q1 2026",
        dataType: "AI PROJECTION",
        affectedMetric: "energy",
      },
    ],
    intelligence: {
      overview:
        "The United States possesses immense economic and technological capacity, but faces escalating multi-hazard climate impacts from Western wildfires to Atlantic hurricanes.",
      historicalContext:
        "Trillion-dollar infrastructure adaptation programs are underway following consecutive record disaster years.",
      whyItMatters:
        "Global financial and technological supply chain stability depends on North American logistics and agricultural breadbasket continuity.",
      recommendedActions: [
        "Accelerate Western forest thinning and AI autonomous aerial fire suppression grids.",
        "Harden coastal surge defenses and sea gates across the Gulf of Mexico and Eastern Seaboard.",
        "Renegotiate Colorado River compacts with mandatory smart irrigation metering.",
      ],
    },
  },
  {
    id: "east-asia",
    name: "Japan (East Asia)",
    country: "Japan",
    city: "Tokyo",
    flag: "🇯🇵",
    population: "125M",
    modifiers: { economy: 7, energy: 4, climate: -6, water: -3 },
    riskProfile: "Seismic faultlines · typhoon corridors · coastal megacity vulnerability",
    primaryThreat: "Earthquake & Tsunami",
    marker: { x: 79, y: 40 },
    cities: [
      {
        name: "Tokyo",
        isCapital: true,
        population: "14.0M (Metro 37M)",
        specificThreat: "Nankai Trough megaquake risk & super-typhoon storm surge",
        airQualityIndex: 28,
        riskLevel: "Critical",
        primaryIssue: "Low-lying eastern delta flooding & dense urban fire spread",
      },
      {
        name: "Osaka",
        population: "2.7M",
        specificThreat: "Osaka Bay storm surge & Kansai airport maritime flooding",
        airQualityIndex: 32,
        riskLevel: "High",
        primaryIssue: "Yodo river flood basin containment",
      },
      {
        name: "Kyoto",
        population: "1.4M",
        specificThreat: "Basin heat traps & cultural heritage preservation",
        airQualityIndex: 25,
        riskLevel: "Moderate",
        primaryIssue: "Tourism infrastructure strain & extreme heat waves",
      },
      {
        name: "Sendai",
        population: "1.1M",
        specificThreat: "Tohoku Pacific subduction zone seismic activity",
        airQualityIndex: 20,
        riskLevel: "High",
        primaryIssue: "Seawall integrity & tsunami evacuation automation",
      },
    ],
    realProblems: [
      {
        id: "jp-1",
        category: "Natural Disasters",
        title: "Nankai Trough Mega-Thrust Earthquake Probability",
        description:
          "70-80% probability of M8-9 subduction quake within the next three decades threatening the Pacific industrial corridor.",
        severity: "critical",
        source: "JMA / Headquarters for Earthquake Research Promotion",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "economy",
      },
      {
        id: "jp-2",
        category: "Climate",
        title: "Super-Typhoon Trajectory Northward Migration",
        description:
          "Warmer sea surface temperatures in the Kuroshio current enabling category 4/5 typhoons to strike Honshu without weakening.",
        severity: "high",
        source: "Japan Meteorological Agency",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
      {
        id: "jp-3",
        category: "Energy",
        title: "Imported LNG Dependency & Nuclear Restart Transition",
        description:
          "High reliance on imported fossil fuels creating economic vulnerability to sea lane disruptions.",
        severity: "medium",
        source: "METI Energy Telemetry",
        lastUpdated: "Updated Q1 2026",
        dataType: "AI PROJECTION",
        affectedMetric: "energy",
      },
    ],
    intelligence: {
      overview:
        "Japan maintains the world's most advanced earthquake early-warning systems and subterranean storm runoff tunnels (G-CANS), serving as a global benchmark for resilient engineering.",
      historicalContext:
        "The 2011 Great East Japan Earthquake re-architected global disaster risk models and prompted comprehensive energy transition reassessments.",
      whyItMatters:
        "High-precision manufacturing, semiconductor components, and robotics supply chains originate in vulnerable coastal prefectures.",
      recommendedActions: [
        "Complete automated tsunami vertical evacuation towers across the Shizuoka/Wakayama coastline.",
        "Expand subterranean water discharge tunnels in Tokyo Bay to handle 100mm/hr rainfall events.",
        "Decentralize emergency governance nodes with satellite AI continuity backups.",
      ],
    },
  },
  {
    id: "south-asia",
    name: "South Asia (India)",
    country: "India",
    city: "New Delhi",
    flag: "🇮🇳",
    population: "1.43B",
    modifiers: { water: -10, climate: -8, health: -5, economy: -3, food: -4 },
    riskProfile: "Monsoon volatility · heat extremes · dense urban exposure",
    primaryThreat: "Flooding & Heat Extremes",
    marker: { x: 68, y: 47 },
    cities: [
      {
        name: "New Delhi",
        isCapital: true,
        population: "33M Metro",
        specificThreat: "Severe winter AQI crisis & summer 48°C+ heatwaves",
        airQualityIndex: 290,
        riskLevel: "Critical",
        primaryIssue: "Air pollution & Yamuna river ecological stress",
      },
      {
        name: "Mumbai",
        population: "21M",
        specificThreat: "Arabian Sea storm surges & Mithi river flash flooding",
        airQualityIndex: 160,
        riskLevel: "Critical",
        primaryIssue: "Coastal reclamation inundation & slum vulnerability",
      },
      {
        name: "Bengaluru",
        population: "13M",
        specificThreat: "Lake encroachment flash floods & severe water table depletion",
        airQualityIndex: 95,
        riskLevel: "High",
        primaryIssue: "Tech corridor groundwater exhaustion",
      },
      {
        name: "Chennai",
        population: "11M",
        specificThreat: "Cyclical drought ('Day Zero') followed by severe monsoon deluge",
        airQualityIndex: 85,
        riskLevel: "High",
        primaryIssue: "Desalination capacity & wetland restoration",
      },
    ],
    realProblems: [
      {
        id: "in-1",
        category: "Air Quality",
        title: "Indo-Gangetic Plain Particulate Concentration",
        description:
          "Over 400 million residents exposed to AQI levels deemed hazardous for over 90 days annually.",
        severity: "critical",
        source: "CPCB / Lancet Planetary Health",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "health",
      },
      {
        id: "in-2",
        category: "Water",
        title: "Groundwater Depletion in Agrarian Heartland",
        description:
          "Over-extraction of aquifers across Punjab, Haryana, and Rajasthan for paddy cultivation pushing borewells past 300m.",
        severity: "critical",
        source: "Central Ground Water Board (CGWB)",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
      {
        id: "in-3",
        category: "Climate",
        title: "Monsoon Erratic Timing & Cloudbursts",
        description:
          "Shift toward short-duration, high-intensity cloudbursts causing catastrophic urban floods in Himalayan and Deccan cities.",
        severity: "high",
        source: "IMD Climate Division",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
    ],
    intelligence: {
      overview:
        "Home to 18% of humanity, India is rapidly urbanizing while managing extreme climatic exposure across the Himalayas, Indo-Gangetic plain, and extensive coastline.",
      historicalContext:
        "Major renewable energy expansion (500GW target) is underway alongside large-scale river rejuvenation projects.",
      whyItMatters:
        "Agricultural output feeds a massive population and stabilizes global rice and grain markets.",
      recommendedActions: [
        "Deploy mandatory agricultural solar pump smart-switching to halt groundwater over-extraction.",
        "Implement urban sponge-city wetlands across Mumbai, Chennai, and Bengaluru.",
        "Establish regional clean energy corridors to power cooling centers in extreme heat zones.",
      ],
    },
  },
  {
    id: "east-africa",
    name: "East Africa (Kenya)",
    country: "Kenya",
    city: "Nairobi",
    flag: "🇰🇪",
    population: "480M Region",
    modifiers: { water: -12, food: -11, energy: -8, health: -6 },
    riskProfile: "Drought cycles · food insecurity · grid fragility",
    primaryThreat: "Severe Drought & Food Crisis",
    marker: { x: 55, y: 55 },
    cities: [
      {
        name: "Nairobi",
        isCapital: true,
        population: "4.9M",
        specificThreat: "Informal settlement flash flooding & water rationing",
        airQualityIndex: 65,
        riskLevel: "Moderate",
        primaryIssue: "Urban drainage & grid reliability",
      },
      {
        name: "Mombasa",
        population: "1.3M",
        specificThreat: "Indian Ocean sea level rise & coral bleaching",
        airQualityIndex: 45,
        riskLevel: "High",
        primaryIssue: "Port logistics exposure & freshwater salinization",
      },
      {
        name: "Kisumu",
        population: "600K",
        specificThreat: "Lake Victoria water hyacinth blooms & irregular rains",
        airQualityIndex: 40,
        riskLevel: "Moderate",
        primaryIssue: "Fisheries depletion & agricultural runoff",
      },
    ],
    realProblems: [
      {
        id: "ke-1",
        category: "Drought",
        title: "Horn of Africa Multi-Season Rainfall Failure",
        description:
          "Consecutive failed rain seasons causing severe pasture depletion and loss of livestock across arid counties.",
        severity: "critical",
        source: "UN OCHA / IGAD Climate Center",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "food",
      },
      {
        id: "ke-2",
        category: "Food",
        title: "Pastoralist Livestock Mortalities & Malnutrition",
        description:
          "Over 3.5 million people in northern pastoralist belts requiring emergency food and nutrient assistance.",
        severity: "critical",
        source: "WFP / Kenya National Drought Management Authority",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "food",
      },
    ],
    intelligence: {
      overview:
        "East Africa is a pioneer in geothermal energy and mobile financial resilience (M-Pesa), but remains deeply exposed to unpredictable Indian Ocean Dipole oscillation cycles.",
      historicalContext:
        "Recent humanitarian interventions highlight the critical need for climate-resilient pastoralist safety nets.",
      whyItMatters:
        "East African stability is crucial for regional commerce, biodiversity preservation, and humanitarian security.",
      recommendedActions: [
        "Expand geothermal microgrids to power solar-driven boreholes in drought-affected counties.",
        "Scale index-based livestock insurance for pastoralist communities.",
        "Implement sand dams and rainwater catchment networks in semi-arid zones.",
      ],
    },
  },
  {
    id: "europe",
    name: "Europe (European Union)",
    country: "European Union",
    city: "Brussels",
    flag: "🇪🇺",
    population: "745M",
    modifiers: { health: 8, economy: 5, climate: 3, energy: -4 },
    riskProfile: "Heat domes · energy transition strain · aging infrastructure",
    primaryThreat: "Heatwave & Drought",
    marker: { x: 49, y: 33 },
    cities: [
      {
        name: "Brussels",
        isCapital: true,
        population: "1.2M",
        specificThreat: "Urban heat island & policy coordination latency",
        airQualityIndex: 38,
        riskLevel: "Low",
        primaryIssue: "Regulatory alignment & energy grid interconnects",
      },
      {
        name: "Berlin",
        population: "3.7M",
        specificThreat: "Spree river flow reduction & summer heat domes",
        airQualityIndex: 42,
        riskLevel: "Moderate",
        primaryIssue: "Industrial water cooling constraints",
      },
      {
        name: "Paris",
        population: "2.1M (Metro 12M)",
        specificThreat: "40°C+ summer heatwaves & Seine river storm surge",
        airQualityIndex: 45,
        riskLevel: "High",
        primaryIssue: "Zinc roof thermal absorption & elderly vulnerability",
      },
      {
        name: "Rome",
        population: "2.8M",
        specificThreat: "Mediterranean desertification & Tiber drought",
        airQualityIndex: 58,
        riskLevel: "High",
        primaryIssue: "Agricultural drought in Po valley & urban heat",
      },
    ],
    realProblems: [
      {
        id: "eu-1",
        category: "Climate",
        title: "Mediterranean Heat Dome Amplification",
        description:
          "Europe is warming twice as fast as the global average, with Southern Europe facing accelerated desertification risks.",
        severity: "high",
        source: "Copernicus Climate Change Service (C3S)",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
      {
        id: "eu-2",
        category: "Water",
        title: "Rhine & Danube Commercial Navigation Low-Water Bottlenecks",
        description:
          "Low summer river levels forcing freight barges to operate at 30% capacity, disrupting chemical and coal supply chains.",
        severity: "medium",
        source: "European Environment Agency (EEA)",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "economy",
      },
    ],
    intelligence: {
      overview:
        "Europe leads the global regulatory framework in climate transition (Green Deal, ETS) but experiences intense summer thermal shocks and continental hydrological stress.",
      historicalContext:
        "The energy restructuring following recent geopolitical crises accelerated renewable deployment by a full decade.",
      whyItMatters: "European standards set global industrial and environmental benchmarks.",
      recommendedActions: [
        "Retrofit historical building stock with passive cooling and green rooftops.",
        "Harden trans-European energy supergrids with HVDC interconnections.",
        "Enact mandatory Po & Rhine river water conservation protocols.",
      ],
    },
  },
  {
    id: "south-america",
    name: "South America (Brazil)",
    country: "Brazil",
    city: "Brasília",
    flag: "🇧🇷",
    population: "440M Region",
    modifiers: { food: 7, water: 6, climate: -7, economy: -5 },
    riskProfile: "Amazon biome pressure · hydrological shifts · commodity shocks",
    primaryThreat: "Drought & Deforestation",
    marker: { x: 33, y: 65 },
    cities: [
      {
        name: "Brasília",
        isCapital: true,
        population: "3.1M",
        specificThreat: "Cerrado biome drying & water rationing cycles",
        airQualityIndex: 30,
        riskLevel: "Low",
        primaryIssue: "Savannah biome preservation",
      },
      {
        name: "São Paulo",
        population: "12.3M",
        specificThreat: "Cantareira reservoir drought crises & flash flooding",
        airQualityIndex: 72,
        riskLevel: "High",
        primaryIssue: "Megacity water system fragility",
      },
      {
        name: "Manaus",
        population: "2.2M",
        specificThreat: "Rio Negro record low water levels isolated by Amazon drought",
        airQualityIndex: 85,
        riskLevel: "Critical",
        primaryIssue: "River transport collapse & forest fire smoke",
      },
    ],
    realProblems: [
      {
        id: "br-1",
        category: "Drought",
        title: "Amazon Rainforest Tipping Point & Hydrological Disruption",
        description:
          "Severe droughts across the Amazon basin reducing river levels to 120-year historic lows, threatening indigenous populations.",
        severity: "critical",
        source: "INPE / Brazilian National Cemaden",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
    ],
    intelligence: {
      overview:
        "The Amazon basin acts as the Earth's primary carbon sink and hydrological pump, generating 'flying rivers' that water continental agriculture.",
      historicalContext:
        "Satellite monitoring has significantly bolstered deforestation enforcement in the legal Amazon.",
      whyItMatters:
        "Amazon biome stability is a planetary boundary condition; tipping into savannah would trigger uncontrollable global warming.",
      recommendedActions: [
        "Expand real-time AI satellite deforestation interception systems.",
        "Incentivize agroforestry and sustainable bioeconomy initiatives.",
      ],
    },
  },
  {
    id: "oceania",
    name: "Oceania (Australia)",
    country: "Australia",
    city: "Sydney",
    flag: "🇦🇺",
    population: "45M Region",
    modifiers: { health: 6, climate: -9, water: -6, economy: 3 },
    riskProfile: "Bushfire seasons · marine heatwaves · sea level exposure",
    primaryThreat: "Bushfires & Coral Bleaching",
    marker: { x: 86, y: 70 },
    cities: [
      {
        name: "Sydney",
        isCapital: false,
        population: "5.3M",
        specificThreat: "Blue Mountains bushfire smoke & coastal beach erosion",
        airQualityIndex: 35,
        riskLevel: "Moderate",
        primaryIssue: "Urban bushland interface fire protection",
      },
      {
        name: "Melbourne",
        population: "5.1M",
        specificThreat: "40°C+ heatwaves & thunderstorm asthma events",
        airQualityIndex: 30,
        riskLevel: "Moderate",
        primaryIssue: "Extreme temperature health spikes",
      },
      {
        name: "Brisbane",
        population: "2.6M",
        specificThreat: "Subtropical river flooding & cyclone storm surges",
        airQualityIndex: 25,
        riskLevel: "High",
        primaryIssue: "River catchment flood mitigation",
      },
    ],
    realProblems: [
      {
        id: "au-1",
        category: "Natural Disasters",
        title: "Black Summer Extreme Bushfire Recurrence",
        description:
          "Prolonged dry spells and high fuel loads exposing southeast populated regions to high-severity fire seasons.",
        severity: "high",
        source: "BOM Australia / CSIRO Wildfire Model",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
    ],
    intelligence: {
      overview:
        "Australia is highly developed with immense renewable potential (solar/wind/green hydrogen) but endures extreme weather volatility.",
      historicalContext:
        "The Black Summer bushfires stimulated nationwide unified disaster management protocols.",
      whyItMatters:
        "Key exporter of critical minerals and agricultural commodities in the Asia-Pacific.",
      recommendedActions: [
        "Scale indigenous cultural burning practices for broad-acre fuel load reduction.",
        "Deploy grid-scale battery storage to fortify rural township resilience.",
      ],
    },
  },
  {
    id: "global",
    name: "Global Sector (Planetary Command)",
    country: "Planetary Command",
    city: "Orbital Habitat",
    flag: "🌍",
    population: "8.15B",
    modifiers: {},
    riskProfile: "Aggregate planetary baseline and systemic feedback loops",
    primaryThreat: "Compound Systemic Cascade",
    marker: { x: 50, y: 48 },
    cities: [
      {
        name: "Orbital Command Hub",
        isCapital: true,
        population: "1.2K Scientists",
        specificThreat: "Space weather solar flares & orbital debris cascades",
        airQualityIndex: 0,
        riskLevel: "Low",
        primaryIssue: "Planetary telemetry coordination",
      },
    ],
    realProblems: [
      {
        id: "gl-1",
        category: "Climate",
        title: "Atmospheric CO2 Concentration Above 425 ppm",
        description:
          "Global greenhouse gas levels continue driving planetary heat retention and sea surface temperature anomalies.",
        severity: "critical",
        source: "NOAA Mauna Loa Observatory",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "climate",
      },
      {
        id: "gl-2",
        category: "Water",
        title: "Global Cryosphere Mass Loss",
        description:
          "Ice sheet loss in Greenland and West Antarctica accelerating sea level rise projections for coastal megacities.",
        severity: "critical",
        source: "NASA GRACE Satellites",
        lastUpdated: "Updated Q1 2026",
        dataType: "REAL DATA",
        affectedMetric: "water",
      },
    ],
    intelligence: {
      overview:
        "Planetary Command aggregates real-time satellite telemetry, oceanic buoys, ground atmospheric stations, and multi-agent AI digital twin forecasts.",
      historicalContext:
        "Established as the unified operations bridge to guide planetary civilization through the 2026-2050 transition window.",
      whyItMatters:
        "Local planetary decisions trigger interconnected systemic feedback loops across all six core survivability metrics.",
      recommendedActions: [
        "Maintain continuous real-time orbital monitoring of vulnerable biomes.",
        "Coordinate multi-lateral AI recommendations across all linked national sectors.",
      ],
    },
  },
];

export function getRegion(id: string): Region {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0]!;
}

export function getCityInfo(region: Region, cityName?: string): CityInfo {
  if (!cityName) return region.cities[0]!;
  return (
    region.cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase()) ?? region.cities[0]!
  );
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Apply the selected region's profile to the global indicators. */
export function regionalStats(
  stats: Record<StatKey, number>,
  region: Region,
): Record<StatKey, number> {
  const out = { ...stats };
  (Object.keys(out) as StatKey[]).forEach((k) => {
    out[k] = clamp(out[k] + (region.modifiers[k] ?? 0));
  });
  return out;
}

export function searchRegions(query: string): Region[] {
  const q = query.trim().toLowerCase();
  if (!q) return REGIONS;
  return REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.cities.some((c) => c.name.toLowerCase().includes(q)) ||
      r.primaryThreat.toLowerCase().includes(q) ||
      r.riskProfile.toLowerCase().includes(q),
  );
}
