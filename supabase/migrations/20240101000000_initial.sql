-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  role text default 'customer' check (role in ('customer', 'admin')),
  points_balance numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Points ledger
create table points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  amount numeric(10,2) not null,
  description text,
  order_id uuid,
  created_at timestamptz default now()
);

-- Films
create table films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  artist_name text,
  description text,
  short_description text,
  poster_url text,
  video_url text,
  status text default 'upcoming' check (status in ('upcoming', 'released', 'in_production')),
  release_date date,
  duration_minutes int,
  featured boolean default false,
  created_at timestamptz default now()
);

-- Products (merch)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text check (category in ('shirt', 'tshirt', 'accessory', 'other')),
  price numeric(10,2) not null,
  images text[] default '{}',
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- Product variants
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  size text,
  color text,
  stock int default 0,
  sku text
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) not null,
  points_earned numeric(10,2) default 0,
  shipping_address jsonb,
  created_at timestamptz default now()
);

-- Order items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

-- Machine locations
create table machine_locations (
  id uuid primary key default gen_random_uuid(),
  mall_name text not null,
  address text,
  city text,
  photo_url text,
  hours text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table points_ledger enable row level security;
alter table films enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table machine_locations enable row level security;

-- Profiles RLS
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Service role full access to profiles" on profiles
  using (auth.role() = 'service_role');

create policy "Admins can view all profiles" on profiles
  for select using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Points ledger RLS
create policy "Users can view own points" on points_ledger
  for select using (auth.uid() = user_id);

create policy "Admins can manage points" on points_ledger
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Films RLS
create policy "Public can view films" on films
  for select using (true);

create policy "Admins can manage films" on films
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Products RLS
create policy "Public can view active products" on products
  for select using (active = true);

create policy "Admins can manage products" on products
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Product variants RLS
create policy "Public can view variants" on product_variants
  for select using (true);

create policy "Admins can manage variants" on product_variants
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Orders RLS
create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can create orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage orders" on orders
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Order items RLS
create policy "Users can view own order items" on order_items
  for select using (
    exists (
      select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage order items" on order_items
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Machine locations RLS
create policy "Public can view active locations" on machine_locations
  for select using (active = true);

create policy "Admins can manage locations" on machine_locations
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
