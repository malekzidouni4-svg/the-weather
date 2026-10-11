import { Language, TemperatureUnit } from '../types/weather';

export interface WeatherConditionInfo {
  en: string;
  ar: string;
  icon: string;
  theme: 'clear_day' | 'clear_night' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
}

export const WMO_MAP: Record<number, WeatherConditionInfo> = {
  0: { en: 'Clear sky', ar: 'سماء صافية', icon: '☀️', theme: 'clear_day' },
  1: { en: 'Mainly clear', ar: 'صحو غالباً', icon: '🌤️', theme: 'clear_day' },
  2: { en: 'Partly cloudy', ar: 'غائم جزئياً', icon: '⛅', theme: 'cloudy' },
  3: { en: 'Overcast', ar: 'غائم كلياً', icon: '☁️', theme: 'cloudy' },
  45: { en: 'Foggy', ar: 'ضبابي', icon: '🌫️', theme: 'fog' },
  48: { en: 'Depositing rime fog', ar: 'ضباب جليدي', icon: '🌫️', theme: 'fog' },
  51: { en: 'Light drizzle', ar: 'رذاذ خفيف', icon: '🌦️', theme: 'rain' },
  53: { en: 'Moderate drizzle', ar: 'رذاذ معتدل', icon: '🌦️', theme: 'rain' },
  55: { en: 'Dense drizzle', ar: 'رذاذ كثيف', icon: '🌧️', theme: 'rain' },
  56: { en: 'Light freezing drizzle', ar: 'رذاذ متجمد خفيف', icon: '🌧️', theme: 'rain' },
  57: { en: 'Dense freezing drizzle', ar: 'رذاذ متجمد كثيف', icon: '🌧️', theme: 'rain' },
  61: { en: 'Slight rain', ar: 'مطر خفيف', icon: '🌧️', theme: 'rain' },
  63: { en: 'Moderate rain', ar: 'أمطار معتدلة', icon: '🌧️', theme: 'rain' },
  65: { en: 'Heavy rain', ar: 'أمطار غزيرة', icon: '🌧️', theme: 'rain' },
  66: { en: 'Light freezing rain', ar: 'أمطار متجمدة خفيفة', icon: '🌨️', theme: 'rain' },
  67: { en: 'Heavy freezing rain', ar: 'أمطار متجمدة غزيرة', icon: '🌨️', theme: 'rain' },
  71: { en: 'Slight snowfall', ar: 'تساقط ثلوج خفيف', icon: '🌨️', theme: 'snow' },
  73: { en: 'Moderate snowfall', ar: 'تساقط ثلوج معتدل', icon: '🌨️', theme: 'snow' },
  75: { en: 'Heavy snowfall', ar: 'تساقط ثلوج كثيف', icon: '❄️', theme: 'snow' },
  77: { en: 'Snow grains', ar: 'حبات ثلجية', icon: '❄️', theme: 'snow' },
  80: { en: 'Slight rain showers', ar: 'زخات مطر خفيفة', icon: '🌦️', theme: 'rain' },
  81: { en: 'Moderate rain showers', ar: 'زخات مطر معتدلة', icon: '🌧️', theme: 'rain' },
  82: { en: 'Violent rain showers', ar: 'زخات مطر عنيفة', icon: '⛈️', theme: 'rain' },
  85: { en: 'Slight snow showers', ar: 'زخات ثلج خفيفة', icon: '🌨️', theme: 'snow' },
  86: { en: 'Heavy snow showers', ar: 'زخات ثلج غزيرة', icon: '❄️', theme: 'snow' },
  95: { en: 'Thunderstorm', ar: 'عواصف رعدية', icon: '⛈️', theme: 'storm' },
  96: { en: 'Thunderstorm with slight hail', ar: 'عاصفة رعدية وبَرَد خفيف', icon: '⛈️', theme: 'storm' },
  97: { en: 'Thunderstorm with heavy hail', ar: 'عاصفة رعدية وبَرَد كثيف', icon: '⛈️', theme: 'storm' },
};

export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  const match = WMO_MAP[code] || {
    en: 'Variable conditions',
    ar: 'أجواء متقلبة',
    icon: '🌤️',
    theme: 'clear_day',
  };

  if (!isDay && (code === 0 || code === 1)) {
    return {
      en: code === 0 ? 'Clear night' : 'Mainly clear night',
      ar: code === 0 ? 'ليلة صافية' : 'ليلة صحوة غالباً',
      icon: '🌙',
      theme: 'clear_night',
    };
  }

  return match;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    return `${Math.round((celsius * 9) / 5 + 32)}`;
  }
  return `${Math.round(celsius)}`;
}

