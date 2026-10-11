import React, { useEffect } from 'react';
import { WeatherAlert } from '../types/notifications';
import { Language } from '../types/weather';
import { AlertCircle, AlertTriangle, CloudLightning, X } from 'lucide-react';

interface InAppAlertToastProps {
  alert: WeatherAlert | null;
  onDismiss: () => void;
  onViewLocation: (cityName: string) => void;
  lang: Language;
}

export const InAppAlertToast: React.FC<InAppAlertToastProps> = ({
  alert,
  onDismiss,
  onViewLocation,
  lang,
}) => {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const isRtl = lang === 'ar';

  const severityColors = {
    critical: 'bg-rose-950/85 border-rose-500/40 text-rose-200 shadow-rose-950/40',
    warning: 'bg-amber-950/85 border-amber-500/40 text-amber-200 shadow-amber-950/40',
    info: 'bg-slate-900/90 border-cyan-500/40 text-cyan-200 shadow-cyan-950/40',
  };

  return (
    <div
      className={`fixed top-5 z-50 max-w-md w-[calc(100%-2rem)] transition-all transform animate-in slide-in-from-top-4 duration-300 ${
        isRtl ? 'left-4' : 'right-4'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-start gap-3.5 ${
          severityColors[alert.severity]
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {alert.severity === 'critical' ? (
            <CloudLightning className="w-5 h-5 text-rose-400" />
          ) : alert.severity === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-cyan-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold truncate">
              {isRtl ? alert.titleAr : alert.titleEn}
            </h4>
            <span className="text-[10px] text-white/50 font-mono shrink-0">
              {alert.cityName}
            </span>
          </div>

          <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
            {isRtl ? alert.messageAr : alert.messageEn}
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => {
                onViewLocation(alert.cityName);
                onDismiss();
              }}
              className="text-[11px] font-bold underline underline-offset-2 hover:text-white cursor-pointer"
            >
              {isRtl ? 'عرض تفاصيل المدينة' : 'View City Weather'}
            </button>
            <span className="text-white/30">·</span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-[11px] text-white/60 hover:text-white cursor-pointer"
            >
              {isRtl ? 'تجاهل' : 'Dismiss'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-white/40 hover:text-white transition-colors p-1 -mr-1 -mt-1 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
