import React from 'react';
import { AirQualityData, Language } from '../types/weather';
import { calculateAQILevel } from '../utils/weatherUtils';
import { ShieldCheck, Wind } from 'lucide-react';

interface AirQualityPanelProps {
  airQuality: AirQualityData;
  lang: Language;
}

export const AirQualityPanel: React.FC<AirQualityPanelProps> = ({ airQuality, lang }) => {
  const isRtl = lang === 'ar';
  const aqiInfo = calculateAQILevel(airQuality.aqi, lang);

  // Determine circle border color and glow
  const colorMap: Record<string, string> = {
    good: 'border-emerald-400 text-emerald-300 shadow-emerald-500/20',
    moderate: 'border-amber-400 text-amber-300 shadow-amber-500/20',
    sensitive: 'border-orange-400 text-orange-300 shadow-orange-500/20',
    unhealthy: 'border-rose-500 text-rose-300 shadow-rose-500/20',
    hazardous: 'border-purple-500 text-purple-300 shadow-purple-500/20',
  };

  const ringStyle = colorMap[aqiInfo.level] || colorMap.good;

  return (
    <section className="glass-panel p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-300" />
          <h2 className="text-base font-bold text-white tracking-tight">
            {isRtl ? 'جودة الهواء' : 'Air Quality'}
          </h2>
        </div>
        <span className="text-[11px] text-white/60 font-medium px-2 py-0.5 rounded-full bg-white/10">
          {isRtl ? 'مؤشر مباشر' : 'Live Index'}
        </span>
      </div>

      {/* AQI Score and Status */}
      <div className="flex items-center gap-4 my-2">
        <div
          className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center bg-white/[0.08] backdrop-blur-md shadow-lg shrink-0 ${ringStyle}`}
        >
          <span className="text-2xl font-black leading-none tabular-nums text-white">
            {airQuality.aqi}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">
            AQI
          </span>
        </div>

        <div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>{isRtl ? airQuality.labelAr : airQuality.labelEn}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-white/70 mt-1 leading-snug">
            {isRtl ? airQuality.summaryAr : airQuality.summaryEn}
          </p>
        </div>
      </div>

      {/* Spectrum Bar */}
      <div className="mt-4">
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 relative">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, Math.max(8, aqiInfo.percent))}%`,
              background: 'linear-gradient(90deg, #34d399 0%, #fbbf24 40%, #f97316 75%, #ef4444 100%)',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-mono">
          <span>0 (Good)</span>
          <span>50</span>
          <span>100</span>
          <span>150+</span>
        </div>
      </div>

      {/* Pollutant Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-white/65">PM2.5</span>
          <b className="text-white font-semibold tabular-nums">{airQuality.pm25} µg/m³</b>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-white/65">PM10</span>
          <b className="text-white font-semibold tabular-nums">{airQuality.pm10} µg/m³</b>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-white/65">NO₂</span>
          <b className="text-white font-semibold tabular-nums">{airQuality.no2} µg/m³</b>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-white/65">O₃</span>
          <b className="text-white font-semibold tabular-nums">{airQuality.o3} µg/m³</b>
        </div>
      </div>
    </section>
  );
};
