-- Rubik OS - Core operational schema.
-- Phase 2 creates the English operational model centered on work_orders.
-- This migration is versioned only; do not run it against Supabase until reviewed.

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

-- Clients and intake channels.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  display_name text,
  document_id text,
  notes text,
  default_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_channels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  channel_id uuid not null references public.contact_channels(id),
  contact_value text not null,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.contact_channels (code, name)
values
  ('whatsapp', 'WhatsApp'),
  ('instagram', 'Instagram'),
  ('tiktok', 'TikTok'),
  ('email', 'Email'),
  ('phone', 'Phone'),
  ('manual', 'Manual')
on conflict (code) do nothing;

-- Work orders: central operational entity.

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  source_channel_id uuid references public.contact_channels(id),
  title text not null,
  description text,
  furniture_type text,
  room text,
  location text,
  priority text not null default 'normal',
  status text not null default 'nuevo_contacto',
  is_blocked boolean not null default false,
  requires_diego_approval boolean not null default true,
  tentative_delivery_date date,
  confirmed_delivery_date date,
  created_by text not null default 'rubik_os',
  assigned_to text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_orders_priority_check check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  constraint work_orders_status_check check (
    status in (
      'nuevo_contacto',
      'relevamiento_ia',
      'esperando_datos_cliente',
      'orden_creada',
      'mini_propuesta_generada',
      'esperando_revision_diego',
      'requiere_modificacion',
      'presupuesto_tentativo_aprobado',
      'presupuesto_enviado_cliente',
      'esperando_respuesta_cliente',
      'cliente_pide_cambios',
      'cliente_acepta_tentativo',
      'desglose_tecnico',
      'consulta_maderera',
      'consulta_operativa',
      'fecha_tentativa_generada',
      'esperando_autorizacion_final_diego',
      'aprobado_para_confirmar',
      'confirmado_con_cliente',
      'esperando_sena',
      'sena_recibida',
      'en_diseno_final',
      'en_corte',
      'en_montaje',
      'en_instalacion',
      'instalado',
      'postventa',
      'cerrado',
      'cancelado',
      'pausado_por_cliente',
      'pausado_por_obra',
      'pausado_por_proveedor',
      'esperando_entrega_externa',
      'reactivacion_pendiente',
      'reactivado_en_revision',
      'bloqueado_por_dependencia',
      'conflicto_de_agenda'
    )
  )
);

create table if not exists public.work_order_status_history (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text,
  reason text,
  created_at timestamptz not null default now()
);

-- Conversations and files.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  client_id uuid references public.clients(id),
  channel_id uuid references public.contact_channels(id),
  sender_type text not null,
  sender_name text,
  body text,
  message_external_id text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint messages_sender_type_check check (
    sender_type in ('client', 'sales_ai', 'planning_ai', 'diego', 'team', 'supplier', 'system')
  )
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  message_id uuid references public.messages(id) on delete set null,
  client_id uuid references public.clients(id),
  file_name text,
  file_type text,
  mime_type text,
  storage_path text,
  public_url text,
  notes text,
  created_at timestamptz not null default now(),
  constraint attachments_file_type_check check (
    file_type is null
    or file_type in ('photo', 'video', 'audio', 'pdf', 'document', 'screenshot', 'other')
  )
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  label text not null,
  room text,
  width_mm numeric,
  height_mm numeric,
  depth_mm numeric,
  unit text not null default 'mm',
  source text,
  is_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint measurements_source_check check (
    source is null
    or source in ('client_reported', 'photo_estimate', 'diego_measured', 'team_measured', 'imported')
  )
);

-- Rubik Design Engine.

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  title text not null,
  design_type text not null default 'mini_proposal',
  status text not null default 'draft',
  version integer not null default 1,
  source_tool text not null default 'rubik_design_engine',
  data jsonb,
  preview_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint designs_design_type_check check (
    design_type in ('mini_proposal', 'technical_design', 'final_design', 'external_import')
  ),
  constraint designs_status_check check (
    status in ('draft', 'waiting_diego_review', 'approved_by_diego', 'needs_changes', 'rejected', 'final')
  ),
  constraint designs_version_check check (version > 0)
);

