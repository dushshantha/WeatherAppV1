import WeatherIcon, { type WeatherCondition } from './WeatherIcon';

interface ForecastCardProps {
  /** Time label e.g. "9AM" or day label e.g. "Mon" */
  label: string;
  /** URL to weather icon image */
  icon: string;
  /** Temperature string e.g. "19°" */
  temperature: string;
  /** Optional precipitation percentage e.g. 15 → shows "15%" */
  precipitationPercent?: number;
  /** Whether this card is the active/selected state */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Weather condition for looping icon animation */
  condition?: WeatherCondition;
}

/**
 * Pill-shaped forecast card used in hourly and weekly forecast strips.
 * Width: 60px, rounded-[30px], glassmorphism background.
 * Active state: solid #48319D background.
 */
export default function ForecastCard({
  label,
  icon,
  temperature,
  precipitationPercent,
  isActive = false,
  onClick,
  condition = 'default',
}: ForecastCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 60,
        borderRadius: 30,
        background: isActive
          ? '#48319D'
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: isActive ? undefined : 'blur(20px)',
        WebkitBackdropFilter: isActive ? undefined : 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isActive
          ? '0 4px 24px rgba(72, 49, 157, 0.4)'
          : '0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'background 250ms ease, box-shadow 250ms ease',
      }}
    >
      {/* Time / Day label */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isActive ? '#FFFFFF' : 'rgba(235, 235, 245, 0.6)',
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        {label}
      </span>

      {/* Weather icon */}
      <WeatherIcon src={icon} size={28} condition={condition} iconKey={icon} />

      {/* Temperature */}
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1,
        }}
      >
        {temperature}
      </span>

      {/* Precipitation percentage (optional) */}
      {precipitationPercent !== undefined && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: isActive ? 'rgba(255, 255, 255, 0.8)' : '#40CBD8',
            lineHeight: 1,
          }}
        >
          {precipitationPercent}%
        </span>
      )}
    </button>
  );
}
