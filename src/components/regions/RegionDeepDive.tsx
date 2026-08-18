import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  AlertTriangle,
  FileCheck,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Wind,
  Droplets,
  Zap,
  Thermometer,
  CloudSun,
  RefreshCw,
  Gauge,
  Globe,
  Activity,
  Wheat,
} from "lucide-react";
import { usePlanetState } from "@/lib/game-store";
import { getRegion, REGIONS, type CityInfo, type RealWorldProblem } from "@/lib/regions";
import { audioService } from "@/services/audioService";
import { liveWeatherService, type LiveWeatherData } from "@/services/liveWeatherService";
import { NasaLiveEventsPanel } from "@/components/nasa/NasaLiveEventsPanel";
import { WaterFoodCascadePanel } from "@/components/cascade/WaterFoodCascadePanel";

export function RegionDeepDive() {
  const { region, regionId, setRegion, activeCity, setSelectedCity } = usePlanetState();
  const [selectedTab, setSelectedTab] = useState<"cities" | "waterfood" | "nasa" | "problems" | "intelligence">("cities");
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  const matchedCity = region.cities.find((c) => c.name.toLowerCase() === activeCity.toLowerCase());
  const activeCityName = matchedCity?.name ?? activeCity ?? region.city;

  const loadWeather = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const data = await liveWeatherService.fetchLiveWeather(activeCityName, region.country);
      setWeatherData(data);
    } catch {
      /* handled in service */
    } finally {
      setWeatherLoading(false);
    }
  }, [activeCityName, region.country]);

  useEffect(() => {
    void loadWeather();
  }, [loadWeather]);

  const currentCityInfo = {
    name: activeCityName,
    population: matchedCity?.population ?? region.population,
    riskLevel: (matchedCity?.riskLevel ?? "HIGH").toUpperCase(),
    airQualityIndex: weatherData?.airQuality?.usAqi ?? matchedCity?.airQualityIndex ?? 115,
    floodRisk: region.id === "pakistan" ? 82 : 45,
    heatwaveRisk: region.id === "pakistan" ? 78 : 52,
    powerStability: region.id === "pakistan" ? 54 : 68,
    waterStress: region.id === "pakistan" ? 74 : 48,
  };

  const handleCityChange = (cityName: string) => {
    audioService.playClick();
    setSelectedCity(cityName);
  };

  const handleRegionChange = (newRegionId: string) => {
    audioService.playClick();
    setRegion(newRegionId);
  };

  const vulnerabilities = [
    region.intelligence?.historicalContext ??
      "Regional vulnerability indicators elevated under compound climate scenarios.",
    region.intelligence?.whyItMatters ?? "Cross-border hydrological and economic cascading risks.",
  ];

  const recommendations = region.intelligence?.recommendedActions ?? [
    "Accelerate decentralized infrastructure resilience grids.",
    "Deploy IoT early-warning hydrological sensors across population centers.",
  ];

  return (
    <div className="holo-panel rounded-xl p-4 md:p-5 space-y-4">
      {/* Header with Country & Region Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{region.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base md:text-lg font-bold text-foreground">
                {region.name.toUpperCase()}
              </h3>
              <span className="rounded-full bg-neon/10 border border-neon/30 px-2 py-0.5 text-[9px] font-display tracking-widest text-neon">
                {region.country}
              </span>
            </div>
            <p className="text-[10px] font-display tracking-widest text-muted-foreground">
              PRIMARY SENSOR TELEMETRY · COORD {region.marker.x.toFixed(1)}°N,{" "}
              {region.marker.y.toFixed(1)}°E
            </p>
          </div>
        </div>

        {/* Quick Region Selector dropdown */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <select
            value={regionId}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="rounded-lg bg-muted/40 border border-border/60 px-3 py-1.5 font-display text-[10px] tracking-widest text-foreground outline-none focus:border-neon cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id} className="bg-background text-foreground">
                {r.flag} {r.name} ({r.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs: Cities & Weather | Water & Food Data | NASA Live Events | Real Problems | Intelligence */}
      <div className="flex items-center gap-2 border-b border-border/30 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            audioService.playClick();
            setSelectedTab("cities");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] tracking-widest whitespace-nowrap transition-all ${
            selectedTab === "cities"
              ? "bg-neon/15 text-neon border border-neon/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 size={12} /> CITIES & LIVE WEATHER ({region.cities.length})
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setSelectedTab("waterfood");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] tracking-widest whitespace-nowrap transition-all ${
            selectedTab === "waterfood"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Droplets size={12} className="text-cyan-400" />
          <Wheat size={12} className="text-amber-400" /> WATER & FOOD CASCADE
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setSelectedTab("nasa");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] tracking-widest whitespace-nowrap transition-all ${
            selectedTab === "nasa"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe size={12} /> NASA LIVE EVENTS
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setSelectedTab("problems");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] tracking-widest whitespace-nowrap transition-all ${
            selectedTab === "problems"
              ? "bg-danger/15 text-danger border border-danger/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertTriangle size={12} /> REAL PROBLEMS ({region.realProblems.length})
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setSelectedTab("intelligence");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] tracking-widest whitespace-nowrap transition-all ${
            selectedTab === "intelligence"
              ? "bg-primary/20 text-primary border border-primary/40 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass size={12} /> INTELLIGENCE BRIEF
        </button>
      </div>

      {/* TAB CONTENT: WATER & FOOD CASCADE DATA */}
      {selectedTab === "waterfood" && (
        <div className="space-y-4">
          <WaterFoodCascadePanel />
        </div>
      )}

      {/* TAB CONTENT: CITIES & LIVE WEATHER */}
      {selectedTab === "cities" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">
              SELECT CITY FOCUS:
            </span>
            {region.cities.map((city) => {
              const isSelected = city.name.toLowerCase() === currentCityInfo.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => handleCityChange(city.name)}
                  className={`px-3 py-1 rounded-md text-xs font-display tracking-wider transition-all ${
                    isSelected
                      ? "neon-border bg-neon/10 text-neon font-bold"
                      : "border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>

          {/* LIVE METEOROLOGICAL TELEMETRY STREAM */}
          <div className="hud-corner rounded-lg bg-background/80 p-4 border border-neon/30 shadow-[0_0_15px_rgba(34,211,238,0.08)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
                <CloudSun size={15} className="text-neon" />
                <h4 className="font-display text-xs md:text-sm font-bold text-foreground tracking-wider">
                  LIVE METEOROLOGICAL TELEMETRY · {currentCityInfo.name.toUpperCase()}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-success/15 border border-success/40 px-2 py-0.5 text-[9px] font-display font-bold tracking-widest text-success">
                  {weatherData?.statusLabel ?? "LIVE DATA"}
                </span>
                <button
                  onClick={() => {
                    audioService.playClick();
                    void loadWeather();
                  }}
                  disabled={weatherLoading}
                  className="rounded-md bg-muted/40 hover:bg-muted/70 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Refresh Live Weather Telemetry"
                  aria-label="Refresh Live Weather"
                >
                  <RefreshCw size={11} className={weatherLoading ? "animate-spin text-neon" : ""} />
                </button>
              </div>
            </div>

            {/* Error banner if live weather temporarily unavailable */}
            {weatherData?.error && (
              <div className="rounded-lg bg-danger/10 border border-danger/40 p-3 flex items-center justify-between">
                <span className="text-xs text-danger flex items-center gap-2">
                  <AlertTriangle size={14} /> {weatherData.error}
                </span>
                <button
                  onClick={() => void loadWeather()}
                  className="rounded bg-danger/20 hover:bg-danger/30 text-danger text-[10px] font-display px-2.5 py-1"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Live Weather Readout Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Thermometer size={10} className="text-warning" /> AMBIENT TEMP
                </span>
                <p className="font-display text-base font-bold text-foreground mt-0.5">
                  {weatherData && weatherData.isLive ? `${weatherData.temperature}°C` : "--"}
                </p>
                <span className="text-[8px] text-muted-foreground">
                  Feels like {weatherData && weatherData.isLive ? `${weatherData.apparentTemperature}°C` : "--"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Droplets size={10} className="text-neon" /> HUMIDITY
                </span>
                <p className="font-display text-base font-bold text-neon mt-0.5">
                  {weatherData && weatherData.isLive ? `${weatherData.humidity}%` : "--"}
                </p>
                <span className="text-[8px] text-muted-foreground">
                  {weatherData && weatherData.isLive ? weatherData.conditionText : "Synchronizing"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Wind size={10} className="text-primary" /> WIND VELOCITY
                </span>
                <p className="font-display text-base font-bold text-foreground mt-0.5">
                  {weatherData && weatherData.isLive ? `${weatherData.windSpeed} km/h` : "--"}
                </p>
                <span className="text-[8px] text-muted-foreground">
                  Precip: {weatherData && weatherData.isLive ? `${weatherData.precipitation} mm` : "0.0 mm"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Gauge size={10} className="text-neon" /> ATM PRESSURE
                </span>
                <p className="font-display text-base font-bold text-foreground mt-0.5">
                  {weatherData && weatherData.isLive ? `${weatherData.pressure} hPa` : "--"}
                </p>
                <span className="text-[8px] text-muted-foreground">
                  Cloud: {weatherData && weatherData.isLive ? `${weatherData.cloudCover}%` : "--"}
                </span>
              </div>
            </div>

            {/* Live Air Quality Readout from Open-Meteo */}
            {weatherData?.airQuality && (
              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-display tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Activity size={11} className="text-neon" /> REAL-TIME AIR QUALITY (OPEN-METEO / COPERNICUS)
                  </span>
                  <span className="rounded bg-neon/10 border border-neon/30 px-2 py-0.5 text-[8.5px] font-display font-bold text-neon">
                    AQI {weatherData.airQuality.usAqi} · {weatherData.airQuality.qualityAssessment.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-muted/15 border border-border/30">
                    <span className="text-[8px] font-mono text-muted-foreground">PM2.5</span>
                    <p className="font-bold text-foreground">{weatherData.airQuality.pm25} µg/m³</p>
                  </div>
                  <div className="p-2 rounded bg-muted/15 border border-border/30">
                    <span className="text-[8px] font-mono text-muted-foreground">PM10</span>
                    <p className="font-bold text-foreground">{weatherData.airQuality.pm10} µg/m³</p>
                  </div>
                  <div className="p-2 rounded bg-muted/15 border border-border/30">
                    <span className="text-[8px] font-mono text-muted-foreground">NO₂</span>
                    <p className="font-bold text-foreground">{weatherData.airQuality.nitrogenDioxide} µg/m³</p>
                  </div>
                  <div className="p-2 rounded bg-muted/15 border border-border/30">
                    <span className="text-[8px] font-mono text-muted-foreground">OZONE (O₃)</span>
                    <p className="font-bold text-foreground">{weatherData.airQuality.ozone} µg/m³</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attribution Footnote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[8.5px] font-mono text-muted-foreground/80 pt-1 border-t border-border/30 gap-1">
              <span>
                SOURCE: {weatherData?.source ?? "Open-Meteo Public API"} (WMO & Copernicus Models)
              </span>
              <span>{weatherData?.lastUpdatedFormatted ?? "Live Telemetry Feed"}</span>
            </div>
          </div>

          {/* SIMULATED VULNERABILITY MODEL */}
          <div className="hud-corner rounded-lg bg-background/60 p-4 border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-neon" />
                <h4 className="font-display text-xs md:text-sm font-bold text-foreground">
                  {currentCityInfo.name.toUpperCase()} SYSTEMIC VULNERABILITY PROFILE
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-muted/40 border border-border/50 px-1.5 py-0.5 text-[8px] font-mono text-muted-foreground">
                  AI-INFERRED
                </span>
                <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[9px] font-display tracking-widest text-muted-foreground">
                  POP: {currentCityInfo.population} · RISK:{" "}
                  <span
                    className={
                      currentCityInfo.riskLevel === "CRITICAL"
                        ? "text-danger font-bold"
                        : currentCityInfo.riskLevel === "HIGH"
                          ? "text-warning font-bold"
                          : "text-success"
                    }
                  >
                    {currentCityInfo.riskLevel}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2 rounded bg-muted/20 border border-border/30 text-center">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Wind size={10} className="text-neon" /> AQI
                </span>
                <p className="font-display text-sm font-bold text-foreground mt-0.5">
                  {currentCityInfo.airQualityIndex}
                </p>
                <span className="text-[8px] text-muted-foreground">
                  {currentCityInfo.airQualityIndex > 150 ? "Unhealthy" : "Moderate"}
                </span>
              </div>

              <div className="p-2 rounded bg-muted/20 border border-border/30 text-center">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Droplets size={10} className="text-neon" /> FLOOD RISK
                </span>
                <p className="font-display text-sm font-bold text-danger mt-0.5">
                  {currentCityInfo.floodRisk}%
                </p>
                <span className="text-[8px] text-muted-foreground">Monsoon Vulnerability</span>
              </div>

              <div className="p-2 rounded bg-muted/20 border border-border/30 text-center">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Thermometer size={10} className="text-warning" /> HEATWAVE
                </span>
                <p className="font-display text-sm font-bold text-warning mt-0.5">
                  {currentCityInfo.heatwaveRisk}%
                </p>
                <span className="text-[8px] text-muted-foreground">Peak Ambient 46°C</span>
              </div>

              <div className="p-2 rounded bg-muted/20 border border-border/30 text-center">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Zap size={10} className="text-primary" /> GRID STABILITY
                </span>
                <p className="font-display text-sm font-bold text-foreground mt-0.5">
                  {currentCityInfo.powerStability}%
                </p>
                <span className="text-[8px] text-muted-foreground">Feed Reserve</span>
              </div>

              <div className="p-2 rounded bg-muted/20 border border-border/30 text-center">
                <span className="text-[8px] font-display tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                  <Droplets size={10} className="text-danger" /> WATER STRESS
                </span>
                <p className="font-display text-sm font-bold text-danger mt-0.5">
                  {currentCityInfo.waterStress}%
                </p>
                <span className="text-[8px] text-muted-foreground">Aquifer Depletion</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NASA LIVE EVENTS */}
      {selectedTab === "nasa" && (
        <NasaLiveEventsPanel />
      )}

      {/* TAB CONTENT: REAL PROBLEMS */}
      {selectedTab === "problems" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-display tracking-widest text-muted-foreground">
            <span>VERIFIED GROUND TRUTH DATASETS</span>
            <span className="text-neon">[REAL DATA TAGGED]</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {region.realProblems.map((problem) => {
              const isExpanded = expandedProblem === problem.id;
              return (
                <div
                  key={problem.id}
                  className="rounded-lg bg-background/50 border border-border/60 p-3 hover:border-danger/40 transition-all cursor-pointer"
                  onClick={() => setExpandedProblem(isExpanded ? null : problem.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-danger/20 text-danger border border-danger/40 px-1.5 py-0.5 text-[8px] font-display tracking-widest">
                        {problem.dataType}
                      </span>
                      <span className="font-display text-xs font-bold text-foreground">
                        {problem.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-display tracking-widest px-2 py-0.5 rounded-full ${
                          problem.severity.toLowerCase() === "critical"
                            ? "bg-danger/20 text-danger"
                            : problem.severity.toLowerCase() === "high"
                              ? "bg-warning/20 text-warning"
                              : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {problem.severity.toUpperCase()}
                      </span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>
                  </div>

                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 pt-2 border-t border-border/40 text-[10px] space-y-1.5 text-muted-foreground"
                      >
                        <div className="flex items-center justify-between">
                          <span>AFFECTED INDICATOR:</span>
                          <span className="font-display text-neon uppercase">
                            {problem.affectedMetric}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>DATA SOURCE / VERIFICATION:</span>
                          <span className="font-display text-foreground">
                            {problem.source || "Copernicus Satellite / UN Observation Network"}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INTELLIGENCE BRIEF */}
      {selectedTab === "intelligence" && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg bg-background/50 border border-border/60 space-y-2">
            <h4 className="font-display text-xs font-bold text-neon flex items-center gap-1.5">
              <Compass size={12} /> EXECUTIVE SUMMARY & OVERVIEW
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {region.intelligence?.overview ?? "Strategic executive overview active."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-danger/5 border border-danger/30 space-y-1.5">
              <h5 className="font-display text-[10px] tracking-widest text-danger flex items-center gap-1">
                <ShieldAlert size={11} /> STRATEGIC VULNERABILITIES
              </h5>
              <ul className="space-y-1">
                {vulnerabilities.map((v, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                    <span className="text-danger font-bold">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-success/5 border border-success/30 space-y-1.5">
              <h5 className="font-display text-[10px] tracking-widest text-success flex items-center gap-1">
                <FileCheck size={11} /> AI RECOMMENDED INTERVENTIONS
              </h5>
              <ul className="space-y-1">
                {recommendations.map((f, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                    <span className="text-success font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
