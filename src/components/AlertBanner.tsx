import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeatherAlert } from '../types/weather';

interface AlertBannerProps {
  alerts: WeatherAlert[];
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9" x2="12" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transition: 'transform 200ms ease',
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AlertItem({ alert }: { alert: WeatherAlert }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ padding: '10px 14px' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#fff',
          padding: 0,
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
        aria-expanded={expanded}
      >
        <WarningIcon />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
          {alert.event}
        </span>
        <ChevronIcon expanded={expanded} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              margin: '8px 0 0 26px',
              fontSize: 12,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}>
              {alert.description}
            </p>
            {alert.sender_name && (
              <p style={{
                margin: '4px 0 0 26px',
                fontSize: 11,
                color: 'rgba(255,255,255,0.55)',
              }}>
                Source: {alert.sender_name}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(220,38,38,0.45)',
      }}
    >
      <div style={{ position: 'relative' }}>
        {alerts.map((alert, i) => (
          <AlertItem key={`${alert.event}-${i}`} alert={alert} />
        ))}

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss weather alerts"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <CloseIcon />
        </button>
      </div>
    </motion.div>
  );
}
