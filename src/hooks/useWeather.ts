import { useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentWeather,
  fetchForecastHourly,
  hasApiKey,
  normalizeCurrentWeather,
  normalizeHourlyForecast,
  normalizeDailyForecast,
} from '../services/weatherApi';
import type {
  NormalizedCurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
} from '../types/weather';

export interface WeatherData {
  current: NormalizedCurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  usingMockData: boolean;
  refetch: () => void;
}

// ── Mock fallback data (used when API key is absent) ─────────────────────────

const MOCK_DATA: WeatherData = {
  current: {
    city: 'Montreal',
    country: 'CA',
    tempC: 19,
    feelsLikeC: 17,
    tempMinC: 18,
    tempMaxC: 24,
    condition: 'Partly Cloudy',
    conditionId: 802,
    iconCode: '02n',
    humidity: 63,
    windSpeedKmh: 12,
    windDeg: 22,
    pressureHpa: 1013,
    visibilityKm: 10,
    uvIndex: 4,
    sunrise: 0,
    sunset: 0,
    rainMm: 0,
  },
  hourly: [
    { label: '12AM', tempC: 19, precipPercent: 20, conditionId: 802, iconCode: '02n' },
    { label: '1AM',  tempC: 18, precipPercent: 15, conditionId: 802, iconCode: '02n' },
    { label: '2AM',  tempC: 17, precipPercent: 25, conditionId: 500, iconCode: '10n' },
    { label: '3AM',  tempC: 16, precipPercent: 35, conditionId: 501, iconCode: '09n' },
    { label: '4AM',  tempC: 16, precipPercent: 30, conditionId: 501, iconCode: '09n' },
    { label: '5AM',  tempC: 15, precipPercent: 15, conditionId: 741, iconCode: '50n' },
    { label: '6AM',  tempC: 16, precipPercent: 5,  conditionId: 801, iconCode: '02d' },
    { label: '7AM',  tempC: 17, precipPercent: 0,  conditionId: 801, iconCode: '02d' },
  ],
  daily: [
    { label: 'MON', tempC: 19, tempMinC: 15, tempMaxC: 22, precipPercent: 20, conditionId: 500, iconCode: '10d' },
    { label: 'TUE', tempC: 21, tempMinC: 17, tempMaxC: 24, precipPercent: 10, conditionId: 802, iconCode: '02n' },
    { label: 'WED', tempC: 23, tempMinC: 18, tempMaxC: 26, precipPercent: 5,  conditionId: 801, iconCode: '02d' },
    { label: 'THU', tempC: 18, tempMinC: 14, tempMaxC: 21, precipPercent: 45, conditionId: 501, iconCode: '09d' },
    { label: 'FRI', tempC: 16, tempMinC: 12, tempMaxC: 19, precipPercent: 60, conditionId: 501, iconCode: '09d' },
    { label: 'SAT', tempC: 20, tempMinC: 16, tempMaxC: 23, precipPercent: 15, conditionId: 741, iconCode: '50d' },
    { label: 'SUN', tempC: 22, tempMinC: 17, tempMaxC: 25, precipPercent: 0,  conditionId: 800, iconCode: '01d' },
  ],
};

export function useWeather(city: string): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!hasApiKey()) {
      // Graceful fallback to mock data
      setData(MOCK_DATA);
      setUsingMockData(true);
      setLoading(false);
      return;
    }

    try {
      const [currentRaw, forecastRaw] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecastHourly(city),
      ]);

      setData({
        current: normalizeCurrentWeather(currentRaw),
        hourly: normalizeHourlyForecast(forecastRaw),
        daily: normalizeDailyForecast(forecastRaw),
      });
      setUsingMockData(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      // Fall back to mock data on error too
      setData(MOCK_DATA);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, usingMockData, refetch: fetchData };
}
