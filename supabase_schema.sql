-- StudMarket (CampusMarket KG) Supabase Schema & Seed Script
-- Run this in your Supabase SQL Editor

create extension if not exists "pgcrypto";

-- 1. Profiles Table
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

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- 2. Products Table
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

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select using (true);

create policy "Authenticated users can insert products"
  on public.products for insert with check (auth.uid() = seller_id or seller_id is null);

create policy "Sellers can update their own products"
  on public.products for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own products"
  on public.products for delete using (auth.uid() = seller_id);

-- 3. Meetup Requests Table
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

alter table public.meetup_requests enable row level security;

create policy "Users can view their own meetup requests"
  on public.meetup_requests for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Authenticated users can create meetup requests"
  on public.meetup_requests for insert
  with check (auth.uid() = buyer_id);

-- 4. Saved Items Table
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.saved_items enable row level security;

create policy "Users can view their own saved items"
  on public.saved_items for select using (auth.uid() = user_id);

create policy "Users can save items"
  on public.saved_items for insert with check (auth.uid() = user_id);

create policy "Users can remove their saved items"
  on public.saved_items for delete using (auth.uid() = user_id);

-- 5. Storage Bucket for Product & Verification Photos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read access for product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Anon users can upload verification IDs during signup"
  on storage.objects for insert
  with check (bucket_id = 'product-images');
