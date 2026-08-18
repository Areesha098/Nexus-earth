import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Flame,
  Wind,
  Snowflake,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  Search,
  Activity,
} from "lucide-react";
import {
  nasaEonetService,
  EONET_CATEGORIES,
  type EonetEvent,
  type NasaEonetResponse,
} from "@/services/nasaEonetService";
import { audioService } from "@/services/audioService";

export function NasaLiveEventsPanel({
  onSelectCoordinates,
}: {
  onSelectCoordinates?: (coords: { lat: number; lon: number }) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [response, setResponse] = useState<NasaEonetResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const loadEvents = useCallback(async (cat?: string) => {
    setLoading(true);
    try {
      const data = await nasaEonetService.fetchLiveEvents(cat ?? selectedCategory, 30);
      setResponse(data);
    } catch {
      // handled inside service
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleCategoryChange = (catId: string) => {
    audioService.playClick();
    setSelectedCategory(catId);
    void loadEvents(catId);
  };

  const filteredEvents = (response?.events || []).filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.categoryTitle.toLowerCase().includes(q) ||
      (e.sourceName && e.sourceName.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "wildfires":
        return <Flame size={12} className="text-orange-400" />;
      case "severeStorms":
        return <Wind size={12} className="text-cyan-400" />;
      case "volcanoes":
        return <AlertTriangle size={12} className="text-red-500" />;
      case "seaLakeIce":
        return <Snowflake size={12} className="text-blue-300" />;
      default:
        return <Activity size={12} className="text-neon" />;
    }
  };

  return (
    <div className="holo-panel rounded-xl p-4 md:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon" />
          </div>
          <Globe size={18} className="text-neon" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm md:text-base font-bold text-foreground">
                NASA EONET LIVE NATURAL EVENTS TRACKER
              </h3>
              <span className="rounded-full bg-neon/15 border border-neon/30 px-2 py-0.5 text-[9px] font-display font-bold tracking-widest text-neon">
                {response?.statusLabel ?? "LIVE NASA FEED"}
              </span>
            </div>
            <p className="text-[10px] font-display tracking-widest text-muted-foreground">
              GLOBAL OBSERVATION NETWORK · ACTIVE WILDFIRES, STORMS & SEVERE ANOMALIES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audioService.playClick();
              void loadEvents();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 px-3 py-1.5 font-display text-[10px] tracking-widest text-foreground transition-colors"
            title="Refresh NASA Live Telemetry"
          >
            <RefreshCw size={11} className={loading ? "animate-spin text-neon" : ""} />
            REFRESH FEED
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {EONET_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md font-display text-[9px] tracking-wider transition-all ${
                  active
                    ? "bg-neon/20 text-neon border border-neon/50 font-bold shadow-sm"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search live events…"
            className="w-full rounded-md bg-muted/40 border border-border/60 pl-7 pr-2 py-1 text-xs outline-none focus:border-neon text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Error state if unavailable */}
      {response?.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/40 p-3 flex items-center justify-between">
          <span className="text-xs text-danger flex items-center gap-2">
            <AlertTriangle size={14} /> {response.error}
          </span>
          <button
            onClick={() => void loadEvents()}
            className="rounded bg-danger/20 hover:bg-danger/30 text-danger text-[10px] font-display px-2.5 py-1"
          >
            Retry
          </button>
        </div>
      )}

      {/* Live Event Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredEvents.map((event) => {
          const isSelected = selectedEventId === event.id;
          const catColor = nasaEonetService.getCategoryColor(event.categoryId);
          const hasCoords = event.latitude !== null && event.longitude !== null;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-3 transition-all border text-left cursor-pointer ${
                isSelected
                  ? "bg-muted/40 border-neon shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  : "bg-background/60 border-border/50 hover:border-neon/40 hover:bg-muted/20"
              }`}
              onClick={() => {
                setSelectedEventId(isSelected ? null : event.id);
                if (hasCoords && onSelectCoordinates && event.latitude && event.longitude) {
                  onSelectCoordinates({ lat: event.latitude, lon: event.longitude });
                }
              }}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-display tracking-widest font-bold"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${catColor} 18%, transparent)`,
                    color: catColor,
                    border: `1px solid color-mix(in oklab, ${catColor} 40%, transparent)`,
                  }}
                >
                  {getCategoryIcon(event.categoryId)}
                  {event.categoryTitle.toUpperCase()}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground">
                  {event.id}
                </span>
              </div>

              <h4 className="font-display text-xs font-bold text-foreground leading-snug line-clamp-2">
                {event.title}
              </h4>

              {event.magnitudeFormatted && (
                <div className="mt-1 text-[9px] font-mono text-warning">
                  MAGNITUDE: {event.magnitudeFormatted}
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between text-[8.5px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(event.latestDate).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>

                {hasCoords ? (
                  <span className="flex items-center gap-0.5 text-neon">
                    <MapPin size={9} />
                    {event.latitude?.toFixed(1)}°, {event.longitude?.toFixed(1)}°
                  </span>
                ) : (
                  <span>Global Event</span>
                )}
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 pt-2 border-t border-border/40 text-[9.5px] space-y-1.5 text-muted-foreground"
                  >
                    {event.description && <p>{event.description}</p>}
                    <div className="flex items-center justify-between pt-1">
                      <span>DATA SOURCE: {event.sourceName || "NASA EONET"}</span>
                      {event.sourceUrl && (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neon hover:underline inline-flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Official Bulletin <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredEvents.length === 0 && !loading && (
          <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
            No live events match the current filter or category.
          </div>
        )}
      </div>

      {/* Footnote attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[8.5px] font-mono text-muted-foreground/80 pt-1 border-t border-border/30 gap-1">
        <span>
          OFFICIAL DATA SOURCE: NASA Earth Observatory Natural Event Tracker (EONET v3) · GSFC
        </span>
        <span>
          SYNCHRONIZATION: {response?.lastUpdated ? `Live at ${response.lastUpdated}` : "Real-time Telemetry"}
        </span>
      </div>
    </div>
  );
}
