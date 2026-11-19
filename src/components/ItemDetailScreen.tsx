import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  Zap,
  Clock,
  Flame,
  BookOpen,
  Languages,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Star,
  Handshake,
  Check,
} from 'lucide-react';
import type { Language, Product, Profile } from '../types/marketplace';
import { t } from '../i18n/translations';
import { DEFAULT_AVATAR, SAMPLE_REVIEWS } from '../lib/seedData';
import { BishkekMapCard } from './BishkekMapCard';
import { LanguageToggle } from './LanguageToggle';

interface ItemDetailScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  product: Product;
  profile: Profile | null;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onBack: () => void;
  onOpenMeetup: () => void;
  onOpenProfile: () => void;
}

export function ItemDetailScreen({
  lang,
  onChangeLang,
  product,
  profile,
  isSaved,
  onToggleSave,
  onBack,
  onOpenMeetup,
  onOpenProfile,
}: ItemDetailScreenProps) {
  const copy = t(lang);
  const [slide, setSlide] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const images = product.images.length > 0 ? product.images : [DEFAULT_AVATAR];
  const titleText = lang === 'ru' && product.title_ru ? product.title_ru : product.title;
  const descText =
    lang === 'ru' && product.description_ru
      ? product.description_ru
      : product.description;

  const originalPrice =
    product.original_price && product.original_price > product.price
      ? product.original_price
      : Math.round(product.price * 2.5);
  const savings = Math.max(0, originalPrice - product.price);
  const discountPct = Math.round((savings / originalPrice) * 100);

  const formatTimeAgo = (iso: string) => {
    const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return `${mins} ${copy.minsAgo}`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} ${copy.hoursAgo}`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Ignore clipboard failure
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-extrabold text-slate-900 truncate">
            {copy.itemDetailTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle lang={lang} onChange={onChangeLang} compact />
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer"
          >
            <img
              src={profile?.avatar_url || product.seller_avatar || DEFAULT_AVATAR}
              alt="Account"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Smooth Touch-Swipeable Photo Carousel */}
      <div
        className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden select-none"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 35) {
            setSlide((prev) =>
              delta < 0
                ? (prev + 1) % images.length
                : (prev - 1 + images.length) % images.length
            );
          }
          touchStartX.current = null;
        }}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {images.map((src, idx) => (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt={`${titleText} (${idx + 1})`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover shrink-0"
            />
          ))}
        </div>

        {/* Floating Campus Quad Pill */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-slate-900">
            {product.campus_quad || `${product.university} Campus`}
          </span>
        </div>

        {/* Dots & 1/4 Counter Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                slide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/55'
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 backdrop-blur-xs text-white px-2.5 py-0.5 text-[11px] font-bold tabular-nums">
          {slide + 1} / {images.length}
        </div>
      </div>

      {/* Loss Aversion Banner */}
      <div className="bg-gradient-to-r from-[#4ADE80] via-[#6EE7B7] to-[#93C5FD] px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <p className="text-xs font-extrabold text-slate-900 leading-tight">
            {copy.saveBannerPrefix} {savings.toLocaleString()} {copy.som}{' '}
            {copy.saveBannerMid}
          </p>
        </div>
        <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-extrabold text-emerald-800 shrink-0 shadow-2xs tabular-nums">
          {discountPct}% {copy.offLabel}
        </span>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-3.5 space-y-3.5">
        {/* Course Tag & Time */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-[#2563EB] tracking-wide uppercase">
            {product.course_tag || `${product.university} · ${product.category}`}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(product.created_at)}
          </span>
        </div>

        {/* Title, Price, FOMO */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
            {titleText}
          </h2>

          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-2xl font-extrabold text-[#2563EB] tabular-nums">
              {product.price.toLocaleString()}{' '}
              <span className="text-sm font-bold">{copy.som}</span>
            </span>
            <span className="text-sm font-semibold text-slate-400 line-through tabular-nums">
              {originalPrice.toLocaleString()} {copy.som}
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {copy.hardcoverTag}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 pt-0.5">
            <Flame className="w-3.5 h-3.5 shrink-0 fill-rose-500 text-rose-500" />
            <span>
              {product.eyeing_count || 4} {copy.fomoEyeing} ·{' '}
              {product.active_chats_count || 2} {copy.fomoChats}
            </span>
          </div>
        </div>

        {/* 3-Column Spec Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 text-center space-y-1">
            <BookOpen className="w-4 h-4 text-[#2563EB] mx-auto" />
            <div className="text-[10px] font-medium text-slate-400">
              {copy.conditionLabel}
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
              {product.condition_label || 'Super clean! (9.5/10)'}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 text-center space-y-1">
            <Languages className="w-4 h-4 text-[#2563EB] mx-auto" />
            <div className="text-[10px] font-medium text-slate-400">
              {copy.languageLabel}
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
              {product.language_label || 'English (easy read)'}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 text-center space-y-1">
            <Sparkles className="w-4 h-4 text-[#2563EB] mx-auto" />
            <div className="text-[10px] font-medium text-slate-400">
              {copy.markingsLabel}
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
              {product.markings_label || 'Zero doodles or notes ✨'}
            </div>
          </div>
        </div>

        {/* Quick Note from Seller */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1.5">
          <h3 className="text-sm font-extrabold text-slate-900">
            {copy.quickNoteFrom} {product.seller_name} 📖
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">{descText}</p>
        </div>

        {/* Seller Authority Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={product.seller_avatar || DEFAULT_AVATAR}
                  alt={product.seller_name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-slate-900">
                    {product.seller_name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    ✓ {copy.studentVerified}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {product.seller_major} · {product.seller_university} Bishkek
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] font-bold text-slate-700">
                {copy.mannerLabel}{' '}
                <span className="text-rose-600 font-extrabold tabular-nums">
                  {product.seller_manner_temp.toFixed(1)}°C 😊
                </span>
              </div>
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-auto mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, product.seller_manner_temp)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {copy.topSeller}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 px-2.5 py-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <Zap className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span className="truncate">{copy.superFastReplies}</span>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 px-2.5 py-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
              <span className="truncate">4.9 (24 {copy.campusHandoffs})</span>
            </div>
          </div>
        </div>

        {/* Campus Peace of Mind 3-Point Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              {copy.peaceOfMindTitle} 🤝
            </h3>
          </div>

          <div className="space-y-2.5">
            {[
              { title: copy.peace1Title, desc: copy.peace1Desc },
              { title: copy.peace2Title, desc: copy.peace2Desc },
              { title: copy.peace3Title, desc: copy.peace3Desc },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {item.title}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Campus Meetup Spot Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  {copy.favoriteSpotTitle}
                </h3>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                📍 {product.meetup_spot} ({product.university} Campus)
              </p>
            </div>
            <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-[#2563EB] shrink-0">
              {copy.safeZonePill}
            </span>
          </div>

          <BishkekMapCard lang={lang} meetupSpot={product.meetup_spot} />

          <div className="rounded-xl bg-slate-50 border border-slate-200/70 px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {copy.bestTimeToMeet}
            </span>
            <span className="font-bold text-slate-900 text-right">
              {lang === 'ru' ? 'Будни 10:00 – 18:00' : 'Weekdays 10:00 – 18:00'}
            </span>
          </div>
        </div>

        {/* Campus Feedback */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              {copy.campusFeedback} (24)
            </h3>
            <span className="text-xs font-bold text-[#2563EB]">{copy.seeAll}</span>
          </div>

          {SAMPLE_REVIEWS.slice(0, 1).map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-900">
                  {lang === 'ru' ? rev.reviewerRu : rev.reviewerEn}
                </span>
                <div className="flex items-center gap-0.5 text-emerald-500">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 fill-emerald-500" />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {lang === 'ru' ? rev.quoteRu : rev.quoteEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center gap-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          onClick={() => onToggleSave(product.id)}
          aria-label="Bookmark item"
          className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 cursor-pointer transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={onOpenMeetup}
          aria-label="Open chat"
          className="w-11 h-11 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-[#2563EB] shrink-0 cursor-pointer transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenMeetup}
          className="flex-1 h-11 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white px-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Handshake className="w-4 h-4 shrink-0" />
          <span className="text-xs font-extrabold truncate">
            {copy.sayHiPropose}
          </span>
          <span className="text-xs font-extrabold border-l border-white/30 pl-2 tabular-nums shrink-0">
            {product.price.toLocaleString()} {copy.som}
          </span>
        </button>
      </div>
    </div>
  );
}