create table if not exists public.design_modules (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references public.designs(id) on delete cascade,
  module_code text not null,
  module_name text,
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  position_z numeric not null default 0,
  width_mm numeric,
  height_mm numeric,
  depth_mm numeric,
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_parts (
  id uuid primary key default gen_random_uuid(),
  design_id uuid not null references public.designs(id) on delete cascade,
  design_module_id uuid references public.design_modules(id) on delete set null,
  part_name text not null,
  material_code text,
  quantity numeric not null default 1,
  width_mm numeric,
  height_mm numeric,
  thickness_mm numeric,
  edge_front_mm numeric,
  edge_back_mm numeric,
  edge_left_mm numeric,
  edge_right_mm numeric,
  notes text,
  created_at timestamptz not null default now(),
  constraint design_parts_quantity_check check (quantity > 0)
);

-- Quotes and pricing.
-- Previous migrations may already have quotes and quote_items. This block extends them safely.

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  design_id uuid references public.designs(id) on delete set null,
  quote_number text unique,
  status text not null default 'borrador',
  currency text not null default 'ARS',
  exchange_rate_reference text,
  exchange_rate_value numeric,
  subtotal numeric not null default 0,
  discount_amount numeric not null default 0,
  tax_amount numeric not null default 0,
  total_amount numeric not null default 0,
  deposit_required boolean not null default true,
  deposit_amount numeric,
  quote_valid_until date,
  price_freeze_date date,
  update_rule text,
  diego_approval_required boolean not null default true,
  approved_by_diego_at timestamptz,
  sent_to_client_at timestamptz,
  accepted_by_client_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_operational_status_check check (
    status in (
      'borrador',
      'tentativo',
      'esperando_revision_diego',
      'aprobado_por_diego',
      'enviado_cliente',
      'aceptado_cliente',
      'rechazado_cliente',
      'vencido',
      'requiere_actualizacion',
      'confirmado',
      'preliminar',
      'pendiente_validacion_diego',
      'validada',
      'señada',
      'convertida_en_proyecto'
    )
  ),
  constraint quotes_operational_currency_check check (currency in ('ARS', 'USD'))
);

alter table public.quotes
  add column if not exists work_order_id uuid references public.work_orders(id) on delete cascade,
  add column if not exists design_id uuid references public.designs(id) on delete set null,
  add column if not exists exchange_rate_reference text,
  add column if not exists exchange_rate_value numeric,
  add column if not exists subtotal numeric not null default 0,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists tax_amount numeric not null default 0,
  add column if not exists total_amount numeric not null default 0,
  add column if not exists deposit_required boolean not null default true,
  add column if not exists deposit_amount numeric,
  add column if not exists quote_valid_until date,
  add column if not exists price_freeze_date date,
  add column if not exists update_rule text,
  add column if not exists diego_approval_required boolean not null default true,
  add column if not exists sent_to_client_at timestamptz,
  add column if not exists accepted_by_client_at timestamptz,
  add column if not exists notes text;

alter table public.quotes
  alter column quote_number drop not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'title'
  ) then
    alter table public.quotes
      alter column title set default 'Operational quote';
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quotes'::regclass
      and conname = 'quotes_status_check'
  ) then
    alter table public.quotes drop constraint quotes_status_check;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quotes'::regclass
      and conname = 'quotes_status_check'
  ) then
    alter table public.quotes
      add constraint quotes_status_check check (
        status in (
          'borrador',
          'tentativo',
          'esperando_revision_diego',
          'aprobado_por_diego',
          'enviado_cliente',
          'aceptado_cliente',
          'rechazado_cliente',
          'vencido',
          'requiere_actualizacion',
          'confirmado',
          'preliminar',
          'pendiente_validacion_diego',
          'validada',
          'señada',
          'convertida_en_proyecto'
        )
      ) not valid;
  end if;
