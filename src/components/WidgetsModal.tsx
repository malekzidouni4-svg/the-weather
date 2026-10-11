import React, { useState } from 'react';
import {
  X,
  Pin,
  PinOff,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Wind,
  Gauge,
  Eye,
  SunMedium,
  Thermometer,
  Cloud,
  CloudRain,
  CloudDrizzle,
  ShieldAlert,
  Sunrise,
  Sunset,
  ThermometerSun,
  LayoutGrid,
} from 'lucide-react';
import {
  ALL_METRIC_WIDGETS,
  DEFAULT_PINNED_WIDGETS,
  MetricWidgetDefinition,
  MetricWidgetId,
} from '../types/widgets';
import { Language, TemperatureUnit, WeatherData } from '../types/weather';

interface WidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedIds: MetricWidgetId[];
  onUpdatePinned: (newIds: MetricWidgetId[]) => void;
  weatherData: WeatherData;
  tempUnit: TemperatureUnit;
  lang: Language;
}

export const WidgetIcon: React.FC<{ iconName: string; className?: string }> = ({
  iconName,
  className = 'w-4 h-4',
}) => {
  switch (iconName) {
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'SunMedium':
      return <SunMedium className={className} />;
    case 'Thermometer':
      return <Thermometer className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Sunrise':
      return <Sunrise className={className} />;
    case 'Sunset':
      return <Sunset className={className} />;
    case 'ThermometerSun':
      return <ThermometerSun className={className} />;
    default:
      return <Droplets className={className} />;
  }
};

