-- Spusťte v Supabase SQL Editoru — přidá tabulky pro menu, nic
-- nesmaže z toho, co už tam je.

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price_czk int,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists menu_categories_business_id_idx on menu_categories(business_id);
create index if not exists menu_items_category_id_idx on menu_items(category_id);

alter table menu_categories enable row level security;
alter table menu_items enable row level security;
