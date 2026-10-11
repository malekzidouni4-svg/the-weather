import { WeatherData, TemperatureUnit, Language } from '../types/weather';
import {
  formatTemperature,
  getWeatherCondition,
  getWindDirection,
  getUVCategory,
  calculateAQILevel,
} from '../utils/weatherUtils';
import { DiurnalPeriod } from '../components/AtmosphereCanvas';

export interface SpokenForecastReport {
  text: string;
  wordCount: number;
  headline: string;
}

export function generateForecastSpeechScript(
  data: WeatherData,
  unit: TemperatureUnit,
  lang: Language,
  period: DiurnalPeriod
): SpokenForecastReport {
  const { location, current, daily, airQuality } = data;
  const isRtl = lang === 'ar';
  const cityName = isRtl && location.nameAr ? location.nameAr : location.name;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const tempStr = `${formatTemperature(current.temperature, unit)} degrees ${
    unit === 'celsius' ? 'Celsius' : 'Fahrenheit'
  }`;
  const feelsStr = `${formatTemperature(current.apparentTemperature, unit)} degrees`;

  const today = daily[0];
  const maxTempStr = today ? `${formatTemperature(today.tempMax, unit)} degrees` : '';
  const minTempStr = today ? `${formatTemperature(today.tempMin, unit)} degrees` : '';
  const precipChance = current.precipitationProbability;
  const windDir = getWindDirection(current.windDirection, lang);
  const aqiInfo = calculateAQILevel(airQuality.aqi, lang);
  const uvInfo = getUVCategory(current.uvIndex, lang);

  if (isRtl) {
    // Natural meteorological Arabic report
    const greetings: Record<DiurnalPeriod, string> = {
      fajr: 'أهلاً بكم مع إطلالة فجر اليوم',
      sunrise: 'صباح الخير مع شروق شمس اليوم',
      morning: 'طاب صباحكم',
      midday: 'طابت ظهيرتكم',
      asr: 'طاب مساؤكم مع وقت العصر',
      sunset: 'مساء الخير مع غروب الشمس',
      twilight: 'مساء الخير',
      night: 'مساء الخير وطابت ليلتكم',
    };

    const greeting = greetings[period] || 'أهلاً بكم في النشرة الجوية';

    let script = `${greeting}، إليكم التقرير الجوي المباشر لمدينة ${cityName}. `;
    script += `الحالة السائدة الآن هي ${condition.ar}. `;
    script += `درجة الحرارة تسجل حالياً ${formatTemperature(current.temperature, unit)} درجة مئوية، `;
    script += `وتشعر وكأنها ${feelsStr} مئوية. `;

    script += `الرطوبة النسبية تبلغ ${current.humidity} بالمئة، `;
    script += `وسرعة الرياح ${current.windSpeed} كيلومتر في الساعة باتجاه ${windDir}. `;

    if (precipChance >= 40) {
      script += `فرصة هطول الأمطار مرتفعة وتصل إلى ${precipChance} بالمئة. `;
    } else {
      script += `احتمالية الهطول منخفضة بنسبة ${precipChance} بالمئة. `;
    }

    if (today) {
      script += `وعلى مدار اليوم، يُتوقع أن تبلغ الحرارة العظمى ${maxTempStr}، بينما تنخفض الصغرى إلى ${minTempStr}. `;
    }

    script += `جودة الهواء في المدينة ${aqiInfo.label} بمؤشر ${airQuality.aqi}. `;

    if (current.uvIndex >= 6) {
      script += `مؤشر الأشعة فوق البنفسجية مرتفع، ويُنصح بارتداء النظارات الشمسية واستخدام واقي الشمس. `;
    }

    script += `نتمنى لكم يوماً سعيداً وآمناً مع تطبيق أتموس.`;

    return {
      text: script,
      wordCount: script.split(/\s+/).length,
      headline: `النشرة الجوية لمدينة ${cityName}`,
    };
  }

  // Natural meteorological English report
  const greetingsEn: Record<DiurnalPeriod, string> = {
    fajr: 'Good dawn',
    sunrise: 'Good morning at sunrise',
    morning: 'Good morning',
    midday: 'Good afternoon',
    asr: 'Good late afternoon',
    sunset: 'Good evening at sunset',
    twilight: 'Good evening',
    night: 'Good night',
  };

  const greeting = greetingsEn[period] || 'Welcome to your weather briefing';

  let script = `${greeting}. Here is your live atmospheric report for ${cityName}. `;
  script += `Current conditions are ${condition.en.toLowerCase()}, `;
  script += `with a temperature of ${tempStr}, feels like ${feelsStr}. `;
  script += `Relative humidity is at ${current.humidity} percent, `;
  script += `with winds blowing from the ${windDir} at ${current.windSpeed} kilometers per hour. `;

  if (precipChance >= 40) {
    script += `Precipitation probability is significant at ${precipChance} percent. `;
  } else {
    script += `Precipitation chance is low at ${precipChance} percent. `;
  }

  if (today) {
    script += `For the remainder of the day, expect a high of ${maxTempStr} and an overnight low of ${minTempStr}. `;
  }

  script += `Air quality is currently ${aqiInfo.label.toLowerCase()} with an index of ${airQuality.aqi}. `;

  if (current.uvIndex >= 6) {
    script += `The UV index is elevated at ${current.uvIndex}, so sun protection is recommended outdoors. `;
  }

  script += `Stay prepared and have a great day with Atmos Weather Intelligence.`;

  return {
    text: script,
    wordCount: script.split(/\s+/).length,
    headline: `Weather Briefing for ${cityName}`,
  };
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

export function pickBestVoice(voices: SpeechSynthesisVoice[], lang: Language): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const targetLangPrefix = lang === 'ar' ? 'ar' : 'en';

  // 1. Prioritize natural / neural / premium voices in target language
  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
  if (matching.length === 0) return voices[0] || null;

  const preferred = matching.find(
    (v) =>
      v.name.includes('Natural') ||
      v.name.includes('Neural') ||
      v.name.includes('Google') ||
      v.name.includes('Siri') ||
      v.name.includes('Enhanced')
  );

  return preferred || matching[0];
}
