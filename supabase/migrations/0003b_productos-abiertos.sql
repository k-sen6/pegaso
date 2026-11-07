-- 0003b: permitir inserción de productos sin auth (temporal)
drop policy if exists "escritura productos abierta" on public.productos;
create policy "escritura productos abierta"
  on public.productos for all to anon, authenticated using (true) with check (true);