end;
$$;

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_type text,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  constraint quote_items_operational_item_type_check check (
    item_type is null
    or item_type in (
      'material',
      'edge',
      'hardware',
      'labor',
      'installation',
      'freight',
      'margin',
      'third_party',
      'service',
      'other'
    )
  )
);

alter table public.quote_items
  add column if not exists unit_price numeric not null default 0,
  add column if not exists total_price numeric not null default 0,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quote_items'
      and column_name = 'unit'
  ) then
    alter table public.quote_items
      alter column unit set default 'unit';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quote_items'
      and column_name = 'unit_price_ars'
  ) then
    alter table public.quote_items
      alter column unit_price_ars set default 0;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quote_items'
      and column_name = 'total_ars'
  ) then
    alter table public.quote_items
      alter column total_ars set default 0;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quote_items'::regclass
      and conname = 'quote_items_item_type_check'
  ) then
    alter table public.quote_items drop constraint quote_items_item_type_check;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quote_items'::regclass
      and conname = 'quote_items_item_type_check'
  ) then
    alter table public.quote_items
      add constraint quote_items_item_type_check check (
        item_type is null
        or item_type in (
          'material',
          'edge',
          'hardware',
          'labor',
          'installation',
          'freight',
          'margin',
          'third_party',
          'service',
          'other'
        )
      ) not valid;
  end if;
end;
$$;

-- Approvals, blockers, dependencies and planning.

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid references public.work_orders(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  design_id uuid references public.designs(id) on delete set null,
  approval_type text not null,
  status text not null default 'pending',
  requested_by text,
  requested_to text not null default 'diego',
  decision_by text,
  decision_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approvals_approval_type_check check (
    approval_type in (
      'diego_quote_review',
      'diego_design_review',
      'diego_delivery_date_review',
      'diego_production_approval',
      'diego_reactivation_approval',
      'client_quote_acceptance',
      'supplier_confirmation',
      'installer_confirmation'
    )
  ),
  constraint approvals_status_check check (
    status in ('pending', 'approved', 'rejected', 'needs_changes', 'cancelled')
  )
);

create table if not exists public.blockers (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  blocker_type text not null,
  title text not null,
  description text,
  responsible_party text,
  status text not null default 'open',
  severity text not null default 'medium',
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blockers_blocker_type_check check (
    blocker_type in (
      'cliente',
      'obra_constructora',
      'proveedor_maderera',
      'materiales',
      'agenda',
      'equipo',
      'diseno',
      'presupuesto',
      'pago_sena',
      'aprobacion_diego',
      'tercero_instalador',
      'otro'
    )
  ),
  constraint blockers_status_check check (status in ('open', 'in_progress', 'resolved', 'cancelled')),
  constraint blockers_severity_check check (severity in ('low', 'medium', 'high', 'critical'))
);

create table if not exists public.dependencies (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  depends_on_work_order_id uuid references public.work_orders(id) on delete set null,
  dependency_type text not null,
  title text not null,
  description text,
  responsible_party text,
  status text not null default 'pending',
  due_date date,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dependencies_no_self_dependency_check check (
    depends_on_work_order_id is null
    or depends_on_work_order_id <> work_order_id
  ),
  constraint dependencies_dependency_type_check check (
    dependency_type in (
      'material_delivery',
      'supplier_confirmation',
      'client_information',
      'obra_ready',
      'diego_approval',
      'installer_availability',
      'payment',
      'other_project',
      'other'
    )
  ),
  constraint dependencies_status_check check (status in ('pending', 'satisfied', 'blocked', 'cancelled'))
);

