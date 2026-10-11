import { WeatherData, TemperatureUnit, Language } from './weather';
import {
  formatTemperature,
  getWindDirection,
  getUVCategory,
  calculateAQILevel,
} from '../utils/weatherUtils';

export type MetricWidgetId =
  | 'humidity'
  | 'wind'
  | 'pressure'
  | 'visibility'
  | 'uvIndex'
  | 'dewPoint'
  | 'cloudCover'
  | 'precipProb'
  | 'precipitation'
  | 'aqi'
  | 'pm25'
  | 'pm10'
  | 'sunrise'
  | 'sunset'
  | 'feelsLike';

export interface WidgetValueResult {
  value: string;
  unit?: string;
  sublabel?: string;
  badge?: {
    text: string;
    color: string;
    bg: string;
  };
}

export interface MetricWidgetDefinition {
  id: MetricWidgetId;
  labelEn: string;
  labelAr: string;
  category: 'atmospheric' | 'solar_rain' | 'air_quality';
  categoryLabelEn: string;
  categoryLabelAr: string;
  iconName: string;
  iconColor: string;
  getValue: (
    data: WeatherData,
    tempUnit: TemperatureUnit,
    lang: Language
  ) => WidgetValueResult;
}

export const DEFAULT_PINNED_WIDGETS: MetricWidgetId[] = [
  'humidity',
  'wind',
  'pressure',
  'visibility',
];

