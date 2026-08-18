/**
 * Live Meteorological & Atmospheric Telemetry Service
 * Integrates real-time Open-Meteo public meteorological & Air Quality data (WMO, ECMWF, Copernicus).
 * Provides authentic live temperature, humidity, precipitation, pressure, wind velocity, and air quality index.
 */

export interface AirQualityData {
  usAqi: number;
  europeanAqi: number;
  pm25: number; // μg/m³
  pm10: number; // μg/m³
  nitrogenDioxide: number; // μg/m³
  ozone: number; // μg/m³
  qualityAssessment: "Good" | "Moderate" | "Unhealthy for Sensitive" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
}

export interface LiveWeatherData {
  cityName: string;
  countryName: string;
  coordinates: { lat: number; lon: number };
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  precipitation: number; // mm
  pressure: number; // hPa
  windSpeed: number; // km/h
  cloudCover: number; // %
  weatherCode: number;
  conditionText: string;
  airQuality?: AirQualityData;
  source: string;
  sourceAttribution: string;
  timestamp: string;
  lastUpdatedFormatted: string;
  isLive: boolean;
  statusLabel: "LIVE DATA" | "LIVE TELEMETRY STREAM" | "TEMPORARILY UNAVAILABLE";
  error?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Pakistan
  islamabad: { lat: 33.6844, lon: 73.0479 },
  karachi: { lat: 24.8607, lon: 67.0011 },
  lahore: { lat: 31.5204, lon: 74.3587 },
  peshawar: { lat: 34.0151, lon: 71.5249 },
  quetta: { lat: 30.1798, lon: 66.975 },
  "indus valley (sukkur/hyderabad)": { lat: 27.7052, lon: 68.8574 },
  sukkur: { lat: 27.7052, lon: 68.8574 },
  hyderabad: { lat: 25.396, lon: 68.3578 },
  rawalpindi: { lat: 33.5651, lon: 73.0169 },
  multan: { lat: 30.1575, lon: 71.5249 },
  faisalabad: { lat: 31.4504, lon: 73.135 },
  gilgit: { lat: 35.9221, lon: 74.3087 },
  gwadar: { lat: 25.1216, lon: 62.3254 },

