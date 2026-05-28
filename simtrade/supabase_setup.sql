-- ============================================================
--  SimTrade — Supabase 資料庫初始化腳本
--  在 Supabase Dashboard → SQL Editor 中執行
-- ============================================================

-- 1. 訂單記錄表
create table if not exists orders (
  id          text primary key,
  created_at  timestamptz default now(),
  time        text,
  symbol      text not null,
  name        text,
  qty         numeric not null,
  side        text not null,       -- 'buy' | 'sell'
  price       numeric not null,
  amount      numeric not null,
  reason      text,
  tax         numeric default 0,
  status      text default 'executed'
);

-- 2. 設定表（儲存模擬資金）
create table if not exists settings (
  key   text primary key,
  value text not null
);

-- 預設資金 100萬
insert into settings (key, value) values ('capital', '1000000')
on conflict (key) do nothing;

-- ============================================================
-- Row Level Security（RLS）— 開放匿名讀寫（個人使用）
-- ============================================================
alter table orders   enable row level security;
alter table settings enable row level security;

-- 允許 anon 角色讀寫
create policy "anon all orders"   on orders   for all using (true) with check (true);
create policy "anon all settings" on settings for all using (true) with check (true);
