-- Laundry Day Off: database schema.
-- Run this whole file once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It is safe to run again (it only creates what is missing and replaces the policies/functions).

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id            text primary key default ('LDO-' || nextval('public.order_number_seq')),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  name          text not null,
  phone         text not null,
  email         text not null,
  address       text not null,
  zip           text not null,
  pickup_date   date not null,
  pickup_window text not null,
  plan          text not null check (plan in ('once', 'weekly', 'biweekly')),
  prefs         jsonb not null default '{}'::jsonb,
  notes         text not null default '',
  est_lbs       numeric not null check (est_lbs > 0),
  final_lbs     numeric check (final_lbs > 0),
  auth_hold     numeric not null check (auth_hold >= 0),
  total         numeric check (total >= 0),
  status        text not null default 'Scheduled'
                check (status in ('Scheduled', 'Picked Up', 'In Wash', 'Out for Delivery', 'Delivered')),
  driver        text,
  bulky         jsonb not null default '{}'::jsonb,
  hangers       integer not null default 0 check (hangers >= 0),
  rush          boolean not null default false,
  agreement     jsonb
);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_pickup_date_idx on public.orders (pickup_date);

-- ---------------------------------------------------------------------------
-- Operators (who can see and manage every order on /admin)
-- ---------------------------------------------------------------------------
create table if not exists public.operators (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_operator()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.operators where user_id = auth.uid()) $$;

-- ---------------------------------------------------------------------------
-- Business / Airbnb quote requests and service-area inquiries
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  biz        text not null,
  type       text not null,
  contact    text not null,
  email      text not null,
  phone      text not null,
  vol        text not null default '',
  msg        text not null default ''
);

-- ---------------------------------------------------------------------------
-- Row Level Security: the database itself enforces who sees what.
-- ---------------------------------------------------------------------------
alter table public.orders    enable row level security;
alter table public.operators enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "orders: read own or operator" on public.orders;
create policy "orders: read own or operator" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_operator());

-- Customers may only create their own, fresh orders (no pre-set weight, total, driver or status).
drop policy if exists "orders: customers create own" on public.orders;
create policy "orders: customers create own" on public.orders
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'Scheduled'
              and final_lbs is null and total is null and driver is null);

-- Only operators can change orders directly (status, weight, driver...).
drop policy if exists "orders: operators update" on public.orders;
create policy "orders: operators update" on public.orders
  for update to authenticated
  using (public.is_operator()) with check (public.is_operator());

drop policy if exists "operators: see self" on public.operators;
create policy "operators: see self" on public.operators
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "inquiries: anyone can submit" on public.inquiries;
create policy "inquiries: anyone can submit" on public.inquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "inquiries: operators read" on public.inquiries;
create policy "inquiries: operators read" on public.inquiries
  for select to authenticated using (public.is_operator());

-- Customers can change the window/plan of their own order, only while it is still Scheduled.
create or replace function public.change_my_order(p_id text, p_window text default null, p_plan text default null)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_plan is not null and p_plan not in ('weekly', 'biweekly') then
    raise exception 'invalid plan';
  end if;
  if p_window is not null and p_window not in ('Morning 8am – 11am', 'Evening 5pm – 8pm') then
    raise exception 'invalid window';
  end if;
  update public.orders
     set pickup_window = coalesce(p_window, pickup_window),
         plan          = coalesce(p_plan, plan)
   where id = p_id and user_id = auth.uid() and status = 'Scheduled';
  if not found then
    raise exception 'order not found or can no longer be changed';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Privileges (explicit, in case the project doesn't auto-grant the Data API roles)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.orders to authenticated;
grant usage, select on sequence public.order_number_seq to authenticated;
grant select on public.operators to authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select on public.inquiries to authenticated;
revoke all on function public.change_my_order(text, text, text) from public, anon;
grant execute on function public.change_my_order(text, text, text) to authenticated;
grant execute on function public.is_operator() to authenticated;

-- ---------------------------------------------------------------------------
-- Live updates: customers see status changes instantly on /account.
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- LAST STEP (run separately, after you've created your own account on the site):
-- make yourself an operator so /admin shows every order. Replace the email.
--
--   insert into public.operators (user_id)
--   select id from auth.users where email = 'you@example.com'
--   on conflict do nothing;
-- ---------------------------------------------------------------------------
