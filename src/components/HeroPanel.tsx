import React, { useState } from 'react';
import { RefreshCw, SlidersHorizontal, Pin, Sparkles, Compass, MapPin, Loader2, Sunset, Sun, Moon } from 'lucide-react';
import { WeatherData, TemperatureUnit, Language } from '../types/weather';
import {
  formatTemperature,
  getWeatherCondition,
  formatLocalizedDate,
} from '../utils/weatherUtils';
import {
  ALL_METRIC_WIDGETS,
  DEFAULT_PINNED_WIDGETS,
  MetricWidgetId,
} from '../types/widgets';
import { WidgetIcon } from './WidgetsModal';
import { DiurnalPeriod, PERIOD_LABELS } from './AtmosphereCanvas';
import { SpeechForecastPlayer } from './SpeechForecastPlayer';

interface HeroPanelProps {
  data: WeatherData;
  unit: TemperatureUnit;
  lang: Language;
  onRefresh: () => void;
  isRefreshing: boolean;
  pinnedWidgetIds?: MetricWidgetId[];
  onOpenWidgets: () => void;
  diurnalPeriod: DiurnalPeriod;
  manualPeriod: DiurnalPeriod | null;
  onSelectPeriod: (period: DiurnalPeriod | null) => void;
  isAutoLocating?: boolean;
}

