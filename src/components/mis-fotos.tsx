"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatoPeso } from "@/lib/compresor";
import { EmptyState } from "@/components/empty-state";

interface FotoRemota {
  id: string;
  producto_id: string | null;
  nombre_producto: string;
  url: string | null;
  peso_bytes: number;
  created_at: string;
}

/** Galería "Mis fotos" — las sincronizadas en Supabase (con fallback offline). */
export function MisFotos() {
  const [fotos, setFotos] = useState<FotoRemota[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    let vivo = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("fotos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(24);
        if (vivo) setFotos(data ?? []);
      } catch {
        // sin red: queda lo local
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  if (cargando) {
    return <div className="mt-3 h-20 animate-pulse rounded-lg bg-muted" />;
  }

  if (fotos.length === 0) {
    return (
      <EmptyState
        className="mt-3"
        titulo="Aún no hay fotos sincronizadas"
        mensaje="Sube una al campo de arriba y pulsa «Subir ahora»: aparecerá aquí y en tu producto."
      />
    );
  }

  return (
    <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {fotos.map((f) => (
        <li key={f.id} className="group relative overflow-hidden rounded-lg border">
          {f.url ? (
            <img
              src={f.url}
              alt={f.nombre_producto}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex aspect-[4/3] w-full items-center justify-center bg-muted">
              <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
            </span>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[10px] leading-tight text-white">
            <span className="line-clamp-1 font-medium">{f.nombre_producto}</span>
            <span className="opacity-80">{formatoPeso(f.peso_bytes)}</span>
          </span>
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            {f.producto_id ? "En producto" : "General"}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Badge invisible si no hay nada: lo usan las páginas con fotos. */
export function EnlaceFotoBase() {
  return <Link href="/mi-cuenta" className="sr-only">Ver mis fotos</Link>;
}
