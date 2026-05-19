-- PostgreSQL Schema for TSOT (The Sign of Times)
-- Execute this directly in your Supabase SQL Editor.

-- Enable pgvector extension (if not already enabled)
create extension if exists vector;

-- 1. Main registry table
create table if not exists public.registry (
  id bigint generated always as identity primary key,
  code text not null unique,
  pillar text not null check (pillar in (
    'COGNITIVE OFFLOADING',
    'FRICTION & VERIFICATION', 
    'TEMPORAL PERCEPTION',
    'EPISTEMIC AGENCY'
  )),
  title text not null,
  human_summary text not null,
  metric text not null,
  verdict text not null,
  risk_level text not null default 'warning' check (risk_level in ('stable','warning','critical')),
  source_url text,
  source_type text default 'preprint' check (source_type in ('peer-reviewed','preprint','conference')),
  paper_year int,
  authors text,
  is_premium boolean default false,
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Full text search index (for keyword-based search engine fallback)
create index if not exists registry_fts_idx on public.registry 
using gin(to_tsvector('english', title || ' ' || human_summary || ' ' || verdict));

-- 3. Vector similarity index (for semantic search, lists set to 100 as base)
create index if not exists registry_embedding_idx on public.registry 
using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 4. Subscribers table for Auth & Lemon Squeezy integration
create table if not exists public.subscribers (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  status text default 'free' check (status in ('free','active','cancelled')),
  lemon_order_id text,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS) Configuration

alter table public.registry enable row level security;
alter table public.subscribers enable row level security;

-- Registry read policies
create policy "Public can read free records"
on public.registry for select
using (is_premium = false);

create policy "Premium users can read all"
on public.registry for select
using (
  is_premium = false or
  exists (
    select 1 from public.subscribers
    where user_id = auth.uid() and status = 'active'
  )
);

-- Subscribers read policies
create policy "Users read own record"
on public.subscribers for select
using (user_id = auth.uid());

-- Optional: Allow upserts/inserts from standard authenticated triggers or service role keys (handled by Supabase service key natively)
