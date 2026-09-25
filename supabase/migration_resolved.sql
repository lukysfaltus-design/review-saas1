-- Spusťte v Supabase SQL Editoru — doplní sloupce pro označování
-- zpráv jako vyřešené, aniž by se smazala existující data.

alter table feedback add column if not exists resolved boolean default false;
alter table feedback add column if not exists resolved_at timestamptz;
