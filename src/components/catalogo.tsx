"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { useCatalogoVivo, Sector } from "@/lib/catalogo";
import { cn } from "cn";

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

const PRECIOS: { etiqueta: string; max: number | null }[] = [
  { etiqueta: "Sin límite", max: null },
  { etiqueta: "Hasta 1 000 CUP", max: 1_000 },
  { etiqueta: "Hasta 3 000 CUP", max: 3_000 },
  { etiqueta: "Hasta 6 000 CUP", max: 6_000 },
];

function GrupoFiltro({
  titulo,
  opciones,
  activo,
  alCambiar,
}: {
  titulo: string;
  opciones: { valor: string; etiqueta: string }[];
  activo: string;
  alCambiar: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => alCambiar(op.valor)}
            aria-pressed={activo === op.valor}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
              activo === op.valor
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-accent",
            )}
          >
            {op.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Catalogo() {
  const {
    productos: PRODUCTOS,
    cooperativas,
    fotosPorProducto,
  } = useCatalogoVivo();
  const [texto, setTexto] = useState("");
  const [sector, setSectorq] = useState<"todos" | Sector>("todos");
  const [provincia, setProvincia] = useState("todas");
  const [precioMax, setPrecioMax] = useState<null | number>(null);
  const [orden, setOrden] = useState<Orden>("relevancia");

  const provincias = useMemo(
    () =>
      Array.from(
        new Set(
          PRODUCTOS.map(
            (p) => cooperativas.get(p.vendedor_id)?.provincia
          ).filter(Boolean)
        )
      ).sort() as string[],
    [PRODUCTOS, cooperativas]
  );

  const listados = useMemo(() => {
    const t = texto.trim().toLowerCase();
    const filtrados = PRODUCTOS.filter((producto) => {
      const coop = cooperativas.get(producto.vendedor_id);
      if (!coop || coop.verificacion === "rechazado") return false;
      if (sector !== "todos" && producto.sector !== sector) return false;
      if (provincia !== "todas" && coop.provincia !== provincia) return false;
      if (precioMax !== null && producto.precio_cup > precioMax) return false;
      if (
        t &&
        !`${producto.nombre} ${producto.descripcion}`.toLowerCase().includes(t)
      )
        return false;
      return true;
    });
    const ordenados = [...filtrados].sort((a, b) => {
      switch (orden) {
        case "precio-asc":
          return a.precio_cup - b.precio_cup;
        case "precio-desc":
          return b.precio_cup - a.precio_cup;
        case "nombre":
          return a.nombre.localeCompare(b.nombre, "es");
        default:
          return Number(b.destacado) - Number(a.destacado);
      }
    });
    return ordenados;
  }, [texto, sector, provincia, precioMax, orden, PRODUCTOS, cooperativas]);

  const hayFiltros =
    texto ||
    sector !== "todos" ||
    provincia !== "todas" ||
    precioMax !== null ||
    orden !== "relevancia";

  return (
    <div>
      {/* Buscador destacado */}
      <div className="relative mb-6">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Busca mango, guayabera, queso…"
          aria-label="Buscar productos"
          className="h-[56px] pl-12 pr-4 text-base"
        />
        {texto && (
          <button
            type="button"
            onClick={() => setTexto("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-8 grid gap-4 rounded-xl border bg-card p-5 shadow-card">
        <GrupoFiltro
          titulo="Sector"
          activo={sector}
          alCambiar={(v) => setSectorq(v)}
          opciones={[
            { valor: "todos", etiqueta: "Todos" },
            { valor: "agroalimentario", etiqueta: "Agroalimentario" },
            { valor: "textil", etiqueta: "Textil" },
            { valor: "artesania", etiqueta: "Artesanía" },
            { valor: "servicios", etiqueta: "Servicios" },
            { valor: "tic", etiqueta: "TIC" },
          ]}
        />
        <GrupoFiltro
          titulo="Provincia"
          activo={provincia}
          alCambiar={setProvincia}
          opciones={[
            { valor: "todas", etiqueta: "Toda Cuba" },
            ...provincias.map((p) => ({ valor: p, etiqueta: p })),
          ]}
        />
        <GrupoFiltro
          titulo="Precio"
          activo={precioMax === null ? "sin-limite" : String(precioMax)}
          alCambiar={(v) =>
            setPrecioMax(v === "sin-limite" ? null : Number(v))
          }
          opciones={PRECIOS.map((p) => ({
            valor: p.max === null ? "sin-limite" : String(p.max),
            etiqueta: p.etiqueta,
          }))}
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Ordenar por
          </p>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="h-[44px] rounded-lg border bg-card px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
            aria-label="Ordenar resultados"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: más bajo primero</option>
            <option value="precio-desc">Precio: más alto primero</option>
            <option value="nombre">Nombre (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-baseline justify-between gap-2 mb-4">
        <p className="text-sm text-muted-foreground" role="status">
          {listados.length} producto{listados.length === 1 ? "" : "s"} encontrado{listados.length === 1 ? "" : "s"}
          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setTexto("");
                setSectorq("todos");
                setProvincia("todas");
                setPrecioMax(null);
                setOrden("relevancia");
              }}
              className="ml-2 text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          )}
        </p>
      </div>

      {listados.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {listados.map((producto) => {
            const coop = cooperativas.get(producto.vendedor_id)!;
            return (
              <ProductCard
                key={producto.id}
                producto={producto}
                cooperativa={coop}
                fotoUrl={fotosPorProducto.get(producto.id) ?? null}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          titulo="Sin resultados"
          mensaje="Prueba con otra palabra o quita algún filtro."
          accion={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setTexto("");
                setSectorq("todos");
                setProvincia("todas");
                setPrecioMax(null);
              }}
            >
              Ver todo el catálogo
            </Button>
          }
        />
      )}
    </div>
  );
}
