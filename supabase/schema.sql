-- Run this in Supabase: SQL Editor → New query → paste → Run

create table if not exists decks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

create index if not exists flashcards_deck_id_idx on flashcards(deck_id);

alter table decks enable row level security;
alter table flashcards enable row level security;

create policy "Public read decks" on decks for select using (true);
create policy "Public insert decks" on decks for insert with check (true);

create policy "Public read flashcards" on flashcards for select using (true);
create policy "Public insert flashcards" on flashcards for insert with check (true);
create policy "Public delete flashcards" on flashcards for delete using (true);

alter publication supabase_realtime add table flashcards;
