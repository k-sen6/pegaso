-- Pegaso 0007: imágenes en tres tamaños para redes lentas.
-- thumb_url (~320 px) para tarjetas, card_url (~640 px) para fichas y
-- url (1280 px) para el detalle/zoom. Todas WebP.

alter table public.fotos add column if not exists thumb_url text;
alter table public.fotos add column if not exists card_url text;

-- Índices para las consultas embebidas del catálogo.
create index if not exists productos_vendedor_idx on public.productos (vendedor_id);
create index if not exists productos_created_idx on public.productos (created_at desc);
create index if not exists fotos_producto_idx on public.fotos (producto_id, created_at desc);
