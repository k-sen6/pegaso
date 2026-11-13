import type { SupabaseClient } from "@supabase/supabase-js";
import type { PegasoTypes } from "@/lib/supabase";

export interface BlobsFoto {
  full: Blob;
  card: Blob;
  thumb: Blob;
}

export interface UrlsFoto {
  url: string;
  cardUrl: string;
  thumbUrl: string;
}

function extension(blob: Blob): string {
  if (blob.type.includes("jpeg")) return "jpg";
  if (blob.type.includes("png")) return "png";
  return "webp";
}

/** Sube la foto en tres tamaños con caché de un año. */
export async function subirFoto(
  sb: SupabaseClient<PegasoTypes>,
  userId: string,
  blobs: BlobsFoto,
  baseRuta?: string
): Promise<UrlsFoto> {
  const base =
    baseRuta ??
    `${userId}/prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const entradas = [
    [`${base}.${extension(blobs.full)}`, blobs.full],
    [`${base}-card.${extension(blobs.card)}`, blobs.card],
    [`${base}-thumb.${extension(blobs.thumb)}`, blobs.thumb],
  ] as const;

  const resultados = await Promise.all(
    entradas.map(([ruta, blob]) =>
      sb.storage.from("fotos").upload(ruta, blob, {
        contentType: blob.type || "image/webp",
        cacheControl: "31536000",
        upsert: true,
      })
    )
  );

  const fallo = resultados.find((r) => r.error);
  if (fallo?.error) throw fallo.error;

  const url = (ruta: string) => sb.storage.from("fotos").getPublicUrl(ruta).data.publicUrl;

  return {
    url: url(entradas[0][0]),
    cardUrl: url(entradas[1][0]),
    thumbUrl: url(entradas[2][0]),
  };
}
