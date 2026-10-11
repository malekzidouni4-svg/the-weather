import React, { useState, useMemo } from 'react';
import { HourlyForecastItem, TemperatureUnit, Language } from '../types/weather';
import {
  formatTemperature,
  convertTempNumber,
  getWeatherCondition,
} from '../utils/weatherUtils';
import { TrendingUp, CloudRain, Wind } from 'lucide-react';

interface HourlyChartPanelProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
  lang: Language;
}

type ChartMetric = 'temp' | 'rain' | 'wind';

export const HourlyChartPanel: React.FC<HourlyChartPanelProps> = ({
  hourly,
  unit,
  lang,
}) => {
  const [metric, setMetric] = useState<ChartMetric>('temp');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const isRtl = lang === 'ar';

  // Take next 12 to 18 data points for crisp display
  const chartData = useMemo(() => {
    return hourly.slice(0, 16);
  }, [hourly]);

  // Calculate points
  const points = useMemo(() => {
    if (chartData.length < 2) return [];

    let values: number[] = [];
    if (metric === 'temp') {
      values = chartData.map((d) => convertTempNumber(d.temperature, unit));
    } else if (metric === 'rain') {
      values = chartData.map((d) => d.precipitationProbability);
    } else {
      values = chartData.map((d) => d.windSpeed);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // SVG canvas bounds
    const width = 800;
    const height = 190;
    const topPad = 25;
    const bottomPad = 35;
    const usableHeight = height - topPad - bottomPad;

    return values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      // Inverted Y: higher value -> smaller y
      const y = height - bottomPad - ((val - min) / range) * usableHeight;
      return { x, y, val, original: chartData[i] };
    });
  }, [chartData, metric, unit]);

  // Generate smooth SVG path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '' };

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const area = `${d} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;
    return { linePath: d, areaPath: area };
  }, [points]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <section className="glass-panel p-6 flex flex-col justify-between">
      {/* Header and Toggle Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            {isRtl ? 'الحرارة والتوقعات الساعية' : 'Temperature & hourly conditions'}
          </h2>
          <span className="text-xs text-white/60">
            {isRtl ? 'توقعات الساعات القادمة' : 'Next 16 hours forecast trajectory'}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.08] border border-white/10">
          <button
            type="button"
            onClick={() => setMetric('temp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'temp'
                ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                : 'text-white/65 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isRtl ? 'درجة الحرارة' : 'Temperature'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('rain')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'rain'
                ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                : 'text-white/65 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{isRtl ? 'احتمال المطر' : 'Precipitation'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMetric('wind')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'wind'
                ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                : 'text-white/65 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{isRtl ? 'سرعة الرياح' : 'Wind'}</span>
          </button>
        </div>
      </div>

      {/* SVG Curve Chart */}
      <div
        className="relative h-48 w-full mt-2 cursor-crosshair select-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const idx = Math.round(ratio * (points.length - 1));
          setHoverIndex(idx);
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg viewBox="0 0 800 190" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="35" x2="800" y2="35" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1="0" y1="145" x2="800" y2="145" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

          {/* Fill Area */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* Main Curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
            />
          )}

          {/* Interactive hover line & marker */}
          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1="10"
                x2={activePoint.x}
                y2="185"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#ffffff"
                stroke="#102b48"
                strokeWidth="3"
                className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
            </>
          )}
        </svg>

        {/* Floating Tooltip Pill */}
        {activePoint && (
          <div
            className="absolute -top-3 pointer-events-none transform -translate-x-1/2 -translate-y-full z-20"
            style={{
              left: `${(activePoint.x / 800) * 100}%`,
            }}
          >
            <div className="rounded-xl px-3 py-1.5 bg-slate-900/90 border border-white/25 shadow-xl text-xs text-white backdrop-blur-md whitespace-nowrap flex items-center gap-2">
              <span className="font-semibold text-white/80">{activePoint.original.formattedTime}</span>
              <span className="text-white/40">·</span>
              <span className="font-bold text-white tabular-nums">
                {metric === 'temp' && `${activePoint.val}°${unit === 'celsius' ? 'C' : 'F'}`}
                {metric === 'rain' && `${activePoint.val}%`}
                {metric === 'wind' && `${activePoint.val} km/h`}
              </span>
              <span>{getWeatherCondition(activePoint.original.weatherCode).icon}</span>
            </div>
          </div>
        )}
      </div>

      {/* Time marks row */}
      <div className="flex justify-between items-center text-white/60 text-xs mt-3 font-medium px-1">
        {chartData
          .filter((_, idx) => idx % 3 === 0 || idx === chartData.length - 1)
          .map((item, i) => (
            <span key={i} className="tabular-nums">
              {item.formattedTime}
            </span>
          ))}
      </div>

      {/* Horizontal hourly strip cards */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 mt-2 border-t border-white/10">
        {chartData.map((item, idx) => {
          const cond = getWeatherCondition(item.weatherCode);
          const isSelected = hoverIndex === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between min-w-[70px] transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-white/20 border-white/40 scale-105'
                  : 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.12]'
              }`}
            >
              <span className="text-[11px] text-white/70 font-medium">{item.formattedTime}</span>
              <span className="text-2xl my-1">{cond.icon}</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {formatTemperature(item.temperature, unit)}°
              </span>
              {item.precipitationProbability > 0 && (
                <span className="text-[10px] text-cyan-300 font-medium tabular-nums mt-0.5">
                  {item.precipitationProbability}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
