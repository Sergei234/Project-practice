import { Video, MapPin } from 'lucide-react';
import type { Language } from '../types/marketplace';
import { t } from '../i18n/translations';

interface BishkekMapCardProps {
  lang: Language;
  meetupSpot: string;
}

export function BishkekMapCard({ lang, meetupSpot }: BishkekMapCardProps) {
  const copy = t(lang);

  const isAuca = meetupSpot.toLowerCase().includes('auca') || meetupSpot.toLowerCase().includes('ауца');
  const isManas = meetupSpot.toLowerCase().includes('manas') || meetupSpot.toLowerCase().includes('манас');

  const streetLabel = isAuca
    ? lang === 'ru'
      ? 'Бишкек, ул. Токомбаева 7/6'
      : 'Bishkek, Tokombaev St'
    : isManas
      ? lang === 'ru'
        ? 'Бишкек, пр. Айтматова 56'
        : 'Bishkek, Aitmatov Ave'
      : lang === 'ru'
        ? 'Бишкек, пр. Манаса'
        : 'Bishkek, Manas Ave';

  return (
    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-[#DCEAF7]">
      {/* Stylized vector map of Bishkek campus streets */}
      <svg
        viewBox="0 0 400 160"
        className="w-full h-full object-cover"
        aria-label="Bishkek Campus Safe-Zone Map"
      >
        <rect width="400" height="160" fill="#E3EDF7" />
        {/* Parks & campus green zones */}
        <rect x="26" y="18" width="64" height="38" rx="6" fill="#CBE7D0" />
        <rect x="265" y="22" width="76" height="44" rx="8" fill="#CBE7D0" />
        <rect x="132" y="72" width="54" height="32" rx="5" fill="#D5ECD9" />

        {/* Urban blocks */}
        <rect x="104" y="16" width="44" height="34" rx="4" fill="#EDF3F9" />
        <rect x="158" y="16" width="88" height="38" rx="4" fill="#EDF3F9" />
        <rect x="24" y="68" width="88" height="42" rx="4" fill="#EDF3F9" />
        <rect x="204" y="72" width="82" height="42" rx="4" fill="#EDF3F9" />
        <rect x="298" y="76" width="82" height="40" rx="4" fill="#EDF3F9" />

        {/* Bishkek Main Arteries: Chui Ave, Frunze St, Manas Ave */}
        <path d="M 0 58 L 400 58" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M 0 58 L 400 58" stroke="#F8D27A" strokeWidth="2.5" />
        <path d="M 0 116 L 400 116" stroke="#FFFFFF" strokeWidth="5" />
        <path d="M 192 0 L 192 160" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M 192 0 L 192 160" stroke="#F8D27A" strokeWidth="2" />
        <path d="M 96 0 L 96 160" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M 290 0 L 290 160" stroke="#FFFFFF" strokeWidth="4" />

        {/* District & Street Labels */}
        <text x="112" y="34" fontSize="8" fill="#64748B" fontWeight="600">
          BIRINCHI MAY
        </text>
        <text x="208" y="34" fontSize="8" fill="#64748B" fontWeight="600">
          SVERDLOV DISTRICT
        </text>
        <text x="152" y="88" fontSize="13" fill="#1E293B" fontWeight="800">
          Bishkek
        </text>
        <text x="155" y="102" fontSize="11" fill="#334155" fontWeight="700">
          Бишкек
        </text>
        <text x="204" y="54" fontSize="7.5" fill="#475569" fontWeight="600">
          Chui Ave
        </text>
        <text x="197" y="132" fontSize="7.5" fill="#475569" fontWeight="600">
          Manas Ave
        </text>
        <text x="28" y="40" fontSize="7.5" fill="#15803D" fontWeight="700">
          KNU Quad
        </text>
        <text x="276" y="46" fontSize="7.5" fill="#15803D" fontWeight="700">
          Ala-Too Sq
        </text>
      </svg>

      {/* Safe-Zone Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 flex flex-col items-center pointer-events-none">
        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md border-2 border-white">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Scrim Bottom Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-900/55 to-transparent px-3 py-2 flex items-center justify-between text-[11px] text-white">
        <span className="inline-flex items-center gap-1.5 font-semibold truncate">
          <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{copy.cctvActive}</span>
        </span>
        <span className="text-slate-200 font-medium shrink-0 ml-2">{streetLabel}</span>
      </div>
    </div>
  );
}
