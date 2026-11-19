import { useState, useRef } from 'react';
import {
  Bell,
  Search,
  SlidersHorizontal,
  Heart,
  Eye,
  MapPin,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  ArrowUpDown,
  BookOpen,
  Laptop,
  LampDesk,
  CheckCircle2,
  Flame,
  Clock,
  Sparkles,
  Database,
} from 'lucide-react';
import type {
  Language,
  Product,
  ProductCategory,
  Profile,
  SortMode,
  UniversityFilter,
} from '../types/marketplace';
import { t } from '../i18n/translations';
import { DEFAULT_AVATAR } from '../lib/seedData';
import { LanguageToggle } from './LanguageToggle';

interface HomeFeedScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  products: Product[];
  loading: boolean;
  profile: Profile | null;
  savedIds: Set<string>;
  onToggleSave: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenProfile: () => void;
  onOpenRegister: () => void;
  onOpenSetupModal: () => void;
  isSupabaseConfigured: boolean;
}

const UNIVERSITIES: { value: UniversityFilter; labelEn: string; labelRu: string }[] = [
  { value: 'ALL', labelEn: 'All Campuses (Bishkek)', labelRu: 'Все вузы (Бишкек)' },
  { value: 'KNU', labelEn: 'KNU (Kyrgyz Nat. Uni)', labelRu: 'КНУ (им. Баласагына)' },
  { value: 'AUCA', labelEn: 'AUCA (American Univ.)', labelRu: 'АУЦА' },
  { value: 'Manas University', labelEn: 'Manas University', labelRu: 'Университет Манас' },
  { value: 'KRSU', labelEn: 'KRSU (Slavic Univ.)', labelRu: 'КРСУ' },
];

