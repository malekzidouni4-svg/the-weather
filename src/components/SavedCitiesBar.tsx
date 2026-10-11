import React from 'react';
import { CityLocation, Language } from '../types/weather';
import { X, Sparkles } from 'lucide-react';

interface SavedCitiesBarProps {
  savedCities: CityLocation[];
  activeLocation: CityLocation;
  lang: Language;
  onSelectCity: (city: CityLocation) => void;
  onRemoveCity: (cityName: string) => void;
}

export const SavedCitiesBar: React.FC<SavedCitiesBarProps> = ({
  savedCities,
  activeLocation,
  lang,
  onSelectCity,
  onRemoveCity,
}) => {
  if (savedCities.length === 0) return null;

  const isRtl = lang === 'ar';

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
      <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider shrink-0 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-cyan-300" />
        {isRtl ? 'المدن السريعة:' : 'Quick Locations:'}
      </span>
      {savedCities.map((city) => {
        const isActive =
          Math.abs(city.latitude - activeLocation.latitude) < 0.05 &&
          Math.abs(city.longitude - activeLocation.longitude) < 0.05;

        const displayName = isRtl && city.nameAr ? city.nameAr : city.name;

        return (
          <div
            key={`${city.name}-${city.country}`}
            className={`flex items-center rounded-xl border text-xs font-medium transition-all shrink-0 backdrop-blur-md ${
              isActive
                ? 'bg-white/22 border-white/40 text-white shadow-sm ring-1 ring-white/30'
                : 'bg-white/8 border-white/12 text-white/75 hover:bg-white/16 hover:text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectCity(city)}
              className="px-3 py-1.5 cursor-pointer text-left flex items-center gap-1.5"
            >
              <span>{displayName}</span>
              <span className="text-[10px] text-white/50 font-mono">
                {city.countryCode || city.country.slice(0, 2)}
              </span>
            </button>
            {savedCities.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCity(city.name);
                }}
                title={isRtl ? 'إزالة' : 'Remove'}
                className="pr-2 pl-0.5 py-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
