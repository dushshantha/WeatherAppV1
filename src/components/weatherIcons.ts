/**
 * Weather icon asset URLs.
 * Replace placeholder values with actual Figma-exported asset URLs
 * or local imports once assets are available.
 *
 * Icon names match the Figma asset library naming convention.
 */
export const weatherIcons = {
  moonCloudMidRain:
    'https://assets.figma.com/moon-cloud-mid-rain.png',
  sunCloudMidRain:
    'https://assets.figma.com/sun-cloud-mid-rain.png',
  moonCloudFastWind:
    'https://assets.figma.com/moon-cloud-fast-wind.png',
  sunCloudAngledRain:
    'https://assets.figma.com/sun-cloud-angled-rain.png',
  tornado:
    'https://assets.figma.com/tornado.png',
  showers:
    'https://assets.figma.com/showers.png',
  partlyCloudy:
    'https://assets.figma.com/partly-cloudy.png',
} as const;

export type WeatherIconKey = keyof typeof weatherIcons;
