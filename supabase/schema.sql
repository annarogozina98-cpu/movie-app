-- Movie app schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- 1. Movies we want to watch
create table if not exists to_watch (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  genre text,
  duration text,
  imdb_rating text,
  description text,
  imdb_link text,
  kinopoisk_link text,
  enriched boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Movies we've already watched
create table if not exists watched (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  genre text,
  duration text,
  imdb_rating text,
  description text,
  imdb_link text,
  kinopoisk_link text,
  enriched boolean not null default false,
  our_rating numeric,
  our_comment text,
  watched_date date,
  created_at timestamptz not null default now()
);

-- 3. AI recommendations (pending = shown on screen 3, rejected = hidden but kept
--    so the AI doesn't suggest the same title again)
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  genre text,
  duration text,
  imdb_rating text,
  description text,
  imdb_link text,
  kinopoisk_link text,
  enriched boolean not null default false,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'rejected')),
  created_at timestamptz not null default now()
);

-- This is a private two-person app reachable only via an unlisted URL, so we
-- open up RLS with permissive policies rather than wiring up user accounts.
alter table to_watch enable row level security;
alter table watched enable row level security;
alter table recommendations enable row level security;

create policy "public access to_watch" on to_watch for all using (true) with check (true);
create policy "public access watched" on watched for all using (true) with check (true);
create policy "public access recommendations" on recommendations for all using (true) with check (true);
