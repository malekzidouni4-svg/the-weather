import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CityLocation,
  Language,
  TemperatureUnit,
  WeatherData,
} from './types/weather';
import {
  NotificationSettings,
  PermissionState,
  WeatherAlert,
} from './types/notifications';
import {
  MetricWidgetId,
  DEFAULT_PINNED_WIDGETS,
} from './types/widgets';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  reverseGeocode,
} from './services/weatherApi';
import {
  AtmosphereCanvas,
  DiurnalPeriod,
  calculateDiurnalPeriod,
} from './components/AtmosphereCanvas';
import {
  getBrowserNotificationPermission,
  getStoredNotificationSettings,
  saveNotificationSettings,
  getSavedAlerts,
  saveAlerts,
  evaluateLocationAlerts,
  isAlertRecentlyNotified,
  markAlertAsNotified,
  dispatchBrowserNotification,
} from './services/notificationService';
import { TopBar } from './components/TopBar';
import { SavedCitiesBar } from './components/SavedCitiesBar';
import { HeroPanel } from './components/HeroPanel';
import { AirQualityPanel } from './components/AirQualityPanel';
import { AtmosphericDetailsPanel } from './components/AtmosphericDetailsPanel';
import { HourlyChartPanel } from './components/HourlyChartPanel';
import { ForecastPanel } from './components/ForecastPanel';
import { NotificationModal } from './components/NotificationModal';
import { InAppAlertToast } from './components/InAppAlertToast';
import { WidgetsModal } from './components/WidgetsModal';
import { AlertCircle, Loader2 } from 'lucide-react';

