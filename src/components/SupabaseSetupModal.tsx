import { useState } from 'react';
import { X, Copy, Check, Database, ShieldCheck } from 'lucide-react';
import type { Language } from '../types/marketplace';

interface SupabaseSetupModalProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
}

const ENV_SNIPPET = `VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"`;

const SQL_SNIPPET = `-- Run in Supabase SQL Editor (see /supabase_schema.sql)
-- Creates profiles, products, meetup_requests, saved_items, and product-images bucket.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null,
  university text not null default 'KNU',
  major text not null default 'Undergraduate Student',
  manner_temp numeric(4,1) not null default 98.5,
  student_id_url text,
  is_verified boolean not null default true,
  avatar_url text,
  avg_reply_mins integer not null default 5,
  handoffs_count integer not null default 0,
  earned_som integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete set null,
  seller_name text not null default 'Aibek',
  seller_university text not null default 'KNU',
  seller_major text not null default 'Computer Science Junior',
  seller_manner_temp numeric(4,1) not null default 98.5,
  seller_avatar text,
  title text not null,
  title_ru text,
  description text,
  description_ru text,
  price integer not null,
  original_price integer,
  category text not null default 'Textbooks',
  university text not null default 'KNU',
  meetup_spot text not null default 'Main Library Lobby',
  campus_quad text not null default 'KNU Central Quad',
  course_tag text,
  condition_label text default 'Super clean! (9.5/10)',
  language_label text default 'English (easy read)',
  markings_label text default 'Zero doodles or notes ✨',
  badge_text text,
  badge_type text default 'urgent',
  images text[] not null default '{}',
  status text not null default 'active',
  likes_count integer not null default 0,
  views_count integer not null default 1,
  active_chats_count integer not null default 2,
  eyeing_count integer not null default 4,
  is_verified_seller boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.meetup_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete set null,
  buyer_name text not null,
  meetup_spot text not null,
  proposed_time text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;`;

export function SupabaseSetupModal({ open, onClose, lang }: SupabaseSetupModalProps) {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!open) return null;

  const copyText = async (text: string, which: 'env' | 'sql') => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'env') {
        setCopiedEnv(true);
        setTimeout(() => setCopiedEnv(false), 1800);
      } else {
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 1800);
      }
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'ru' ? 'Настройка Supabase' : 'Supabase Backend Setup'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru' ? 'Auth, БД и Storage (product-images)' : 'Auth, PostgreSQL & Storage'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-slate-700 leading-relaxed flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              {lang === 'ru'
                ? 'Укажите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в переменных окружения и выполните SQL-скрипт (supabase_schema.sql) в Supabase.'
                : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables and run supabase_schema.sql in your Supabase SQL Editor.'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">.env Variables</span>
              <button
                type="button"
                onClick={() => copyText(ENV_SNIPPET, 'env')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] overflow-x-auto font-mono">
              {ENV_SNIPPET}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">SQL Schema (supabase_schema.sql)</span>
              <button
                type="button"
                onClick={() => copyText(SQL_SNIPPET, 'sql')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[10px] max-h-48 overflow-auto font-mono leading-relaxed">
              {SQL_SNIPPET}
            </pre>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            {lang === 'ru' ? 'Понятно' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}
