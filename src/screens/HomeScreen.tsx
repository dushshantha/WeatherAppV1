import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ForecastCard from '../components/ForecastCard';
import WeatherStatWidget from '../components/WeatherStatWidget';
import type { WeatherStatType } from '../components/WeatherStatWidget';
import WeatherIcon from '../components/WeatherIcon';
import type { WeatherCondition } from '../components/WeatherIcon';
import AlertBanner from '../components/AlertBanner';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../hooks/useWeather';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNotifications } from '../hooks/useNotifications';
import { fetchWeatherAlerts, reverseGeocode } from '../services/weatherApi';
import type { WeatherAlert } from '../types/weather';

type ForecastTab = 'hourly' | 'weekly';
type TempUnit = 'C' | 'F';

const tabSlideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: 'easeOut' as const } },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const } }),
};

function toDisplayTemp(tempC: number, unit: TempUnit): string {
  if (unit === 'F') return `${Math.round(tempC * 9 / 5 + 32)}°`;
  return `${tempC}°`;
}

function formatTime(unixTs: number): string {
  if (!unixTs) return '—';
  return new Date(unixTs * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function windDegToCompass(deg: number): string {
  const dirs = ['N', 'N/NE', 'NE', 'E/NE', 'E', 'E/SE', 'SE', 'S/SE', 'S', 'S/SW', 'SW', 'W/SW', 'W', 'W/NW', 'NW', 'N/NW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function conditionIdToWeatherCondition(id: number): WeatherCondition {
  if (id >= 200 && id < 600) return 'rain';
  if (id >= 700 && id < 800) return 'wind';
  if (id === 800) return 'sun';
  return 'default';
}

const mkSvg = (inner: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${inner}</svg>`)}`;

const ICONS = {
  moonCloud: mkSvg('<path d="M16 8a9 9 0 0 0 0 16 9 9 0 0 1 0-16z" fill="white" opacity=".85"/><ellipse cx="27" cy="20" rx="10" ry="7" fill="white" opacity=".75"/>'),
  sunCloud: mkSvg('<circle cx="12" cy="11" r="5" fill="#FFD060" opacity=".95"/><line x1="12" y1="4" x2="12" y2="6" stroke="#FFD060" stroke-width="1.5" stroke-linecap="round"/><line x1="17" y1="6" x2="16" y2="7.5" stroke="#FFD060" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="26" cy="22" rx="11" ry="7" fill="white" opacity=".85"/>'),
  cloudRain: mkSvg('<ellipse cx="20" cy="14" rx="13" ry="8" fill="white" opacity=".8"/><path d="M13 25l-2 8M19 25l-2 8M25 25l-2 8M31 25l-2 8" stroke="#40CBD8" stroke-width="2" stroke-linecap="round"/>'),
  rain: mkSvg('<ellipse cx="20" cy="12" rx="13" ry="7" fill="white" opacity=".75"/><path d="M10 26l-4 12M17 24l-4 14M24 24l-4 14M31 26l-4 12" stroke="#40CBD8" stroke-width="2.5" stroke-linecap="round"/>'),
  wind: mkSvg('<ellipse cx="20" cy="15" rx="14" ry="7" fill="white" opacity=".8"/><path d="M5 25h22M5 31h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>'),
  sun: mkSvg('<circle cx="20" cy="20" r="8" fill="#FFD060" opacity=".95"/><line x1="20" y1="4" x2="20" y2="8" stroke="#FFD060" stroke-width="2" stroke-linecap="round"/><line x1="20" y1="32" x2="20" y2="36" stroke="#FFD060" stroke-width="2" stroke-linecap="round"/>'),
};

function conditionIdToIcon(id: number, iconCode: string): string {
  const isNight = iconCode.endsWith('n');
  if (id >= 200 && id < 300) return ICONS.rain;
  if (id >= 300 && id < 400) return ICONS.cloudRain;
  if (id >= 500 && id < 600) return id >= 502 ? ICONS.rain : ICONS.cloudRain;
  if (id >= 600 && id < 700) return ICONS.cloudRain;
  if (id >= 700 && id < 800) return ICONS.wind;
  if (id === 800) return ICONS.sun;
  return isNight ? ICONS.moonCloud : ICONS.sunCloud;
}

const hourlyData: Array<{ label: string; temp: string; precip?: number; icon: string; condition: WeatherCondition }> = [
  { label: '12AM', temp: '19°', precip: 20, icon: ICONS.moonCloud,  condition: 'default' },
  { label: '1AM',  temp: '18°', precip: 15, icon: ICONS.moonCloud,  condition: 'default' },
  { label: '2AM',  temp: '17°', precip: 25, icon: ICONS.cloudRain,  condition: 'rain'    },
  { label: '3AM',  temp: '16°', precip: 35, icon: ICONS.rain,       condition: 'rain'    },
  { label: '4AM',  temp: '16°', precip: 30, icon: ICONS.rain,       condition: 'rain'    },
  { label: '5AM',  temp: '15°', precip: 15, icon: ICONS.wind,       condition: 'wind'    },
  { label: '6AM',  temp: '16°', precip: 5,  icon: ICONS.sunCloud,   condition: 'sun'     },
  { label: '7AM',  temp: '17°',             icon: ICONS.sunCloud,   condition: 'sun'     },
];

const weeklyData: Array<{ label: string; temp: string; precip?: number; icon: string; condition: WeatherCondition }> = [
  { label: 'MON', temp: '19°', precip: 20, icon: ICONS.cloudRain, condition: 'rain'    },
  { label: 'TUE', temp: '21°', precip: 10, icon: ICONS.moonCloud, condition: 'default' },
  { label: 'WED', temp: '23°', precip: 5,  icon: ICONS.sunCloud,  condition: 'sun'     },
  { label: 'THU', temp: '18°', precip: 45, icon: ICONS.rain,      condition: 'rain'    },
  { label: 'FRI', temp: '16°', precip: 60, icon: ICONS.rain,      condition: 'rain'    },
  { label: 'SAT', temp: '20%', precip: 15, icon: ICONS.wind,      condition: 'wind'    },
  { label: 'SUN', temp: '22°',             icon: ICONS.sunCloud,  condition: 'sun'     },
];

const STARS = [
  { top: 4, left: 12, size: 1.5, opacity: 0.7 }, { top: 7, left: 55, size: 1.0, opacity: 0.5 },
  { top: 3, left: 80, size: 2.0, opacity: 0.8 }, { top: 12, left: 25, size: 1.0, opacity: 0.6 },
  { top: 9, left: 65, size: 1.5, opacity: 0.7 }, { top: 15, left: 45, size: 1.0, opacity: 0.5 },
  { top: 5, left: 38, size: 2.0, opacity: 0.9 }, { top: 18, left: 88, size: 1.5, opacity: 0.6 },
  { top: 20, left: 10, size: 1.0, opacity: 0.4 }, { top: 6, left: 92, size: 1.0, opacity: 0.7 },
  { top: 25, left: 30, size: 1.5, opacity: 0.5 }, { top: 14, left: 75, size: 1.0, opacity: 0.8 },
  { top: 22, left: 60, size: 2.0, opacity: 0.6 }, { top: 8, left: 5, size: 1.0, opacity: 0.5 },
  { top: 30, left: 85, size: 1.5, opacity: 0.7 }, { top: 2, left: 48, size: 1.0, opacity: 0.6 },
  { top: 16, left: 95, size: 1.5, opacity: 0.5 }, { top: 28, left: 18, size: 1.0, opacity: 0.7 },
];

const HOMEPAGE_BG = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=430&fit=crop&q=80';

function HouseIllustration() {
  return (
    <svg width="280" height="140" viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="140" cy="132" rx="100" ry="7" fill="rgba(0,0,0,0.25)" />
      <rect x="60" y="60" width="160" height="72" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <path d="M44 61 L140 15 L236 61Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinejoin="round" />
      <rect x="183" y="30" width="16" height="30" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <rect x="72" y="72" width="42" height="30" rx="3" fill="rgba(255,230,100,0.10)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <line x1="93" y1="72" x2="93" y2="102" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <line x1="72" y1="87" x2="114" y2="87" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <rect x="166" y="72" width="42" height="30" rx="3" fill="rgba(255,230,100,0.10)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <line x1="187" y1="72" x2="187" y2="102" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <line x1="166" y1="87" x2="208" y2="87" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <rect x="114" y="92" width="52" height="40" rx="3" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <circle cx="154" cy="114" r="2.5" fill="rgba(255,255,255,0.28)" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 2L3 5v17l6-3 6 3 6-3V2l-6 3-6-3z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 2v17M15 5v17" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SkeletonBar({ width, height, borderRadius = 6 }: { width: number | string; height: number; borderRadius?: number }) {
  return <div style={{ width, height, borderRadius, background: 'rgba(255,255,255,0.12)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />;
}

interface HomeScreenProps {
  city?: string;
  onCityChange?: (city: string) => void;
  onNavigateToSearch?: () => void;
}

export default function HomeScreen({ city = 'Montreal', onCityChange, onNavigateToSearch }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<ForecastTab>('hourly');
  const [tabDirection, setTabDirection] = useState(0);
  const [activeHourlyCard, setActiveHourlyCard] = useState(0);
  const [activeWeeklyCard, setActiveWeeklyCard] = useState(0);
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const prevAlertEventsRef = useRef<string[]>([]);

  const { theme, toggleTheme } = useTheme();
  const { data, loading, error, usingMockData } = useWeather(city);
  const geo = useGeolocation();
  const { supported: notifSupported, optedIn, requestPermission, sendNotification } = useNotifications();
  const current = data?.current;

  useEffect(() => {
    if (geo.lat !== null && geo.lon !== null) {
      reverseGeocode(geo.lat, geo.lon)
        .then((detectedCity) => {
          setGeoError(null);
          onCityChange?.(detectedCity);
          setCoords({ lat: geo.lat!, lon: geo.lon! });
        })
        .catch(() => {
          setGeoError('Could not detect your city. Check your API key.');
          setCoords({ lat: geo.lat!, lon: geo.lon! });
        });
    }
    if (geo.error) setGeoError(geo.error);
  }, [geo.lat, geo.lon, geo.error]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!coords) return;
    fetchWeatherAlerts(coords.lat, coords.lon)
      .then((fetched: WeatherAlert[]) => setAlerts(fetched))
      .catch(() => { /* ignore */ });
  }, [coords]);

  useEffect(() => {
    if (!optedIn || alerts.length === 0) return;
    const currentEvents = alerts.map((a) => a.event);
    const newEvents = currentEvents.filter((e) => !prevAlertEventsRef.current.includes(e));
    newEvents.forEach((event) => sendNotification('⚠️ Weather Alert', { body: event, icon: '/vite.svg' }));
    prevAlertEventsRef.current = currentEvents;
  }, [alerts, optedIn, sendNotification]);

  const liveHourly = data?.hourly.map((h) => ({
    label: h.label, temp: toDisplayTemp(h.tempC, tempUnit), precip: h.precipPercent,
    icon: conditionIdToIcon(h.conditionId, h.iconCode), condition: conditionIdToWeatherCondition(h.conditionId),
  })) ?? hourlyData;

  const liveWeekly = data?.daily.map((d) => ({
    label: d.label, temp: toDisplayTemp(d.tempC, tempUnit), precip: d.precipPercent,
    icon: conditionIdToIcon(d.conditionId, d.iconCode), condition: conditionIdToWeatherCondition(d.conditionId),
  })) ?? weeklyData;

  const forecastData = activeTab === 'hourly' ? liveHourly : liveWeekly;
  const activeCard = activeTab === 'hourly' ? activeHourlyCard : activeWeeklyCard;
  const setActiveCard = activeTab === 'hourly' ? setActiveHourlyCard : setActiveWeeklyCard;

  function switchTab(tab: ForecastTab) {
    if (tab === activeTab) return;
    setTabDirection(tab === 'weekly' ? 1 : -1);
    setActiveTab(tab);
  }

  const statWidgets: Array<{ type: WeatherStatType; value: string; description?: string }> = current
    ? [
        { type: 'uv-index',   value: String(current.uvIndex), description: current.uvIndex <= 2 ? 'Low' : current.uvIndex <= 5 ? 'Moderate' : 'High' },
        { type: 'sunrise',    value: formatTime(current.sunrise), description: `Sunset: ${formatTime(current.sunset)}` },
        { type: 'wind',       value: `${current.windSpeedKmh} km/h`, description: windDegToCompass(current.windDeg) },
        { type: 'rainfall',   value: `${current.rainMm} mm`, description: 'In last hour' },
        { type: 'feels-like', value: toDisplayTemp(current.feelsLikeC, tempUnit), description: 'Feels like' },
        { type: 'humidity',   value: `${current.humidity}%`, description: 'Relative humidity' },
        { type: 'visibility', value: `${current.visibilityKm} km`, description: 'Current visibility' },
        { type: 'pressure',   value: `${current.pressureHpa} hPa`, description: 'Atmospheric pressure' },
      ]
    : [
        { type: 'uv-index',   value: '4',        description: 'Low for now' },
        { type: 'sunrise',    value: '6:15 AM',  description: 'Sunset: 7:43 PM' },
        { type: 'wind',       value: '12 km/h',  description: 'N/NE gusts 20' },
        { type: 'rainfall',   value: '0 mm',     description: 'In last 24h' },
        { type: 'feels-like', value: '17°',      description: 'Similar to actual' },
        { type: 'humidity',   value: '63%',       description: 'Dew point 11°' },
        { type: 'visibility', value: '10 km',    description: 'Clear skies' },
        { type: 'pressure',   value: '1013 hPa', description: 'Rising' },
      ];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: '100svh', minHeight: 700, margin: '0 auto', overflow: 'hidden', background: 'var(--gradient-bg)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
      <style>{`
        @keyframes skeletonPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.65; } }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <img src={HOMEPAGE_BG} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(156deg, rgba(46,51,90,0.82) 0%, rgba(28,27,51,0.88) 100%)', pointerEvents: 'none' }} />

      {STARS.map((star, i) => (
        <div key={i} style={{ position: 'absolute', top: `${star.top}%`, left: `${star.left}%`, width: star.size, height: star.size, borderRadius: '50%', background: 'white', opacity: star.opacity, pointerEvents: 'none' }} />
      ))}

      <div style={{ position: 'absolute', top: -100, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(100,80,210,0.55) 0%, transparent 65%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 220, right: -90, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(64,203,216,0.22) 0%, transparent 70%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 100, left: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(72,49,157,0.18) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Weather alerts banner */}
      <AnimatePresence>
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}
      </AnimatePresence>

      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 30, display: 'flex', alignItems: 'center', gap: 8 }}>
        {notifSupported && (
          <button
            onClick={requestPermission}
            aria-label={optedIn ? 'Notifications enabled' : 'Enable weather notifications'}
            style={{ width: 32, height: 32, borderRadius: '50%', background: optedIn ? 'rgba(255,200,50,0.22)' : 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)', border: optedIn ? '1px solid rgba(255,200,50,0.4)' : '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s ease, transform 0.2s ease', padding: 0 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={optedIn ? '#FFD050' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s ease, transform 0.2s ease', padding: 0 }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="rgba(26,26,46,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.18)', overflow: 'hidden' }}>
          {(['C', 'F'] as TempUnit[]).map((unit) => (
            <button key={unit} onClick={() => setTempUnit(unit)} style={{ width: 36, height: 30, background: tempUnit === unit ? 'rgba(255,255,255,0.22)' : 'none', border: 'none', color: tempUnit === unit ? '#FFFFFF' : 'rgba(235,235,245,0.45)', fontSize: 13, fontWeight: tempUnit === unit ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 200ms ease, color 200ms ease' }} aria-label={`Switch to ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}`}>{`°${unit}`}</button>
          ))}
        </div>
      </div>

      {(error || geoError) && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(200,50,50,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '10px 16px', textAlign: 'center', fontSize: 13, color: '#fff', fontWeight: 500 }}>
          {geoError ?? 'Could not load live weather — showing sample data.'}
        </div>
      )}

      <div style={{ position: 'absolute', top: 58, left: 0, right: 0, textAlign: 'center', zIndex: 2, pointerEvents: 'none' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 4 }}>
            <SkeletonBar width={120} height={26} borderRadius={8} />
            <SkeletonBar width={90} height={80} borderRadius={12} />
            <SkeletonBar width={140} height={16} borderRadius={6} />
            <SkeletonBar width={100} height={14} borderRadius={6} />
          </div>
        ) : (
          <>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>{current?.city ?? 'Montreal'}</div>
            <div style={{ fontSize: 96, fontWeight: 200, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-4px', margin: '4px 0 2px' }}>{current ? toDisplayTemp(current.tempC, tempUnit) : '19°'}</div>
            <div style={{ fontSize: 17, fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{current ? capitalize(current.condition) : 'Partly Cloudy'}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}><WeatherIcon src={ICONS.sunCloud} size={64} condition="sun" iconKey="hero" /></div>
            <div style={{ fontSize: 15, fontWeight: 400, color: 'var(--color-text-secondary)', marginTop: 6, letterSpacing: '0.02em' }}>{current ? `H:${toDisplayTemp(current.tempMaxC, tempUnit)}   L:${toDisplayTemp(current.tempMinC, tempUnit)}` : 'H:24°   L:18°'}</div>
            {usingMockData && <div style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 12, background: 'rgba(255,200,50,0.12)', border: '1px solid rgba(255,200,50,0.2)', fontSize: 11, color: 'rgba(255,220,100,0.85)' }}>{error ? 'Offline — sample data' : 'Demo mode'}</div>}
          </>
        )}
      </div>

      <div style={{ position: 'absolute', top: 304, left: '50%', transform: 'translateX(-50%)', zIndex: 2, pointerEvents: 'none' }}><HouseIllustration /></div>

      <div style={{ position: 'absolute', top: 519, left: 0, right: 0, bottom: 0, borderRadius: '44px 44px 0 0', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255, 255, 255, 0.14)', borderBottom: 'none', display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 10 }} className="scrollbar-hide">
        <div style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.28)', margin: '10px auto 0', flexShrink: 0 }} />
        <div style={{ position: 'relative', display: 'flex', marginTop: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <button onClick={() => switchTab('hourly')} style={{ flex: 1, padding: '13px 0', fontSize: 15, fontWeight: activeTab === 'hourly' ? 600 : 400, color: activeTab === 'hourly' ? '#FFFFFF' : 'rgba(235,235,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 250ms ease', fontFamily: 'inherit' }}>Hourly Forecast</button>
          <button onClick={() => switchTab('weekly')} style={{ flex: 1, padding: '13px 0', fontSize: 15, fontWeight: activeTab === 'weekly' ? 600 : 400, color: activeTab === 'weekly' ? '#FFFFFF' : 'rgba(235,235,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 250ms ease', fontFamily: 'inherit' }}>Weekly Forecast</button>
          <div style={{ position: 'absolute', bottom: -1, left: activeTab === 'hourly' ? '0%' : '50%', width: '50%', height: 3, background: 'rgba(255,255,255,0.9)', borderRadius: '2px 2px 0 0', transition: 'left 260ms cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
        <div style={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={tabDirection}>
            <motion.div key={activeTab} custom={tabDirection} variants={tabSlideVariants} initial="enter" animate="center" exit="exit" className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 20px 12px' }}>
              {forecastData.map((item, i) => (
                <ForecastCard key={item.label} label={item.label} icon={item.icon} temperature={item.temp} precipitationPercent={item.precip} isActive={i === activeCard} onClick={() => setActiveCard(i)} condition={item.condition} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 20px', flexShrink: 0 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px', justifyItems: 'center', flexShrink: 0 }}>
          {statWidgets.map((widget) => <WeatherStatWidget key={widget.type} type={widget.type} value={widget.value} description={widget.description} />)}
        </div>
        <div style={{ margin: '0 16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(235,235,245,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Air Quality</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>Good</div>
            <div style={{ fontSize: 13, color: 'rgba(235,235,245,0.55)', marginTop: 4 }}>Air quality is satisfactory</div>
          </div>
          <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
              <circle cx="30" cy="30" r="24" fill="none" stroke="#40CBD8" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24 * 0.3} ${2 * Math.PI * 24 * 0.7}`} strokeDashoffset={2 * Math.PI * 24 * 0.25} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#40CBD8' }}>42</div>
          </div>
        </div>
        <div style={{ height: 84, flexShrink: 0 }} />
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 40px 16px', zIndex: 20 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, opacity: 0.65, transition: 'opacity 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Map view" onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')} onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.65')}><MapIcon /></button>
        <button className="neu-button" style={{ width: 56, height: 56, flexShrink: 0 }} aria-label="Add location">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <button onClick={onNavigateToSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 10, opacity: 0.65, transition: 'opacity 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="City list" onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')} onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.65')}><ListIcon /></button>
      </div>
    </div>
  );
}
