create extension if not exists "pgcrypto";

create table businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  google_review_url text not null,
  owner_email text not null,
  logo_url text,
  instagram_url text,
  facebook_url text,
  website_url text,
  accent_color text default '#2F7DFF',
  plan text default 'basic',
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  customer_name text,
  message text,
  resolved boolean default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index feedback_business_id_idx on feedback(business_id);
create index feedback_created_at_idx on feedback(created_at);

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price_czk int,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index menu_categories_business_id_idx on menu_categories(business_id);
create index menu_items_category_id_idx on menu_items(category_id);

-- Service role klíč (používaný serverem) obchází RLS, takže tabulky
-- zůstávají bez veřejných policies -- nikdo zvenčí je nemůže číst přímo.
alter table businesses enable row level security;
alter table feedback enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
