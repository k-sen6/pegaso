"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PortadaOptin } from "@/components/portada-optin";
import type { Producto } from "@/lib/mock";
import { TEMA_DE_PRODUCTO, TEMA_DE_SLUG } from "@/lib/mock/temas";

/**
 * Portada de la ficha: foto subida por el vendedor (Supabase) si existe;
 * si no, la AVIF temática local. Offline: siempre la local.
 */
export function FotoFicha({ producto }: { producto: Producto }) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;
    (async () => {
      try {
        const { data: prod } = await supabase
          .from("productos")
          .select("id")
          .eq("slug", producto.slug)
          .maybeSingle();
        if (!prod || !vivo) return;
        const { data: foto } = await supabase
          .from("fotos")
          .select("url")
          .eq("producto_id", prod.id)
          .eq("estado", "sincronizada")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (vivo && foto?.url) setFotoUrl(foto.url);
      } catch {
        // sin red: portada local
      }
    })();
    return () => {
      vivo = false;
    };
  }, [producto.slug]);

  return (
    <PortadaOptin
      temaId={TEMA_DE_PRODUCTO[producto.id] ?? TEMA_DE_SLUG[producto.slug] ?? "generica"}
      hue={producto.hue ?? 225}
      nombre={producto.nombre}
      priorizar
      fotoUrl={fotoUrl}
      className="aspect-[4/3] rounded-xl"
    />
  );
}
