-- Review SaaS – schema v2
-- Tento skript je bezpečné spustit i nad databází, kde už tabulky existují.
-- Nic nemaže, jen vytvoří chybějící tabulky/sloupce.

create extension if not exists pgcrypto;

-- BUSINESSES -----------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

alter table businesses add column if not exists google_review_link text;
alter table businesses add column if not exists notify_email text;
alter table businesses add column if not exists plan text not null default 'nfc';
alter table businesses add column if not exists status text not null default 'trial';
alter table businesses add column if not exists brand_color text not null default '#2563eb';
alter table businesses add column if not exists weekly_digest boolean not null default false;
alter table businesses add column if not exists monthly_digest boolean not null default false;

-- FEEDBACK ---------------------------------------------------------
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  rating smallint not null,
  created_at timestamptz not null default now()
);

alter table feedback add column if not exists message text;
alter table feedback add column if not exists tags text[] default '{}';
alter table feedback add column if not exists resolved boolean not null default false;

create index if not exists feedback_business_id_idx on feedback(business_id);
create index if not exists feedback_created_at_idx on feedback(created_at);
