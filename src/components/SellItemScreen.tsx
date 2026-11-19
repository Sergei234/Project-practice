import { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  X,
  PiggyBank,
  Camera,
  CheckCircle2,
  BookOpen,
  Laptop,
  LampDesk,
  Package,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Rocket,
  AlertCircle,
} from 'lucide-react';
import type { Language, ProductCategory, Profile } from '../types/marketplace';
import { t } from '../i18n/translations';
import { CAMPUS_SAFE_ZONES, DEFAULT_AVATAR } from '../lib/seedData';
import { LanguageToggle } from './LanguageToggle';
import {
  supabase,
  isSupabaseConfigured,
  uploadImageToSupabase,
} from '../lib/supabase';

interface SellItemScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  profile: Profile | null;
  onBack: () => void;
  onRequireAuth: () => void;
  onPublished: () => Promise<void>;
}

export function SellItemScreen({
  lang,
  onChangeLang,
  profile,
  onBack,
  onRequireAuth,
  onPublished,
}: SellItemScreenProps) {
  const copy = t(lang);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'All'>>('Textbooks');
  const [price, setPrice] = useState('');
  const [meetupSpot, setMeetupSpot] = useState(CAMPUS_SAFE_ZONES[0].shortEn);
  const [description, setDescription] = useState('');
  const [pledgeAccepted, setPledgeAccepted] = useState(true);
  const [trustBoosted, setTrustBoosted] = useState(false);
  const [draftMsg, setDraftMsg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5 - files.length);
    if (selected.length === 0) return;

    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, String(reader.result)].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    setPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setError(
        lang === 'ru'
          ? 'Подключите Supabase (VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY) для публикации товаров.'
          : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to publish listings.'
      );
      return;
    }

    if (!profile) {
      onRequireAuth();
      return;
    }

    if (!title.trim()) {
      setError(
        lang === 'ru' ? 'Введите название товара.' : 'Please enter an item title.'
      );
      return;
    }

    if (!pledgeAccepted) {
      setError(
        lang === 'ru'
          ? 'Подтвердите обязательство безопасного обмена в кампусе.'
          : 'Please accept the Campus Trust Pledge.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await uploadImageToSupabase(file, 'listings');
        if (res.error) {
          setError(res.error);
          setSubmitting(false);
          return;
        }
        if (res.url) uploadedUrls.push(res.url);
      }

      if (uploadedUrls.length === 0) {
        uploadedUrls.push(
          category === 'Electronics'
            ? '/src/assets/images/macbook_air_m1_1795078746659.jpg'
            : category === 'Dorm Goods'
              ? '/src/assets/images/dorm_kettle_lamp_1795078747115.jpg'
              : '/src/assets/images/economics_textbook_1795078747508.jpg'
        );
      }

      const zone = CAMPUS_SAFE_ZONES.find((z) => z.shortEn === meetupSpot);
      const numericPrice = Math.max(0, Number(price) || 0);

      const { error: insertErr } = await supabase.from('products').insert({
        seller_id: profile.id,
        seller_name: profile.nickname,
        seller_university: profile.university,
        seller_major: profile.major || `${profile.university} Student`,
        seller_manner_temp: profile.manner_temp || 98.5,
        seller_avatar: profile.avatar_url || DEFAULT_AVATAR,
        title: title.trim(),
        description: description.trim() || 'Clean student item ready for campus handoff.',
        price: numericPrice,
        original_price: numericPrice > 0 ? Math.round(numericPrice * 2.2) : null,
        category,
        university: zone?.university || profile.university || 'KNU',
        meetup_spot: meetupSpot,
        campus_quad: `${zone?.university || profile.university} Campus`,
        course_tag: `${category.toUpperCase()} · ${profile.university}`,
        badge_text: trustBoosted ? 'Trust Boost' : 'New on Campus',
        badge_type: trustBoosted ? 'verified' : 'dorm',
        images: uploadedUrls,
        status: 'active',
        is_verified_seller: true,
      });

      if (insertErr) {
        setError(insertErr.message);
        return;
      }

      await onPublished();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-extrabold text-slate-900">
            {copy.postListingTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle lang={lang} onChange={onChangeLang} compact />
          <Share2 className="w-4 h-4 text-slate-600" />
          <img
            src={profile?.avatar_url || DEFAULT_AVATAR}
            alt="User"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
        </div>
      </header>

      {/* Subheader: Close / Title / Save Draft */}
      <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Close"
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
          <span>{copy.listNewItem}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <button
          type="button"
          onClick={() => {
            setDraftMsg(true);
            setTimeout(() => setDraftMsg(false), 1800);
          }}
          className="rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563EB] px-3 py-1 text-xs font-bold cursor-pointer"
        >
          {draftMsg ? copy.draftSaved : copy.saveDraft}
        </button>
      </div>

      <form onSubmit={handlePublish} className="px-4 pt-3.5 space-y-4">
        {/* Fast Sale Campus Spark Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-3.5 text-white flex items-center gap-3 shadow-md shadow-blue-600/20">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-400 text-slate-950 px-2 py-0.5 text-[9px] font-extrabold">
                {copy.fastSaleBadge}
              </span>
              <span className="text-xs font-bold text-blue-100">
                {copy.campusSpark}
              </span>
            </div>
            <p className="text-xs font-bold leading-snug mt-1">
              💡 {copy.fastSaleCopy}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Item Photos + Trust Boost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900">{copy.itemPhotos}</span>
            <span className="text-slate-400 font-semibold tabular-nums">
              {files.length} {copy.photosCountSuffix}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <label className="col-span-2 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#2563EB] bg-white p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px]">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="sr-only"
              />
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-1.5">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-slate-900">
                {copy.addPhotos}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {copy.realPhotosTip}
              </span>
            </label>

            <div className="col-span-1 rounded-2xl bg-emerald-50 border border-emerald-200 p-2.5 flex flex-col justify-between text-left">
              <div>
                <div className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 uppercase">
                  <CheckCircle2 className="w-3 h-3" />
                  {copy.trustBoost}
                </div>
                <div className="text-xs font-extrabold text-slate-900 mt-1 leading-tight">
                  {copy.studentIdShot}
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                  {copy.viewPriority}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrustBoosted((v) => !v)}
                className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                  trustBoosted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-emerald-200 text-emerald-700'
                }`}
              >
                {trustBoosted ? '✓ Boosted' : copy.snapId}
              </button>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {previews.map((src, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-900/75 text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              {copy.isbnVisible}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              {copy.dormLighting}
            </span>
          </div>
        </div>

        {/* Item Title */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
            {copy.itemTitleLabel} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={copy.itemTitlePlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
            {copy.categoryLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'Textbooks', icon: BookOpen },
                { id: 'Electronics', icon: Laptop },
                { id: 'Dorm Goods', icon: LampDesk },
                { id: 'Other', icon: Package },
              ] as const
            ).map(({ id, icon: Icon }) => {
              const active = category === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {copy.categories[id]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selling Price */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900">
              {copy.sellingPriceLabel} <span className="text-rose-500">*</span>
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              {copy.currencyName}
            </span>
          </div>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <span className="px-3.5 py-3 bg-blue-50 text-[#2563EB] text-xs font-extrabold border-r border-slate-200 uppercase">
              {copy.som}
            </span>
            <input
              type="number"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={copy.enterPricePlaceholder}
              className="flex-1 px-3 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none tabular-nums"
            />
            <button
              type="button"
              onClick={() => setPrice('0')}
              className="mr-2 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {copy.freeBtn}
            </button>
          </div>

          <div className="rounded-xl bg-slate-100/90 px-3 py-2 text-[11px] text-slate-600 flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
            <span>{copy.avgPriceTip}</span>
          </div>
        </div>

        {/* Campus Safe-Zone Meetup */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900">
              {copy.safeZoneLabel} <span className="text-rose-500">*</span>
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              {copy.verifiedZone}
            </span>
          </div>

          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-[#2563EB] absolute left-3.5 pointer-events-none" />
            <select
              value={meetupSpot}
              onChange={(e) => setMeetupSpot(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-8 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] cursor-pointer"
            >
              {CAMPUS_SAFE_ZONES.map((z) => (
                <option key={z.id} value={z.shortEn}>
                  {lang === 'ru' ? z.nameRu : z.nameEn}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{copy.safeZoneSafetyNote}</span>
          </p>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
            {copy.detailedDescLabel}
          </label>
          <div className="relative">
            <textarea
              rows={4}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={copy.detailedDescPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] resize-none"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] font-bold text-slate-400 tabular-nums">
              {description.length}/400
            </span>
          </div>
        </div>

        {/* Campus Trust Pledge */}
        <label className="flex items-start gap-2.5 rounded-2xl bg-white border border-slate-200 p-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={pledgeAccepted}
            onChange={(e) => setPledgeAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-[11px] text-slate-700 leading-relaxed font-medium">
            ✓ {copy.trustPledgeText}
          </span>
        </label>

        {/* Sticky Publish Footer */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 pt-2 pb-3 space-y-2 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {copy.campusFeedActive}
            </span>
            <span className="font-extrabold text-[#2563EB]">{copy.zeroSellerFee}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-colors cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>{submitting ? copy.publishing : copy.publishNow}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