create table if not exists public.planning_alerts (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  alert_type text not null,
  title text not null,
  message text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  generated_by text not null default 'planning_ai',
  assigned_to text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planning_alerts_alert_type_check check (
    alert_type in (
      'falta_confirmacion_diego',
      'falta_respuesta_cliente',
      'falta_sena',
      'falta_medidas',
      'falta_confirmacion_maderera',
      'falta_confirmacion_instalador',
      'conflicto_agenda',
      'obra_no_lista',
      'dependencia_bloqueante',
      'fecha_tentativa_no_confirmada',
      'reactivacion_requiere_revision',
      'otro'
    )
  ),
  constraint planning_alerts_status_check check (status in ('open', 'in_progress', 'resolved', 'cancelled')),
  constraint planning_alerts_severity_check check (severity in ('low', 'medium', 'high', 'critical'))
);

create table if not exists public.project_reactivations (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  paused_reason text,
  paused_at timestamptz,
  reactivation_requested_at timestamptz not null default now(),
  requested_by text,
  reactivation_reason text,
  status text not null default 'pending_review',
  diego_approval_id uuid references public.approvals(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_reactivations_status_check check (
    status in ('pending_review', 'approved', 'rejected', 'scheduled', 'cancelled')
  )
);

-- Payments and appointments.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  payment_type text not null default 'deposit',
  status text not null default 'pending',
  amount numeric not null,
  currency text not null default 'ARS',
  payment_method text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_payment_type_check check (
    payment_type in ('deposit', 'partial', 'final', 'refund', 'other')
  ),
  constraint payments_status_check check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  constraint payments_currency_check check (currency in ('ARS', 'USD')),
  constraint payments_amount_check check (amount >= 0)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  appointment_type text not null,
  status text not null default 'tentative',
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  assigned_to text,
  location text,
  google_calendar_event_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_appointment_type_check check (
    appointment_type in (
      'measurement_visit',
      'diego_review',
      'supplier_pickup',
      'cutting',
      'assembly',
      'installation',
      'post_sale_visit',
      'other'
    )
  ),
  constraint appointments_status_check check (
    status in ('tentative', 'confirmed', 'cancelled', 'completed', 'rescheduled')
  ),
  constraint appointments_time_order_check check (
    starts_at is null
    or ends_at is null
    or ends_at >= starts_at
  )
);

-- Suppliers, requests and inventory.

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  supplier_type text,
  contact_name text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_supplier_type_check check (
    supplier_type is null
    or supplier_type in ('maderera', 'herrajes', 'transporte', 'tercero_instalador', 'otro')
  )
);

create table if not exists public.supplier_requests (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  request_type text not null,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  response_summary text,
  estimated_ready_date date,
  quoted_amount numeric,
  currency text not null default 'ARS',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_requests_request_type_check check (
    request_type in (
      'material_availability',
      'price_check',
      'cutting_time',
      'hardware_availability',
      'delivery_time',
      'other'
    )
  ),
  constraint supplier_requests_status_check check (
    status in ('pending', 'confirmed', 'unavailable', 'cancelled', 'needs_follow_up')
  ),
  constraint supplier_requests_currency_check check (currency in ('ARS', 'USD'))
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_code text,
  name text not null,
  category text,
  unit text,
  quantity_on_hand numeric not null default 0,
  minimum_quantity numeric not null default 0,
  supplier_id uuid references public.suppliers(id) on delete set null,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_items_category_check check (
    category is null
    or category in ('placa', 'canto', 'herraje', 'herramienta', 'consumible', 'otro')
  ),
  constraint inventory_items_quantity_on_hand_check check (quantity_on_hand >= 0),
  constraint inventory_items_minimum_quantity_check check (minimum_quantity >= 0)
);

-- Post sale.

create table if not exists public.post_sale_cases (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  client_id uuid references public.clients(id),
  title text not null,
  description text,
  status text not null default 'open',
  severity text not null default 'medium',
  resolution_notes text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_sale_cases_status_check check (
    status in ('open', 'in_progress', 'waiting_client', 'resolved', 'closed', 'cancelled')
  ),
  constraint post_sale_cases_severity_check check (severity in ('low', 'medium', 'high', 'critical'))
);

