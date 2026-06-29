-- Rubik OS - Quotes, materials, exchange rates and cutlists.
-- This migration creates the first quoting/despiece base model.
-- External exchange-rate APIs are intentionally not connected yet.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  brand text not null,
  category text not null,
  substrate text,
  name text not null,
  color text,
  thickness_mm numeric,
  length_mm numeric,
  width_mm numeric,
  unit text not null,
  price_ars numeric not null,
  currency text not null default 'ARS',
  updated_at timestamptz not null default now(),
  source text,
  active boolean not null default true,
  constraint materials_currency_check check (currency in ('ARS', 'USD')),
  constraint materials_price_ars_check check (price_ars >= 0),
  constraint materials_thickness_mm_check check (thickness_mm is null or thickness_mm > 0),
  constraint materials_length_mm_check check (length_mm is null or length_mm > 0),
  constraint materials_width_mm_check check (width_mm is null or width_mm > 0)
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  rate_type text not null,
  buy_ars numeric,
  sell_ars numeric not null,
  source text,
  created_at timestamptz not null default now(),
  constraint exchange_rates_rate_type_check check (rate_type in ('oficial', 'blue', 'mep', 'ccl', 'manual')),
  constraint exchange_rates_buy_ars_check check (buy_ars is null or buy_ars >= 0),
  constraint exchange_rates_sell_ars_check check (sell_ars > 0),
  constraint exchange_rates_date_rate_type_key unique (date, rate_type)
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid,
  project_id uuid,
  quote_number text not null unique,
  title text not null,
  description text,
  status text not null default 'borrador',
  currency text not null default 'ARS',
  exchange_rate_id uuid references public.exchange_rates(id),
  subtotal_materials_ars numeric not null default 0,
  subtotal_hardware_ars numeric not null default 0,
  subtotal_services_ars numeric not null default 0,
  subtotal_labor_ars numeric not null default 0,
  waste_percentage numeric not null default 12,
  margin_percentage numeric not null default 35,
  discount_ars numeric not null default 0,
  total_ars numeric not null default 0,
  total_usd numeric,
  deposit_percentage numeric not null default 50,
  deposit_ars numeric not null default 0,
  deposit_usd numeric,
  valid_until timestamptz,
  frozen_at timestamptz,
  approved_by_diego boolean not null default false,
  approved_by_diego_at timestamptz,
  notes_internal text,
  notes_client text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_status_check check (status in ('borrador', 'preliminar', 'pendiente_validacion_diego', 'validada', 'enviada_cliente', 'señada', 'vencida', 'rechazada', 'convertida_en_proyecto')),
  constraint quotes_currency_check check (currency in ('ARS', 'USD')),
  constraint quotes_subtotal_materials_ars_check check (subtotal_materials_ars >= 0),
  constraint quotes_subtotal_hardware_ars_check check (subtotal_hardware_ars >= 0),
  constraint quotes_subtotal_services_ars_check check (subtotal_services_ars >= 0),
  constraint quotes_subtotal_labor_ars_check check (subtotal_labor_ars >= 0),
  constraint quotes_waste_percentage_check check (waste_percentage >= 0),
  constraint quotes_margin_percentage_check check (margin_percentage >= 0),
  constraint quotes_discount_ars_check check (discount_ars >= 0),
  constraint quotes_total_ars_check check (total_ars >= 0),
  constraint quotes_total_usd_check check (total_usd is null or total_usd >= 0),
  constraint quotes_deposit_percentage_check check (deposit_percentage >= 0 and deposit_percentage <= 100),
  constraint quotes_deposit_ars_check check (deposit_ars >= 0),
  constraint quotes_deposit_usd_check check (deposit_usd is null or deposit_usd >= 0),
  constraint quotes_diego_approval_timestamp_check check (((approved_by_diego = false and approved_by_diego_at is null) or approved_by_diego = true))
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_type text not null,
  description text not null,
  quantity numeric not null default 1,
  unit text not null,
  unit_price_ars numeric not null,
  total_ars numeric not null,
  notes text,
  constraint quote_items_item_type_check check (item_type in ('material', 'hardware', 'service', 'labor', 'other')),
  constraint quote_items_quantity_check check (quantity > 0),
  constraint quote_items_unit_price_ars_check check (unit_price_ars >= 0),
  constraint quote_items_total_ars_check check (total_ars >= 0)
);

create table if not exists public.cutlist_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  module_name text,
  piece_name text not null,
  material_id uuid references public.materials(id),
  quantity integer not null,
  length_mm numeric not null,
  width_mm numeric not null,
  thickness_mm numeric,
  edge_front_mm numeric not null default 0,
  edge_back_mm numeric not null default 0,
  edge_left_mm numeric not null default 0,
  edge_right_mm numeric not null default 0,
  grain_direction text,
  notes text,
  approved_for_cut boolean not null default false,
  created_at timestamptz not null default now(),
  constraint cutlist_items_quantity_check check (quantity > 0),
  constraint cutlist_items_length_mm_check check (length_mm > 0),
  constraint cutlist_items_width_mm_check check (width_mm > 0),
  constraint cutlist_items_thickness_mm_check check (thickness_mm is null or thickness_mm > 0),
  constraint cutlist_items_edges_check check (edge_front_mm >= 0 and edge_back_mm >= 0 and edge_left_mm >= 0 and edge_right_mm >= 0),
  constraint cutlist_items_grain_direction_check check (grain_direction is null or grain_direction in ('horizontal', 'vertical', 'indistinto'))
);

create index if not exists materials_active_idx on public.materials(active);
create index if not exists exchange_rates_date_rate_type_idx on public.exchange_rates(date, rate_type);
create index if not exists quotes_client_id_idx on public.quotes(client_id);
create index if not exists quotes_project_id_idx on public.quotes(project_id);
create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists quote_items_quote_id_idx on public.quote_items(quote_id);
create index if not exists cutlist_items_quote_id_idx on public.cutlist_items(quote_id);
create index if not exists cutlist_items_material_id_idx on public.cutlist_items(material_id);

do $$
begin
  if not exists (select 1 from pg_trigger where tgrelid = 'public.materials'::regclass and tgname = 'materials_set_updated_at') then
    create trigger materials_set_updated_at before update on public.materials for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgrelid = 'public.quotes'::regclass and tgname = 'quotes_set_updated_at') then
    create trigger quotes_set_updated_at before update on public.quotes for each row execute function public.set_updated_at();
  end if;
end;
$$;

comment on table public.materials is 'Rubik materials catalog used for quoting and cutlist costing.';
comment on table public.exchange_rates is 'Manual exchange-rate registry. Future dolar blue integrations will update sell_ars here for rate_type = blue.';
comment on column public.exchange_rates.sell_ars is 'ARS sell rate used when the client pays in USD. For now it must be loaded manually for the payment/deposit date.';
comment on table public.quotes is 'Quotes generated by Rubik OS. Final quotes require Diego validation before sending.';
comment on column public.quotes.frozen_at is 'Timestamp when the quote price becomes frozen after the client pays a deposit.';
comment on table public.quote_items is 'Cost and price lines that compose a quote.';
comment on table public.cutlist_items is 'Base cutlist/despiece items. These must be approved by Diego before sending to suppliers.';