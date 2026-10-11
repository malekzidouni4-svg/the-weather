import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types/weather';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const isRtl = lang === 'ar';

  // If already running standalone on Android / iOS
  if (isInstalled) {
    return (
      <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{isRtl ? 'مثبت على الجهاز' : 'App Installed'}</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title={isRtl ? 'تثبيت التطبيق أو تحويله إلى APK' : 'Install App or Export APK'}
        className="glass-btn h-11 px-3.5 rounded-[15px] flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-cyan-200 border-cyan-400/30 hover:border-cyan-300 hover:text-white"
      >
        <Smartphone className="w-4 h-4 text-cyan-300" />
        <span className="hidden sm:inline">
          {isRtl ? 'تثبيت التطبيق / APK' : 'Install App / APK'}
        </span>
      </button>

      {/* APK & Install Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/20 bg-slate-900/95 shadow-2xl p-6 text-white backdrop-blur-2xl flex flex-col justify-between"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 grid place-items-center text-cyan-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isRtl ? 'تشغيل التطبيق على أندرويد و APK' : 'Run on Android & Export to APK'}
                    </h3>
                    <p className="text-xs text-white/60">
                      {isRtl ? 'تطبيق ويب تقدمي (PWA) قابل للتثبيت كحزمة أندرويد مستقلة' : 'Installable PWA ready for Android & APK generation'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Direct 1-tap install if available */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isRtl ? 'تثبيت فوري على شاشة الهاتف' : 'Instant 1-Tap Home Screen Install'}
                    </div>
                    <div className="text-[11px] text-white/70 mt-0.5">
                      {isRtl ? 'يعمل بدون شريط المتصفح كتطبيق أصلي مع دعم عدم الاتصال' : 'Runs standalone full-screen with offline support'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      setShowModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-lg shadow-cyan-400/25"
                  >
                    {isRtl ? 'تثبيت الآن' : 'Install Now'}
                  </button>
                </div>
              )}

              {/* Steps for Android / Chrome */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10">
                  <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] grid place-items-center font-bold">1</span>
                    {isRtl ? 'التثبيت المباشر على نظام أندرويد (Chrome / Samsung):' : 'Direct Install on Android (Chrome / Samsung):'}
                  </h4>
                  <p className="text-white/75 leading-relaxed">
                    {isRtl
                      ? 'اضغط على زر القائمة (⋮) أعلى متصفح Chrome في هاتفك، ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية" (Add to Home screen). سيتحول فوراً لتطبيق مستقل بأيقونته الخاصة.'
                      : 'Tap the (⋮) menu in Chrome on Android, then select "Install app" or "Add to Home screen". It installs directly with its own app icon.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10">
                  <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-400/20 text-teal-300 text-[11px] grid place-items-center font-bold">2</span>
                    {isRtl ? 'التحويل إلى ملف APK مخصص لمتجر Google Play:' : 'Convert into standalone APK for Google Play:'}
                  </h4>
                  <p className="text-white/75 leading-relaxed mb-2">
                    {isRtl
                      ? 'الكود مجهز بالكامل بملف الـ Manifest والـ Service Worker والأيقونات القياسية. لتحويله لملف .apk يمكنك استخدام:'
                      : 'The code includes complete Web App Manifest, Service Worker, and compliant icons. To build a native .apk file:'}
                  </p>
                  <div className="space-y-1.5 text-[11px] font-mono text-cyan-300 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                    <div>• <strong>PWABuilder:</strong> pwabuilder.com (توليد APK بنقرة واحدة)</div>
                    <div>• <strong>Bubblewrap (Google CLI):</strong> npx @bubblewrap/cli build</div>
                    <div>• <strong>Capacitor:</strong> npx cap add android &amp;&amp; npx cap build</div>
                  </div>
                </div>

                {isIOS && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10">
                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                      <span>🍎</span>
                      {isRtl ? 'لأجهزة iPhone / iPad (Safari):' : 'For iPhone / iPad (Safari):'}
                    </h4>
                    <p className="text-white/75 leading-relaxed">
                      {isRtl
                        ? 'اضغط على زر المشاركة (Share) في أسفل الشاشة، ثم مرر واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                        : 'Tap the Share button in Safari, then scroll down and tap "Add to Home Screen".'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {isRtl ? 'حسناً، فهمت' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
