-- Run this once in Supabase → SQL Editor → New query → Run.

-- 1) Cards table
create table if not exists public.cards (
  id               text primary key,
  token_hash       text not null,               -- sha256 of the creator's secret token
  data             jsonb not null,              -- names, message, occasion, music choice, captions
  photo_paths      text[] not null default '{}',
  song_path        text,
  status           text not null default 'pending' check (status in ('pending', 'paid')),
  amount           integer not null,            -- in paise (3500 = ₹35)
  order_id         text unique,
  payment_id       text,
  open_count       integer not null default 0,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz,
  first_opened_at  timestamptz
);

-- Row Level Security ON with no policies = nobody can read/write from the browser.
-- Only the server (using the service key) can touch this table.
alter table public.cards enable row level security;

-- 2) Private storage bucket for photos and songs (max 10 MB per file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wish-media', 'wish-media', false, 10485760,
  array['image/jpeg', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav']
)
on conflict (id) do nothing;

-- Optional housekeeping: delete cards that were never paid after 7 days.
-- (Their files stay in Storage; you can clear old folders from the Storage page.)
-- delete from public.cards where status = 'pending' and created_at < now() - interval '7 days';