export const WidgetsModal: React.FC<WidgetsModalProps> = ({
  isOpen,
  onClose,
  pinnedIds,
  onUpdatePinned,
  weatherData,
  tempUnit,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const isRtl = lang === 'ar';

  if (!isOpen) return null;

  const togglePin = (id: MetricWidgetId) => {
    if (pinnedIds.includes(id)) {
      if (pinnedIds.length <= 1) {
        return; // Keep at least one metric pinned
      }
      onUpdatePinned(pinnedIds.filter((p) => p !== id));
    } else {
      if (pinnedIds.length >= 8) {
        return; // Max 8 metrics
      }
      onUpdatePinned([...pinnedIds, id]);
    }
  };

  const moveMetric = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pinnedIds.length) return;
    const next = [...pinnedIds];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onUpdatePinned(next);
  };

  const applyPreset = (preset: 'default' | 'outdoor' | 'air') => {
    if (preset === 'default') {
      onUpdatePinned(DEFAULT_PINNED_WIDGETS);
    } else if (preset === 'outdoor') {
      onUpdatePinned(['uvIndex', 'wind', 'precipProb', 'aqi']);
    } else if (preset === 'air') {
      onUpdatePinned(['aqi', 'pm25', 'pm10', 'humidity']);
    }
  };

  const allWidgetsList = Object.values(ALL_METRIC_WIDGETS);

  const filteredWidgets =
    selectedCategory === 'all'
      ? allWidgetsList
      : allWidgetsList.filter((w) => w.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-white/20 bg-slate-900/90 shadow-2xl p-6 text-white backdrop-blur-2xl flex flex-col justify-between"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 grid place-items-center text-cyan-300">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {isRtl ? 'تخصيص ودمج الودجات (Widgets)' : 'Customize Pinned Metrics (Widgets)'}
                </h2>
                <p className="text-xs text-white/60">
                  {isRtl
                    ? 'اختر وثبّت المؤشرات الجوية المفضلة لعرضها في بطاقة الطقس الرئيسية'
                    : 'Select and pin custom weather data points to your Hero Panel'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Currently Pinned Strip */}
          <div className="rounded-2xl p-4 bg-white/[0.06] border border-white/12 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">
                  {isRtl ? 'المؤشرات المثبتة حالياً:' : 'Currently Pinned:'}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
                  {pinnedIds.length} / 8
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('default')}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {isRtl ? 'الافتراضي' : 'Default'}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('outdoor')}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {isRtl ? 'الأنشطة الخارجية' : 'Outdoor'}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('air')}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {isRtl ? 'جودة الهواء' : 'Air Quality'}
                </button>
              </div>
            </div>

            {/* Pinned Items Reordering */}
            <div className="flex flex-wrap gap-2">
              {pinnedIds.map((id, index) => {
                const widget = ALL_METRIC_WIDGETS[id];
                if (!widget) return null;
                const valueInfo = widget.getValue(weatherData, tempUnit, lang);

                return (
                  <div
                    key={id}
                    className="p-2.5 rounded-xl bg-white/[0.10] border border-white/20 backdrop-blur-md flex items-center gap-2 group transition-all"
                  >
                    <WidgetIcon iconName={widget.iconName} className={`w-3.5 h-3.5 ${widget.iconColor}`} />
                    <span className="text-xs font-semibold text-white">
                      {isRtl ? widget.labelAr : widget.labelEn}
                    </span>
                    <span className="text-xs font-bold text-white/80 tabular-nums ml-1">
                      {valueInfo.value}{valueInfo.unit ? ` ${valueInfo.unit}` : ''}
                    </span>

                    {/* Order Controls */}
                    <div className="flex items-center gap-0.5 ml-2 rtl:mr-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveMetric(index, 'left')}
                          title={isRtl ? 'تحريك للأمام' : 'Move left'}
                          className="p-0.5 hover:text-cyan-300 cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {index < pinnedIds.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveMetric(index, 'right')}
                          title={isRtl ? 'تحريك للخلف' : 'Move right'}
                          className="p-0.5 hover:text-cyan-300 cursor-pointer"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => togglePin(id)}
                        title={isRtl ? 'إلغاء التثبيت' : 'Unpin'}
                        className="p-0.5 hover:text-rose-400 cursor-pointer ml-1 rtl:mr-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30 font-semibold'
                  : 'bg-white/[0.06] text-white/60 hover:text-white'
              }`}
            >
              {isRtl ? 'جميع الودجات (15)' : 'All Widgets (15)'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('atmospheric')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'atmospheric'
                  ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30 font-semibold'
                  : 'bg-white/[0.06] text-white/60 hover:text-white'
              }`}
            >
              {isRtl ? 'الأجواء والرياح' : 'Atmospheric & Wind'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('solar_rain')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'solar_rain'
                  ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30 font-semibold'
                  : 'bg-white/[0.06] text-white/60 hover:text-white'
              }`}
            >
              {isRtl ? 'الشمس والأمطار' : 'Solar & Rain'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('air_quality')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'air_quality'
                  ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30 font-semibold'
                  : 'bg-white/[0.06] text-white/60 hover:text-white'
              }`}
            >
              {isRtl ? 'جودة الهواء' : 'Air Quality'}
            </button>
          </div>

          {/* All Available Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredWidgets.map((widget) => {
              const isPinned = pinnedIds.includes(widget.id);
              const valueInfo = widget.getValue(weatherData, tempUnit, lang);

              return (
                <div
                  key={widget.id}
                  onClick={() => togglePin(widget.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isPinned
                      ? 'bg-white/[0.12] border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                      : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
                        isPinned ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      <WidgetIcon iconName={widget.iconName} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                        <span>{isRtl ? widget.labelAr : widget.labelEn}</span>
                        {valueInfo.badge && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold"
                            style={{
                              backgroundColor: valueInfo.badge.bg,
                              color: valueInfo.badge.color,
                            }}
                          >
                            {valueInfo.badge.text}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5 truncate">
                        {valueInfo.sublabel && (
                          <span className="opacity-75">{valueInfo.sublabel} · </span>
                        )}
                        <span className="font-bold text-white tabular-nums">
                          {valueInfo.value}
                          {valueInfo.unit ? ` ${valueInfo.unit}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pin Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(widget.id);
                    }}
                    className={`w-8 h-8 rounded-xl grid place-items-center transition-colors cursor-pointer shrink-0 ${
                      isPinned
                        ? 'bg-cyan-400 text-slate-950 font-bold'
                        : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onUpdatePinned(DEFAULT_PINNED_WIDGETS)}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'استعادة الافتراضي' : 'Reset to Default'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-cyan-400/20"
          >
            {isRtl ? 'حفظ وإغلاق' : 'Save & Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
