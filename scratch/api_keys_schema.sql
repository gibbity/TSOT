-- ==========================================
-- TSOT API Keys & Daily Atomic Usage Counter
-- ==========================================

-- 1. API Keys Table
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  key_hash text not null unique,  -- SHA-256 hash of plaintext key
  key_prefix text not null,        -- e.g. "tsot_live_a1b2..." for UI masking
  tier text default 'free' check (tier in ('free', 'pro', 'enterprise')),
  daily_limit int default 50,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.api_keys enable row level security;

-- Policies for api_keys
create policy "Users can view their own API keys" 
  on public.api_keys for select 
  using (auth.uid() = user_id);

create policy "Users can create their own API keys" 
  on public.api_keys for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own API keys" 
  on public.api_keys for delete 
  using (auth.uid() = user_id);

-- 2. Daily Atomic Usage Counter
create table if not exists public.api_usage (
  key_hash text not null references public.api_keys(key_hash) on delete cascade,
  usage_date date not null default current_date,
  request_count int not null default 1,
  primary key (key_hash, usage_date)
);

create index if not exists idx_api_usage_lookup on public.api_usage (key_hash, usage_date);

alter table public.api_usage enable row level security;

-- 3. Atomic Postgres Function (check_and_increment_usage)
create or replace function check_and_increment_usage(
  p_key_hash text
) returns jsonb as $$
declare
  v_key record;
  v_count int;
begin
  -- 1. Verify key validity
  select tier, daily_limit, is_active into v_key
  from public.api_keys
  where key_hash = p_key_hash;

  if not found or not v_key.is_active then
    return jsonb_build_object('valid', false, 'reason', 'invalid_key');
  end if;

  -- 2. Atomic upsert counter (single roundtrip)
  insert into public.api_usage (key_hash, usage_date, request_count)
  values (p_key_hash, current_date, 1)
  on conflict (key_hash, usage_date)
  do update set request_count = public.api_usage.request_count + 1
  returning request_count into v_count;

  -- 3. Check limit
  if v_count > v_key.daily_limit then
    return jsonb_build_object(
      'valid', true,
      'allowed', false,
      'tier', v_key.tier,
      'count', v_count,
      'limit', v_key.daily_limit,
      'remaining', 0
    );
  else
    return jsonb_build_object(
      'valid', true,
      'allowed', true,
      'tier', v_key.tier,
      'count', v_count,
      'limit', v_key.daily_limit,
      'remaining', v_key.daily_limit - v_count
    );
  end if;
end;
$$ language plpgsql security definer;
