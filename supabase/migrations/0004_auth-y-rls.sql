-- 0004: autenticación email/contraseña + RLS recomendado + limpieza de seeds
-- Ejecutar en Supabase → SQL Editor (o con tools/supabase.ts si hay SUPABASE_DB_URL).
--
-- Modelo: cada usuario autenticado es dueño de UNA fila en `vendedores`,
-- reutilizando su UUID de auth como `vendedores.id`. Así `productos.vendedor_id`
-- apunta directamente a `auth.uid()` y no hace falta columna extra.

-- ── 1) Cerrar escrituras anónimas abiertas ────────────────────────────────
drop policy if exists "escritura productos abierta" on public.productos;
drop policy if exists "escritura fotos abierta" on public.fotos;
drop policy if exists "subida fotos abierta" on storage.objects;
drop policy if exists "actualizar fotos abierta" on storage.objects;
drop policy if exists "eliminar fotos abierta" on storage.objects;

-- ── 2) Vendedores: solo el dueño gestiona su fila (id = auth.uid()) ───────
drop policy if exists "escritura vendedores autenticada" on public.vendedores;
drop policy if exists "vendedores propias insert" on public.vendedores;
drop policy if exists "vendedores propias update" on public.vendedores;
drop policy if exists "vendedores propias delete" on public.vendedores;

create policy "vendedores propias insert"
  on public.vendedores for insert to authenticated
  with check (id = auth.uid());

create policy "vendedores propias update"
  on public.vendedores for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "vendedores propias delete"
  on public.vendedores for delete to authenticated
  using (id = auth.uid());

-- ── 3) Productos: dueño del vendedor ──────────────────────────────────────
drop policy if exists "escritura productos autenticada" on public.productos;
drop policy if exists "productos propios all" on public.productos;

create policy "productos propios all"
  on public.productos for all to authenticated
  using (vendedor_id = auth.uid())
  with check (vendedor_id = auth.uid());

-- ── 4) Fotos: dueño del producto ──────────────────────────────────────────
drop policy if exists "escritura fotos autenticada" on public.fotos;
drop policy if exists "fotos propias all" on public.fotos;

create policy "fotos propias all"
  on public.fotos for all to authenticated
  using (
    exists (
      select 1 from public.productos p
      where p.id = fotos.producto_id and p.vendedor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.productos p
      where p.id = fotos.producto_id and p.vendedor_id = auth.uid()
    )
  );

-- ── 5) Storage: subida solo autenticada ───────────────────────────────────
drop policy if exists "subida fotos autenticada" on storage.objects;
drop policy if exists "actualizar fotos autenticada" on storage.objects;
drop policy if exists "eliminar fotos autenticada" on storage.objects;

create policy "subida fotos autenticada"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos');
create policy "actualizar fotos autenticada"
  on storage.objects for update to authenticated
  using (bucket_id = 'fotos') with check (bucket_id = 'fotos');
create policy "eliminar fotos autenticada"
  on storage.objects for delete to authenticated
  using (bucket_id = 'fotos');

-- ── 6) Limpieza: borrar vendedores sembrados (sin cuenta) ─────────────────
-- Los vendedores reales usan id = auth.uid(); los sembrados no están en auth.users.
delete from public.vendedores
where id not in (select id from auth.users);
