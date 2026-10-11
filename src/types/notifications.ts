export type AlertType = 'severe' | 'rain' | 'temp_change' | 'air_quality' | 'high_wind' | 'system';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface WeatherAlert {
  id: string;
  cityName: string;
  country: string;
  type: AlertType;
  severity: AlertSeverity;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  severeWeather: boolean;
  incomingRain: boolean;
  tempFluctuations: boolean;
  poorAirQuality: boolean;
  highWind: boolean;
  sound: boolean;
}

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';
