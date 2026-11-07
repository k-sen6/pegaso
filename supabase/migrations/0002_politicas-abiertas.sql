-- 0002: abrir políticas anónimas para demo sin auth.
-- Permite subir fotos y registrar filas `fotos` sin sesión de usuario.
-- Al introducir auth (email/password) se protege de nuevo limitando a authenticated.

drop policy if exists "subida fotos autenticada" on storage.objects;
create policy "subida fotos abierta"
  on storage.objects for insert to anon, authenticated with check (bucket_id = 'fotos');

drop policy if exists "actualizar fotos autenticada" on storage.objects;
create policy "actualizar fotos abierta"
  on storage.objects for update to anon, authenticated using (bucket_id = 'fotos') with check (bucket_id = 'fotos');

drop policy if exists "eliminar fotos autenticada" on storage.objects;
create policy "eliminar fotos abierta"
  on storage.objects for delete to anon, authenticated using (bucket_id = 'fotos');

drop policy if exists "escritura fotos autenticada" on public.fotos;
create policy "escritura fotos abierta"
  on public.fotos for all to anon, authenticated using (true) with check (true);
