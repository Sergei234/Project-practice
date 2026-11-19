import { Home, Plus, User } from 'lucide-react';
import type { Language, ScreenName } from '../types/marketplace';
import { t } from '../i18n/translations';

interface BottomNavProps {
  lang: Language;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  isVerified: boolean;
}

export function BottomNav({ lang, activeScreen, onNavigate, isVerified }: BottomNavProps) {
  const copy = t(lang);

  return (
    <nav
      aria-label="Primary bottom navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 pt-1.5 pb-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
    >
      <div className="grid grid-cols-3 items-end">
        {/* Home Tab */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            activeScreen === 'home' ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={activeScreen === 'home' ? 2.4 : 2} />
          <span className="text-[11px] font-semibold mt-1 whitespace-nowrap">
            {copy.navHome}
          </span>
        </button>

        {/* Center Elevated Sell (+) Button */}
        <div className="flex flex-col items-center justify-end -mt-5">
          <button
            type="button"
            onClick={() => onNavigate('sell')}
            aria-label={copy.navSell}
            className="w-13 h-13 rounded-full bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 ring-4 ring-white transition-all cursor-pointer"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <span
            className={`text-[11px] font-bold mt-1 whitespace-nowrap ${
              activeScreen === 'sell' ? 'text-[#2563EB]' : 'text-[#2563EB]'
            }`}
          >
            {copy.navSell}
          </span>
        </div>

        {/* My Page Tab */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
            activeScreen === 'profile' ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" strokeWidth={activeScreen === 'profile' ? 2.4 : 2} />
            <span
              className={`absolute -top-1.5 -right-2.5 text-[8px] font-extrabold px-1 py-0.2 rounded-full leading-tight ${
                isVerified
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-100 text-[#2563EB]'
              }`}
            >
              ID
            </span>
          </div>
          <span className="text-[11px] font-semibold mt-1 whitespace-nowrap">
            {copy.navMyPage}
          </span>
        </button>
      </div>
    </nav>
  );
}
