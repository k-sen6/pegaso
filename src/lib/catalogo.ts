"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { guardarCache, leerCache } from "@/lib/db-local";
import { rutaLocal } from "@/lib/base";

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
  telefono: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
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

export interface FotoProducto {
  thumb: string;
  card: string;
  full: string;
}

export interface CatalogoSnapshot {
  ts: number;
  productos: Producto[];
  vendedores: Cooperativa[];
  fotos: Record<string, FotoProducto>;
}

export type OrigenCatalogo = "red" | "cache" | "semilla" | "vacio";

export interface CatalogoRemoto {
  productos: Producto[];
  cooperativas: Map<string, Cooperativa>;
  fotosPorProducto: Map<string, FotoProducto>;
  vivo: boolean;
  origen: OrigenCatalogo;
  actualizado: number | null;
}

const CLAVE = "catalogo:v1";
const TTL_SYNC = 60_000;

let enCurso: Promise<CatalogoSnapshot | null> | null = null;
let ultimaSync = 0;

function vacio(): CatalogoRemoto {
  return {
    productos: [],
    cooperativas: new Map(),
    fotosPorProducto: new Map(),
    vivo: false,
    origen: "vacio",
    actualizado: null,
  };
}

export function desdeSnapshot(
  snap: CatalogoSnapshot,
  origen: OrigenCatalogo
): CatalogoRemoto {
  return {
    productos: snap.productos,
    cooperativas: new Map(snap.vendedores.map((v) => [v.id, v])),
    fotosPorProducto: new Map(Object.entries(snap.fotos)),
    vivo: true,
    origen,
    actualizado: snap.ts,
  };
}

type FilaFoto = {
  url: string | null;
  card_url: string | null;
  thumb_url: string | null;
  estado: string;
  created_at: string;
};

type FilaProducto = {
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
  fotos?: FilaFoto[] | null;
};

type FilaVendedor = {
  id: string;
  slug: string;
  nombre: string;
  sector: string;
  provincia: string;
  municipio: string;
  descripcion: string;
  verificacion: string;
  foto_url: string | null;
  telefono: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  productos?: FilaProducto[] | null;
};

function mejorFoto(fotos: FilaFoto[] | null | undefined): FotoProducto | null {
  if (!fotos || fotos.length === 0) return null;
  const validas = fotos
    .filter((f) => f.url && f.estado === "sincronizada")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const f = validas[0];
  if (!f?.url) return null;
  return {
    thumb: f.thumb_url ?? f.url,
    card: f.card_url ?? f.url,
    full: f.url,
  };
}

/** Una sola consulta con embeds: vendedores → productos → fotos. */
export async function traerCatalogo(): Promise<CatalogoSnapshot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("vendedores")
    .select(
      "id,slug,nombre,sector,provincia,municipio,descripcion,verificacion,foto_url,telefono,direccion,lat,lng,created_at,productos(id,slug,nombre,descripcion,precio_cup,sector,destacado,hue,vendedor_id,created_at,fotos(url,card_url,thumb_url,estado,created_at))"
    )
    .order("nombre");

  if (error || !data) return null;

  const vendedores = (data as unknown as FilaVendedor[]).map((v) => ({
    id: v.id,
    slug: v.slug,
    nombre: v.nombre,
    sector: v.sector,
    provincia: v.provincia,
    municipio: v.municipio,
    descripcion: v.descripcion,
    verificacion: v.verificacion,
    foto_url: v.foto_url,
    telefono: v.telefono ?? null,
    direccion: v.direccion ?? null,
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    created_at: v.created_at,
  }));

  const productos: Producto[] = [];
  const fotos: Record<string, FotoProducto> = {};

  for (const v of data as unknown as FilaVendedor[]) {
    for (const p of v.productos ?? []) {
      productos.push({
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
      });
      const foto = mejorFoto(p.fotos);
      if (foto) fotos[p.id] = foto;
    }
  }

  productos.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { ts: Date.now(), vendedores, productos, fotos };
}

export async function sincronizarCatalogo(
  forzar = false
): Promise<CatalogoSnapshot | null> {
  if (!supabase || typeof navigator === "undefined" || !navigator.onLine) {
    return null;
  }
  if (!forzar && enCurso) return enCurso;
  if (!forzar && Date.now() - ultimaSync < TTL_SYNC) return null;

  enCurso = traerCatalogo()
    .then(async (snap) => {
      if (snap) {
        await guardarCache(CLAVE, snap);
        ultimaSync = Date.now();
      }
      return snap;
    })
    .catch(() => null)
    .finally(() => {
      enCurso = null;
    });

  return enCurso;
}

/** Snapshot empaquetado en el build, para el primer arranque sin red. */
async function leerSemilla(): Promise<CatalogoSnapshot | null> {
  try {
    const res = await fetch(rutaLocal("/data/catalogo.json"), {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as CatalogoSnapshot;
    if (!Array.isArray(json.productos) || !Array.isArray(json.vendedores)) {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

export async function leerCatalogoLocal(): Promise<{
  snap: CatalogoSnapshot;
  origen: OrigenCatalogo;
} | null> {
  try {
    const guardado = await leerCache<CatalogoSnapshot>(CLAVE);
    if (guardado?.valor) {
      return { snap: guardado.valor, origen: "cache" };
    }
  } catch {
    // IndexedDB no disponible: seguimos con la semilla.
  }
  const semilla = await leerSemilla();
  return semilla ? { snap: semilla, origen: "semilla" } : null;
}

export function useCatalogoVivo(): CatalogoRemoto {
  const [estado, setEstado] = useState<CatalogoRemoto>(vacio);

  useEffect(() => {
    let montado = true;

    async function arrancar() {
      const local = await leerCatalogoLocal();
      if (montado && local) {
        setEstado(desdeSnapshot(local.snap, local.origen));
      }

      const vivo = await sincronizarCatalogo(!local);
      if (montado && vivo) {
        setEstado(desdeSnapshot(vivo, "red"));
      } else if (montado && !local) {
        setEstado((prev) => (prev.vivo ? prev : { ...prev, vivo: false }));
      }
    }

    void arrancar();

    const alVolver = () => {
      void sincronizarCatalogo(true).then((snap) => {
        if (montado && snap) setEstado(desdeSnapshot(snap, "red"));
      });
    };
    const alEnfocar = () => {
      if (document.visibilityState === "visible") alVolver();
    };

    window.addEventListener("online", alVolver);
    document.addEventListener("visibilitychange", alEnfocar);
    return () => {
      montado = false;
      window.removeEventListener("online", alVolver);
      document.removeEventListener("visibilitychange", alEnfocar);
    };
  }, []);

  return estado;
}