const STORAGE_KEY_UNIT = 'atmos_unit';
const STORAGE_KEY_LANG = 'atmos_lang';
const STORAGE_KEY_CITIES = 'atmos_saved_cities';
const STORAGE_KEY_LAST_CITY = 'atmos_last_city';
const STORAGE_KEY_WIDGETS = 'atmos_pinned_widgets';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem(STORAGE_KEY_UNIT) as TemperatureUnit) || 'celsius';
  });

  const [lang, setLang] = useState<Language>(() => {
    // Default to 'ar' based on user request in Arabic
    return (localStorage.getItem(STORAGE_KEY_LANG) as Language) || 'ar';
  });

  const [savedCities, setSavedCities] = useState<CityLocation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CITIES);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_CITIES;
  });

  const [location, setLocation] = useState<CityLocation>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAST_CITY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_CITIES[0]; // Bouira, Algeria
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isAutoLocating, setIsAutoLocating] = useState<boolean>(false);
  const [hasAttemptedAutoLocate, setHasAttemptedAutoLocate] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Atmospheric Diurnal Period State
  const [diurnalPeriod, setDiurnalPeriod] = useState<DiurnalPeriod>(() => {
    const d = new Date();
    return calculateDiurnalPeriod(d.getHours(), d.getMinutes());
  });
  const [manualPeriod, setManualPeriod] = useState<DiurnalPeriod | null>(null);

  // Notification States
  const [notificationPermission, setNotificationPermission] = useState<PermissionState>(() => {
    return getBrowserNotificationPermission();
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    return getStoredNotificationSettings();
  });
  const [alerts, setAlerts] = useState<WeatherAlert[]>(() => {
    return getSavedAlerts();
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeToastAlert, setActiveToastAlert] = useState<WeatherAlert | null>(null);

  // Custom Pinned Widgets State
  const [pinnedWidgets, setPinnedWidgets] = useState<MetricWidgetId[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WIDGETS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_PINNED_WIDGETS;
  });
  const [isWidgetsModalOpen, setIsWidgetsModalOpen] = useState(false);

  const handleUpdatePinnedWidgets = (newIds: MetricWidgetId[]) => {
    setPinnedWidgets(newIds);
    try {
      localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(newIds));
    } catch {
      // ignore
    }
  };

  // Ref to prevent overlapping alert checks
  const isCheckingAlertsRef = useRef(false);

  // Sync HTML direction attribute
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, [lang]);

  // Sync unit in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_UNIT, unit);
  }, [unit]);

  // Sync saved cities in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CITIES, JSON.stringify(savedCities));
  }, [savedCities]);

  // Update theme color meta tag on Android devices to match diurnal period
  useEffect(() => {
    const themeMeta = document.getElementById('theme-color-meta');
    if (!themeMeta) return;

    const period = manualPeriod || diurnalPeriod;
    const themeColors: Record<DiurnalPeriod, string> = {
      fajr: '#09152b',
      sunrise: '#112845',
      morning: '#163e63',
      midday: '#194e7c',
      asr: '#1f4260',
      sunset: '#1d2b45',
      twilight: '#0e1a33',
      night: '#061120',
    };
    themeMeta.setAttribute('content', themeColors[period] || '#102b48');
  }, [diurnalPeriod, manualPeriod]);

  // Automatic Geolocation on initial application launch
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator && !hasAttemptedAutoLocate) {
      setHasAttemptedAutoLocate(true);
      const hasStoredCity = localStorage.getItem(STORAGE_KEY_LAST_CITY);
      if (!hasStoredCity) {
        setIsAutoLocating(true);
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const resolved = await reverseGeocode(latitude, longitude);
              setLocation(resolved);
            } catch {
              // fallback
            } finally {
              setIsAutoLocating(false);
            }
          },
          () => {
            setIsAutoLocating(false);
          },
          { timeout: 8000, enableHighAccuracy: false }
        );
      }
    }
  }, [hasAttemptedAutoLocate]);

  // Sync notification settings in localStorage
  const handleUpdateSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  // Clear alerts
  const handleClearAlerts = () => {
    setAlerts([]);
    saveAlerts([]);
  };

  // Check alert triggers for a location
  const checkAlertsForLocation = useCallback(
    (targetLocation: CityLocation, data: WeatherData) => {
      if (!notificationSettings.enabled) return;

      const detectedAlerts = evaluateLocationAlerts(
        targetLocation,
        data,
        notificationSettings
      );

      if (detectedAlerts.length === 0) return;

      for (const alert of detectedAlerts) {
        if (!isAlertRecentlyNotified(alert.id)) {
          const title = lang === 'ar' ? alert.titleAr : alert.titleEn;
          const body = lang === 'ar' ? alert.messageAr : alert.messageEn;
          dispatchBrowserNotification(title, body, notificationSettings.sound);

          setActiveToastAlert(alert);
          markAlertAsNotified(alert.id);

          setAlerts((prev) => {
            const next = [alert, ...prev.filter((a) => a.id !== alert.id)].slice(0, 30);
            saveAlerts(next);
            return next;
          });
        }
      }
    },
    [notificationSettings, lang]
  );

  // Background monitor: Periodically scans all saved locations for weather alerts
  const scanAllSavedLocationsForAlerts = useCallback(async () => {
    if (!notificationSettings.enabled || isCheckingAlertsRef.current) return;
    isCheckingAlertsRef.current = true;

    try {
      const citiesToScan = savedCities.slice(0, 5);
      for (const city of citiesToScan) {
        if (
          weatherData &&
          Math.abs(city.latitude - weatherData.location.latitude) < 0.05 &&
          Math.abs(city.longitude - weatherData.location.longitude) < 0.05
        ) {
          checkAlertsForLocation(city, weatherData);
        } else {
          try {
            const data = await fetchWeatherData(city);
            checkAlertsForLocation(city, data);
          } catch {
            // ignore
          }
        }
      }
    } finally {
      isCheckingAlertsRef.current = false;
    }
  }, [savedCities, notificationSettings, weatherData, checkAlertsForLocation]);

  // Periodic interval for scanning saved cities (every 4 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      scanAllSavedLocationsForAlerts();
    }, 4 * 60 * 1000);
    return () => clearInterval(timer);
  }, [scanAllSavedLocationsForAlerts]);

  // Fetch Weather Data for active location
  const loadWeather = useCallback(
    async (targetLocation: CityLocation) => {
      try {
        setErrorMsg(null);
        const data = await fetchWeatherData(targetLocation);
        setWeatherData(data);
        localStorage.setItem(STORAGE_KEY_LAST_CITY, JSON.stringify(targetLocation));

        checkAlertsForLocation(targetLocation, data);
      } catch (err: any) {
        console.error('Failed to load weather data:', err);
        setErrorMsg(
          lang === 'ar'
            ? 'تعذر تحميل بيانات الطقس، جاري استخدام البيانات المخزنة مؤقتاً.'
            : 'Unable to load real-time weather data; using fallback cache.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [lang, checkAlertsForLocation]
  );

  // Initial load or on location change
  useEffect(() => {
    loadWeather(location);
  }, [location, loadWeather]);

  // Geolocation Button Handler
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert(lang === 'ar' ? 'تحديد الموقع غير مدعوم في متصفحك' : 'Geolocation is not supported');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resolved = await reverseGeocode(latitude, longitude);
          setLocation(resolved);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setIsLocating(false);
        setErrorMsg(
          lang === 'ar'
            ? 'تعذر الحصول على إذن الموقع الجغرافي. يرجى تفعيل الموقع في إعدادات الهاتف.'
            : 'Could not access geolocation. Please allow location permissions in device settings.'
        );
      },
      { timeout: 10000 }
    );
  };

  // Toggle Save Current City
  const isCurrentCitySaved = savedCities.some(
    (c) =>
      c.name.toLowerCase() === location.name.toLowerCase() ||
      (Math.abs(c.latitude - location.latitude) < 0.05 &&
        Math.abs(c.longitude - location.longitude) < 0.05)
  );

  const toggleSaveCity = () => {
    if (isCurrentCitySaved) {
      setSavedCities((prev) =>
        prev.filter((c) => c.name.toLowerCase() !== location.name.toLowerCase())
      );
    } else {
      setSavedCities((prev) => [location, ...prev]);
    }
  };

  const removeSavedCity = (cityName: string) => {
    setSavedCities((prev) => prev.filter((c) => c.name !== cityName));
  };

  const handleSelectCityByName = (cityName: string) => {
    const found = savedCities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (found) {
      setLocation(found);
      setIsLoading(true);
    }
  };

  const isRtl = lang === 'ar';
  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen text-[#f7fbff] relative font-sans select-none sm:select-auto">
      {/* Dynamic Animated Atmosphere Canvas (Rain, Snow, Stars, Thunderstorms, Diurnal Sky) */}
      <AtmosphereCanvas
        weatherCode={weatherData?.current.weatherCode ?? 0}
        isDay={weatherData?.current.isDay ?? true}
        lang={lang}
        manualPeriod={manualPeriod}
        onPeriodChange={(p) => setDiurnalPeriod(p)}
      />

      {/* Floating In-App Alert Toast */}
      <InAppAlertToast
        alert={activeToastAlert}
        onDismiss={() => setActiveToastAlert(null)}
        onViewLocation={handleSelectCityByName}
        lang={lang}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setAlerts((prev) => {
            const updated = prev.map((a) => ({ ...a, read: true }));
            saveAlerts(updated);
            return updated;
          });
        }}
        permission={notificationPermission}
        onPermissionChange={setNotificationPermission}
        settings={notificationSettings}
        onSettingsChange={handleUpdateSettings}
        savedCities={savedCities}
        alerts={alerts}
        onClearAlerts={handleClearAlerts}
        onSelectCityByName={handleSelectCityByName}
        lang={lang}
      />

      {/* Widgets Customizer Modal */}
      {weatherData && (
        <WidgetsModal
          isOpen={isWidgetsModalOpen}
          onClose={() => setIsWidgetsModalOpen(false)}
          pinnedIds={pinnedWidgets}
          onUpdatePinned={handleUpdatePinnedWidgets}
          weatherData={weatherData}
          tempUnit={unit}
          lang={lang}
        />
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-3.5 sm:p-7 relative z-10 flex flex-col min-h-screen justify-between pb-8">
        <div>
          {/* Top Bar with PWA / APK, Notifications, Widgets */}
          <TopBar
            currentLocation={location}
            unit={unit}
            lang={lang}
            notificationPermission={notificationPermission}
            unreadAlertsCount={unreadAlertsCount}
            onOpenNotifications={() => setIsNotificationModalOpen(true)}
            onOpenWidgets={() => setIsWidgetsModalOpen(true)}
            onSelectCity={(city) => {
              setLocation(city);
              setIsLoading(true);
            }}
            onToggleUnit={() =>
              setUnit((u) => (u === 'celsius' ? 'fahrenheit' : 'celsius'))
            }
            onToggleLang={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
            onLocate={handleLocate}
            isLocating={isLocating}
            isSaved={isCurrentCitySaved}
            onToggleSaveCity={toggleSaveCity}
          />

          {/* Quick Access Saved Cities Bar */}
          <SavedCitiesBar
            savedCities={savedCities}
            activeLocation={location}
            lang={lang}
            onSelectCity={(city) => {
              setLocation(city);
              setIsLoading(true);
            }}
            onRemoveCity={removeSavedCity}
          />

          {/* Error Banner if any */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-amber-200/60 hover:text-white px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading Skeleton or Main Content */}
          {isLoading && !weatherData ? (
            <div className="min-h-[500px] grid place-items-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-9 h-9 animate-spin text-cyan-300" />
                <span className="text-sm font-semibold tracking-wide text-white/80">
                  {isRtl ? 'جاري قياس البيانات الجوية الحية...' : 'Gathering atmospheric telemetry...'}
                </span>
              </div>
            </div>
          ) : weatherData ? (
            <div className="space-y-5">
              {/* Top Split Layout: Hero Panel (1.45fr) + Side Column (0.9fr) */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.9fr] gap-5 items-stretch">
                {/* Hero Panel */}
                <HeroPanel
                  data={weatherData}
                  unit={unit}
                  lang={lang}
                  onRefresh={() => {
                    setIsRefreshing(true);
                    loadWeather(location);
                  }}
                  isRefreshing={isRefreshing}
                  pinnedWidgetIds={pinnedWidgets}
                  onOpenWidgets={() => setIsWidgetsModalOpen(true)}
                  diurnalPeriod={diurnalPeriod}
                  manualPeriod={manualPeriod}
                  onSelectPeriod={setManualPeriod}
                  isAutoLocating={isAutoLocating}
                />

                {/* Side Panels Column */}
                <div className="flex flex-col gap-5 justify-between">
                  {/* Air Quality Panel */}
                  <AirQualityPanel airQuality={weatherData.airQuality} lang={lang} />

                  {/* Atmospheric Details Panel */}
                  <AtmosphericDetailsPanel
                    data={weatherData}
                    unit={unit}
                    lang={lang}
                  />
                </div>
              </div>

              {/* Bottom Layout: Hourly Chart Panel (1.35fr) + 7-Day Forecast (0.65fr) */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-5 items-stretch">
                {/* Hourly Chart Panel */}
                <HourlyChartPanel
                  hourly={weatherData.hourly}
                  unit={unit}
                  lang={lang}
                />

                {/* 7-Day Outlook */}
                <ForecastPanel
                  daily={weatherData.daily}
                  unit={unit}
                  lang={lang}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 pb-2 text-center text-xs text-white/50 border-t border-white/10 font-medium">
          <p>
            {isRtl
              ? 'Atmos — ذكاء الأرصاد الجوية · واجهة زجاجية متكيفة مع السماء وأطوار اليوم · مجهز لنظام أندرويد و PWA/APK · Open-Meteo'
              : 'Atmos Weather Intelligence · Glass UI · Dynamic Diurnal Sky Simulation · Android PWA/APK Ready · Open-Meteo'}
          </p>
        </footer>
      </div>
    </div>
  );
}
