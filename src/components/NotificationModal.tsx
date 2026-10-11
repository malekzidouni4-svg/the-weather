import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  VolumeX,
  CloudLightning,
  CloudRain,
  Wind,
  ShieldAlert,
  ThermometerSnowflake,
  Trash2,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  NotificationSettings,
  PermissionState,
  WeatherAlert,
} from '../types/notifications';
import { Language, CityLocation } from '../types/weather';
import {
  dispatchBrowserNotification,
  playAlertChime,
  requestBrowserNotificationPermission,
} from '../services/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: PermissionState;
  onPermissionChange: (perm: PermissionState) => void;
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  savedCities: CityLocation[];
  alerts: WeatherAlert[];
  onClearAlerts: () => void;
  onSelectCityByName?: (cityName: string) => void;
  lang: Language;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  permission,
  onPermissionChange,
  settings,
  onSettingsChange,
  savedCities,
  alerts,
  onClearAlerts,
  onSelectCityByName,
  lang,
}) => {
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const isRtl = lang === 'ar';

  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    onPermissionChange(perm);
    if (perm === 'granted') {
      dispatchBrowserNotification(
        isRtl ? '🔔 تم تفعيل إشعارات Atmos' : '🔔 Atmos Weather Alerts Enabled',
        isRtl
          ? 'ستتلقى إشعارات فورية عند حدوث تغيرات مناخية هامة في مدنك المحفوظة.'
          : 'You will now receive alerts for significant weather events in your saved locations.',
        settings.sound
      );
    }
  };

  const handleSendTest = () => {
    const testTitle = isRtl
      ? '⚡ تنبيه تجريبي: عواصف رعدية في البويرة'
      : '⚡ Test Alert: Thunderstorms approaching';
    const testBody = isRtl
      ? 'هذا إشعار تجريبي لاختبار نظام التنبيهات والأصوات بنجاح في تطبيق Atmos.'
      : 'This is a test notification verifying your atmospheric alert setup in Atmos.';

    dispatchBrowserNotification(testTitle, testBody, settings.sound);
    if (settings.sound && permission !== 'granted') {
      playAlertChime();
    }
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/20 bg-slate-900/90 shadow-2xl p-6 text-white backdrop-blur-2xl flex flex-col justify-between"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 grid place-items-center text-cyan-300">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {isRtl ? 'إشعارات وتنبيهات الطقس' : 'Weather Alerts & Notifications'}
                </h2>
                <p className="text-xs text-white/60">
                  {isRtl
                    ? 'تنبيهات فورية عند حدوث تغيرات مناخية في مدنك المحفوظة'
                    : 'Real-time alerts for critical shifts in your saved locations'}
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

          {/* Browser Permission Status Card */}
          <div className="rounded-2xl p-4 bg-white/[0.06] border border-white/12 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {permission === 'granted' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : permission === 'denied' ? (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>
                      {permission === 'granted'
                        ? isRtl
                          ? 'إشعارات المتصفح مفعلة'
                          : 'Browser Notifications Active'
                        : permission === 'denied'
                        ? isRtl
                          ? 'الإشعارات محظورة في المتصفح'
                          : 'Notifications Blocked in Browser'
                        : isRtl
                        ? 'إذن الإشعارات مطلوب'
                        : 'Notification Permission Needed'}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        permission === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : permission === 'denied'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {permission}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    {permission === 'granted'
                      ? isRtl
                        ? 'سيقوم Atmos بإرسال إشعارات سطح المكتب حتى لو كان التطبيق في الخلفية.'
                        : 'Atmos can alert you with desktop notifications even when in the background.'
                      : permission === 'denied'
                      ? isRtl
                        ? 'يرجى النقر على أيقونة القفل في شريط العنوان لتفعيل الإشعارات.'
                        : 'Please grant notification access via your browser address bar settings.'
                      : isRtl
                      ? 'انقر لتفعيل تنبيهات المتصفح وتلقي التحذيرات المناخية.'
                      : 'Grant browser permission to receive desktop atmospheric alerts.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto rtl:mr-auto">
                {permission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {isRtl ? 'تفعيل الإشعارات' : 'Enable Notifications'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSendTest}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {testSent
                      ? isRtl
                        ? 'تم الإرسال!'
                        : 'Sent!'
                      : isRtl
                      ? 'إشعار تجريبي'
                      : 'Test Alert'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Alert Category Thresholds */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
              {isRtl ? 'شروط وقواعد التنبيه:' : 'Alert Trigger Criteria:'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Severe weather */}
              <div
                onClick={() => toggleSetting('severeWeather')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  settings.severeWeather
                    ? 'bg-white/[0.08] border-cyan-400/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CloudLightning className="w-4 h-4 text-amber-300 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold">
                      {isRtl ? 'عواصف وثلوج قاسية' : 'Severe Storms & Snow'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {isRtl ? 'عواصف رعدية، أمطار طوفانية، ثلوج' : 'Thunderstorms, torrential rain'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.severeWeather}
                  onChange={() => {}}
                  className="rounded accent-cyan-400"
                />
              </div>

              {/* Rain Soon */}
              <div
                onClick={() => toggleSetting('incomingRain')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  settings.incomingRain
                    ? 'bg-white/[0.08] border-cyan-400/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CloudRain className="w-4 h-4 text-cyan-300 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold">
                      {isRtl ? 'أمطار وشيكة (< 3 ساعات)' : 'Incoming Rain (< 3h)'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {isRtl ? 'احتمال هطول > 60%' : 'Rain chance > 60% approaching'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.incomingRain}
                  onChange={() => {}}
                  className="rounded accent-cyan-400"
                />
              </div>

              {/* High Wind */}
              <div
                onClick={() => toggleSetting('highWind')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  settings.highWind
                    ? 'bg-white/[0.08] border-cyan-400/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Wind className="w-4 h-4 text-teal-300 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold">
                      {isRtl ? 'رياح عاتية (> 35 كم/س)' : 'High Winds (> 35 km/h)'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {isRtl ? 'عواصف وهوامش رياح قوية' : 'Strong wind gusts and storms'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highWind}
                  onChange={() => {}}
                  className="rounded accent-cyan-400"
                />
              </div>

              {/* Poor Air Quality */}
              <div
                onClick={() => toggleSetting('poorAirQuality')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  settings.poorAirQuality
                    ? 'bg-white/[0.08] border-cyan-400/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold">
                      {isRtl ? 'جودة هواء رديئة (AQI > 100)' : 'Poor Air Quality (AQI > 100)'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {isRtl ? 'تلوث وتأثير على الفئات الحساسة' : 'Pollution exceeding safe limits'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.poorAirQuality}
                  onChange={() => {}}
                  className="rounded accent-cyan-400"
                />
              </div>

              {/* Extreme Temps */}
              <div
                onClick={() => toggleSetting('tempFluctuations')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  settings.tempFluctuations
                    ? 'bg-white/[0.08] border-cyan-400/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ThermometerSnowflake className="w-4 h-4 text-blue-300 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold">
                      {isRtl ? 'صقيع أو موجات حر' : 'Freezing & Heatwaves'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {isRtl ? 'درجات حرارة ≤ 0°م أو ≥ 38°م' : 'Temperatures ≤ 0°C or ≥ 38°C'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.tempFluctuations}
                  onChange={() => {}}
                  className="rounded accent-cyan-400"
                />
              </div>

              {/* Audio Chime */}
              <div
                onClick={() => toggleSetting('sound')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  settings.sound
                    ? 'bg-white/[0.08] border-cyan-400/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {settings.sound ? (
                    <Volume2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white/40 shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="text-xs font-semibold">
                      {isRtl ? 'نغمة صوتية عند التنبيه' : 'Sound Chime on Alert'}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {isRtl ? 'نغمة صوتية خفيفة' : 'Audible atmospheric ping'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={() => {}}
                  className="rounded accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Monitored Saved Locations */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
              {isRtl ? 'المدن المشمولة بالمراقبة:' : 'Monitored Locations:'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {savedCities.map((city) => (
                <span
                  key={city.name}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white/80 font-medium flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{isRtl && city.nameAr ? city.nameAr : city.name}</span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {city.countryCode || city.country}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Recent Alerts Feed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                {isRtl ? 'سجل التنبيهات الأخيرة:' : 'Recent Alerts History:'}
              </h3>
              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAlerts}
                  className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isRtl ? 'مسح السجل' : 'Clear'}</span>
                </button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-center text-xs text-white/45">
                {isRtl
                  ? 'لا توجد تنبيهات نشطة حالياً. الأجواء مستقرة في جميع مدنك المحفوظة.'
                  : 'No active weather alerts. Atmospheric conditions are stable across all saved cities.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      if (onSelectCityByName) onSelectCityByName(alert.cityName);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-colors ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/15 border-rose-400/30 text-rose-200 hover:bg-rose-500/25'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/15 border-amber-400/30 text-amber-200 hover:bg-amber-500/25'
                        : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/25'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{isRtl ? alert.titleAr : alert.titleEn}</span>
                      <span className="text-[10px] font-mono opacity-60">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed text-[11px]">
                      {isRtl ? alert.messageAr : alert.messageEn}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
