"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Cooperativa {
  id: string;
  slug: string;
  nombre: string;
  sector: string;
  provincia: string;
  municipio: string;
  descripcion: string;
  verificacion: string;
  foto_url: string | null;
  created_at: string;
  productosCount?: number;
}

export type Sector = string;
export type EstadoVerificacion = string;

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio_cup: number;
  sector: string;
  destacado: boolean;
  hue: number;
  vendedor_id: string;
  created_at: string;
}

export interface CatalogoRemoto {
  productos: Producto[];
  cooperativas: Map<string, Cooperativa>;
  fotosPorProducto: Map<string, string>;
  vivo: boolean;
}

export function useCatalogoVivo(): CatalogoRemoto {
  const [estado, setEstado] = useState<CatalogoRemoto>({
    productos: [],
    cooperativas: new Map(),
    fotosPorProducto: new Map(),
    vivo: false,
  });
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (!supabase || !online) return;

      try {
        const { data: vendedores, error: errV } = await supabase
          .from("vendedores")
          .select("*")
          .order("nombre");
        if (errV || !vivo) return;

        const mapa = new Map<string, Cooperativa>();
        for (const v of vendedores ?? []) {
          mapa.set(v.id, {
            id: v.id,
            slug: v.slug,
            nombre: v.nombre,
            sector: v.sector,
            provincia: v.provincia,
            municipio: v.municipio,
            descripcion: v.descripcion,
            verificacion: v.verificacion,
            foto_url: v.foto_url,
            created_at: v.created_at,
          });
        }

        const { data: productosRemotos, error: errP } = await supabase
          .from("productos")
          .select("*")
          .order("created_at", { ascending: false });
        if (errP || !vivo) return;

        const productos: Producto[] = (productosRemotos ?? []).map((p) => {
          return {
            id: p.id,
            slug: p.slug,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio_cup: p.precio_cup,
            sector: p.sector,
            destacado: p.destacado,
            hue: p.hue ?? 225,
            vendedor_id: p.vendedor_id,
            created_at: p.created_at,
          };
        });

        const fotosPorProducto = new Map<string, string>();
        try {
          const { data: fotos } = await supabase
            .from("fotos")
            .select("producto_id, url, created_at")
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
        // sin red o error: queda estado vacío (sin mock)
      }
    })();

    return () => {
      vivo = false;
    };
  }, [online]);

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