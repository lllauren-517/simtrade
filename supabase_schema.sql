-- ============================================================
-- SimTrade Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Securities table (stock/ETF data)
create table if not exists public.securities (
  symbol       text primary key,
  name         text not null default '',
  grp          text not null default 'etf',   -- 'etf' | 'stock'
  type         text not null default 'ETF',   -- 'ETF' | 'EQUITY'
  price        numeric default 0,
  base         numeric default 0,             -- previous close
  vol          numeric default 0,
  created_at   timestamptz default now()
);

-- 2. Orders table
create table if not exists public.orders (
  id               text primary key,
  time             text,
  symbol           text not null,
  name             text,
  qty              numeric not null,
  side             text not null,             -- 'buy' | 'sell'
  price            numeric not null,
  amount           numeric not null,
  grp              text not null,
  status           text default 'executed',
  comment          text,
  settlementdate   text,
  settlement_date  text,
  settlement_price numeric,
  fee_rate         numeric default 0,
  fee_amount       numeric default 0,
  tax_rate         numeric default 0,
  tax_amount       numeric default 0,
  settlement_amount numeric,
  scorecard        jsonb default '{}',
  created_at       timestamptz default now()
);

-- 3. Settings table (for initial cash etc.)
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- 4. Portfolio events (dividends)
create table if not exists public.portfolio_events (
  id           text primary key default gen_random_uuid()::text,
  grp          text not null,
  event_type   text not null,
  symbol       text,
  event_date   text,
  cash_amount  numeric default 0,
  share_delta  numeric default 0,
  note         text,
  created_at   timestamptz default now()
);

-- 5. Enable Realtime on orders
alter publication supabase_realtime add table public.orders;

-- 6. Row Level Security (disable for simplicity in this demo)
alter table public.securities disable row level security;
alter table public.orders disable row level security;
alter table public.settings disable row level security;
alter table public.portfolio_events disable row level security;

-- 7. Seed default securities
insert into public.securities (symbol, name, grp, type, price, base) values
  ('0050.TW',    '元大台灣50',        'etf',   'ETF',    182.50,  181.00),
  ('0056.TW',    '元大高股息',         'etf',   'ETF',    33.20,   33.00),
  ('006208.TW',  '富邦台50',           'etf',   'ETF',    95.10,   94.50),
  ('00878.TW',   '國泰永續高股息',     'etf',   'ETF',    20.80,   20.70),
  ('00919.TW',   '群益台灣精選高息',   'etf',   'ETF',    22.40,   22.30),
  ('2330.TW',    '台積電',             'stock', 'EQUITY', 978.00,  970.00),
  ('2317.TW',    '鴻海',               'stock', 'EQUITY', 183.00,  180.00),
  ('2454.TW',    '聯發科',             'stock', 'EQUITY', 1255.00, 1240.00),
  ('2881.TW',    '富邦金',             'stock', 'EQUITY', 88.50,   87.00),
  ('1101.TW',    '台泥',               'stock', 'EQUITY', 39.20,   38.80)
on conflict (symbol) do nothing;

-- 8. Default settings
insert into public.settings (key, value) values
  ('portfolio', '{"initialCash": 1000000}')
on conflict (key) do nothing;