export const ALL_METRIC_WIDGETS: Record<MetricWidgetId, MetricWidgetDefinition> = {
  humidity: {
    id: 'humidity',
    labelEn: 'Humidity',
    labelAr: 'الرطوبة',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'Droplets',
    iconColor: 'text-cyan-300',
    getValue: (data) => ({
      value: `${data.current.humidity}`,
      unit: '%',
      sublabel: data.current.humidity > 70 ? 'High' : data.current.humidity < 35 ? 'Dry' : 'Normal',
    }),
  },
  wind: {
    id: 'wind',
    labelEn: 'Wind Speed',
    labelAr: 'سرعة الرياح',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'Wind',
    iconColor: 'text-teal-300',
    getValue: (data, _, lang) => ({
      value: `${data.current.windSpeed}`,
      unit: 'km/h',
      sublabel: getWindDirection(data.current.windDirection, lang),
    }),
  },
  pressure: {
    id: 'pressure',
    labelEn: 'Pressure',
    labelAr: 'الضغط الجوي',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'Gauge',
    iconColor: 'text-indigo-300',
    getValue: (data) => ({
      value: `${data.current.pressure}`,
      unit: 'hPa',
      sublabel: data.current.pressure > 1013 ? 'High' : 'Low',
    }),
  },
  visibility: {
    id: 'visibility',
    labelEn: 'Visibility',
    labelAr: 'مدى الرؤية',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'Eye',
    iconColor: 'text-amber-300',
    getValue: (data) => ({
      value: `${data.current.visibility}`,
      unit: 'km',
      sublabel: data.current.visibility >= 10 ? 'Clear' : 'Reduced',
    }),
  },
  uvIndex: {
    id: 'uvIndex',
    labelEn: 'UV Index',
    labelAr: 'مؤشر UV',
    category: 'solar_rain',
    categoryLabelEn: 'Solar & Rain',
    categoryLabelAr: 'الشمس والهطول',
    iconName: 'SunMedium',
    iconColor: 'text-amber-400',
    getValue: (data, _, lang) => {
      const uv = data.current.uvIndex;
      const cat = getUVCategory(uv, lang);
      return {
        value: `${uv}`,
        badge: {
          text: cat.label,
          color: cat.color,
          bg: `${cat.color}25`,
        },
      };
    },
  },
  dewPoint: {
    id: 'dewPoint',
    labelEn: 'Dew Point',
    labelAr: 'نقطة الندى',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'Thermometer',
    iconColor: 'text-sky-300',
    getValue: (data, tempUnit) => ({
      value: formatTemperature(data.current.dewPoint, tempUnit),
      unit: `°${tempUnit === 'celsius' ? 'C' : 'F'}`,
      sublabel: 'Condensation',
    }),
  },
  cloudCover: {
    id: 'cloudCover',
    labelEn: 'Cloud Cover',
    labelAr: 'الغطاء السحابي',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'Cloud',
    iconColor: 'text-slate-300',
    getValue: (data) => ({
      value: `${data.current.cloudCover}`,
      unit: '%',
      sublabel: data.current.cloudCover > 60 ? 'Overcast' : data.current.cloudCover < 20 ? 'Clear' : 'Scattered',
    }),
  },
  precipProb: {
    id: 'precipProb',
    labelEn: 'Precipitation %',
    labelAr: 'احتمال الهطول',
    category: 'solar_rain',
    categoryLabelEn: 'Solar & Rain',
    categoryLabelAr: 'الشمس والهطول',
    iconName: 'CloudRain',
    iconColor: 'text-cyan-400',
    getValue: (data) => ({
      value: `${data.current.precipitationProbability}`,
      unit: '%',
      sublabel: data.current.precipitationProbability > 40 ? 'High' : 'Low',
    }),
  },
  precipitation: {
    id: 'precipitation',
    labelEn: 'Current Rain',
    labelAr: 'كمية الأمطار',
    category: 'solar_rain',
    categoryLabelEn: 'Solar & Rain',
    categoryLabelAr: 'الشمس والهطول',
    iconName: 'CloudDrizzle',
    iconColor: 'text-blue-400',
    getValue: (data) => ({
      value: `${data.current.precipitation || 0}`,
      unit: 'mm',
      sublabel: 'Current rate',
    }),
  },
  aqi: {
    id: 'aqi',
    labelEn: 'Air Quality (AQI)',
    labelAr: 'مؤشر جودة الهواء',
    category: 'air_quality',
    categoryLabelEn: 'Air Quality & Pollutants',
    categoryLabelAr: 'جودة الهواء والملوثات',
    iconName: 'ShieldAlert',
    iconColor: 'text-emerald-400',
    getValue: (data, _, lang) => {
      const aqi = data.airQuality.aqi;
      const level = calculateAQILevel(aqi, lang);
      return {
        value: `${aqi}`,
        badge: {
          text: level.label,
          color: level.color,
          bg: `${level.color}25`,
        },
      };
    },
  },
  pm25: {
    id: 'pm25',
    labelEn: 'PM2.5 Level',
    labelAr: 'جسيمات PM2.5',
    category: 'air_quality',
    categoryLabelEn: 'Air Quality & Pollutants',
    categoryLabelAr: 'جودة الهواء والملوثات',
    iconName: 'Wind',
    iconColor: 'text-rose-400',
    getValue: (data) => ({
      value: `${data.airQuality.pm25}`,
      unit: 'µg/m³',
      sublabel: 'Fine particles',
    }),
  },
  pm10: {
    id: 'pm10',
    labelEn: 'PM10 Level',
    labelAr: 'جسيمات PM10',
    category: 'air_quality',
    categoryLabelEn: 'Air Quality & Pollutants',
    categoryLabelAr: 'جودة الهواء والملوثات',
    iconName: 'Wind',
    iconColor: 'text-orange-400',
    getValue: (data) => ({
      value: `${data.airQuality.pm10}`,
      unit: 'µg/m³',
      sublabel: 'Inhalable dust',
    }),
  },
  sunrise: {
    id: 'sunrise',
    labelEn: 'Sunrise Time',
    labelAr: 'وقت الشروق',
    category: 'solar_rain',
    categoryLabelEn: 'Solar & Rain',
    categoryLabelAr: 'الشمس والهطول',
    iconName: 'Sunrise',
    iconColor: 'text-amber-300',
    getValue: (data) => ({
      value: data.sunriseToday,
      sublabel: 'Morning dawn',
    }),
  },
  sunset: {
    id: 'sunset',
    labelEn: 'Sunset Time',
    labelAr: 'وقت الغروب',
    category: 'solar_rain',
    categoryLabelEn: 'Solar & Rain',
    categoryLabelAr: 'الشمس والهطول',
    iconName: 'Sunset',
    iconColor: 'text-orange-400',
    getValue: (data) => ({
      value: data.sunsetToday,
      sublabel: 'Dusk twilight',
    }),
  },
  feelsLike: {
    id: 'feelsLike',
    labelEn: 'Feels Like',
    labelAr: 'الحرارة المحسوسة',
    category: 'atmospheric',
    categoryLabelEn: 'Atmospheric & Wind',
    categoryLabelAr: 'الأجواء والرياح',
    iconName: 'ThermometerSun',
    iconColor: 'text-rose-300',
    getValue: (data, tempUnit) => ({
      value: formatTemperature(data.current.apparentTemperature, tempUnit),
      unit: `°${tempUnit === 'celsius' ? 'C' : 'F'}`,
      sublabel: 'Thermal index',
    }),
  },
};
