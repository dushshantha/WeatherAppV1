import type {
  CurrentWeatherResponse,
  ForecastResponse,
  NormalizedCurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  WeatherAlert,
  OneCallAlertsResponse,
} from '../types/weather';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

export function hasApiKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim() !== '' && API_KEY !== 'your_key_here');
}

function mpsToKmh(mps: number): number {
  return Math.round(mps * 3.6);
}

function kelvinToCelsius(k: number): number {
  return Math.round(k - 273.15);
}

function formatHourLabel(dt: number): string {
  const date = new Date(dt * 1000);
  const h = date.getHours();
  if (h === 0) return '12AM';
  if (h < 12) return `${h}AM`;
  if (h === 12) return '12PM';
  return `${h - 12}PM`;
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function formatDayLabel(dt: number): string {
  return DAY_LABELS[new Date(dt * 1000).getDay()];
}

export async function fetchCurrentWeather(city: string): Promise<CurrentWeatherResponse> {
  if (!hasApiKey()) {
    throw new Error('NO_API_KEY');
  }
  const res = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<CurrentWeatherResponse>;
}

export async function fetchForecastHourly(city: string): Promise<ForecastResponse> {
  if (!hasApiKey()) {
    throw new Error('NO_API_KEY');
  }
  // /forecast returns 3-hour intervals for 5 days — take first 8 items for hourly
  const res = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<ForecastResponse>;
}

export async function fetchForecastWeekly(city: string): Promise<ForecastResponse> {
  // Same endpoint as hourly — callers choose how to group results
  return fetchForecastHourly(city);
}

export async function fetchWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  if (!hasApiKey()) return [];
  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&exclude=current,minutely,hourly,daily`
  );
  if (!res.ok) return [];
  const data = (await res.json()) as OneCallAlertsResponse;
  return data.alerts ?? [];
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  if (!hasApiKey()) throw new Error('NO_API_KEY');
  const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = (await res.json()) as CurrentWeatherResponse;
  return data.name;
}

// ── Normalizers ──────────────────────────────────────────────────────────────

export function normalizeCurrentWeather(raw: CurrentWeatherResponse): NormalizedCurrentWeather {
  return {
    city: raw.name,
    country: raw.sys.country,
    tempC: kelvinToCelsius(raw.main.temp),
    feelsLikeC: kelvinToCelsius(raw.main.feels_like),
    tempMinC: kelvinToCelsius(raw.main.temp_min),
    tempMaxC: kelvinToCelsius(raw.main.temp_max),
    condition: raw.weather[0]?.description ?? '',
    conditionId: raw.weather[0]?.id ?? 800,
    iconCode: raw.weather[0]?.icon ?? '01d',
    humidity: raw.main.humidity,
    windSpeedKmh: mpsToKmh(raw.wind.speed),
    windDeg: raw.wind.deg,
    pressureHpa: raw.main.pressure,
    visibilityKm: Math.round(raw.visibility / 1000),
    uvIndex: 0,
    sunrise: raw.sys.sunrise,
    sunset: raw.sys.sunset,
    rainMm: raw.rain?.['1h'] ?? raw.rain?.['3h'] ?? 0,
  };
}

export function normalizeHourlyForecast(raw: ForecastResponse): HourlyForecastItem[] {
  return raw.list.slice(0, 8).map((item) => ({
    label: formatHourLabel(item.dt),
    tempC: kelvinToCelsius(item.main.temp),
    precipPercent: Math.round(item.pop * 100),
    conditionId: item.weather[0]?.id ?? 800,
    iconCode: item.weather[0]?.icon ?? '01d',
  }));
}

export function normalizeDailyForecast(raw: ForecastResponse): DailyForecastItem[] {
  // Group by day (take the noon-ish entry for each day)
  const byDay = new Map<string, typeof raw.list[0]>();
  for (const item of raw.list) {
    const date = new Date(item.dt * 1000);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!byDay.has(key)) {
      byDay.set(key, item);
    } else {
      // Prefer the entry closest to noon
      const existing = byDay.get(key)!;
      const existingHour = new Date(existing.dt * 1000).getHours();
      const currentHour = date.getHours();
      if (Math.abs(currentHour - 12) < Math.abs(existingHour - 12)) {
        byDay.set(key, item);
      }
    }
  }

  return Array.from(byDay.values())
    .slice(0, 7)
    .map((item) => ({
      label: formatDayLabel(item.dt),
      tempC: kelvinToCelsius(item.main.temp),
      tempMinC: kelvinToCelsius(item.main.temp_min),
      tempMaxC: kelvinToCelsius(item.main.temp_max),
      precipPercent: Math.round(item.pop * 100),
      conditionId: item.weather[0]?.id ?? 800,
      iconCode: item.weather[0]?.icon ?? '01d',
    }));
}
