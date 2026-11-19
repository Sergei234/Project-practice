import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Send, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Language, Product, Profile } from '../types/marketplace';
import { t } from '../i18n/translations';
import { CAMPUS_SAFE_ZONES } from '../lib/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface MeetupModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  profile: Profile | null;
  lang: Language;
  onRequireAuth: () => void;
}

export function MeetupModal({
  open,
  onClose,
  product,
  profile,
  lang,
  onRequireAuth,
}: MeetupModalProps) {
  const copy = t(lang);
  const [spot, setSpot] = useState(product?.meetup_spot || CAMPUS_SAFE_ZONES[0].shortEn);
  const [timeSlot, setTimeSlot] = useState<string>(copy.meetupTimeOptions[0]);
  const [message, setMessage] = useState<string>(copy.meetupDefaultMsg);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open && product) {
      setSpot(product.meetup_spot || CAMPUS_SAFE_ZONES[0].shortEn);
      setTimeSlot(copy.meetupTimeOptions[0]);
      setMessage(copy.meetupDefaultMsg);
      setError(null);
      setSubmitted(false);
    }
  }, [open, product, lang]);

  if (!open || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setError(
        lang === 'ru'
          ? 'Подключите Supabase (VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY), чтобы отправлять запросы на встречу.'
          : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to send live meetup requests.'
      );
      return;
    }

    if (!profile) {
      onClose();
      onRequireAuth();
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from('meetup_requests').insert({
        product_id: product.id,
        buyer_id: profile.id,
        seller_id: product.seller_id,
        buyer_name: profile.nickname,
        meetup_spot: spot,
        proposed_time: timeSlot,
        message: message.trim() || copy.meetupDefaultMsg,
        status: 'pending',
      });

      if (insertErr) {
        setError(insertErr.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meetup-modal-title"
    >
      <div className="w-full max-w-[398px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 id="meetup-modal-title" className="text-base font-extrabold text-slate-900">
              {copy.meetupModalTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{copy.meetupModalSub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">{copy.meetupSentTitle}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{copy.meetupSentDesc}</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 text-left text-xs space-y-1">
              <div className="font-semibold text-slate-800">{spot}</div>
              <div className="text-slate-500">{timeSlot}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              {copy.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Item summary strip */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <img
                src={product.images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {lang === 'ru' && product.title_ru ? product.title_ru : product.title}
                </p>
                <p className="text-xs font-extrabold text-[#2563EB] tabular-nums">
                  {product.price.toLocaleString()} {copy.som}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Safe-Zone Select */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                {copy.meetupSpotField}
              </label>
              <select
                value={spot}
                onChange={(e) => setSpot(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563EB]"
              >
                {CAMPUS_SAFE_ZONES.map((z) => (
                  <option key={z.id} value={z.shortEn}>
                    {lang === 'ru' ? z.nameRu : z.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Time Chips */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                {copy.meetupTimeField}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {copy.meetupTimeOptions.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                      timeSlot === slot
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {copy.meetupMessageField}
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#2563EB] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'ru'
                  ? 'Безопасный обмен · Оплата только после осмотра товара'
                  : 'Inspect in person before paying · Daytime campus CCTV zones'}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? '...' : copy.sendMeetupBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
