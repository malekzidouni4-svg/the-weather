import {
  NotificationSettings,
  PermissionState,
  WeatherAlert,
} from '../types/notifications';
import { CityLocation, WeatherData } from '../types/weather';

const STORAGE_KEY_SETTINGS = 'atmos_notification_settings';
const STORAGE_KEY_ALERTS = 'atmos_weather_alerts';
const STORAGE_KEY_NOTIFIED = 'atmos_notified_hashes';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  severeWeather: true,
  incomingRain: true,
  tempFluctuations: true,
  poorAirQuality: true,
  highWind: true,
  sound: true,
};

// Check browser notification support & status
export function getBrowserNotificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as PermissionState;
}

// Request permission with promise
export async function requestBrowserNotificationPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission as PermissionState;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return Notification.permission as PermissionState;
  }
}

// Play pleasant web audio chime
export function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone pleasant ping
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

// Display native browser notification
export function dispatchBrowserNotification(
  title: string,
  body: string,
  playSound: boolean = true
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22 width=%2264%22 height=%2264%22><circle cx=%2232%22 cy=%2232%22 r=%2230%22 fill=%22%23102b48%22/><text x=%2250%%22 y=%2255%%22 font-size=%2234%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>⚡</text></svg>',
        tag: 'atmos-weather-alert',
      });
      if (playSound) {
        playAlertChime();
      }
      return true;
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
  return false;
}

