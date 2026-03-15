import React from 'react';

export type WeatherStatType =
  | 'uv-index'
  | 'sunrise'
  | 'wind'
  | 'rainfall'
  | 'feels-like'
  | 'humidity'
  | 'visibility'
  | 'pressure';

interface WeatherStatWidgetProps {
  type: WeatherStatType;
  /** Primary value string e.g. "4", "6:15 AM", "12 km/h", "0 mm", "29°", "63%", "10 km", "1013 hPa" */
  value: string;
  /** Optional secondary/descriptive line e.g. "Low for now", "Sunset: 7:43 PM" */
  description?: string;
}

const STAT_CONFIG: Record<
  WeatherStatType,
  { label: string; icon: React.ReactNode }
> = {
  'uv-index': {
    label: 'UV Index',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="white" />
        <path
          d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  sunrise: {
    label: 'Sunrise',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2v4M4.22 6.22l2.83 2.83M2 14h4M18 14h4M19.78 6.22l-2.83 2.83"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M5 19a7 7 0 0 1 14 0"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="3" y1="19" x2="21" y2="19" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  wind: {
    label: 'Wind',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9.59 4.59A2 2 0 1 1 11 8H2"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.59 19.41A2 2 0 1 0 14 16H2"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.59 11.41A2 2 0 1 0 8 8H2"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  rainfall: {
    label: 'Rainfall',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 14v6M8 14v6M12 16v6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  'feels-like': {
    label: 'Feels Like',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2a2 2 0 0 1 2 2v8a4 4 0 1 1-4 0V4a2 2 0 0 1 2-2z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  humidity: {
    label: 'Humidity',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  visibility: {
    label: 'Visibility',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
  pressure: {
    label: 'Pressure',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M12 6v6l4 2"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

/**
 * 164×164px glassmorphism stat widget used in the main weather detail grid.
 * Supports: UV Index, Sunrise, Wind, Rainfall, Feels Like, Humidity, Visibility, Pressure.
 */
export default function WeatherStatWidget({
  type,
  value,
  description,
}: WeatherStatWidgetProps) {
  const config = STAT_CONFIG[type];

  return (
    <div
      style={{
        width: 164,
        height: 164,
        borderRadius: 22,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Header: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {config.icon}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(235, 235, 245, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {config.label}
        </span>
      </div>

      {/* Primary value */}
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginBottom: description ? 4 : 0,
          }}
        >
          {value}
        </div>

        {/* Optional description */}
        {description && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(235, 235, 245, 0.6)',
              lineHeight: 1.3,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
