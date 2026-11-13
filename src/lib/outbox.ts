"use client";

import { supabase } from "@/lib/supabase";
import {
  borrarPendiente,
  guardarPendiente,
  listarPendientes,
  type Pendiente,
} from "@/lib/db-local";
import { subirFoto } from "@/lib/subida";

export type DatosProducto = {
  nombre: string;
  descripcion: string;
  precio_cup: number;
  sector: string;
  destacado: boolean;
  vendedor_id: string;
  slug?: string;
};

export function nuevoPendiente(
  tipo: Pendiente["tipo"],
  datos: DatosProducto,
  opciones: {
    productoId?: string;
    foto?: Pendiente["foto"];
    quitarFoto?: boolean;
  } = {}
): Pendiente {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tipo,
    datos,
    productoId: opciones.productoId,
    foto: opciones.foto,
    quitarFoto: opciones.quitarFoto,
    intentos: 0,
    creado: Date.now(),
  };
}

/** Reintenta la cola offline. Devuelve cuántos elementos se completaron. */
export async function procesarPendientes(): Promise<number> {
  if (!supabase || typeof navigator === "undefined" || !navigator.onLine) {
    return 0;
  }
  const sb = supabase;
  const pendientes = await listarPendientes();
  let completados = 0;

  for (const p of pendientes) {
    try {
      if (p.tipo === "producto-borrar" && p.productoId) {
        const { error } = await sb
          .from("productos")
          .delete()
          .eq("id", p.productoId);
        if (error) throw error;
      } else {
        const datos = p.datos as unknown as DatosProducto;
        let urls: Awaited<ReturnType<typeof subirFoto>> | null = null;
        if (p.foto) {
          urls = await subirFoto(sb, datos.vendedor_id, {
            full: p.foto.full,
            card: p.foto.card,
            thumb: p.foto.thumb,
          });
        }

        let productoId = p.productoId;
        if (p.tipo === "producto-crear") {
          const { data, error } = await sb
            .from("productos")
            .insert({
              nombre: datos.nombre,
              descripcion: datos.descripcion,
              precio_cup: datos.precio_cup,
              sector: datos.sector,
              destacado: datos.destacado,
              vendedor_id: datos.vendedor_id,
              slug: datos.slug ?? `producto-${Date.now().toString(36)}`,
            })
            .select("id")
            .single();
          if (error) throw error;
          productoId = data.id;
        } else if (p.tipo === "producto-editar" && productoId) {
          const { error } = await sb
            .from("productos")
            .update({
              nombre: datos.nombre,
              descripcion: datos.descripcion,
              precio_cup: datos.precio_cup,
              sector: datos.sector,
              destacado: datos.destacado,
            })
            .eq("id", productoId);
          if (error) throw error;
          if (p.quitarFoto) {
            await sb.from("fotos").delete().eq("producto_id", productoId);
          }
        }

        if (urls && productoId) {
          const { error } = await sb.from("fotos").insert({
            producto_id: productoId,
            nombre_producto: datos.nombre,
            url: urls.url,
            card_url: urls.cardUrl,
            thumb_url: urls.thumbUrl,
            peso_bytes: p.foto?.peso ?? 0,
            ancho: p.foto?.ancho ?? 0,
            alto: p.foto?.alto ?? 0,
            estado: "sincronizada",
          });
          if (error) throw error;
        }
      }

      await borrarPendiente(p.id);
      completados += 1;
    } catch (e) {
      await guardarPendiente({
        ...p,
        intentos: p.intentos + 1,
        error: e instanceof Error ? e.message : "Error desconocido",
      });
    }
  }

  return completados;
}
