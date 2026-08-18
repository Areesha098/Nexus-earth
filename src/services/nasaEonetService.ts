/**
 * NASA EONET (Earth Observatory Natural Event Tracker) API Service
 * Connects directly to NASA EONET v3 public API to retrieve authentic, real-time natural events.
 * https://eonet.gsfc.nasa.gov/docs/v3
 */

export interface EonetCategory {
  id: string;
  title: string;
}

export interface EonetSource {
  id: string;
  url: string;
}

export interface EonetGeometry {
  date: string;
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
  latestDate: string;
  latitude: number | null;
  longitude: number | null;
  categoryTitle: string;
  categoryId: string;
  magnitudeFormatted?: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface NasaEonetResponse {
  events: EonetEvent[];
  count: number;
  isLive: boolean;
  statusLabel: string;
  lastUpdated: string;
  source: string;
  error?: string;
}

export const EONET_CATEGORIES = [
  { id: "all", label: "All Natural Events" },
  { id: "wildfires", label: "Wildfires" },
  { id: "severeStorms", label: "Severe Storms & Cyclones" },
  { id: "volcanoes", label: "Volcanoes" },
  { id: "seaLakeIce", label: "Sea & Lake Ice" },
  { id: "floods", label: "Floods & Hydrological" },
  { id: "landslides", label: "Landslides" },
  { id: "tempExtremes", label: "Temperature Extremes" },
] as const;

// In-memory cache
let cachedResponse: NasaEonetResponse | null = null;
let cacheExpiry = 0;
const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export const nasaEonetService = {
  async fetchLiveEvents(categoryId?: string, limit = 30): Promise<NasaEonetResponse> {
    const now = Date.now();
    if (cachedResponse && now < cacheExpiry && (!categoryId || categoryId === "all")) {
      return cachedResponse;
    }

    try {
      let url = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=${limit}`;
      if (categoryId && categoryId !== "all") {
        url += `&category=${categoryId}`;
      }

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`NASA EONET API returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        events?: Array<{
          id: string;
          title: string;
          description: string | null;
          link: string;
          closed: string | null;
          categories: Array<{ id: string; title: string }>;
          sources: Array<{ id: string; url: string }>;
          geometry: Array<{
            magnitudeValue?: number | null;
            magnitudeUnit?: string | null;
            date: string;
            type: string;
            coordinates: [number, number];
          }>;
        }>;
      };

      const rawEvents = data.events || [];
      const parsedEvents: EonetEvent[] = rawEvents.map((e) => {
        const latestGeom = e.geometry && e.geometry.length > 0 ? e.geometry[e.geometry.length - 1] : null;
        const lon = latestGeom && Array.isArray(latestGeom.coordinates) ? latestGeom.coordinates[0] : null;
        const lat = latestGeom && Array.isArray(latestGeom.coordinates) ? latestGeom.coordinates[1] : null;
        const cat = e.categories && e.categories.length > 0 ? e.categories[0] : { id: "general", title: "Natural Event" };
        const src = e.sources && e.sources.length > 0 ? e.sources[0] : null;

        let magnitudeFormatted: string | undefined;
        if (latestGeom?.magnitudeValue !== undefined && latestGeom?.magnitudeValue !== null) {
          magnitudeFormatted = `${latestGeom.magnitudeValue} ${latestGeom.magnitudeUnit || ""}`.trim();
        }

        return {
          id: e.id,
          title: e.title,
          description: e.description,
          link: e.link,
          categories: e.categories || [],
          sources: e.sources || [],
          geometry: e.geometry || [],
          latestDate: latestGeom?.date || new Date().toISOString(),
          latitude: lat,
          longitude: lon,
          categoryId: cat.id,
          categoryTitle: cat.title,
          magnitudeFormatted,
          sourceName: src?.id,
          sourceUrl: src?.url,
        };
      });

      const response: NasaEonetResponse = {
        events: parsedEvents,
        count: parsedEvents.length,
        isLive: true,
        statusLabel: "LIVE NASA EONET FEED",
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        source: "NASA Earth Observatory (EONET v3)",
      };

      if (!categoryId || categoryId === "all") {
        cachedResponse = response;
        cacheExpiry = now + CACHE_DURATION_MS;
      }

      return response;
    } catch (err) {
      console.warn("NASA EONET API fetch error:", err);

      return {
        events: cachedResponse?.events || [],
        count: cachedResponse?.events?.length || 0,
        isLive: false,
        statusLabel: "LIVE DATA TEMPORARILY UNAVAILABLE",
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "NASA Earth Observatory (EONET v3)",
        error: "Live connection to NASA EONET temporarily unavailable. Please retry.",
      };
    }
  },

  getCategoryColor(categoryId: string): string {
    switch (categoryId) {
      case "wildfires":
        return "#ff5a1f";
      case "severeStorms":
        return "#22d3ee";
      case "volcanoes":
        return "#ef4444";
      case "seaLakeIce":
        return "#60a5fa";
      case "floods":
        return "#06b6d4";
      case "landslides":
        return "#f59e0b";
      case "tempExtremes":
        return "#f97316";
      default:
        return "#a855f7";
    }
  },
};
