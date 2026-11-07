"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Cooperativa, Producto } from "./mock";
import {
  PRODUCTOS,
  cooperativaPorId,
  COOPERATIVAS,
} from "./mock";

export interface CatalogoRemoto {
  productos: Producto[];
  cooperativas: Map<string, Cooperativa>;
  /** foto subida más reciente por productoId (url pública) */
  fotosPorProducto: Map<string, string>;
  /** true si los datos vinieron de Supabase (no del mock local) */
  vivo: boolean;
}

function deMock(): CatalogoRemoto {
  return {
    productos: PRODUCTOS,
    cooperativas: new Map(COOPERATIVAS.map((c) => [c.id, c])),
    fotosPorProducto: new Map(),
    vivo: false,
  };
}

/**
 * Catálogo vivo: muestra el mock al instante (offline-first) y lo
 * reemplaza por Supabase en vivo cuando haya red. Si falla, sigue mock.
 */
export function useCatalogoVivo(): CatalogoRemoto {
  const [estado, setEstado] = useState<CatalogoRemoto>(() => deMock());

  useEffect(() => {
    if (!supabase || typeof navigator !== "undefined" && !navigator.onLine) return;
    let vivo = true;
    (async () => {
      try {
        const { data: vendedores, error: errV } = await supabase
          .from("vendedores")
          .select("*")
          .order("nombre");
        if (errV || !vendedores?.length) return;
        const { data: productosRemotos, error: errP } = await supabase
          .from("productos")
          .select("*")
          .order("nombre");
        if (errP || !productosRemotos?.length) return;
        if (!vivo) return;
        const mapa = new Map<string, Cooperativa>();
        for (const v of vendedores) {
          mapa.set(v.id, {
            id: v.id,
            slug: v.slug,
            nombre: v.nombre,
            sector: (v.sector ?? "servicios") as Cooperativa["sector"],
            provincia: v.provincia,
            municipio: v.municipio,
            descripcion: v.descripcion,
            verificacion: (v.verificacion ?? "pendiente") as Cooperativa["verificacion"],
            nivel: "basico",
            productosCount: 0,
          });
        }
        const productos: Producto[] = productosRemotos.map((p) => {
          const vendedor = mapa.get(p.vendedor_id);
          return {
            id: p.id,
            slug: p.slug,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precioCup: p.precio_cup,
            sector: (p.sector ?? "servicios") as Producto["sector"],
            destacado: p.destacado,
            emoji: "▦",
            hue: p.hue ?? 225,
            cooperativaId: vendedor ? vendedor.id : "",
          };
        });
        const fotosPorProducto = new Map<string, string>();
        try {
          const { data: fotos } = await supabase
            .from("fotos")
            .select("producto_id,url,created_at")
            .eq("estado", "sincronizada")
            .not("producto_id", "is", null)
            .order("created_at", { ascending: false });
          if (fotos) {
            for (const f of fotos) {
              if (f.producto_id && f.url && !fotosPorProducto.has(f.producto_id)) {
                fotosPorProducto.set(f.producto_id, f.url);
              }
            }
          }
        } catch {
          // sin fotos: sigue el catálogo
        }
        setEstado({ productos, cooperativas: mapa, fotosPorProducto, vivo: true });
      } catch {
        // sin red o error: queda el mock, silencioso (offline-first)
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  return estado;
}

/** Resuelve el vendedor de un producto desde el mapa (remoto o mock). */
export function vendedorDe(
  producto: Producto,
  cooperativas: Map<string, Cooperativa>,
): Cooperativa {
  return cooperativas.get(producto.cooperativaId) ?? cooperativaPorId(producto.cooperativaId)!;
}
