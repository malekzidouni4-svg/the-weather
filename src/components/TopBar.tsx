import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe, Star, Loader2, X, Bell, LayoutGrid } from 'lucide-react';
import { CityLocation, Language, TemperatureUnit } from '../types/weather';
import { searchCities } from '../services/weatherApi';
import { PermissionState } from '../types/notifications';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  currentLocation: CityLocation;
  unit: TemperatureUnit;
  lang: Language;
  notificationPermission: PermissionState;
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenWidgets?: () => void;
  onSelectCity: (city: CityLocation) => void;
  onToggleUnit: () => void;
  onToggleLang: () => void;
  onLocate: () => void;
  isLocating: boolean;
  isSaved: boolean;
  onToggleSaveCity: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentLocation,
  unit,
  lang,
  notificationPermission,
  unreadAlertsCount,
  onOpenNotifications,
  onOpenWidgets,
  onSelectCity,
  onToggleUnit,
  onToggleLang,
  onLocate,
  isLocating,
  isSaved,
  onToggleSaveCity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced city search
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchCities(searchTerm);
      setResults(cities);
      setIsSearching(false);
      setIsOpen(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityLocation) => {
    onSelectCity(city);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    const cities = await searchCities(searchTerm);
    setIsSearching(false);
    if (cities.length > 0) {
      handleSelect(cities[0]);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[14px] border border-white/20 bg-white/14 backdrop-blur-md grid place-items-center shadow-lg text-lg select-none">
          ◒
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-xl leading-tight">
            Atmos
          </span>
          <span className="text-[11px] text-white/60 tracking-wider font-medium uppercase">
            {isRtl ? 'ذكاء الأرصاد الجوية' : 'Weather Intelligence'}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div ref={dropdownRef} className="flex-1 max-w-xl mx-auto w-full min-w-[260px] relative">
        <form onSubmit={handleManualSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              placeholder={isRtl ? 'ابحث عن مدينة أو عاصمة...' : 'Search city or territory...'}
              className="glass-input h-11 w-full rounded-[15px] px-4 text-sm placeholder:text-white/55 pr-10 focus:ring-1 focus:ring-white/40"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="glass-btn h-11 px-4 rounded-[15px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isRtl ? 'بحث' : 'Search'}</span>
          </button>

          <button
            type="button"
            onClick={onLocate}
            disabled={isLocating}
            title={isRtl ? 'استخدام موقعي الحالي' : 'Use current location'}
            className="glass-btn h-11 w-11 rounded-[15px] grid place-items-center cursor-pointer shrink-0"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/20 bg-slate-900/85 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
            <div className="p-1.5 flex flex-col gap-1">
              {results.map((city, idx) => (
                <button
                  key={`${city.latitude}-${city.longitude}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between hover:bg-white/15 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-white/50 group-hover:text-white transition-colors">📍</span>
                    <span className="font-semibold text-white truncate">{city.name}</span>
                    {city.admin1 && (
                      <span className="text-white/50 text-xs truncate">({city.admin1})</span>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-mono shrink-0 ml-2">
                    {city.countryCode || city.country}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* PWA / Android APK Install Button */}
        <PWAInstallButton lang={lang} />

        {/* Custom Widgets Button */}
        {onOpenWidgets && (
          <button
            type="button"
            onClick={onOpenWidgets}
            title={isRtl ? 'تخصيص الودجات والمؤشرات' : 'Customize Pinned Widgets'}
            className="glass-btn h-11 px-3 rounded-[15px] flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          >
            <LayoutGrid className="w-4 h-4 text-cyan-300" />
            <span className="hidden md:inline">
              {isRtl ? 'الودجات' : 'Widgets'}
            </span>
          </button>
        )}

        {/* Notification Bell Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          title={isRtl ? 'إشعارات وتنبيهات الطقس' : 'Weather Alerts & Notifications'}
          className="glass-btn h-11 px-3 rounded-[15px] flex items-center gap-1.5 cursor-pointer text-xs font-semibold relative"
        >
          <Bell className="w-4 h-4 text-cyan-300" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 shadow-lg animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
          <span className="hidden sm:inline">
            {isRtl ? 'التنبيهات' : 'Alerts'}
          </span>
        </button>

        {/* Star / Favorite current city */}
        <button
          type="button"
          onClick={onToggleSaveCity}
          title={isSaved ? (isRtl ? 'إزالة من المفضلة' : 'Remove from saved') : (isRtl ? 'حفظ في المفضلة' : 'Save location')}
          className={`glass-btn h-11 px-3 rounded-[15px] flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
            isSaved ? 'text-amber-300 border-amber-300/40 bg-amber-300/10' : ''
          }`}
        >
          <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
          <span className="hidden md:inline">
            {isSaved ? (isRtl ? 'محفوظ' : 'Saved') : (isRtl ? 'حفظ' : 'Save')}
          </span>
        </button>

        {/* Temperature unit switch */}
        <button
          type="button"
          onClick={onToggleUnit}
          className="glass-btn h-11 px-3.5 rounded-[15px] text-xs font-bold cursor-pointer tracking-wider"
          title="Toggle Celsius / Fahrenheit"
        >
          {unit === 'celsius' ? '°C' : '°F'}
        </button>

        {/* Language switch */}
        <button
          type="button"
          onClick={onToggleLang}
          className="glass-btn h-11 px-3 rounded-[15px] text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          title={isRtl ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
