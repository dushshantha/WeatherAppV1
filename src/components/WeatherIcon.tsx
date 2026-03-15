import { motion, AnimatePresence } from 'framer-motion';
import type { TargetAndTransition, Transition } from 'framer-motion';

export type WeatherCondition = 'rain' | 'wind' | 'sun' | 'default';

interface WeatherIconProps {
  /** URL or data URI for the icon image */
  src: string;
  /** Alt text for the icon */
  alt?: string;
  /** Width/height in px */
  size?: number;
  /** Weather condition drives looping animation variant */
  condition?: WeatherCondition;
  /** Unique key — changing it triggers AnimatePresence exit/enter */
  iconKey?: string | number;
}

// ---------------------------------------------------------------------------
// Looping animation per weather condition
// ---------------------------------------------------------------------------
type LoopAnim = { animate: TargetAndTransition; transition: Transition };

const loopAnims: Record<WeatherCondition, LoopAnim | null> = {
  rain: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  wind: {
    animate: { rotate: [0, -8, 8, 0] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  sun: {
    animate: { scale: [1, 1.12, 1] },
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
  default: null,
};

/**
 * Animated weather icon.
 * - Fades and scales in on mount, out on unmount (AnimatePresence in parent).
 * - Loops a condition-specific animation (rain bounce, wind sway, sun pulse).
 * - Respects `prefers-reduced-motion` via `.weather-icon-loop *` CSS rule.
 */
export default function WeatherIcon({
  src,
  alt = '',
  size = 28,
  condition = 'default',
  iconKey,
}: WeatherIconProps) {
  const loop = loopAnims[condition];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={iconKey ?? src}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="weather-icon-loop"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.img
          src={src}
          alt={alt}
          aria-hidden={!alt || undefined}
          style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
          animate={loop?.animate}
          transition={loop?.transition}
        />
      </motion.div>
    </AnimatePresence>
  );
}
