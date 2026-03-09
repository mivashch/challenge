-- Dev Knowledge Hub Schema
-- Run this in your Supabase SQL Editor

create table if not exists technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists commands (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  command text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  url text not null,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (optional - remove if not needed)
-- alter table technologies enable row level security;
-- alter table commands enable row level security;
-- alter table links enable row level security;
-- alter table notes enable row level security;
