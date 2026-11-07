"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Trash2 } from "lucide-react";
import { reservasStore, reservasServidor } from "@/store/reservas";
import { PRODUCTOS, cooperativaPorId } from "@/lib/mock";
import { formatoPrecioCup } from "@/lib/precio";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

function fechaCorta(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function MisReservas() {
  const { reservas } = useSyncExternalStore(
    reservasStore.suscribir,
    reservasStore.obtener,
    () => reservasServidor
  );
  const quitar = reservasStore.quitar;

  if (reservas.length === 0) {
    return (
      <EmptyState
        className="mt-4"
        titulo="Aún no tienes reservas"
        mensaje="Cuando reserves un producto aparecerá aquí, guardado en este teléfono."
        accion={
          <Button asChild variant="outline" size="sm">
            <Link href="/productos">Ver productos</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="mt-4 grid gap-3">
      {reservas.map((reserva) => {
        const producto = PRODUCTOS.find((p) => p.id === reserva.productoId);
        if (!producto) return null;
        const cooperativa = cooperativaPorId(producto.cooperativaId);
        return (
          <li key={reserva.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-md text-xl"
              style={{ background: "linear-gradient(135deg, oklch(0.85 0.08 220), oklch(0.55 0.11 235))" }}
            >
              {producto.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/productos/${producto.slug}`} className="block truncate font-medium hover:underline">
                {producto.nombre}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatoPrecioCup(producto.precioCup)} · {cooperativa?.nombre ?? "-"} ·{" "}
                {fechaCorta(reserva.fechaISO)} · pago en {reserva.modo}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{reserva.id}</p>
            </div>
            <button
              type="button"
              aria-label={`Eliminar reserva ${reserva.id}`}
              onClick={() => quitar(reserva.id)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
