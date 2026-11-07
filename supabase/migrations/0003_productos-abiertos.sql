-- 0003: permitir inserción de productos sin auth (temporal, hasta cuentas de vendedor)
-- y permitir lectura/escritura de fotos sin restricción de vendedor_id

drop policy if exists "escritura productos autenticada" on public.productos;
create policy "escritura productos abierta"
  on public.productos for all to anon, authenticated using (true) with check (true);

drop policy if exists "escritura fotos autenticada" on public.fotos;
create policy "escritura fotos abierta"
  on public.fotos for all to anon, authenticated using (true) with check (true);
