import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  X,
  Headphones,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import { WeatherData, TemperatureUnit, Language } from '../types/weather';
import { DiurnalPeriod } from './AtmosphereCanvas';
import {
  generateForecastSpeechScript,
  getAvailableVoices,
  pickBestVoice,
  SpokenForecastReport,
} from '../services/speechForecastService';

interface SpeechForecastPlayerProps {
  data: WeatherData;
  unit: TemperatureUnit;
  lang: Language;
  period: DiurnalPeriod;
}

export const SpeechForecastPlayer: React.FC<SpeechForecastPlayerProps> = ({
  data,
  unit,
  lang,
  period,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [report, setReport] = useState<SpokenForecastReport>(() =>
    generateForecastSpeechScript(data, unit, lang, period)
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isRtl = lang === 'ar';

  // Update script whenever location, weather, or lang changes
  useEffect(() => {
    const updated = generateForecastSpeechScript(data, unit, lang, period);
    setReport(updated);

    // If speaking and city changes, stop speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [data, unit, lang, period]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(isRtl ? 'المتصفح لا يدعم ميزة قراءة الصوت' : 'Speech synthesis not supported');
      return;
    }

    // Cancel existing
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(report.text);
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

    const voices = getAvailableVoices();
    const bestVoice = pickBestVoice(voices, lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsOpen(true);
  };

  const handleTogglePause = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else {
      handleStartSpeech();
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleChangeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      handleStopSpeech();
      setTimeout(handleStartSpeech, 50);
    }
  };

  return (
    <>
      {/* Quick Launch Button in Hero Panel */}
      <button
        type="button"
        onClick={() => {
          if (!isPlaying && !isPaused) {
            handleStartSpeech();
          } else {
            setIsOpen(true);
          }
        }}
        title={isRtl ? 'استمع إلى النشرة الجوية الصوتية' : 'Listen to Spoken Weather Forecast'}
        className={`glass-btn h-11 px-3.5 rounded-[16px] flex items-center gap-2 cursor-pointer text-xs font-semibold shrink-0 transition-all ${
          isPlaying
            ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
            : 'text-white/90 hover:text-white'
        }`}
      >
        {isPlaying ? (
          <div className="flex items-center gap-0.5 h-3.5">
            <span className="w-0.5 h-3 bg-cyan-300 rounded-full animate-pulse" />
            <span className="w-0.5 h-4 bg-cyan-300 rounded-full animate-bounce" />
            <span className="w-0.5 h-2 bg-cyan-300 rounded-full animate-pulse" />
          </div>
        ) : (
          <Headphones className="w-4 h-4 text-cyan-300" />
        )}
        <span>{isRtl ? 'استمع للنشرة' : 'Listen'}</span>
      </button>

      {/* Floating Audio Player Dock / Dialog */}
      {isOpen && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg rounded-[26px] border border-white/20 bg-slate-900/95 shadow-2xl p-5 text-white backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-200"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 grid place-items-center text-cyan-300">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{report.headline}</span>
                  {isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </h4>
                <p className="text-[10px] text-white/50">
                  {isRtl ? 'بصوت الذكاء الاصطناعي عبر Web Speech' : 'Spoken via browser Web Speech synthesis'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transcript Box */}
          <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10 max-h-32 overflow-y-auto mb-3.5 text-xs text-white/80 leading-relaxed font-sans">
            <p>{report.text}</p>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3">
            {/* Playback Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePause}
                className="w-10 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 grid place-items-center font-bold transition-all cursor-pointer shadow-lg shadow-cyan-400/20"
                title={isPlaying ? (isRtl ? 'إيقاف مؤقت' : 'Pause') : isRtl ? 'تشغيل' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5 rtl:mr-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleStopSpeech}
                disabled={!isPlaying && !isPaused}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white grid place-items-center transition-colors cursor-pointer"
                title={isRtl ? 'إيقاف تام' : 'Stop'}
              >
                <Square className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleStartSpeech}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white grid place-items-center transition-colors cursor-pointer"
                title={isRtl ? 'إعادة من البداية' : 'Replay'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Audio Wave Visualizer Animation */}
            {isPlaying && (
              <div className="flex items-center gap-1 h-5 px-3 rounded-full bg-white/5 border border-white/10">
                <span className="w-1 h-3 bg-cyan-300 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-5 bg-cyan-300 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce [animation-delay:450ms]" />
                <span className="w-1 h-3 bg-cyan-300 rounded-full animate-bounce [animation-delay:200ms]" />
              </div>
            )}

            {/* Speed Rate Controls */}
            <div className="flex items-center gap-1 rounded-xl bg-white/[0.08] p-1 border border-white/10 text-[11px] font-mono">
              {[0.9, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleChangeRate(rate)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
