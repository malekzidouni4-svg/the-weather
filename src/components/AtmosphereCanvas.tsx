import React, { useEffect, useRef, useState } from 'react';
import { WeatherConditionInfo } from '../utils/weatherUtils';
import { Sparkles, Eye } from 'lucide-react';
import { Language } from '../types/weather';

export type DiurnalPeriod =
  | 'fajr'
  | 'sunrise'
  | 'morning'
  | 'midday'
  | 'asr'
  | 'sunset'
  | 'twilight'
  | 'night';

interface AtmosphereCanvasProps {
  weatherCode: number;
  isDay: boolean;
  lang: Language;
  manualPeriod?: DiurnalPeriod | null;
  onPeriodChange?: (period: DiurnalPeriod) => void;
}

export function calculateDiurnalPeriod(hour: number, minute: number = 0): DiurnalPeriod {
  const time = hour + minute / 60;
  if (time >= 4.5 && time < 6.25) return 'fajr';
  if (time >= 6.25 && time < 8.0) return 'sunrise';
  if (time >= 8.0 && time < 12.0) return 'morning';
  if (time >= 12.0 && time < 15.5) return 'midday';
  if (time >= 15.5 && time < 18.0) return 'asr';
  if (time >= 18.0 && time < 19.5) return 'sunset';
  if (time >= 19.5 && time < 21.0) return 'twilight';
  return 'night';
}

