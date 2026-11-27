-- Run this in Supabase → SQL Editor → New query → Run.
-- It is safe to run again: running it on an existing project just applies the new changes.

-- 1) Cards table
create table if not exists public.cards (
  id               text primary key,
  token_hash       text not null,               -- sha256 of the creator's secret token
  data             jsonb not null,              -- names, message, occasion, music choice, captions, teddy genders
  photo_paths      text[] not null default '{}',
  song_path        text,                        -- no longer used: songs are never uploaded
  status           text not null default 'pending' check (status in ('pending', 'paid')),
  amount           integer not null,            -- in paise (3500 = ₹35)
  order_id         text unique,
  payment_id       text,
  open_count       integer not null default 0,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz,
  first_opened_at  timestamptz,
  expires_at       timestamptz                  -- the card and its photos are deleted automatically after this
);

-- For projects created before the 7-day rule: add the new column and an index for the clean-up.
alter table public.cards add column if not exists expires_at timestamptz;
create index if not exists cards_expires_idx on public.cards (expires_at);
create index if not exists cards_created_idx on public.cards (created_at);

-- Row Level Security ON with no policies = nobody can read/write from the browser.
-- Only the server (using the service key) can touch this table.
alter table public.cards enable row level security;

-- 2) Private storage bucket for PHOTOS ONLY (JPEG, max 5 MB each). Songs are never stored.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wish-media', 'wish-media', false, 5242880, array['image/jpeg'])
on conflict (id) do update
  set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

-- 3) Cards that were already paid for before this change get a 7-day expiry counted from today,
--    so they are cleaned up too (optional: run once).
update public.cards
   set expires_at = now() + interval '7 days'
 where status = 'paid' and expires_at is null;
