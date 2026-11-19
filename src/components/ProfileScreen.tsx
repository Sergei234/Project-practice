import { useState } from 'react';
import {
  Bell,
  Settings,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Zap,
  Pencil,
  MoreHorizontal,
  ShieldCheck,
  IdCard,
  Globe,
  LogOut,
  HeartHandshake,
  MapPin,
  Check,
  X,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import type { Language, Product, Profile } from '../types/marketplace';
import { t } from '../i18n/translations';
import { CAMPUS_SAFE_ZONES, DEFAULT_AVATAR } from '../lib/seedData';
import { LanguageToggle } from './LanguageToggle';

interface ProfileScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  profile: Profile | null;
  products: Product[];
  savedIds: Set<string>;
  onSelectProduct: (product: Product) => void;
  onOpenRegister: () => void;
  onOpenSell: () => void;
  onOpenSetupModal: () => void;
  onSignOut: () => Promise<void>;
  onBumpProduct: (productId: string) => Promise<void>;
  onUpdateProduct: (
    productId: string,
    updates: Partial<Pick<Product, 'title' | 'price' | 'status' | 'meetup_spot'>>
  ) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export function ProfileScreen({
  lang,
  onChangeLang,
  profile,
  products,
  savedIds,
  onSelectProduct,
  onOpenRegister,
  onOpenSetupModal,
  onSignOut,
  onBumpProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProfileScreenProps) {
  const copy = t(lang);
  const [tab, setTab] = useState<'active' | 'sold' | 'saved'>('active');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'sold'>('active');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showSafeZonesModal, setShowSafeZonesModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const myActive = profile
    ? products.filter((p) => p.seller_id === profile.id && p.status === 'active')
    : [];
  const mySold = profile
    ? products.filter((p) => p.seller_id === profile.id && p.status === 'sold')
    : [];
  const mySaved = products.filter((p) => savedIds.has(p.id));

  const visibleList =
    tab === 'active' ? myActive : tab === 'sold' ? mySold : mySaved;

  const totalEarned = mySold.reduce((sum, item) => sum + item.price, 0);
  const mannerTemp = profile?.manner_temp ?? 98.5;

  const showToast = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 2200);
  };

  const openEdit = (item: Product) => {
    setEditingProduct(item);
    setEditTitle(item.title);
    setEditPrice(String(item.price));
    setEditStatus(item.status);
    setMenuOpenId(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await onUpdateProduct(editingProduct.id, {
      title: editTitle.trim() || editingProduct.title,
      price: Math.max(0, Number(editPrice) || 0),
      status: editStatus,
    });
    setEditingProduct(null);
    showToast(lang === 'ru' ? 'Объявление обновлено' : 'Listing updated');
  };

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      {/* Top Brand Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4.5 h-4.5 text-[#2563EB]" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[10px] font-extrabold tracking-wider text-[#2563EB] uppercase truncate">
              {copy.brandSub}
            </div>
            <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900">
              <span>{copy.profileTopTitle}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle lang={lang} onChange={onChangeLang} compact />
          <div className="relative w-8 h-8 rounded-full shrink-0">
            <img
              src={profile?.avatar_url || DEFAULT_AVATAR}
              alt={profile?.nickname || 'Student'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            {profile?.is_verified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 pt-3.5 space-y-3.5">
        {statusFeedback && (
          <div className="rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Page Title Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{copy.myPageTitle}</h1>
            <p className="text-xs text-slate-500">{copy.myPageSub}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSafeZonesModal(true)}
              aria-label="Campus Safe Zones"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            <button
              type="button"
              onClick={onOpenSetupModal}
              aria-label="Settings"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Identity Card OR Sign-In Gate */}
        {profile ? (
          <>
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={profile.avatar_url || DEFAULT_AVATAR}
                    alt={profile.nickname}
                    referrerPolicy="no-referrer"
                    className="w-15 h-15 rounded-full object-cover border-2 border-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-extrabold text-slate-900 truncate">
                      {profile.nickname}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      {copy.verifiedBadge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 truncate">
                    {profile.major} ({profile.university} Bishkek)
                  </p>
                  <p className="text-[11px] font-semibold text-[#2563EB] truncate mt-0.5 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Manner Temp Box */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-slate-900">
                      {copy.mannerTempTitle}
                    </span>
                    <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                      {copy.topTrusted}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-rose-600 tabular-nums">
                    {mannerTemp.toFixed(1)}°C 😊
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 via-amber-500 to-rose-500"
                    style={{ width: `${Math.min(100, mannerTemp)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    {copy.avgReply}
                  </span>
                  <span>{copy.goalTemp}</span>
                </div>
              </div>
            </div>

            {/* 3-Column Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-400 tracking-wide">
                  {copy.earnedStat}
                </div>
                <div className="text-sm font-extrabold text-[#2563EB] mt-0.5 tabular-nums">
                  {totalEarned.toLocaleString()}{' '}
                  <span className="text-[10px]">{copy.som}</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                  ↗ {copy.earnedSub}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-400 tracking-wide">
                  {copy.safeMeetupsStat}
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {mySold.length}
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                  🛡️ {copy.dormAndQuad}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-400 tracking-wide">
                  {copy.responseStat}
                </div>
                <div className="text-sm font-extrabold text-emerald-600 mt-0.5 tabular-nums">
                  100%
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                  {copy.promptStudent}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">
                {copy.signInPromptTitle}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {copy.signInPromptDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {copy.signInPromptBtn}
            </button>
          </div>
        )}

        {/* Listings Management Tabs */}
        <div className="bg-slate-100 rounded-2xl p-1 grid grid-cols-3 gap-1 border border-slate-200/70">
          {(
            [
              { id: 'active', label: `${copy.tabActive} (${myActive.length})` },
              { id: 'sold', label: `${copy.tabSold} (${mySold.length})` },
              { id: 'saved', label: `${copy.tabSaved} (${mySaved.length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                tab === item.id
                  ? 'bg-white text-[#2563EB] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Listings Stack */}
        {visibleList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-xs font-medium text-slate-500">
            {copy.emptyTabListings}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleList.map((item) => {
              const titleText =
                lang === 'ru' && item.title_ru ? item.title_ru : item.title;
              const isOwner = Boolean(profile && item.seller_id === profile.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-2.5 shadow-2xs"
                >
                  <div
                    onClick={() => onSelectProduct(item)}
                    className="flex gap-3 cursor-pointer"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.images[0]}
                        alt={titleText}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold text-white ${
                          item.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'
                        }`}
                      >
                        {item.status === 'active' ? copy.liveBadge : copy.soldBadge}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-slate-400 truncate">
                        {item.campus_quad || item.university}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {titleText}
                      </h3>
                      <div className="text-sm font-extrabold text-[#2563EB] mt-0.5 tabular-nums">
                        {item.price.toLocaleString()} {copy.som}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.meetup_spot}</span>
                      </div>
                    </div>
                  </div>

                  {isOwner && tab !== 'saved' && (
                    <div className="relative flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={async () => {
                          await onBumpProduct(item.id);
                          showToast(
                            lang === 'ru'
                              ? 'Объявление поднято в ленте!'
                              : 'Listing bumped to top!'
                          );
                        }}
                        className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {copy.bumpBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {copy.editBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpenId((prev) => (prev === item.id ? null : item.id))
                        }
                        aria-label="More options"
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {menuOpenId === item.id && (
                        <div className="absolute right-0 bottom-11 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20 w-36 text-xs font-bold">
                          <button
                            type="button"
                            onClick={async () => {
                              setMenuOpenId(null);
                              await onUpdateProduct(item.id, {
                                status: item.status === 'active' ? 'sold' : 'active',
                              });
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-800 cursor-pointer"
                          >
                            {copy.markSoldBtn}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setMenuOpenId(null);
                              await onDeleteProduct(item.id);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            {copy.deleteBtn}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TRUST & PREFERENCES Menu */}
        <div className="pt-1 space-y-2">
          <div className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase px-1">
            {copy.trustPreferences}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSafeZonesModal(true)}
              className="w-full px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900">
                    {copy.campusSafeZonesMenu}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {copy.campusSafeZonesSub}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <div className="px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <IdCard className="w-4.5 h-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      {copy.studentIdStatusMenu}
                    </span>
                    <span className="rounded-full bg-emerald-500 text-white px-2 py-0.2 text-[9px] font-extrabold">
                      {copy.validBadge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {copy.verifiedUntil}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            <button
              type="button"
              onClick={() => onChangeLang(lang === 'en' ? 'ru' : 'en')}
              className="w-full px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Globe className="w-4.5 h-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900">
                    {copy.languageMenu}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {copy.currentLanguageLabel}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] shrink-0">
                {lang.toUpperCase()}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </span>
            </button>

            {profile && (
              <button
                type="button"
                onClick={onSignOut}
                className="w-full px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-rose-50/50 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <LogOut className="w-4.5 h-4.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-rose-600">
                      {copy.logOutMenu}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {copy.logOutSub}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Always trade on-campus reminder */}
        <div className="rounded-2xl bg-[#EEF4FF] border border-blue-100 p-3.5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-white text-[#2563EB] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              {copy.alwaysTradeOnCampus}
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
              {copy.alwaysTradeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Listing Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-[380px] bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                {copy.editBtn}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {copy.itemTitleLabel}
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {copy.sellingPriceLabel} ({copy.som})
              </label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'active' | 'sold')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                <option value="active">{copy.liveBadge}</option>
                <option value="sold">{copy.soldBadge}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-extrabold cursor-pointer"
            >
              {copy.saveChanges}
            </button>
          </form>
        </div>
      )}

      {/* Campus Safe-Zones Sheet */}
      {showSafeZonesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                {copy.campusSafeZonesMenu}
              </h3>
              <button
                type="button"
                onClick={() => setShowSafeZonesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {CAMPUS_SAFE_ZONES.map((z) => (
                <div
                  key={z.id}
                  className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs space-y-0.5"
                >
                  <div className="font-extrabold text-slate-900">
                    {lang === 'ru' ? z.nameRu : z.nameEn}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {lang === 'ru' ? z.addressRu : z.addressEn} ·{' '}
                    {lang === 'ru' ? z.hoursRu : z.hoursEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