export const PERIOD_LABELS: Record<DiurnalPeriod, { en: string; ar: string; icon: string }> = {
  fajr: { en: 'Dawn (Fajr)', ar: 'الفجر', icon: '🌌' },
  sunrise: { en: 'Sunrise', ar: 'الشروق', icon: '🌅' },
  morning: { en: 'Morning', ar: 'الصباح', icon: '☀️' },
  midday: { en: 'Midday (Zuhr)', ar: 'الظهيرة', icon: '☀️' },
  asr: { en: 'Afternoon (Asr)', ar: 'العصر', icon: '🌤️' },
  sunset: { en: 'Sunset (Maghrib)', ar: 'الغروب', icon: '🌇' },
  twilight: { en: 'Twilight (Isha)', ar: 'الشفق', icon: '🌆' },
  night: { en: 'Night', ar: 'الليل', icon: '🌙' },
};

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  weatherCode,
  isDay,
  lang,
  manualPeriod,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<DiurnalPeriod>(() => {
    const d = new Date();
    return calculateDiurnalPeriod(d.getHours(), d.getMinutes());
  });

  const activePeriod = manualPeriod || currentPeriod;
  const isRtl = lang === 'ar';

  // Update period automatically every 5 minutes
  useEffect(() => {
    const updateTimePeriod = () => {
      const d = new Date();
      setCurrentPeriod(calculateDiurnalPeriod(d.getHours(), d.getMinutes()));
    };
    updateTimePeriod();
    const interval = setInterval(updateTimePeriod, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine weather type
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode);
  const isStorm = [95, 96, 97].includes(weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isFog = [45, 48].includes(weatherCode);
  const isCloudy = [2, 3].includes(weatherCode) && !isRain && !isStorm && !isSnow;
  const isClear = [0, 1].includes(weatherCode) && !isRain && !isStorm;

  // Compute rich dynamic background gradient based on period AND weather
  const getAtmosphereGradient = (): string => {
    // Severe storm override
    if (isStorm) {
      return 'linear-gradient(135deg, #090e18 0%, #171f2c 45%, #2a2238 100%)';
    }
    // Rain override
    if (isRain) {
      if (activePeriod === 'night' || activePeriod === 'twilight') {
        return 'linear-gradient(135deg, #07111e 0%, #152435 50%, #1c3247 100%)';
      }
      return 'linear-gradient(135deg, #142436 0%, #29425a 50%, #4a6782 100%)';
    }
    // Snow override
    if (isSnow) {
      return 'linear-gradient(135deg, #162438 0%, #2f4968 50%, #7697b8 100%)';
    }
    // Fog override
    if (isFog) {
      return 'linear-gradient(135deg, #1b2633 0%, #374657 50%, #5d6e80 100%)';
    }

    // Diurnal periods
    switch (activePeriod) {
      case 'fajr':
        return 'linear-gradient(135deg, #09152b 0%, #1a2f4c 45%, #c87563 100%)';
      case 'sunrise':
        return 'linear-gradient(135deg, #112845 0%, #305473 45%, #ea9a65 85%, #fcd37a 100%)';
      case 'morning':
        return 'linear-gradient(135deg, #163e63 0%, #3d7ea3 48%, #dfb46c 100%)';
      case 'midday':
        return 'linear-gradient(135deg, #194e7c 0%, #4992bb 50%, #eac277 100%)';
      case 'asr':
        return 'linear-gradient(135deg, #1f4260 0%, #4a6c82 45%, #d9935f 85%, #efba6d 100%)';
      case 'sunset':
        return 'linear-gradient(135deg, #1d2b45 0%, #5a2c42 45%, #ea6344 80%, #f7a859 100%)';
      case 'twilight':
        return 'linear-gradient(135deg, #0e1a33 0%, #26294a 50%, #5b3f5e 100%)';
      case 'night':
      default:
        return 'linear-gradient(135deg, #061120 0%, #0d1e34 50%, #1a2c47 100%)';
    }
  };

  // Canvas particle simulation (Rain, Snow, Stars, Clouds, Lightning)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Rain Particles
    const rainDrops: Array<{ x: number; y: number; l: number; v: number; op: number }> = [];
    if (isRain || isStorm) {
      const dropCount = isStorm ? 180 : 110;
      for (let i = 0; i < dropCount; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          l: 12 + Math.random() * 18,
          v: 14 + Math.random() * 12,
          op: 0.25 + Math.random() * 0.45,
        });
      }
    }

    // Snow Particles
    const snowflakes: Array<{ x: number; y: number; r: number; v: number; sway: number; swaySpeed: number }> = [];
    if (isSnow) {
      for (let i = 0; i < 90; i++) {
        snowflakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.5 + Math.random() * 3.5,
          v: 1 + Math.random() * 2,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.02 + Math.random() * 0.03,
        });
      }
    }

    // Stars Particles (Active during Night, Fajr, Twilight)
    const stars: Array<{ x: number; y: number; r: number; alpha: number; speed: number }> = [];
    if (['night', 'fajr', 'twilight'].includes(activePeriod) && !isRain && !isStorm && !isCloudy && !isFog) {
      for (let i = 0; i < 85; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.8),
          r: 0.6 + Math.random() * 1.6,
          alpha: 0.2 + Math.random() * 0.8,
          speed: 0.005 + Math.random() * 0.015,
        });
      }
    }

    // Shooting star state
    let shootingStar: { x: number; y: number; len: number; vx: number; vy: number; life: number } | null = null;
    let shootingStarTimer = 0;

    // Lightning Flash State (for Storm)
    let lightningOpacity = 0;

    // Volumetric Cloud Patches
    const cloudPatches = [
      { x: -100, y: height * 0.15, r: 240, vx: 0.25, op: 0.06 },
      { x: width * 0.4, y: height * 0.25, r: 300, vx: 0.2, op: 0.08 },
      { x: width * 0.8, y: height * 0.1, r: 260, vx: 0.18, op: 0.07 },
    ];

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Stars
      if (stars.length > 0) {
        ctx.fillStyle = '#ffffff';
        for (const s of stars) {
          s.alpha += Math.sin(tick * s.speed) * 0.015;
          const a = Math.max(0.15, Math.min(0.95, s.alpha));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.fill();
        }

        // Random occasional shooting star
        shootingStarTimer++;
        if (shootingStarTimer > 400 && Math.random() < 0.008 && !shootingStar) {
          shootingStar = {
            x: Math.random() * width * 0.7,
            y: Math.random() * height * 0.35,
            len: 80,
            vx: 8 + Math.random() * 4,
            vy: 4 + Math.random() * 2,
            life: 1,
          };
          shootingStarTimer = 0;
        }

        if (shootingStar) {
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(shootingStar.x - shootingStar.vx * 4, shootingStar.y - shootingStar.vy * 4);
          ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.life * 0.75})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          shootingStar.x += shootingStar.vx;
          shootingStar.y += shootingStar.vy;
          shootingStar.life -= 0.035;
          if (shootingStar.life <= 0) shootingStar = null;
        }
      }

      // 2. Draw Clouds / Mist
      if (isCloudy || isRain || isStorm || isFog) {
        for (const cp of cloudPatches) {
          cp.x += cp.vx;
          if (cp.x - cp.r > width) cp.x = -cp.r * 2;

          const grad = ctx.createRadialGradient(cp.x, cp.y, cp.r * 0.1, cp.x, cp.y, cp.r);
          grad.addColorStop(0, `rgba(255, 255, 255, ${cp.op * (isStorm ? 0.4 : 1)})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, cp.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Rain
      if (rainDrops.length > 0) {
        ctx.strokeStyle = 'rgba(210, 235, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (const drop of rainDrops) {
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 3, drop.y + drop.l);

          drop.y += drop.v;
          drop.x -= 1.5; // subtle slant

          if (drop.y > height) {
            drop.y = -drop.l;
            drop.x = Math.random() * (width + 100);
          }
        }
        ctx.stroke();
      }

      // 4. Draw Snow
      if (snowflakes.length > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (const f of snowflakes) {
          f.sway += f.swaySpeed;
          f.x += Math.sin(f.sway) * 0.8;
          f.y += f.v;

          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw Thunderstorm Lightning Flash
      if (isStorm) {
        if (Math.random() < 0.006 && lightningOpacity <= 0) {
          lightningOpacity = 0.55 + Math.random() * 0.35;
        }

        if (lightningOpacity > 0) {
          ctx.fillStyle = `rgba(225, 235, 255, ${lightningOpacity})`;
          ctx.fillRect(0, 0, width, height);
          lightningOpacity -= 0.04;
        }
      }

      // 6. Draw Sunbeams (for Clear Day during Morning / Midday / Asr)
      if (isClear && ['morning', 'midday', 'sunrise', 'asr'].includes(activePeriod)) {
        const sunX = width * 0.82;
        const sunY = height * 0.15;
        const rayRadius = Math.max(width, height) * 0.7;

        const sunGrad = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, rayRadius);
        sunGrad.addColorStop(0, 'rgba(255, 240, 200, 0.14)');
        sunGrad.addColorStop(0.35, 'rgba(255, 220, 160, 0.06)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, rayRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRain, isStorm, isSnow, isCloudy, isFog, isClear, activePeriod]);

  const bgStyle = getAtmosphereGradient();

  return (
    <>
      {/* Background Gradient Layer */}
      <div
        className="fixed inset-0 -z-30 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{ background: bgStyle }}
      />

      {/* Atmospheric Canvas for Rain, Snow, Stars, Lightning */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-20 pointer-events-none w-full h-full"
      />

      {/* Ambient Blur Depth Orbs */}
      <div className="atmosphere-orbs" />
    </>
  );
};