-- Indexes for common operational filters.

create index if not exists client_contacts_client_id_idx on public.client_contacts(client_id);
create index if not exists client_contacts_channel_id_idx on public.client_contacts(channel_id);
create index if not exists client_contacts_client_channel_idx on public.client_contacts(client_id, channel_id);

create index if not exists work_orders_client_id_idx on public.work_orders(client_id);
create index if not exists work_orders_status_idx on public.work_orders(status);
create index if not exists work_orders_source_channel_id_idx on public.work_orders(source_channel_id);
create index if not exists work_orders_tentative_delivery_date_idx on public.work_orders(tentative_delivery_date);
create index if not exists work_orders_confirmed_delivery_date_idx on public.work_orders(confirmed_delivery_date);
create index if not exists work_orders_is_blocked_idx on public.work_orders(is_blocked);

create index if not exists work_order_status_history_work_order_id_created_at_idx
  on public.work_order_status_history(work_order_id, created_at);

create index if not exists messages_work_order_id_idx on public.messages(work_order_id);
create index if not exists messages_client_id_idx on public.messages(client_id);
create index if not exists messages_channel_id_idx on public.messages(channel_id);
create index if not exists messages_occurred_at_idx on public.messages(occurred_at);

create index if not exists attachments_work_order_id_idx on public.attachments(work_order_id);
create index if not exists attachments_message_id_idx on public.attachments(message_id);
create index if not exists attachments_client_id_idx on public.attachments(client_id);

create index if not exists measurements_work_order_id_idx on public.measurements(work_order_id);
create index if not exists measurements_is_confirmed_idx on public.measurements(is_confirmed);

create index if not exists designs_work_order_id_idx on public.designs(work_order_id);
create index if not exists designs_status_idx on public.designs(status);
create index if not exists design_modules_design_id_idx on public.design_modules(design_id);
create index if not exists design_parts_design_id_idx on public.design_parts(design_id);
create index if not exists design_parts_design_module_id_idx on public.design_parts(design_module_id);

create index if not exists quotes_work_order_id_idx on public.quotes(work_order_id);
create index if not exists quotes_design_id_idx on public.quotes(design_id);
create index if not exists quotes_status_operational_idx on public.quotes(status);
create index if not exists quote_items_quote_id_operational_idx on public.quote_items(quote_id);

create index if not exists approvals_work_order_id_idx on public.approvals(work_order_id);
create index if not exists approvals_quote_id_idx on public.approvals(quote_id);
create index if not exists approvals_design_id_idx on public.approvals(design_id);
create index if not exists approvals_status_idx on public.approvals(status);

create index if not exists blockers_work_order_id_idx on public.blockers(work_order_id);
create index if not exists blockers_status_idx on public.blockers(status);
create index if not exists blockers_type_idx on public.blockers(blocker_type);

create index if not exists dependencies_work_order_id_idx on public.dependencies(work_order_id);
create index if not exists dependencies_depends_on_work_order_id_idx on public.dependencies(depends_on_work_order_id);
create index if not exists dependencies_status_idx on public.dependencies(status);

create index if not exists planning_alerts_work_order_id_idx on public.planning_alerts(work_order_id);
create index if not exists planning_alerts_status_idx on public.planning_alerts(status);
create index if not exists planning_alerts_alert_type_idx on public.planning_alerts(alert_type);

create index if not exists project_reactivations_work_order_id_idx on public.project_reactivations(work_order_id);
create index if not exists project_reactivations_status_idx on public.project_reactivations(status);

create index if not exists payments_work_order_id_idx on public.payments(work_order_id);
create index if not exists payments_quote_id_idx on public.payments(quote_id);
create index if not exists payments_status_idx on public.payments(status);

create index if not exists appointments_work_order_id_idx on public.appointments(work_order_id);
create index if not exists appointments_starts_at_idx on public.appointments(starts_at);
create index if not exists appointments_status_idx on public.appointments(status);

