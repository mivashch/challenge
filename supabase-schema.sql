
create table if not exists technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists commands (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  command text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  url text not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------
-- FOLDERS (for grouping technologies)
-- ---------------------------------------------

    create table if not exists folders (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users(id) on delete cascade,
      name text not null,
      sort_order int not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    alter table folders enable row level security;
    drop policy if exists "folders: owner access" on folders;
    create policy "folders: owner access" on folders
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    alter table technologies add column if not exists folder_id uuid references folders(id) on delete set null;

-- ---------------------------------------------
-- МІГРАЦІЯ (якщо таблиці вже існують без updated_at)
-- ---------------------------------------------

alter table technologies add column if not exists updated_at timestamptz not null default now();
alter table commands    add column if not exists updated_at timestamptz not null default now();
alter table links       add column if not exists updated_at timestamptz not null default now();
alter table notes       add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------
-- TRIGGERS
-- ---------------------------------------------

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists technologies_updated_at on technologies;
drop trigger if exists commands_updated_at     on commands;
drop trigger if exists links_updated_at       on links;
drop trigger if exists notes_updated_at       on notes;
drop trigger if exists folders_updated_at     on folders;

create trigger technologies_updated_at before update on technologies
  for each row execute function update_updated_at();
create trigger commands_updated_at before update on commands
  for each row execute function update_updated_at();
create trigger links_updated_at before update on links
  for each row execute function update_updated_at();
create trigger notes_updated_at before update on notes
  for each row execute function update_updated_at();
create trigger folders_updated_at before update on folders
  for each row execute function update_updated_at();


create or replace function update_technology_updated_at()
returns trigger as $$
begin
  update technologies
  set updated_at = now()
  where id = coalesce(new.technology_id, old.technology_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists commands_update_technology on commands;
drop trigger if exists links_update_technology    on links;
drop trigger if exists notes_update_technology    on notes;

create trigger commands_update_technology
  after insert or update or delete on commands
  for each row execute function update_technology_updated_at();

create trigger links_update_technology
  after insert or update or delete on links
  for each row execute function update_technology_updated_at();

create trigger notes_update_technology
  after insert or update or delete on notes
  for each row execute function update_technology_updated_at();

-- ---------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------

alter table technologies enable row level security;
alter table commands     enable row level security;
alter table links        enable row level security;
alter table notes        enable row level security;

drop policy if exists "technologies: owner access" on technologies;
drop policy if exists "commands: owner access"     on commands;
drop policy if exists "links: owner access"        on links;
drop policy if exists "notes: owner access"        on notes;

create policy "technologies: owner access" on technologies
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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
