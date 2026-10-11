import React from 'react';
import { WeatherData, TemperatureUnit, Language } from '../types/weather';
import { formatTemperature, getUVCategory } from '../utils/weatherUtils';
import { Sun, CloudRain, Sunrise, Sunset, Eye, Sparkles } from 'lucide-react';

interface AtmosphericDetailsPanelProps {
  data: WeatherData;
  unit: TemperatureUnit;
  lang: Language;
}

export const AtmosphericDetailsPanel: React.FC<AtmosphericDetailsPanelProps> = ({
  data,
  unit,
  lang,
}) => {
  const { current, sunriseToday, sunsetToday } = data;
  const isRtl = lang === 'ar';
  const uvCategory = getUVCategory(current.uvIndex, lang);

  // Compute daylight progress percentage
  let daylightProgress = 50;
  try {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [sRiseH, sRiseM] = sunriseToday.split(':').map(Number);
    const [sSetH, sSetM] = sunsetToday.split(':').map(Number);
    const riseMins = sRiseH * 60 + sRiseM;
    const setMins = sSetH * 60 + sSetM;

    if (currentMins <= riseMins) daylightProgress = 0;
    else if (currentMins >= setMins) daylightProgress = 100;
    else {
      daylightProgress = Math.round(((currentMins - riseMins) / (setMins - riseMins)) * 100);
    }
  } catch {
    daylightProgress = 50;
  }

  return (
    <section className="glass-panel p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <h2 className="text-base font-bold text-white tracking-tight">
            {isRtl ? 'التفاصيل الجوية' : 'Atmospheric Details'}
          </h2>
        </div>
        <span className="text-[11px] text-white/60 font-medium px-2 py-0.5 rounded-full bg-white/10">
          {isRtl ? 'اليوم' : 'Today'}
        </span>
      </div>

      {/* Grid of Atmospheric metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* UV Index */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/65">{isRtl ? 'مؤشر UV' : 'UV Index'}</span>
          <b className="text-xs font-semibold flex items-center gap-1.5 tabular-nums">
            <span className="text-white">{current.uvIndex}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: `${uvCategory.color}25`,
                color: uvCategory.color,
              }}
            >
              {uvCategory.label}
            </span>
          </b>
        </div>

        {/* Dew Point */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/65">{isRtl ? 'نقطة الندى' : 'Dew Point'}</span>
          <b className="text-xs font-semibold text-white tabular-nums">
            {formatTemperature(current.dewPoint, unit)}°{unit === 'celsius' ? 'C' : 'F'}
          </b>
        </div>

        {/* Cloud Cover */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/65">{isRtl ? 'الغطاء السحابي' : 'Cloud Cover'}</span>
          <b className="text-xs font-semibold text-white tabular-nums">
            {current.cloudCover}%
          </b>
        </div>

        {/* Precipitation */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/65">{isRtl ? 'احتمال الهطول' : 'Precipitation'}</span>
          <b className="text-xs font-semibold text-white tabular-nums flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
            {current.precipitationProbability}%
          </b>
        </div>

        {/* Sunrise */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/65 flex items-center gap-1">
            <Sunrise className="w-3.5 h-3.5 text-amber-300" />
            {isRtl ? 'الشروق' : 'Sunrise'}
          </span>
          <b className="text-xs font-semibold text-white font-mono tabular-nums">
            {sunriseToday}
          </b>
        </div>

        {/* Sunset */}
        <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-white/65 flex items-center gap-1">
            <Sunset className="w-3.5 h-3.5 text-orange-400" />
            {isRtl ? 'الغروب' : 'Sunset'}
          </span>
          <b className="text-xs font-semibold text-white font-mono tabular-nums">
            {sunsetToday}
          </b>
        </div>
      </div>

      {/* Sun Daylight Arc Indicator */}
      <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex justify-between items-center text-[11px] text-white/60 mb-2">
          <span>{isRtl ? 'مسار الشمس اليومي' : 'Solar Daylight Track'}</span>
          <span className="font-mono text-white/80 tabular-nums">{daylightProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500"
            style={{ width: `${daylightProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
};
