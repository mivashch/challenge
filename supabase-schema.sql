-- Dev Knowledge Hub Schema
-- Run this in your Supabase SQL Editor

create table if not exists technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

-- Row Level Security
alter table technologies enable row level security;
alter table commands enable row level security;
alter table links enable row level security;
alter table notes enable row level security;

-- Technologies: 
create policy "technologies: owner access" on technologies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Commands/Links/Notes: 
create policy "commands: owner access" on commands
  for all using (
    exists (select 1 from technologies where id = commands.technology_id and user_id = auth.uid())
  );

create policy "links: owner access" on links
  for all using (
    exists (select 1 from technologies where id = links.technology_id and user_id = auth.uid())
  );

create policy "notes: owner access" on notes
  for all using (
    exists (select 1 from technologies where id = notes.technology_id and user_id = auth.uid())
  );
