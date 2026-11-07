"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Cooperativa, Producto } from "@/lib/mock";
import {
  PRODUCTOS,
  cooperativaPorId,
  COOPERATIVAS,
} from "@/lib/mock";

export interface CatalogoRemoto {
  productos: Producto[];
  cooperativas: Map<string, Cooperativa>;
  fotosPorProducto: Map<string, string>;
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
 * Catálogo vivo: usa Supabase cuando hay red.
 * - Si Supabase responde (incluso con 0 filas), se muestra eso (vacío si no hay productos).
 * - El mock solo se usa como fallback si NO hay red en absoluto (offline total).
 */
export function useCatalogoVivo(): CatalogoRemoto {
  const [estado, setEstado] = useState<CatalogoRemoto>(() => deMock());
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    if (!supabase || !online) return;

    let vivo = true;
    (async () => {
      try {
        const { data: vendedores, error: errV } = await supabase
          .from("vendedores")
          .select("*")
          .order("nombre");
        if (errV || !vivo) return;

        const { data: productosRemotos, error: errP } = await supabase
          .from("productos")
          .select("*")
          .order("created_at", { ascending: false });
        if (errP || !vivo) return;

        // Mapear vendedores
        const mapa = new Map<string, Cooperativa>();
        for (const v of vendedores ?? []) {
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

        // Mapear productos (SIEMPRE desde Supabase, incluso si está vacío)
        const productos: Producto[] = (productosRemotos ?? []).map((p) => {
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

        if (vivo) {
          setEstado({ productos, cooperativas: mapa, fotosPorProducto, vivo: true });
        }
      } catch {
        // sin red o error: queda el mock (offline total)
      }
    })();

    return () => {
      vivo = false;
    };
  }, [supabase, online]);

  // Detectar cambios de conexión online/offline
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setOnline(navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
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
