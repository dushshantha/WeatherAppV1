import { useState } from 'react';
import WeatherCityCard from '../components/WeatherCityCard';
import { weatherIcons } from '../components/weatherIcons';
import {
  fetchCurrentWeather,
  hasApiKey,
  normalizeCurrentWeather,
} from '../services/weatherApi';

interface CityData {
  city: string;
  country: string;
  temperature: string;
  condition: string;
  high: string;
  low: string;
  icon: string;
}

const ALL_CITIES: CityData[] = [
  {
    city: 'Montreal',
    country: 'Canada',
    temperature: '19°',
    condition: 'Mid Rain',
    high: '24°',
    low: '18°',
    icon: weatherIcons.moonCloudMidRain,
  },
  {
    city: 'Toronto',
    country: 'Canada',
    temperature: '20°',
    condition: 'Fast Wind',
    high: '22°',
    low: '15°',
    icon: weatherIcons.moonCloudFastWind,
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    temperature: '13°',
    condition: 'Showers',
    high: '15°',
    low: '10°',
    icon: weatherIcons.showers,
  },
  {
    city: 'Tennessee',
    country: 'United States',
    temperature: '23°',
    condition: 'Tornado',
    high: '28°',
    low: '19°',
    icon: weatherIcons.tornado,
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    temperature: '31°',
    condition: 'Partly Cloudy',
    high: '33°',
    low: '27°',
    icon: weatherIcons.partlyCloudy,
  },
  {
    city: 'Taipei',
    country: 'Taiwan',
    temperature: '23°',
    condition: 'Tornado',
    high: '26°',
    low: '20°',
    icon: weatherIcons.tornado,
  },
];

// Simple inline SVG placeholder icon for live search results
const mkSvg = (inner: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">${inner}</svg>`
  )}`;

const PLACEHOLDER_ICON = mkSvg(
  '<circle cx="80" cy="60" r="30" fill="#FFD060" opacity=".9"/>' +
  '<ellipse cx="80" cy="105" rx="50" ry="28" fill="white" opacity=".75"/>'
);

interface WeatherSearchScreenProps {
  onBack?: () => void;
  onCitySelect?: (city: CityData) => void;
}

export default function WeatherSearchScreen({
  onBack,
  onCitySelect,
}: WeatherSearchScreenProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<CityData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (hasApiKey()) {
      setSearching(true);
      setSearchResult(null);
      setSearchError(null);
      try {
        const raw = await fetchCurrentWeather(trimmed);
        const norm = normalizeCurrentWeather(raw);
        setSearchResult({
          city: norm.city,
          country: norm.country,
          temperature: `${norm.tempC}°`,
          condition: norm.condition.charAt(0).toUpperCase() + norm.condition.slice(1),
          high: `${norm.tempMaxC}°`,
          low: `${norm.tempMinC}°`,
          icon: PLACEHOLDER_ICON,
        });
      } catch {
        setSearchError(`City not found: "${trimmed}"`);
      } finally {
        setSearching(false);
      }
    }
    // When no API key: filtering ALL_CITIES is sufficient (handled in render below)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleClear() {
    setQuery('');
    setSearchResult(null);
    setSearchError(null);
  }

  const showLiveResult = searchResult !== null;
  const filteredCities = !showLiveResult && query.trim()
    ? ALL_CITIES.filter((c) =>
        c.city.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_CITIES;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #2E335A 0%, #1C1B33 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Purple ellipse decorations */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -120,
          left: -100,
          width: 356,
          height: 356,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(72,49,157,0.55) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(72,49,157,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Navigation bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(46, 51, 90, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 16px 8px',
        }}
      >
        {/* Top row: back button + ellipsis */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          {/* Back button */}
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: 'rgba(235, 235, 245, 0.9)',
              fontSize: 17,
              fontWeight: 400,
              cursor: 'pointer',
              padding: '4px 0',
              letterSpacing: '-0.2px',
            }}
            aria-label="Go back to Weather"
          >
            <span style={{ fontSize: 20, lineHeight: 1, marginTop: -1 }}>‹</span>
            <span>Weather</span>
          </button>

          {/* Ellipsis menu */}
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(235, 235, 245, 0.9)',
              fontSize: 22,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
              letterSpacing: 2,
              lineHeight: 1,
            }}
            aria-label="More options"
          >
            ···
          </button>
        </div>

        {/* Search field */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '8px 12px',
          }}
        >
          {/* Magnifying glass — click to search */}
          <button
            onClick={handleSearch}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              flexShrink: 0, opacity: 0.6,
            }}
            aria-label="Search"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="5" stroke="rgba(235,235,245,0.9)" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14.5" y2="14.5"
                stroke="rgba(235,235,245,0.9)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchResult || searchError) { setSearchResult(null); setSearchError(null); }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city or airport"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 400,
            }}
          />

          {query.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                background: 'rgba(235, 235, 245, 0.3)',
                border: 'none',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1C1B33',
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scrollable city list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {searching && (
          <p style={{ marginTop: 24, color: 'rgba(235,235,245,0.6)', fontSize: 15 }}>
            Searching…
          </p>
        )}

        {!searching && showLiveResult && searchResult && (
          <WeatherCityCard
            city={searchResult.city}
            country={searchResult.country}
            temperature={searchResult.temperature}
            condition={searchResult.condition}
            high={searchResult.high}
            low={searchResult.low}
            icon={searchResult.icon}
            onClick={() => onCitySelect?.(searchResult)}
          />
        )}

        {!searching && searchError && (
          <p style={{ marginTop: 48, color: 'rgba(235,235,245,0.4)', fontSize: 15, textAlign: 'center' }}>
            {searchError}
          </p>
        )}

        {!searching && !showLiveResult && !searchError && (
          filteredCities.length === 0 ? (
            <p style={{
              marginTop: 48,
              color: 'rgba(235, 235, 245, 0.4)',
              fontSize: 15,
              textAlign: 'center',
            }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            filteredCities.map((cityData) => (
              <WeatherCityCard
                key={cityData.city}
                city={cityData.city}
                country={cityData.country}
                temperature={cityData.temperature}
                condition={cityData.condition}
                high={cityData.high}
                low={cityData.low}
                icon={cityData.icon}
                onClick={() => onCitySelect?.(cityData)}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}
