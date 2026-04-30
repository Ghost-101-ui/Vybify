
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Profiles insertable by owner" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Vibes history
create table public.vibes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  vibe_summary text,
  mood text,
  energy text,
  context text,
  style text,
  recommendations jsonb,
  best_pick jsonb,
  caption text,
  hashtags text[],
  created_at timestamptz not null default now()
);

alter table public.vibes enable row level security;
create policy "Vibes select own" on public.vibes for select using (auth.uid() = user_id);
create policy "Vibes insert own" on public.vibes for insert with check (auth.uid() = user_id);
create policy "Vibes delete own" on public.vibes for delete using (auth.uid() = user_id);

create index vibes_user_created_idx on public.vibes(user_id, created_at desc);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('vybify-images', 'vybify-images', true)
on conflict (id) do nothing;

create policy "Vybify images public read" on storage.objects for select using (bucket_id = 'vybify-images');
create policy "Vybify images user upload" on storage.objects for insert with check (
  bucket_id = 'vybify-images' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Vybify images user delete" on storage.objects for delete using (
  bucket_id = 'vybify-images' and auth.uid()::text = (storage.foldername(name))[1]
);