export function HomeFeedScreen({
  lang,
  onChangeLang,
  products,
  loading,
  profile,
  savedIds,
  onToggleSave,
  onSelectProduct,
  onOpenProfile,
  onOpenRegister,
  onOpenSetupModal,
  isSupabaseConfigured,
}: HomeFeedScreenProps) {
  const copy = t(lang);
  const [universityFilter, setUniversityFilter] = useState<UniversityFilter>('ALL');
  const [category, setCategory] = useState<ProductCategory>('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [promoIndex, setPromoIndex] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const cycleSort = () => {
    setSortMode((prev) =>
      prev === 'recent' ? 'price_asc' : prev === 'price_asc' ? 'price_desc' : 'recent'
    );
  };

  const sortLabel =
    sortMode === 'recent'
      ? copy.sortRecent
      : sortMode === 'price_asc'
        ? copy.sortPriceAsc
        : copy.sortPriceDesc;

  const filteredProducts = products
    .filter((item) => item.status === 'active')
    .filter((item) =>
      universityFilter === 'ALL' ? true : item.university === universityFilter
    )
    .filter((item) => (category === 'All' ? true : item.category === category))
    .filter((item) => (verifiedOnly ? item.is_verified_seller : true))
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.title_ru || '').toLowerCase().includes(q) ||
        item.meetup_spot.toLowerCase().includes(q) ||
        (item.course_tag || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortMode === 'price_asc') return a.price - b.price;
      if (sortMode === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const promo = copy.promoSlides[promoIndex % copy.promoSlides.length];

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      {/* Top Brand Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-[#2563EB]" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[10px] font-extrabold tracking-wider text-[#2563EB] uppercase truncate">
                {copy.brandSub}
              </div>
              <button
                type="button"
                onClick={() =>
                  setUniversityFilter((prev) => (prev === 'ALL' ? 'KNU' : 'ALL'))
                }
                className="flex items-center gap-1 text-sm font-extrabold text-slate-900 cursor-pointer"
              >
                <span>{copy.marketplaceTitle}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotif((s) => !s)}
                aria-label="Notifications"
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700 relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2">
                  <div className="font-bold text-slate-900">
                    {lang === 'ru' ? 'Уведомления кампуса' : 'Campus Activity'}
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50/70 text-slate-700">
                    {lang === 'ru'
                      ? 'В холле библиотеки КНУ сейчас активно 18 безопасных встреч.'
                      : '18 verified student handoffs scheduled at KNU Library today.'}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={profile ? onOpenProfile : onOpenRegister}
              aria-label="User Profile"
              className="relative w-9 h-9 rounded-full overflow-visible cursor-pointer shrink-0"
            >
              <img
                src={profile?.avatar_url || DEFAULT_AVATAR}
                alt={profile?.nickname || 'Student'}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </span>
            </button>
          </div>
        </div>

        {/* Context Row: University Picker + Verified Badge + RU|EN */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5">
          <div className="relative flex-1 min-w-0">
            <select
              aria-label="Select University"
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value as UniversityFilter)}
              className="w-full appearance-none rounded-full bg-slate-50 border border-slate-200/90 pl-3 pr-7 py-1.5 text-[11px] font-bold text-slate-800 truncate focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              {UNIVERSITIES.map((u) => (
                <option key={u.value} value={u.value}>
                  {lang === 'ru' ? u.labelRu : u.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700 whitespace-nowrap shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            {copy.verifiedBadge}
          </span>

          <LanguageToggle lang={lang} onChange={onChangeLang} compact />
        </div>
      </header>

      <div className="px-4 pt-3 space-y-3.5">
        {/* Supabase Env Notice if unconfigured */}
        {!isSupabaseConfigured && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-amber-900 truncate">
                  {copy.supabaseRequiredTitle}
                </p>
                <p className="text-[10px] text-amber-700 truncate">
                  {copy.supabaseRequiredDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSetupModal}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copy.setupGuideBtn}
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-2xl bg-white border border-slate-200/90 pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
          <button
            type="button"
            onClick={cycleSort}
            aria-label="Filter and sort"
            className="absolute right-2.5 w-7 h-7 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Swipeable Hero Promo Card (1/3) */}
        <div
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > 40) {
              setPromoIndex((prev) =>
                delta < 0
                  ? (prev + 1) % copy.promoSlides.length
                  : (prev - 1 + copy.promoSlides.length) % copy.promoSlides.length
              );
            }
            touchStartX.current = null;
          }}
          onClick={() => setPromoIndex((prev) => (prev + 1) % copy.promoSlides.length)}
          className="relative rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] p-4 text-white overflow-hidden shadow-md shadow-blue-600/20 cursor-pointer select-none"
        >
          {/* Decorative background book silhouette */}
          <BookOpen className="w-28 h-28 text-white/10 absolute -right-4 -bottom-4 rotate-12 pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">
              <Flame className="w-3 h-3 text-amber-300" />
              {promo.tag}
            </span>
            <span className="rounded-full bg-slate-950/30 px-2 py-0.5 text-[10px] font-bold tabular-nums">
              {(promoIndex % copy.promoSlides.length) + 1} / {copy.promoSlides.length}
            </span>
          </div>

          <h2 className="text-lg font-extrabold tracking-tight leading-snug pr-6">
            {promo.title}
          </h2>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-emerald-400 text-slate-950 px-2 py-0.5 text-[10px] font-extrabold">
              {promo.pill}
            </span>
            <span className="text-xs font-medium text-blue-100">· {promo.sub}</span>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {(
            [
              { id: 'All', icon: null },
              { id: 'Textbooks', icon: BookOpen },
              { id: 'Electronics', icon: Laptop },
              { id: 'Dorm Goods', icon: LampDesk },
            ] as const
          ).map(({ id, icon: Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {copy.categories[id]}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
              verifiedOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {copy.verifiedOnly}
          </button>
        </div>

        {/* Listings Header */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-extrabold text-slate-900">
              {copy.campusListings}
            </h2>
            <span className="text-xs font-medium text-slate-400">
              {universityFilter === 'ALL' ? copy.bishkekQuad : universityFilter}
            </span>
          </div>

          <button
            type="button"
            onClick={cycleSort}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
          >
            <span>{sortLabel}</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* 2-Column Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((skeleton) => (
              <div
                key={skeleton}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <Sparkles className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">{copy.emptyFeed}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const isSaved = savedIds.has(product.id);
              const titleText =
                lang === 'ru' && product.title_ru ? product.title_ru : product.title;
              const badgeColor =
                product.badge_type === 'dorm'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-rose-600 text-white';
              const footerTag =
                product.badge_type === 'dorm'
                  ? copy.fastDeal
                  : product.category === 'Electronics'
                    ? copy.verifiedWord
                    : copy.safeSpot;

              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={titleText}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {product.badge_text && (
                      <span
                        className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold shadow-xs max-w-[125px] truncate ${badgeColor}`}
                      >
                        {product.badge_type !== 'dorm' && (
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                        )}
                        <span className="truncate">{product.badge_text}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(product.id);
                      }}
                      aria-label="Save item"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-slate-600 hover:text-rose-500 cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isSaved ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{product.meetup_spot}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                        {titleText}
                      </h3>
                    </div>

                    <div>
                      <div className="text-sm font-extrabold text-[#2563EB] tabular-nums">
                        {product.price.toLocaleString()}{' '}
                        <span className="text-[11px] font-bold">{copy.som}</span>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5">
                            <Heart className="w-3 h-3" />
                            {product.likes_count}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {product.views_count}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-600">{footerTag}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Campus Safe Exchange Zones Banner */}
        <div className="rounded-2xl bg-slate-100/90 border border-slate-200/80 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-slate-900">
              {copy.safeExchangeTitle}
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              {copy.safeExchangeDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
