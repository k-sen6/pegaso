"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservasStore } from "@/store/reservas";
import { cn } from "cn";

type Modo = "efectivo" | "transferencia";

export interface ProductoReserva {
  id: string;
  slug: string;
  nombre: string;
  precio_cup: number;
}

/**
 * Flujo de reserva sin backend: guarda la reserva en el dispositivo
 * (Zustand persist). Con Supabase/PowerSync (Iteración 4-5) esta misma
 * acción se sincronizará al vendedor cuando haya señal.
 */
export function BotonesReservar({ producto }: { producto: ProductoReserva }) {
  const agregar = reservasStore.agregar;
  const [abierto, setAbierto] = useState<Modo | null>(null);
  const [guardado, setGuardado] = useState<string | null>(null);
  const [paso, setPaso] = useState<"forma" | "confirmando">("forma");

  const reservar = (modo: Modo) => {
    setAbierto(modo);
    setPaso("forma");
  };

  const confirmar = async (modo: Modo) => {
    setPaso("confirmando");
    // Pequeño delay para feedback perceptible (300 ms)
    await new Promise((r) => setTimeout(r, 300));
    const reserva = agregar({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      modo,
    });
    setGuardado(reserva.id);
  };

  const cerrar = () => setAbierto(null);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="h-10 px-5" onClick={() => reservar("efectivo")}>
          Reservar con efectivo
        </Button>
        <Button size="lg" variant="outline" className="h-10 px-5" onClick={() => reservar("transferencia")}>
          Reservar con transferencia
        </Button>
      </div>

      {abierto && !guardado && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Reservar ${producto.nombre}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && cerrar()}
        >
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg">
            <h2 className="font-semibold">Confirmar reserva</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {producto.nombre} · pago en {abierto}
            </p>
            <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
              <li>· Recoger y pagar directamente en el punto de venta del vendedor.</li>
              <li>· La reserva queda guardada sin conexión en este teléfono.</li>
              <li>· Se sincronizará con el vendedor cuando llegues al punto de venta.</li>
            </ul>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={cerrar} disabled={paso === "confirmando"}>
                Cancelar
              </Button>
              <Button
                className={cn("flex-1", paso === "confirmando" && "opacity-80")}
                disabled={paso === "confirmando"}
                onClick={() => confirmar(abierto)}
              >
                {paso === "confirmando" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {abierto && guardado && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && cerrar()}
        >
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-semibold">Reserva guardada</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Código <span className="font-mono font-semibold text-foreground">{guardado}</span>. Muéstralo en la
              tienda del vendedor al pasar a recoger.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Encuéntrala siempre en <strong className="text-foreground">Mi cuenta → Mis reservas</strong>.
            </p>
            <Button className="mt-4 w-full" onClick={cerrar}>
              Listo
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
