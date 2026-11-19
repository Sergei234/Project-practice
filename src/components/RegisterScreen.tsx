import { useState } from 'react';
import {
  ArrowLeft,
  Info,
  User,
  GraduationCap,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  AlertCircle,
} from 'lucide-react';
import type { Language } from '../types/marketplace';
import { t } from '../i18n/translations';
import { LanguageToggle } from './LanguageToggle';
import {
  supabase,
  isSupabaseConfigured,
  uploadImageToSupabase,
} from '../lib/supabase';

interface RegisterScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onBack: () => void;
  onSuccessAuth: () => void;
  onOpenSetupModal: () => void;
}

const UNIVERSITY_OPTIONS = ['KNU', 'AUCA', 'Manas University', 'KRSU'];

export function RegisterScreen({
  lang,
  onChangeLang,
  onBack,
  onSuccessAuth,
  onOpenSetupModal,
}: RegisterScreenProps) {
  const copy = t(lang);
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('KNU');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    const reader = new FileReader();
    reader.onload = () => setIdPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const resolveUniversityEmail = (raw: string, uni: string) => {
    const trimmed = raw.trim();
    if (trimmed.includes('@')) return trimmed;
    const domain =
      uni === 'AUCA'
        ? 'auca.kg'
        : uni === 'Manas University'
          ? 'manas.edu.kg'
          : uni === 'KRSU'
            ? 'krsu.edu.kg'
            : 'knu.kg';
    const cleanId = trimmed.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() || 'student';
    return `${cleanId}@${domain}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setError(
        lang === 'ru'
          ? 'Supabase не настроен. Нажмите «SQL схема» и добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.'
          : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        lang === 'ru'
          ? 'Пароль должен содержать минимум 8 символов.'
          : 'Password must be at least 8 characters.'
      );
      return;
    }

    const emailToUse = resolveUniversityEmail(emailOrId, university);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password,
        });
        if (signInErr) {
          setError(signInErr.message);
          return;
        }
        onSuccessAuth();
        return;
      }

      if (!fullName.trim()) {
        setError(
          lang === 'ru' ? 'Введите ваше имя и фамилию.' : 'Please enter your full name.'
        );
        return;
      }

      let uploadedIdUrl: string | null = null;
      if (idFile) {
        const uploaded = await uploadImageToSupabase(idFile, 'student-ids');
        if (uploaded.url) {
          uploadedIdUrl = uploaded.url;
        }
      }

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: emailToUse,
        password,
        options: {
          data: {
            nickname: fullName.trim(),
            university,
          },
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        return;
      }

      if (signUpData.user) {
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          email: emailToUse,
          nickname: fullName.trim(),
          university,
          major: `${university} Student`,
          manner_temp: 98.5,
          student_id_url: uploadedIdUrl,
          is_verified: true,
        });

        if (profileErr) {
          setError(profileErr.message);
          return;
        }
      }

      if (signUpData.session) {
        onSuccessAuth();
      } else {
        setSuccessMsg(
          lang === 'ru'
            ? `Аккаунт создан! Подтвердите письмо на ${emailToUse} (или войдите, если подтверждение отключено).`
            : `Account created! Check ${emailToUse} to confirm your email, or sign in.`
        );
        setMode('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-900">
          {mode === 'register' ? copy.registerTopTitle : copy.logInLink}
        </h1>
        <button
          type="button"
          onClick={onOpenSetupModal}
          aria-label="Supabase info"
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pt-3 space-y-4">
        {/* Step Progress & Language Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-extrabold text-[#2563EB]">
              {copy.step1of2}
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full bg-[#2563EB] rounded-full transition-all ${
                  mode === 'login' ? 'w-full' : 'w-1/2'
                }`}
              />
            </div>
          </div>
          <LanguageToggle lang={lang} onChange={onChangeLang} compact />
        </div>

        {/* Social Proof Header Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#F3F6FF] to-[#EEF4FF] border border-blue-100/80 p-4 space-y-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {['AUCA', 'KNU', 'MANAS'].map((uni) => (
              <span
                key={uni}
                className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-800"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {uni}
              </span>
            ))}
            <span className="rounded-full bg-emerald-400/90 text-slate-950 px-2.5 py-0.5 text-[10px] font-extrabold">
              {copy.plus12Campuses}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {mode === 'register' ? copy.registerHeadline : copy.logInHeadline}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {mode === 'register' ? copy.registerSub : copy.logInSub}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex -space-x-1.5">
              <span className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white text-[10px] font-extrabold text-[#2563EB] flex items-center justify-center">
                A
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white text-[10px] font-extrabold text-emerald-900 flex items-center justify-center">
                N
              </span>
              <span className="w-6 h-6 rounded-full bg-rose-100 border-2 border-white text-[10px] font-extrabold text-rose-700 flex items-center justify-center">
                B
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              {copy.studentOnlyAccess}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-slate-900">
                    {copy.fullNameLabel}
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {copy.asOnId}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={copy.fullNamePlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                  {copy.yourUniversityLabel}
                </label>
                <div className="relative flex items-center">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-8 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] cursor-pointer"
                  >
                    {UNIVERSITY_OPTIONS.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold text-slate-900">
                {copy.uniEmailLabel}
              </label>
              <span className="text-[11px] font-bold text-emerald-600">
                {copy.fastTrackBadge}
              </span>
            </div>
            <div className="relative flex items-center">
              <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder={copy.uniEmailPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
              {copy.passwordLabel}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.passwordPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
                className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              {/* Dashed Student Identity Verification Upload */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>{copy.studentIdVerifyTitle}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    <Zap className="w-3 h-3" />
                    {copy.instantAiBadge}
                  </span>
                </div>

                <label className="block rounded-3xl border-2 border-dashed border-blue-200 hover:border-[#2563EB] bg-blue-50/25 p-5 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  {idPreview ? (
                    <div className="space-y-2">
                      <img
                        src={idPreview}
                        alt="Student ID preview"
                        className="h-28 mx-auto rounded-xl object-cover border border-slate-200"
                      />
                      <p className="text-xs font-bold text-emerald-700">
                        ✓ {idFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-[#2563EB] flex items-center justify-center mx-auto">
                        <ScanLine className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {copy.uploadIdTitle}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {copy.uploadIdSub}
                      </div>
                      <div className="inline-block rounded-xl bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                        {copy.uploadIdNote}
                      </div>
                    </div>
                  )}
                </label>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{copy.privacyNote}</span>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-colors cursor-pointer"
          >
            <span>
              {submitting
                ? '...'
                : mode === 'register'
                  ? copy.verifyCreateBtn
                  : copy.logInBtn}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Register / Log In */}
        <div className="text-center space-y-2 pt-1">
          <p className="text-xs text-slate-600 font-medium">
            {mode === 'register' ? copy.alreadyVerified : copy.needAccount}{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setMode((m) => (m === 'register' ? 'login' : 'register'));
              }}
              className="font-extrabold text-[#2563EB] hover:underline cursor-pointer"
            >
              {mode === 'register' ? copy.logInLink : copy.registerLink}
            </button>
          </p>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
            {copy.legalAgree}
          </p>
        </div>
      </div>
    </div>
  );
}
