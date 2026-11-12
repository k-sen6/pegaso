-- 0006: perfil de vendedor (WhatsApp + ubicación) y eliminación de cuenta
-- Ejecutar en Supabase → SQL Editor, con tools/supabase.ts o con psql.
--
-- Añade los datos que necesita el MVP lanzable:
--   · telefono  → WhatsApp principal para contactar por producto
--   · direccion → texto de la dirección de recogida
--   · lat/lng   → coordenadas opcionales para el mapa
-- También estandariza `verificacion` y crea la función de borrado de cuenta.

-- ── 1) Columnas nuevas ────────────────────────────────────────────────────
alter table public.vendedores
  add column if not exists telefono text,
  add column if not exists direccion text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- ── 2) Verificación: un solo vocabulario ──────────────────────────────────
update public.vendedores set verificacion = 'verificado' where verificacion = 'verificada';
update public.vendedores set verificacion = 'rechazado' where verificacion = 'rechazada';
update public.vendedores set verificacion = 'pendiente' where verificacion not in ('pendiente','verificado','rechazado');

alter table public.vendedores alter column verificacion set default 'pendiente';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vendedores_verificacion_check'
  ) then
    alter table public.vendedores
      add constraint vendedores_verificacion_check
      check (verificacion in ('pendiente','verificado','rechazado'));
  end if;
end $$;

-- ── 3) Storage: cada usuario solo toca su propia carpeta (uid/...) ────────
drop policy if exists "subida fotos autenticada" on storage.objects;
drop policy if exists "actualizar fotos autenticada" on storage.objects;
drop policy if exists "eliminar fotos autenticada" on storage.objects;

create policy "subida fotos autenticada"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "actualizar fotos autenticada"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "eliminar fotos autenticada"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 4) Eliminar la propia cuenta (datos + auth) ───────────────────────────
create or replace function public.eliminar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  delete from public.productos where vendedor_id = uid;
  delete from public.vendedores where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.eliminar_mi_cuenta() from public;
grant execute on function public.eliminar_mi_cuenta() to authenticated;