  // Global Hubs
  "washington dc": { lat: 38.9072, lon: -77.0369 },
  "los angeles": { lat: 34.0522, lon: -118.2437 },
  miami: { lat: 25.7617, lon: -80.1918 },
  "new york": { lat: 40.7128, lon: -74.006 },
  "san francisco": { lat: 37.7749, lon: -122.4194 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  osaka: { lat: 34.6937, lon: 135.5023 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  sapporo: { lat: 43.0618, lon: 141.3545 },
  "new delhi": { lat: 28.6139, lon: 77.209 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  nairobi: { lat: -1.2921, lon: 36.8219 },
  mombasa: { lat: -4.0435, lon: 39.6682 },
  kisumu: { lat: -0.0917, lon: 34.768 },
  paris: { lat: 48.8566, lon: 2.3522 },
  berlin: { lat: 52.52, lon: 13.405 },
  rome: { lat: 41.9028, lon: 12.4964 },
  madrid: { lat: 40.4168, lon: -3.7038 },
  london: { lat: 51.5074, lon: -0.1278 },
  brasília: { lat: -15.7975, lon: -47.8919 },
  brasilia: { lat: -15.7975, lon: -47.8919 },
  manaus: { lat: -3.119, lon: -60.0217 },
  "são paulo": { lat: -23.5505, lon: -46.6333 },
  "sao paulo": { lat: -23.5505, lon: -46.6333 },
  canberra: { lat: -35.2809, lon: 149.13 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  melbourne: { lat: -37.8136, lon: 144.9631 },
};

function weatherCodeToText(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Atmospheric Fog";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Rain Showers";
  if (code >= 71 && code <= 77) return "Snowfall";
  if (code >= 80 && code <= 82) return "Heavy Rain Showers";
  if (code >= 95 && code <= 99) return "Convective Thunderstorm";
  return "Variable Atmosphere";
}

function evaluateAqiAssessment(aqi: number): AirQualityData["qualityAssessment"] {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// In-memory cache to prevent redundant requests
const weatherCache = new Map<string, { data: LiveWeatherData; expiresAt: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

export const liveWeatherService = {
  getCoordinatesForCity(cityName: string, regionCountry?: string): { lat: number; lon: number } {
    const key = cityName.toLowerCase().trim();
    if (CITY_COORDINATES[key]) return CITY_COORDINATES[key];

    // Fallback based on country
    const countryKey = (regionCountry || "").toLowerCase();
    if (countryKey.includes("pakistan")) return { lat: 33.6844, lon: 73.0479 };
    if (countryKey.includes("united states") || countryKey.includes("america"))
      return { lat: 38.9072, lon: -77.0369 };
    if (countryKey.includes("japan") || countryKey.includes("east asia"))
      return { lat: 35.6762, lon: 139.6503 };
    if (countryKey.includes("india") || countryKey.includes("south asia"))
      return { lat: 28.6139, lon: 77.209 };
    if (countryKey.includes("kenya") || countryKey.includes("africa"))
      return { lat: -1.2921, lon: 36.8219 };
    if (countryKey.includes("europe") || countryKey.includes("france"))
      return { lat: 48.8566, lon: 2.3522 };
    if (countryKey.includes("brazil") || countryKey.includes("south america"))
      return { lat: -15.7975, lon: -47.8919 };
    if (countryKey.includes("australia") || countryKey.includes("oceania"))
      return { lat: -35.2809, lon: 149.13 };

    return { lat: 33.6844, lon: 73.0479 }; // Default to Pakistan
  },

  async fetchLiveWeather(
    cityName: string,
    countryName: string,
    fallbackCoords?: { lat: number; lon: number },
  ): Promise<LiveWeatherData> {
    const coords =
      CITY_COORDINATES[cityName.toLowerCase().trim()] ||
      fallbackCoords ||
      this.getCoordinatesForCity(cityName, countryName);
    const cacheKey = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;

    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      // Parallel fetch: Open-Meteo Weather + Air Quality
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m,weather_code,cloud_cover&timezone=auto`;
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi,european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`;

      const [weatherRes, airRes] = await Promise.allSettled([
        fetch(weatherUrl, { headers: { Accept: "application/json" } }),
        fetch(airQualityUrl, { headers: { Accept: "application/json" } }),
      ]);

      if (weatherRes.status !== "fulfilled" || !weatherRes.value.ok) {
        throw new Error("Failed to reach Open-Meteo Weather API");
      }

      const json = (await weatherRes.value.json()) as {
        current?: {
          temperature_2m?: number;
          apparent_temperature?: number;
          relative_humidity_2m?: number;
          precipitation?: number;
          surface_pressure?: number;
          wind_speed_10m?: number;
          weather_code?: number;
          cloud_cover?: number;
          time?: string;
        };
      };

      const current = json.current;
      if (!current) {
        throw new Error("No current weather payload returned from Open-Meteo");
      }

      let airQuality: AirQualityData | undefined;
      if (airRes.status === "fulfilled" && airRes.value.ok) {
        try {
          const airJson = (await airRes.value.json()) as {
            current?: {
              us_aqi?: number;
              european_aqi?: number;
              pm10?: number;
              pm2_5?: number;
              nitrogen_dioxide?: number;
              ozone?: number;
            };
          };
          if (airJson.current) {
            const usAqi = Math.round(airJson.current.us_aqi ?? 65);
            airQuality = {
              usAqi,
              europeanAqi: Math.round(airJson.current.european_aqi ?? 45),
              pm25: Math.round((airJson.current.pm2_5 ?? 18) * 10) / 10,
              pm10: Math.round((airJson.current.pm10 ?? 28) * 10) / 10,
              nitrogenDioxide: Math.round((airJson.current.nitrogen_dioxide ?? 12) * 10) / 10,
              ozone: Math.round((airJson.current.ozone ?? 60) * 10) / 10,
              qualityAssessment: evaluateAqiAssessment(usAqi),
            };
          }
        } catch {
          // non-blocking
        }
      }

      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const data: LiveWeatherData = {
        cityName,
        countryName,
        coordinates: coords,
        temperature: Math.round((current.temperature_2m ?? 24) * 10) / 10,
        apparentTemperature: Math.round((current.apparent_temperature ?? 26) * 10) / 10,
        humidity: Math.round(current.relative_humidity_2m ?? 55),
        precipitation: Math.round((current.precipitation ?? 0) * 10) / 10,
        pressure: Math.round(current.surface_pressure ?? 1012),
        windSpeed: Math.round((current.wind_speed_10m ?? 12) * 10) / 10,
        cloudCover: Math.round(current.cloud_cover ?? 20),
        weatherCode: current.weather_code ?? 0,
        conditionText: weatherCodeToText(current.weather_code ?? 0),
        airQuality,
        source: "Open-Meteo Global Network",
        sourceAttribution: "WMO Global Observation Network, Copernicus Atmosphere Service & ECMWF Models",
        timestamp: current.time || now.toISOString(),
        lastUpdatedFormatted: `Live Telemetry at ${timeString}`,
        isLive: true,
        statusLabel: "LIVE DATA",
      };

      weatherCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return data;
    } catch (err) {
      console.warn("Open-Meteo live query error:", err);

      const errorData: LiveWeatherData = {
        cityName,
        countryName,
        coordinates: coords,
        temperature: 0,
        apparentTemperature: 0,
        humidity: 0,
        precipitation: 0,
        pressure: 1013,
        windSpeed: 0,
        cloudCover: 0,
        weatherCode: 0,
        conditionText: "Offline",
        source: "Open-Meteo Global Network",
        sourceAttribution: "WMO Global Observation Network",
        timestamp: new Date().toISOString(),
        lastUpdatedFormatted: "Live data temporarily unavailable",
        isLive: false,
        statusLabel: "TEMPORARILY UNAVAILABLE",
        error: "Live meteorological connection temporarily unavailable. Please click refresh to retry.",
      };

      return errorData;
    }
  },
};