// Check weather data for significant changes/alerts
export function evaluateLocationAlerts(
  location: CityLocation,
  weather: WeatherData,
  settings: NotificationSettings
): WeatherAlert[] {
  if (!settings.enabled) return [];

  const alerts: WeatherAlert[] = [];
  const cityName = location.name;
  const country = location.countryCode || location.country;
  const current = weather.current;

  // 1. Severe Weather Alerts (Thunderstorms, heavy rain, snow)
  if (settings.severeWeather) {
    if ([95, 96, 97].includes(current.weatherCode)) {
      alerts.push({
        id: `severe-storm-${location.name}-${new Date().getHours()}`,
        cityName,
        country,
        type: 'severe',
        severity: 'critical',
        titleEn: `⚡ Severe Thunderstorm Alert: ${cityName}`,
        titleAr: `⚡ تحذير من عواصف رعدية: ${cityName}`,
        messageEn: `Active thunderstorms detected in ${cityName} with lightning and potential hail. Seek shelter.`,
        messageAr: `رصد عواصف رعدية نشطة في ${cityName} مع صواعق واحتمال تساقط البَرَد. يُنصح بالاحتماء.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if ([65, 67, 82].includes(current.weatherCode)) {
      alerts.push({
        id: `severe-rain-${location.name}-${new Date().getHours()}`,
        cityName,
        country,
        type: 'severe',
        severity: 'warning',
        titleEn: `🌧️ Heavy Downpour Warning: ${cityName}`,
        titleAr: `🌧️ تنبيه من أمطار غزيرة: ${cityName}`,
        messageEn: `Heavy rain showers in progress in ${cityName}. Reduced road visibility and localized pooling.`,
        messageAr: `هطول أمطار غزيرة حالياً في ${cityName}. انخفاض الرؤية وتجمع مياه على الطرقات.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if ([71, 73, 75, 85, 86].includes(current.weatherCode)) {
      alerts.push({
        id: `severe-snow-${location.name}-${new Date().getHours()}`,
        cityName,
        country,
        type: 'severe',
        severity: 'warning',
        titleEn: `❄️ Snowfall Advisory: ${cityName}`,
        titleAr: `❄️ تنبيه تساقط الثلوج: ${cityName}`,
        messageEn: `Snowfall active in ${cityName}. Icy road conditions possible.`,
        messageAr: `تساقط الثلوج في ${cityName}. انتبه من احتمالية تشكل الجليد على الطرقات.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  // 2. Incoming Rain in next 3 hours
  if (settings.incomingRain) {
    const nextHours = weather.hourly.slice(1, 4);
    const rainUpcoming = nextHours.find((h) => h.precipitationProbability >= 60 || h.precipitation > 1.5);
    if (rainUpcoming && ![61, 63, 65, 80, 81, 82, 95].includes(current.weatherCode)) {
      alerts.push({
        id: `rain-soon-${location.name}-${rainUpcoming.hour}`,
        cityName,
        country,
        type: 'rain',
        severity: 'info',
        titleEn: `🌦️ Rain Expected Soon in ${cityName}`,
        titleAr: `🌦️ توقعات بهطول أمطار قريباً في ${cityName}`,
        messageEn: `High chance of rain (${rainUpcoming.precipitationProbability}%) approaching around ${rainUpcoming.formattedTime}.`,
        messageAr: `احتمال كبير لتساقط الأمطار (${rainUpcoming.precipitationProbability}%) حوالي الساعة ${rainUpcoming.formattedTime}.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  // 3. High Wind Warning (> 35 km/h)
  if (settings.highWind && current.windSpeed >= 35) {
    alerts.push({
      id: `wind-${location.name}-${new Date().getHours()}`,
      cityName,
      country,
      type: 'high_wind',
      severity: current.windSpeed >= 55 ? 'critical' : 'warning',
      titleEn: `💨 High Wind Gusts in ${cityName} (${current.windSpeed} km/h)`,
      titleAr: `💨 هبات رياح قوية في ${cityName} (${current.windSpeed} كم/س)`,
      messageEn: `Strong wind conditions detected. Secure loose outdoor objects and drive cautiously.`,
      messageAr: `تم رصد رياح عاتية. يرجى تثبيت الأغراض الخارجية وتوخي الحذر أثناء القيادة.`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // 4. Poor Air Quality Alert (AQI > 100)
  if (settings.poorAirQuality && weather.airQuality.aqi > 100) {
    alerts.push({
      id: `aqi-${location.name}-${Math.round(weather.airQuality.aqi / 20)}`,
      cityName,
      country,
      type: 'air_quality',
      severity: weather.airQuality.aqi > 150 ? 'critical' : 'warning',
      titleEn: `😷 Degraded Air Quality in ${cityName} (AQI ${weather.airQuality.aqi})`,
      titleAr: `😷 تراجع جودة الهواء في ${cityName} (مؤشر ${weather.airQuality.aqi})`,
      messageEn: `${weather.airQuality.summaryEn}. Sensitive groups should limit prolonged outdoor exertion.`,
      messageAr: `${weather.airQuality.summaryAr}. يُنصح بالحد من النشاط البدني الخارجي.`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // 5. Extreme or rapid temperature shifts (e.g. Freezing <= 0°C or Scorching Heat >= 38°C)
  if (settings.tempFluctuations) {
    if (current.temperature <= 0) {
      alerts.push({
        id: `freeze-${location.name}-${new Date().getDate()}`,
        cityName,
        country,
        type: 'temp_change',
        severity: 'warning',
        titleEn: `🧊 Freezing Cold Warning: ${cityName} (${current.temperature}°C)`,
        titleAr: `🧊 تحذير من الصقيع والانجماد: ${cityName} (${current.temperature}°م)`,
        messageEn: `Sub-zero temperatures detected. Watch for black ice on roads and bridges.`,
        messageAr: `انخفاض درجات الحرارة إلى ما دون الصفر المئوي. يرجى الانتباه من الجليد والانجماد.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (current.temperature >= 38) {
      alerts.push({
        id: `heat-${location.name}-${new Date().getDate()}`,
        cityName,
        country,
        type: 'temp_change',
        severity: 'warning',
        titleEn: `🔥 Extreme Heatwave Alert: ${cityName} (${current.temperature}°C)`,
        titleAr: `🔥 موجة حر شديدة: ${cityName} (${current.temperature}°م)`,
        messageEn: `Dangerous high temperatures. Stay hydrated and avoid direct sun exposure.`,
        messageAr: `درجات حرارة شديدة الارتفاع. حافظ على شرب السوائل وتجنب التعرض المباشر للشمس.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  return alerts;
}

// Storage helpers
export function getSavedAlerts(): WeatherAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: WeatherAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts.slice(0, 30)));
  } catch {
    // ignore
  }
}

export function getNotifiedHashes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFIED);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markAlertAsNotified(id: string): void {
  try {
    const hashes = getNotifiedHashes();
    hashes[id] = Date.now();
    localStorage.setItem(STORAGE_KEY_NOTIFIED, JSON.stringify(hashes));
  } catch {
    // ignore
  }
}

export function isAlertRecentlyNotified(id: string, cooldownHours = 4): boolean {
  const hashes = getNotifiedHashes();
  const timestamp = hashes[id];
  if (!timestamp) return false;
  const elapsedHours = (Date.now() - timestamp) / (1000 * 60 * 60);
  return elapsedHours < cooldownHours;
}

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