export const HeroPanel: React.FC<HeroPanelProps> = ({
  data,
  unit,
  lang,
  onRefresh,
  isRefreshing,
  pinnedWidgetIds = DEFAULT_PINNED_WIDGETS,
  onOpenWidgets,
  diurnalPeriod,
  manualPeriod,
  onSelectPeriod,
  isAutoLocating,
}) => {
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const { location, current } = data;
  const isRtl = lang === 'ar';
  const condition = getWeatherCondition(current.weatherCode, current.isDay);

  const cityName = isRtl && location.nameAr ? location.nameAr : location.name;
  const countryName = location.countryCode || location.country;

  const formattedDate = formatLocalizedDate(data.updatedAt, lang, location.timezone);

  const activePeriod = manualPeriod || diurnalPeriod;
  const periodInfo = PERIOD_LABELS[activePeriod];

  return (
    <section className="glass-panel relative overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[475px]">
      {/* Background ambient light orb */}
      <div className="absolute w-96 h-96 rounded-full -right-24 -top-28 bg-white/12 blur-2xl pointer-events-none" />

      {/* Top Location Bar */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-2">
              <span>{cityName}</span>
              {countryName && (
                <span className="text-white/70 font-semibold text-lg sm:text-2xl">
                  , {countryName}
                </span>
              )}
            </h1>

            {isAutoLocating && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-200 text-[10px] flex items-center gap-1 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{isRtl ? 'تحديد الموقع...' : 'Detecting...'}</span>
              </span>
            )}
          </div>

          <div className="text-white/75 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-2 font-medium">
            <span>{formattedDate}</span>
            {location.admin1 && (
              <>
                <span className="text-white/35">·</span>
                <span className="text-white/60">{location.admin1}</span>
              </>
            )}
            <span className="text-white/35">·</span>
            {/* Diurnal Phase Badge */}
            <button
              type="button"
              onClick={() => setShowSceneSelector(!showSceneSelector)}
              title={isRtl ? 'تغيير أو معاينة الأطوار الجوية' : 'Atmosphere scene preview'}
              className="px-2.5 py-0.5 rounded-full bg-white/12 hover:bg-white/20 border border-white/15 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{periodInfo.icon}</span>
              <span>{isRtl ? periodInfo.ar : periodInfo.en}</span>
              {manualPeriod && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/25 text-amber-200">
                  {isRtl ? 'معاينة' : 'Preview'}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Spoken Weather Forecast Feature */}
          <SpeechForecastPlayer
            data={data}
            unit={unit}
            lang={lang}
            period={activePeriod}
          />

          {/* Atmosphere Scene Selector Toggle */}
          <button
            type="button"
            onClick={() => setShowSceneSelector(!showSceneSelector)}
            title={isRtl ? 'التحكم بأجواء السماء (فجر/صباح/غروب/ليل)' : 'Atmospheric Scenes'}
            className={`glass-btn h-11 px-3 rounded-[16px] flex items-center gap-1.5 cursor-pointer text-xs font-semibold shrink-0 ${
              showSceneSelector ? 'bg-white/20 border-white/40 text-white' : 'text-white/85'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">
              {isRtl ? 'الأجواء' : 'Atmosphere'}
            </span>
          </button>

          {/* Quick open widgets button */}
          <button
            type="button"
            onClick={onOpenWidgets}
            title={isRtl ? 'تخصيص مؤشرات الودجات' : 'Customize Pinned Widgets'}
            className="glass-btn h-11 px-3.5 rounded-[16px] flex items-center gap-1.5 cursor-pointer text-white/90 shrink-0 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">
              {isRtl ? 'الودجات' : 'Widgets'}
            </span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title={isRtl ? 'تحديث البيانات' : 'Refresh forecast'}
            className="glass-btn h-11 w-11 rounded-[16px] grid place-items-center cursor-pointer text-white/90 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Atmospheric Scene Selector Bar (When active) */}
      {showSceneSelector && (
        <div className="relative z-20 my-3 p-3 rounded-2xl bg-slate-950/70 border border-white/20 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {isRtl ? 'معاينة أطوار السماء وفترات اليوم:' : 'Atmospheric Diurnal Sky Simulator:'}
            </span>
            {manualPeriod && (
              <button
                type="button"
                onClick={() => onSelectPeriod(null)}
                className="text-[11px] text-cyan-300 hover:underline cursor-pointer"
              >
                {isRtl ? 'العودة للوقت الحقيقي ↺' : 'Sync Real-Time ↺'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectPeriod(null)}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                !manualPeriod
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              ⏱️ {isRtl ? 'تلقائي مباشر' : 'Live Auto'}
            </button>

            {(['fajr', 'sunrise', 'morning', 'asr', 'sunset', 'night'] as DiurnalPeriod[]).map(
              (p) => {
                const info = PERIOD_LABELS[p];
                const isSelected = manualPeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onSelectPeriod(p)}
                    className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{isRtl ? info.ar : info.en}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Main Temperature and Weather Icon */}
      <div className="relative z-10 my-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-baseline font-semibold tracking-tighter text-white select-none">
            <span className="text-7xl sm:text-9xl font-bold leading-none tabular-nums">
              {formatTemperature(current.temperature, unit)}
            </span>
            <span className="text-2xl sm:text-3xl text-white/75 font-normal ml-2 rtl:mr-2">
              °{unit === 'celsius' ? 'C' : 'F'}
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-semibold text-white/95 mt-3 drop-shadow-sm flex items-center gap-2">
            <span>{isRtl ? condition.ar : condition.en}</span>
            <span className="text-sm font-normal text-white/60">
              · {isRtl ? periodInfo.ar : periodInfo.en}
            </span>
          </div>

          <div className="text-white/70 text-sm mt-1 flex flex-wrap items-center gap-2 font-medium">
            <span>
              {isRtl ? 'تشعر وكأنها' : 'Feels like'}{' '}
              <strong className="text-white font-semibold tabular-nums">
                {formatTemperature(current.apparentTemperature, unit)}°
                {unit === 'celsius' ? 'C' : 'F'}
              </strong>
            </span>
            <span className="text-white/30">·</span>
            <span>
              {isRtl ? 'الغطاء السحابي' : 'Cloud cover'}{' '}
              <strong className="text-white font-semibold tabular-nums">
                {current.cloudCover}%
              </strong>
            </span>
          </div>
        </div>

        {/* Big Weather Icon / Graphic */}
        <div className="weather-bob text-7xl sm:text-8xl lg:text-9xl select-none filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
          {condition.icon}
        </div>
      </div>

      {/* Custom Pinned Metrics Section */}
      <div className="relative z-10 pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-medium">
            <Pin className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isRtl ? 'المؤشرات المثبتة (Pinned Metrics)' : 'Pinned Metrics'}</span>
          </div>

          <button
            type="button"
            onClick={onOpenWidgets}
            className="text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>{isRtl ? 'تخصيص' : 'Customize'}</span>
            <span className="text-white/40">({pinnedWidgetIds.length})</span>
          </button>
        </div>

        {/* Dynamic Responsive Grid for Pinned Widgets */}
        <div
          className={`grid gap-3 ${
            pinnedWidgetIds.length <= 4
              ? 'grid-cols-2 sm:grid-cols-4'
              : pinnedWidgetIds.length <= 6
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {pinnedWidgetIds.map((widgetId) => {
            const widget = ALL_METRIC_WIDGETS[widgetId];
            if (!widget) return null;
            const res = widget.getValue(data, unit, lang);

            return (
              <div
                key={widgetId}
                onClick={onOpenWidgets}
                className="rounded-[20px] p-4 bg-white/[0.08] border border-white/[0.12] backdrop-blur-md flex flex-col justify-between hover:bg-white/[0.13] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-white/65 text-xs font-medium mb-2">
                  <span className="truncate group-hover:text-white transition-colors">
                    {isRtl ? widget.labelAr : widget.labelEn}
                  </span>
                  <WidgetIcon iconName={widget.iconName} className={`w-3.5 h-3.5 ${widget.iconColor}`} />
                </div>

                <div className="flex items-baseline justify-between gap-1.5">
                  <div className="flex items-baseline gap-1 min-w-0">
                    <b className="text-lg sm:text-xl font-bold text-white tabular-nums truncate">
                      {res.value}
                    </b>
                    {res.unit && (
                      <span className="text-[11px] text-white/70 font-medium shrink-0">
                        {res.unit}
                      </span>
                    )}
                  </div>

                  {res.badge ? (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: res.badge.bg,
                        color: res.badge.color,
                      }}
                    >
                      {res.badge.text}
                    </span>
                  ) : res.sublabel ? (
                    <span className="text-[10px] text-white/50 font-mono shrink-0 truncate">
                      {res.sublabel}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
