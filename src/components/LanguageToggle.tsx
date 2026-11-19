import type { Language } from '../types/marketplace';

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
  compact?: boolean;
}

export function LanguageToggle({ lang, onChange, compact = false }: LanguageToggleProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full bg-slate-100 border border-slate-200/80 p-0.5 shrink-0 ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => onChange('ru')}
        className={`px-2.5 py-1 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
          lang === 'ru'
            ? 'bg-white text-[#2563EB] shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        RU
      </button>
      <span className="text-slate-300 text-[10px] select-none" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`px-2.5 py-1 rounded-full font-bold transition-colors whitespace-nowrap cursor-pointer ${
          lang === 'en'
            ? 'bg-white text-[#2563EB] shadow-xs'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        EN
      </button>
    </div>
  );
}
