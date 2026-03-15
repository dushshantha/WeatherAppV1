import { useState, useEffect } from 'react';

export interface CityData {
  city: string;
  country: string;
  temperature: string;
  condition: string;
  high: string;
  low: string;
  icon: string;
}

const STORAGE_KEY = 'saved-cities';
const MAX_CITIES = 10;

export function useSavedCities() {
  const [savedCities, setSavedCities] = useState<CityData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CityData[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCities));
  }, [savedCities]);

  function addCity(city: CityData) {
    setSavedCities((prev) => {
      if (prev.some((c) => c.city === city.city && c.country === city.country)) return prev;
      if (prev.length >= MAX_CITIES) return prev;
      return [...prev, city];
    });
  }

  function removeCity(cityName: string) {
    setSavedCities((prev) => prev.filter((c) => c.city !== cityName));
  }

  function isSaved(cityName: string): boolean {
    return savedCities.some((c) => c.city === cityName);
  }

  return { savedCities, addCity, removeCity, isSaved };
}
