// OpenWeatherMap API response types

export interface WeatherCoord {
  lon: number;
  lat: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface WeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherClouds {
  all: number;
}

export interface WeatherSys {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherRain {
  '1h'?: number;
  '3h'?: number;
}

export interface CurrentWeatherResponse {
  coord: WeatherCoord;
  weather: WeatherCondition[];
  main: WeatherMain;
  visibility: number;
  wind: WeatherWind;
  clouds: WeatherClouds;
  rain?: WeatherRain;
  dt: number;
  sys: WeatherSys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherCondition[];
  clouds: WeatherClouds;
  wind: WeatherWind;
  visibility: number;
  pop: number; // probability of precipitation 0-1
  rain?: WeatherRain;
  dt_txt: string;
}

export interface ForecastCity {
  id: number;
  name: string;
  coord: WeatherCoord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: ForecastCity;
}

// Normalized types used in UI

export interface NormalizedCurrentWeather {
  city: string;
  country: string;
  tempC: number;
  feelsLikeC: number;
  tempMinC: number;
  tempMaxC: number;
  condition: string;
  conditionId: number;
  iconCode: string;
  humidity: number;
  windSpeedKmh: number;
  windDeg: number;
  pressureHpa: number;
  visibilityKm: number;
  uvIndex: number; // not in free API, default 0
  sunrise: number; // unix timestamp
  sunset: number; // unix timestamp
  rainMm: number;
}

export interface HourlyForecastItem {
  label: string; // "12AM", "1AM", etc.
  tempC: number;
  precipPercent: number;
  conditionId: number;
  iconCode: string;
}

export interface DailyForecastItem {
  label: string; // "MON", "TUE", etc.
  tempC: number;
  tempMinC: number;
  tempMaxC: number;
  precipPercent: number;
  conditionId: number;
  iconCode: string;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags?: string[];
}

export interface OneCallAlertsResponse {
  alerts?: WeatherAlert[];
}
