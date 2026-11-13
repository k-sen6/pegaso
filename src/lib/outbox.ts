"use client";

import { supabase } from "@/lib/supabase";
import {
  borrarPendiente,
  guardarPendiente,
  listarPendientes,
  type Pendiente,
} from "@/lib/db-local";
import { subirFoto } from "@/lib/subida";
import { esDuplicado, nuevoId } from "@/lib/ids";

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
    fotoId?: string;
    foto?: Pendiente["foto"];
    quitarFoto?: boolean;
  } = {}
): Pendiente {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tipo,
    datos,
    productoId: opciones.productoId ?? (tipo === "producto-crear" ? nuevoId() : undefined),
    fotoId: opciones.fotoId ?? (opciones.foto ? nuevoId() : undefined),
    foto: opciones.foto,
    quitarFoto: opciones.quitarFoto,
    intentos: 0,
    creado: Date.now(),
  };
}

let enCurso: Promise<number> | null = null;

/**
 * Reintenta la cola offline. Devuelve cuántos elementos se completaron.
 * Una sola ejecución a la vez: dos vaciados simultáneos duplicaban productos.
 */
export function procesarPendientes(): Promise<number> {
  if (enCurso) return enCurso;
  enCurso = ejecutarPendientes().finally(() => {
    enCurso = null;
  });
  return enCurso;
}

async function ejecutarPendientes(): Promise<number> {
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
        if (error && !esDuplicado(error)) throw error;
      } else {
        const datos = p.datos as unknown as DatosProducto;
        const productoId =
          p.productoId ?? (p.tipo === "producto-crear" ? nuevoId() : undefined);
        const fotoId = p.fotoId ?? (p.foto ? nuevoId() : undefined);
        let urls: Awaited<ReturnType<typeof subirFoto>> | null = null;
        if (p.foto) {
          urls = await subirFoto(
            sb,
            datos.vendedor_id,
            {
              full: p.foto.full,
              card: p.foto.card,
              thumb: p.foto.thumb,
            },
            `${datos.vendedor_id}/${productoId}-${fotoId}`
          );
        }

        if (p.tipo === "producto-crear") {
          const { error } = await sb.from("productos").insert({
            id: productoId,
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio_cup: datos.precio_cup,
            sector: datos.sector,
            destacado: datos.destacado,
            vendedor_id: datos.vendedor_id,
            slug: datos.slug ?? `producto-${Date.now().toString(36)}`,
          });
          if (error && !esDuplicado(error)) throw error;
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
            id: fotoId,
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
          if (error && !esDuplicado(error)) throw error;
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
