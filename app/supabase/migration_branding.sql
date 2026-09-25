-- Spusťte tohle v Supabase SQL Editoru, pokud jste tabulku "businesses"
-- už dřív vytvořili podle původní verze schema.sql. Přidá to nové
-- sloupce pro logo, sociální sítě a barvu, aniž by se smazala
-- jakákoliv existující data.

alter table businesses add column if not exists logo_url text;
alter table businesses add column if not exists instagram_url text;
alter table businesses add column if not exists facebook_url text;
alter table businesses add column if not exists website_url text;
alter table businesses add column if not exists accent_color text default '#2F7DFF';
