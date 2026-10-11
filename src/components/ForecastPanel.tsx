import React, { useState } from 'react';
import { DailyForecastItem, TemperatureUnit, Language } from '../types/weather';
import {
  formatTemperature,
  convertTempNumber,
  getWeatherCondition,
} from '../utils/weatherUtils';
import { Calendar, ChevronRight, Droplets, Wind, Sun, X } from 'lucide-react';

interface ForecastPanelProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
  lang: Language;
}

export const ForecastPanel: React.FC<ForecastPanelProps> = ({ daily, unit, lang }) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem | null>(null);
  const isRtl = lang === 'ar';

  // Compute absolute min and max of entire week for proportional bar widths
  const weekTemps = daily.flatMap((d) => [
    convertTempNumber(d.tempMin, unit),
    convertTempNumber(d.tempMax, unit),
  ]);
  const overallMin = Math.min(...weekTemps);
  const overallMax = Math.max(...weekTemps);
  const tempSpan = Math.max(1, overallMax - overallMin);

  return (
    <section className="glass-panel p-6 flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-300" />
          <h2 className="text-base font-bold text-white tracking-tight">
            {isRtl ? 'توقعات 7 أيام' : '7-Day Outlook'}
          </h2>
        </div>
        <span className="text-[11px] text-white/60 font-medium">
          {isRtl ? 'الأعلى / الأدنى' : 'High / Low'}
        </span>
      </div>

      {/* Days List */}
      <div className="flex flex-col gap-2">
        {daily.map((day, idx) => {
          const cond = getWeatherCondition(day.weatherCode);
          const minVal = convertTempNumber(day.tempMin, unit);
          const maxVal = convertTempNumber(day.tempMax, unit);

          // Proportional offsets for range bar
          const leftPercent = Math.max(0, Math.min(80, ((minVal - overallMin) / tempSpan) * 100));
          const rightPercent = Math.max(0, Math.min(80, ((overallMax - maxVal) / tempSpan) * 100));

          const displayName = isRtl ? day.dayNameAr : day.dayName;

          return (
            <button
              type="button"
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className="w-full text-left p-2.5 rounded-2xl bg-white/[0.045] hover:bg-white/[0.12] border border-white/[0.06] transition-all grid grid-cols-[65px_36px_1fr_65px] items-center gap-2 cursor-pointer group"
            >
              <strong className="text-xs font-bold text-white/90 truncate group-hover:text-white">
                {displayName}
              </strong>

              <span className="text-xl select-none">{cond.icon}</span>

              {/* Proportional Range Bar */}
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-300 via-amber-200 to-orange-400"
                  style={{
                    left: `${leftPercent}%`,
                    right: `${rightPercent}%`,
                  }}
                />
              </div>

              {/* Min/Max values */}
              <b className="text-xs font-bold text-right tabular-nums text-white/90 whitespace-nowrap">
                {maxVal}° <span className="text-white/50 font-normal">/ {minVal}°</span>
              </b>
            </button>
          );
        })}
      </div>

      {/* Day Details Modal / Drawer if user clicks a day */}
      {selectedDay && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl rounded-[28px] p-6 z-30 flex flex-col justify-between border border-white/20 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {getWeatherCondition(selectedDay.weatherCode).icon}
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {isRtl ? selectedDay.dayNameAr : selectedDay.dayName}
                  </h3>
                  <p className="text-xs text-white/60">
                    {isRtl
                      ? getWeatherCondition(selectedDay.weatherCode).ar
                      : getWeatherCondition(selectedDay.weatherCode).en}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <span className="text-[11px] text-white/60 block mb-1">
                  {isRtl ? 'درجات الحرارة' : 'Temperatures'}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {formatTemperature(selectedDay.tempMax, unit)}° /{' '}
                  {formatTemperature(selectedDay.tempMin, unit)}°
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <span className="text-[11px] text-white/60 block mb-1 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-300" />
                  {isRtl ? 'الأمطار المتوقعة' : 'Precipitation'}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {selectedDay.precipitationProbability}% ({selectedDay.precipitationSum} mm)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <span className="text-[11px] text-white/60 block mb-1 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-teal-300" />
                  {isRtl ? 'أقصى سرعة رياح' : 'Max Wind Speed'}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {selectedDay.windSpeedMax} km/h
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <span className="text-[11px] text-white/60 block mb-1 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-300" />
                  {isRtl ? 'أقصى مؤشر UV' : 'Max UV Index'}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {selectedDay.uvIndexMax}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-white/60 pt-3 border-t border-white/10">
            <span>
              {isRtl ? 'شروق:' : 'Sunrise:'} <b>{selectedDay.sunrise}</b>
            </span>
            <span>
              {isRtl ? 'غروب:' : 'Sunset:'} <b>{selectedDay.sunset}</b>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
