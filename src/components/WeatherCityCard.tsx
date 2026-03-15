interface WeatherCityCardProps {
  /** City name e.g. "San Francisco" */
  city: string;
  /** Country name e.g. "United States" */
  country: string;
  /** Current temperature e.g. "23°" */
  temperature: string;
  /** Weather condition description e.g. "Partly Cloudy" */
  condition: string;
  /** High temperature e.g. "25°" */
  high: string;
  /** Low temperature e.g. "18°" */
  low: string;
  /** URL to the large weather icon (160×160px) */
  icon: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether city is bookmarked */
  isBookmarked?: boolean;
  /** Called when bookmark icon is toggled */
  onBookmark?: () => void;
  /** If provided, shows an X remove button */
  onRemove?: () => void;
}

/**
 * 342px-wide city card used in the location search / city list screen.
 * Glassmorphism background, large 160px weather icon on the right,
 * temperature in 64px font on the left.
 */
export default function WeatherCityCard({
  city,
  country,
  temperature,
  condition,
  high,
  low,
  icon,
  onClick,
  isBookmarked,
  onBookmark,
  onRemove,
}: WeatherCityCardProps) {
  return (
    <div style={{ position: 'relative', width: 342 }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          padding: '16px 16px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 250ms ease, box-shadow 250ms ease',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'rgba(255, 255, 255, 0.1)';
        }}
      >
        {/* Left content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* City name */}
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#FFFFFF',
              lineHeight: 1.2,
            }}
          >
            {city}
          </span>

          {/* Country */}
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(235, 235, 245, 0.6)',
              marginTop: 2,
              marginBottom: 8,
            }}
          >
            {country}
          </span>

          {/* Temperature — 64px font */}
          <span
            style={{
              fontSize: 64,
              fontWeight: 300,
              color: '#FFFFFF',
              lineHeight: 1,
              letterSpacing: '-2px',
            }}
          >
            {temperature}
          </span>

          {/* Condition */}
          <span
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: 'rgba(235, 235, 245, 0.6)',
              marginTop: 4,
            }}
          >
            {condition}
          </span>

          {/* H/L row */}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>
              H:{high}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(235, 235, 245, 0.6)',
              }}
            >
              L:{low}
            </span>
          </div>
        </div>

        {/* Right: large weather icon */}
        <img
          src={icon}
          alt={condition}
          style={{
            width: 160,
            height: 160,
            objectFit: 'contain',
            flexShrink: 0,
            marginRight: -8,
          }}
        />
      </button>

      {/* Bookmark toggle — top-right of card */}
      {onBookmark !== undefined && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark();
          }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark city'}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z"
              stroke="rgba(235,235,245,0.9)"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill={isBookmarked ? 'rgba(235,235,245,0.9)' : 'none'}
            />
          </svg>
        </button>
      )}

      {/* Remove (X) button — top-left of card */}
      {onRemove !== undefined && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove city"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(235, 235, 245, 0.15)',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(235,235,245,0.9)',
            fontSize: 11,
            fontWeight: 700,
            zIndex: 2,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