export function convertTempNumber(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function getWindDirection(degrees: number, lang: Language): string {
  const directionsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const directionsAr = ['شمال', 'شمال شرقي', 'شرق', 'جنوب شرقي', 'جنوب', 'جنوب غربي', 'غرب', 'شمال غربي'];
  const index = Math.round(degrees / 45) % 8;
  return lang === 'ar' ? directionsAr[index] : directionsEn[index];
}

export function getUVCategory(uv: number, lang: Language): { label: string; color: string } {
  if (uv <= 2) {
    return { label: lang === 'ar' ? 'منخفض' : 'Low', color: '#68d391' };
  }
  if (uv <= 5) {
    return { label: lang === 'ar' ? 'معتدل' : 'Moderate', color: '#ecc94b' };
  }
  if (uv <= 7) {
    return { label: lang === 'ar' ? 'مرتفع' : 'High', color: '#ed8936' };
  }
  if (uv <= 10) {
    return { label: lang === 'ar' ? 'مرتفع جداً' : 'Very High', color: '#e53e3e' };
  }
  return { label: lang === 'ar' ? 'شديد الخطورة' : 'Extreme', color: '#9f7aea' };
}

export function calculateAQILevel(aqi: number, lang: Language) {
  if (aqi <= 50) {
    return {
      level: 'good' as const,
      label: lang === 'ar' ? 'ممتاز' : 'Good',
      summary: lang === 'ar' ? 'جودة الهواء ممتازة ونقية' : 'Air quality is satisfactory and clean',
      percent: Math.min(100, Math.max(10, (aqi / 50) * 25)),
      color: '#34d399',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'moderate' as const,
      label: lang === 'ar' ? 'معتدل' : 'Moderate',
      summary: lang === 'ar' ? 'جودة الهواء مقبولة لمعظم الناس' : 'Air quality is acceptable for most people',
      percent: Math.min(100, 25 + ((aqi - 50) / 50) * 25),
      color: '#fbbf24',
    };
  }
  if (aqi <= 150) {
    return {
      level: 'sensitive' as const,
      label: lang === 'ar' ? 'غير صحي للحساسين' : 'Unhealthy for Sensitive',
      summary: lang === 'ar' ? 'قد يتأثر أصحاب الحساسية التنفسية' : 'Sensitive groups should reduce prolonged outdoor effort',
      percent: Math.min(100, 50 + ((aqi - 100) / 50) * 25),
      color: '#f97316',
    };
  }
  if (aqi <= 200) {
    return {
      level: 'unhealthy' as const,
      label: lang === 'ar' ? 'غير صحي' : 'Unhealthy',
      summary: lang === 'ar' ? 'قد يعاني الجميع من آثار صحية' : 'Everyone may begin to experience health effects',
      percent: Math.min(100, 75 + ((aqi - 150) / 50) * 15),
      color: '#ef4444',
    };
  }
  return {
    level: 'hazardous' as const,
    label: lang === 'ar' ? 'خطير' : 'Hazardous',
    summary: lang === 'ar' ? 'تحذير صحي لتجنب الخروج' : 'Health warning of emergency conditions',
    percent: 100,
    color: '#a855f7',
  };
}

export function getAtmosphereBackground(hour: number, weatherCode: number, isDay: boolean): string {
  // If severe rain, thunderstorm, or snow
  if ([95, 96, 97].includes(weatherCode)) {
    return 'linear-gradient(135deg, #0d1527 0%, #1a2536 50%, #2f2a4a 100%)';
  }
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return 'linear-gradient(135deg, #112233 0%, #253e56 50%, #44687d 100%)';
  }
  if ([71, 73, 75, 85, 86].includes(weatherCode)) {
    return 'linear-gradient(135deg, #1b263b 0%, #3d5a80 50%, #98c1d9 100%)';
  }
  if ([45, 48].includes(weatherCode)) {
    return 'linear-gradient(135deg, #192a3e 0%, #364958 50%, #556b7c 100%)';
  }

  // Based on diurnal cycle
  if (hour >= 5 && hour < 8) {
    // Dawn / Sunrise
    return 'linear-gradient(135deg, #142850 0%, #2c5364 45%, #e7895e 100%)';
  }
  if (hour >= 8 && hour < 13) {
    // Crisp Morning / Midday
    return 'linear-gradient(135deg, #173a5c 0%, #4d8fb3 48%, #e9b96b 100%)';
  }
  if (hour >= 13 && hour < 17) {
    // Bright Afternoon
    return 'linear-gradient(135deg, #1e4d77 0%, #5ba4c7 48%, #f3c27b 100%)';
  }
  if (hour >= 17 && hour < 19) {
    // Golden Hour / Sunset
    return 'linear-gradient(135deg, #243b55 0%, #744253 45%, #f29468 100%)';
  }
  if (hour >= 19 && hour < 21) {
    // Twilight / Dusk
    return 'linear-gradient(135deg, #101c36 0%, #29324e 50%, #684860 100%)';
  }
  // Night / Deep Night
  return 'linear-gradient(135deg, #071324 0%, #11233f 50%, #253350 100%)';
}

export function formatLocalizedDate(date: Date, lang: Language, timezone?: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone || undefined,
    };
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'en-US', options).format(date);
  } catch {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'en-US', options).format(date);
  }
}
