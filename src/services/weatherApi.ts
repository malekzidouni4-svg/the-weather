import {
  AirQualityData,
  CityLocation,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherData,
} from '../types/weather';
import { calculateAQILevel } from '../utils/weatherUtils';

export const DEFAULT_CITIES: CityLocation[] = [
  {
    name: 'Bouira',
    nameAr: 'البويرة',
    country: 'Algeria',
    countryCode: 'DZ',
    admin1: 'Bouira Province',
    latitude: 36.3749,
    longitude: 3.902,
    timezone: 'Africa/Algiers',
  },
  {
    name: 'Algiers',
    nameAr: 'الجزائر العاصمة',
    country: 'Algeria',
    countryCode: 'DZ',
    admin1: 'Algiers',
    latitude: 36.7538,
    longitude: 3.0588,
    timezone: 'Africa/Algiers',
  },
  {
    name: 'Oran',
    nameAr: 'وهران',
    country: 'Algeria',
    countryCode: 'DZ',
    admin1: 'Oran',
    latitude: 35.6971,
    longitude: -0.6308,
    timezone: 'Africa/Algiers',
  },
  {
    name: 'Dubai',
    nameAr: 'دبي',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    admin1: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
  },
  {
    name: 'Paris',
    nameAr: 'باريس',
    country: 'France',
    countryCode: 'FR',
    admin1: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
  },
  {
    name: 'London',
    nameAr: 'لندن',
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  {
    name: 'Tokyo',
    nameAr: 'طوكيو',
    country: 'Japan',
    countryCode: 'JP',
    admin1: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
  {
    name: 'New York',
    nameAr: 'نيويورك',
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
];

export async function searchCities(query: string): Promise<CityLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding lookup failed');
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      name: item.name,
      country: item.country || '',
      countryCode: item.country_code || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
  } catch (err) {
    console.warn('Geocoding search error:', err);
    return [];
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<CityLocation> {
  try {
    // Open-Meteo geocoding search near point or fallback
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    );
    if (res.ok) {
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.name ||
        'Current Location';
      const country = data.address?.country || '';
      const countryCode = (data.address?.country_code || '').toUpperCase();
      return {
        name: city,
        country,
        countryCode,
        latitude,
        longitude,
      };
    }
  } catch {
    // ignore
  }

  return {
    name: 'Current Location',
    nameAr: 'الموقع الحالي',
    country: '',
    latitude,
    longitude,
  };
}

export async function fetchWeatherData(location: CityLocation): Promise<WeatherData> {
  const { latitude, longitude } = location;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,cloud_cover,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max&timezone=auto`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

  let weatherRes: any = null;
  let aqiRes: any = null;

  try {
    const [wData, aData] = await Promise.all([
      fetch(weatherUrl).then((r) => (r.ok ? r.json() : null)),
      fetch(aqiUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    weatherRes = wData;
    aqiRes = aData;
  } catch (error) {
    console.warn('Weather API fetch failed, using fallback simulation:', error);
  }

  // Fallback if network blocked or failed
  if (!weatherRes || !weatherRes.current) {
    return generateFallbackWeatherData(location);
  }

  const current = weatherRes.current;
  const hourlyRaw = weatherRes.hourly || {};
  const dailyRaw = weatherRes.daily || {};

  // Find index of current hour in hourly data
  const now = new Date();
  const currentIsoPrefix = now.toISOString().slice(0, 13);
  let currentHourIdx = 0;
  if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
    const found = hourlyRaw.time.findIndex((t: string) => t.startsWith(currentIsoPrefix));
    if (found >= 0) currentHourIdx = found;
  }

  // Next 24 hours of forecast
  const hourly: HourlyForecastItem[] = [];
  if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
    for (let i = currentHourIdx; i < Math.min(hourlyRaw.time.length, currentHourIdx + 24); i++) {
      const timeStr = hourlyRaw.time[i];
      const dateObj = new Date(timeStr);
      const hourVal = dateObj.getHours();
      const formattedTime =
        i === currentHourIdx
          ? 'Now'
          : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

      hourly.push({
        time: timeStr,
        formattedTime,
        hour: hourVal,
        temperature: Math.round(hourlyRaw.temperature_2m?.[i] ?? 20),
        precipitationProbability: Math.round(hourlyRaw.precipitation_probability?.[i] ?? 0),
        precipitation: Number(hourlyRaw.precipitation?.[i] ?? 0),
        weatherCode: hourlyRaw.weather_code?.[i] ?? 0,
        windSpeed: Math.round(hourlyRaw.wind_speed_10m?.[i] ?? 10),
        humidity: Math.round(hourlyRaw.relative_humidity_2m?.[i] ?? 50),
        cloudCover: Math.round(hourlyRaw.cloud_cover?.[i] ?? 20),
        uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
      });
    }
  }

  // Next 7 days of forecast
  const daily: DailyForecastItem[] = [];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  if (dailyRaw.time && Array.isArray(dailyRaw.time)) {
    for (let i = 0; i < Math.min(dailyRaw.time.length, 7); i++) {
      const dateStr = dailyRaw.time[i];
      const dObj = new Date(dateStr);
      const dayIdx = dObj.getDay();
      const isToday = i === 0;

      daily.push({
        date: dateStr,
        dayName: isToday ? 'Today' : daysEn[dayIdx].slice(0, 3),
        dayNameAr: isToday ? 'اليوم' : daysAr[dayIdx],
        weatherCode: dailyRaw.weather_code?.[i] ?? 0,
        tempMax: Math.round(dailyRaw.temperature_2m_max?.[i] ?? 24),
        tempMin: Math.round(dailyRaw.temperature_2m_min?.[i] ?? 14),
        apparentTempMax: Math.round(dailyRaw.apparent_temperature_max?.[i] ?? 25),
        apparentTempMin: Math.round(dailyRaw.apparent_temperature_min?.[i] ?? 13),
        precipitationProbability: Math.round(dailyRaw.precipitation_probability_max?.[i] ?? 0),
        precipitationSum: Number(dailyRaw.precipitation_sum?.[i] ?? 0),
        windSpeedMax: Math.round(dailyRaw.wind_speed_10m_max?.[i] ?? 12),
        uvIndexMax: Number(dailyRaw.uv_index_max?.[i] ?? 5),
        sunrise: dailyRaw.sunrise?.[i]?.split('T')[1]?.slice(0, 5) || '06:45',
        sunset: dailyRaw.sunset?.[i]?.split('T')[1]?.slice(0, 5) || '18:15',
      });
    }
  }

  // Air Quality
  let rawAqi = aqiRes?.current?.us_aqi || aqiRes?.current?.european_aqi || 34;
  const pm25 = Math.round(aqiRes?.current?.pm2_5 ?? 8);
  const pm10 = Math.round(aqiRes?.current?.pm10 ?? 16);
  const no2 = Math.round(aqiRes?.current?.nitrogen_dioxide ?? 11);
  const o3 = Math.round(aqiRes?.current?.ozone ?? 76);
  const so2 = Math.round(aqiRes?.current?.sulphur_dioxide ?? 4);
  const co = Math.round(aqiRes?.current?.carbon_monoxide ?? 210);

  const aqiInfo = calculateAQILevel(rawAqi, 'en');
  const aqiInfoAr = calculateAQILevel(rawAqi, 'ar');

  const airQuality: AirQualityData = {
    aqi: rawAqi,
    category: aqiInfo.level,
    labelEn: aqiInfo.label,
    labelAr: aqiInfoAr.label,
    summaryEn: aqiInfo.summary,
    summaryAr: aqiInfoAr.summary,
    pm25,
    pm10,
    no2,
    o3,
    so2,
    co,
  };

  const dewPoint = hourlyRaw.dew_point_2m?.[currentHourIdx] ?? 13;
  const uvNow = hourlyRaw.uv_index?.[currentHourIdx] ?? 4;
  const precipProbNow = hourlyRaw.precipitation_probability?.[currentHourIdx] ?? 10;

  return {
    location,
    current: {
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: Math.round(current.wind_direction_10m ?? 0),
      pressure: Math.round(current.surface_pressure ?? 1016),
      visibility: 10,
      weatherCode: current.weather_code ?? 0,
      cloudCover: Math.round(current.cloud_cover ?? 30),
      isDay: current.is_day === 1,
      uvIndex: Math.round(uvNow),
      dewPoint: Math.round(dewPoint),
      precipitationProbability: Math.round(precipProbNow),
      precipitation: Number(current.precipitation ?? 0),
    },
    hourly,
    daily,
    airQuality,
    sunriseToday: daily[0]?.sunrise || '06:45',
    sunsetToday: daily[0]?.sunset || '18:15',
    updatedAt: new Date(),
  };
}

function generateFallbackWeatherData(location: CityLocation): WeatherData {
  return {
    location,
    current: {
      temperature: 24,
      apparentTemperature: 25,
      humidity: 48,
      windSpeed: 14,
      windDirection: 45,
      pressure: 1016,
      visibility: 10,
      weatherCode: 2,
      cloudCover: 42,
      isDay: true,
      uvIndex: 5,
      dewPoint: 13,
      precipitationProbability: 10,
      precipitation: 0,
    },
    hourly: [
      { time: '2026-10-10T11:00', formattedTime: 'Now', hour: 11, temperature: 24, precipitationProbability: 10, precipitation: 0, weatherCode: 2, windSpeed: 14, humidity: 48, cloudCover: 40, uvIndex: 5 },
      { time: '2026-10-10T12:00', formattedTime: '12 PM', hour: 12, temperature: 25, precipitationProbability: 10, precipitation: 0, weatherCode: 1, windSpeed: 15, humidity: 45, cloudCover: 30, uvIndex: 6 },
      { time: '2026-10-10T15:00', formattedTime: '3 PM', hour: 15, temperature: 26, precipitationProbability: 15, precipitation: 0, weatherCode: 1, windSpeed: 16, humidity: 42, cloudCover: 35, uvIndex: 5 },
      { time: '2026-10-10T18:00', formattedTime: '6 PM', hour: 18, temperature: 22, precipitationProbability: 15, precipitation: 0, weatherCode: 2, windSpeed: 12, humidity: 55, cloudCover: 45, uvIndex: 2 },
      { time: '2026-10-10T21:00', formattedTime: '9 PM', hour: 21, temperature: 18, precipitationProbability: 20, precipitation: 0, weatherCode: 2, windSpeed: 10, humidity: 65, cloudCover: 50, uvIndex: 0 },
      { time: '2026-10-11T00:00', formattedTime: '12 AM', hour: 0, temperature: 16, precipitationProbability: 25, precipitation: 0, weatherCode: 3, windSpeed: 8, humidity: 72, cloudCover: 60, uvIndex: 0 },
      { time: '2026-10-11T03:00', formattedTime: '3 AM', hour: 3, temperature: 15, precipitationProbability: 20, precipitation: 0, weatherCode: 2, windSpeed: 7, humidity: 78, cloudCover: 50, uvIndex: 0 },
      { time: '2026-10-11T06:00', formattedTime: '6 AM', hour: 6, temperature: 14, precipitationProbability: 15, precipitation: 0, weatherCode: 1, windSpeed: 9, humidity: 80, cloudCover: 30, uvIndex: 1 },
    ],
    daily: [
      { date: '2026-10-10', dayName: 'Today', dayNameAr: 'اليوم', weatherCode: 2, tempMax: 24, tempMin: 14, apparentTempMax: 25, apparentTempMin: 13, precipitationProbability: 10, precipitationSum: 0, windSpeedMax: 14, uvIndexMax: 5, sunrise: '06:45', sunset: '18:10' },
      { date: '2026-10-11', dayName: 'Sun', dayNameAr: 'الأحد', weatherCode: 0, tempMax: 26, tempMin: 15, apparentTempMax: 27, apparentTempMin: 14, precipitationProbability: 5, precipitationSum: 0, windSpeedMax: 12, uvIndexMax: 6, sunrise: '06:46', sunset: '18:09' },
      { date: '2026-10-12', dayName: 'Mon', dayNameAr: 'الإثنين', weatherCode: 1, tempMax: 25, tempMin: 13, apparentTempMax: 25, apparentTempMin: 12, precipitationProbability: 10, precipitationSum: 0, windSpeedMax: 13, uvIndexMax: 6, sunrise: '06:47', sunset: '18:07' },
      { date: '2026-10-13', dayName: 'Tue', dayNameAr: 'الثلاثاء', weatherCode: 61, tempMax: 21, tempMin: 12, apparentTempMax: 20, apparentTempMin: 11, precipitationProbability: 60, precipitationSum: 4.2, windSpeedMax: 18, uvIndexMax: 4, sunrise: '06:48', sunset: '18:06' },
      { date: '2026-10-14', dayName: 'Wed', dayNameAr: 'الأربعاء', weatherCode: 80, tempMax: 22, tempMin: 11, apparentTempMax: 21, apparentTempMin: 10, precipitationProbability: 45, precipitationSum: 2.1, windSpeedMax: 15, uvIndexMax: 5, sunrise: '06:49', sunset: '18:04' },
      { date: '2026-10-15', dayName: 'Thu', dayNameAr: 'الخميس', weatherCode: 0, tempMax: 27, tempMin: 14, apparentTempMax: 28, apparentTempMin: 13, precipitationProbability: 0, precipitationSum: 0, windSpeedMax: 11, uvIndexMax: 6, sunrise: '06:50', sunset: '18:03' },
      { date: '2026-10-16', dayName: 'Fri', dayNameAr: 'الجمعة', weatherCode: 0, tempMax: 28, tempMin: 15, apparentTempMax: 29, apparentTempMin: 14, precipitationProbability: 0, precipitationSum: 0, windSpeedMax: 12, uvIndexMax: 7, sunrise: '06:51', sunset: '18:01' },
    ],
    airQuality: {
      aqi: 34,
      category: 'good',
      labelEn: 'Good',
      labelAr: 'ممتاز',
      summaryEn: 'Air quality is satisfactory and clean',
      summaryAr: 'جودة الهواء ممتازة ونقية',
      pm25: 8,
      pm10: 16,
      no2: 11,
      o3: 76,
      so2: 4,
      co: 210,
    },
    sunriseToday: '06:45',
    sunsetToday: '18:10',
    updatedAt: new Date(),
  };
}
