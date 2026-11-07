"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CoopCard } from "@/components/coop-card";
import { EmptyState } from "@/components/empty-state";
import { supabase } from "@/lib/supabase";
import type { Cooperativa, Sector } from "@/lib/mock/types";
import { NOMBRE_SECTOR, SECTORES } from "@/lib/mock/types";
import { cn } from "cn";

type Filtro = "todos" | Sector;

export function DirectorioVendedores() {
  const [vendedores, setVendedores] = useState<Cooperativa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    let montado = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("vendedores")
          .select("*")
          .order("nombre");
        if (error) throw error;
        if (montado) setVendedores((data ?? []) as unknown as Cooperativa[]);
      } catch {
        // sin red
      } finally {
        if (montado) setCargando(false);
      }
    })();
    return () => {
      montado = false;
    };
  }, []);

  const listados = useMemo(() => {
    const t = texto.trim().toLowerCase();
    return vendedores.filter((coop) => {
      if (filtro !== "todos" && coop.sector !== filtro) return false;
      if (t && !`${coop.nombre} ${coop.provincia} ${coop.municipio} ${coop.descripcion}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [texto, filtro, vendedores]);

  if (cargando) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-xl border bg-muted animate-pulse h-64 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-muted/50 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:flex sm:items-center">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca vendedor, municipio o provincia…"
            aria-label="Buscar vendedores"
            className="h-11 pl-9 pr-9"
          />
          {texto && (
            <button
              type="button"
              onClick={() => setTexto("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["todos", ...SECTORES] as Filtro[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFiltro(s)}
              aria-pressed={filtro === s}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                filtro === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {s === "todos" ? "Todos" : NOMBRE_SECTOR[s]}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        {listados.length} vendedor{listados.length === 1 ? "" : "es"}
      </p>

      {listados.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listados.map((cooperativa) => (
            <CoopCard key={cooperativa.id} cooperativa={cooperativa} />
          ))}
        </div>
      ) : (
        <EmptyState
          titulo="Sin resultados"
          mensaje="Prueba con otra palabra o cambia el sector."
        />
      )}
    </div>
  );
}
