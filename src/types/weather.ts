export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Language = 'en' | 'ar';

export interface CityLocation {
  name: string;
  nameAr?: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  weatherCode: number;
  cloudCover: number;
  isDay: boolean;
  uvIndex: number;
  dewPoint: number;
  precipitationProbability: number;
  precipitation: number;
}

export interface HourlyForecastItem {
  time: string;
  formattedTime: string;
  hour: number;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  cloudCover: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  dayNameAr: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  aqi: number;
  category: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  labelEn: string;
  labelAr: string;
  summaryEn: string;
  summaryAr: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
}

export interface WeatherData {
  location: CityLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  sunriseToday: string;
  sunsetToday: string;
  updatedAt: Date;
}
