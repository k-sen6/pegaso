-- Pegaso — Esquema inicial (Supabase)
-- Fuente versionada: se aplica con tools/supabase.ts (node + postgres).
-- Las políticas RLS dejan lectura pública de catálogo; escritura solo
-- mediante service_role (backend) o usuario autenticado.

create extension if not exists pgcrypto;

create table if not exists public.vendedores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  sector text not null,
  provincia text not null,
  municipio text not null,
  descripcion text not null default '',
  verificacion text not null default 'pendiente',
  foto_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text not null default '',
  precio_cup integer not null default 0,
  sector text not null,
  destacado boolean not null default false,
  hue integer not null default 225,
  vendedor_id uuid references public.vendedores (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references public.productos (id) on delete cascade,
  nombre_producto text not null default 'Foto sin título',
  url text,
  peso_bytes integer not null default 0,
  ancho integer not null default 0,
  alto integer not null default 0,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table if not exists public.reservas (
  id text primary key,
  producto_slug text not null,
  modo text not null,
  estado text not null default 'local',
  sincronizado boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.vendedores enable row level security;
alter table public.productos enable row level security;
alter table public.fotos enable row level security;
alter table public.reservas enable row level security;

-- Lectura pública del catálogo (anon + autenticados)
create policy "lectura publica vendedores"
  on public.vendedores for select to anon, authenticated using (true);
create policy "lectura publica productos"
  on public.productos for select to anon, authenticated using (true);
create policy "lectura publica fotos"
  on public.fotos for select to anon, authenticated using (true);

-- Escritura solo backend (service_role bypassa RLS en cualquier caso);
-- estas políticas dejan la puerta abierta a usuarios autenticados.
create policy "escritura vendedores autenticada"
  on public.vendedores for all to authenticated using (true) with check (true);
create policy "escritura productos autenticada"
  on public.productos for all to authenticated using (true) with check (true);
create policy "escritura fotos autenticada"
  on public.fotos for all to authenticated using (true) with check (true);
create policy "escritura reservas autenticada"
  on public.reservas for all to authenticated using (true) with check (true);

-- Storage: bucket público "fotos" (lectura) + subida autenticada
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "subida fotos autenticada"
  on storage.objects for insert to authenticated with check (bucket_id = 'fotos');
create policy "actualizar fotos autenticada"
  on storage.objects for update to authenticated using (bucket_id = 'fotos') with check (bucket_id = 'fotos');
create policy "eliminar fotos autenticada"
  on storage.objects for delete to authenticated using (bucket_id = 'fotos');
create policy "lectura fotos publica"
  on storage.objects for select to anon, authenticated using (bucket_id = 'fotos');