create index if not exists suppliers_supplier_type_idx on public.suppliers(supplier_type);
create index if not exists suppliers_is_active_idx on public.suppliers(is_active);
create index if not exists supplier_requests_work_order_id_idx on public.supplier_requests(work_order_id);
create index if not exists supplier_requests_supplier_id_idx on public.supplier_requests(supplier_id);
create index if not exists supplier_requests_status_idx on public.supplier_requests(status);

create index if not exists inventory_items_item_code_idx on public.inventory_items(item_code);
create index if not exists inventory_items_category_idx on public.inventory_items(category);
create index if not exists inventory_items_supplier_id_idx on public.inventory_items(supplier_id);

create index if not exists post_sale_cases_work_order_id_idx on public.post_sale_cases(work_order_id);
create index if not exists post_sale_cases_client_id_idx on public.post_sale_cases(client_id);
create index if not exists post_sale_cases_status_idx on public.post_sale_cases(status);

-- updated_at triggers.

do $$
declare
  table_name text;
  trigger_name text;
begin
  foreach table_name in array array[
    'clients',
    'client_contacts',
    'work_orders',
    'measurements',
    'designs',
    'design_modules',
    'quotes',
    'approvals',
    'blockers',
    'dependencies',
    'planning_alerts',
    'project_reactivations',
    'payments',
    'appointments',
    'suppliers',
    'supplier_requests',
    'inventory_items',
    'post_sale_cases'
  ]
  loop
    trigger_name := table_name || '_set_updated_at';

    if not exists (
      select 1
      from pg_trigger
      where tgrelid = ('public.' || table_name)::regclass
        and tgname = trigger_name
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
        trigger_name,
        table_name
      );
    end if;
  end loop;
end;
$$;

-- Comments.

comment on table public.clients is 'Base client records for Rubik OS.';
comment on table public.contact_channels is 'Inbound and outbound contact channel catalog.';
comment on table public.client_contacts is 'Client contact values by channel.';
comment on table public.work_orders is 'Central operational entity. Every sale, design, quote, blocker and post-sale case hangs from a work order.';
comment on table public.work_order_status_history is 'Audit trail of work order status transitions.';
comment on table public.messages is 'Messages from clients, AI agents, Diego, team members, suppliers and system events.';
comment on table public.attachments is 'Photos, videos, audio, PDFs, screenshots and other files linked to orders, messages or clients.';
comment on table public.measurements is 'Approximate or confirmed measurements for a work order.';
comment on table public.designs is 'Rubik Design Engine proposals and technical designs.';
comment on table public.design_modules is 'Modules placed inside a design.';
comment on table public.design_parts is 'Parts generated by a design or design module for cutlists and technical review.';
comment on table public.quotes is 'Quotes and pricing conditions. Critical quotes require Diego approval.';
comment on table public.quote_items is 'Quote line items for materials, edges, hardware, labor, installation, freight and margin.';
comment on table public.approvals is 'Critical approvals from Diego, clients, suppliers or installers.';
comment on table public.blockers is 'Open and resolved blockers that prevent operational progress.';
comment on table public.dependencies is 'Internal and external dependencies required before an order can advance.';
comment on table public.planning_alerts is 'Planning AI alerts for missing confirmations, blockers and agenda conflicts.';
comment on table public.project_reactivations is 'Review history for paused projects that request reactivation.';
comment on table public.payments is 'Deposits, partial payments, final payments and refunds.';
comment on table public.appointments is 'Tentative and confirmed operational appointments.';
comment on table public.suppliers is 'Suppliers, lumberyards, hardware vendors, transport and external installers.';
comment on table public.supplier_requests is 'Supplier requests for stock, price, cutting time, hardware availability and delivery.';
comment on table public.inventory_items is 'Basic inventory for boards, edge banding, hardware, tools and consumables.';
comment on table public.post_sale_cases is 'Post-sale follow-up, issues, adjustments and warranty cases.';
