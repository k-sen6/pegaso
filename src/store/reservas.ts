import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Reserva {
  id: string;
  productoId: string;
  /** modo de pago elegido al reservar */
  modo: "efectivo" | "transferencia";
  /** estado hasta tener backend real */
  estado: "local";
  fechaISO: string;
}

interface ReservasState {
  reservas: Reserva[];
  agregar: (r: Omit<Reserva, "id" | "estado" | "fechaISO">) => Reserva;
  quitar: (id: string) => void;
}

function nuevoId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

export const useReservas = create<ReservasState>()(
  persist(
    (set) => ({
      reservas: [],
      agregar: (r) => {
        const reserva: Reserva = {
          ...r,
          id: nuevoId(),
          estado: "local",
          fechaISO: new Date().toISOString(),
        };
        set((s) => ({ reservas: [reserva, ...s.reservas] }));
        return reserva;
      },
      quitar: (id) =>
        set((s) => ({ reservas: s.reservas.filter((x) => x.id !== id) })),
    }),
    { name: "pegaso-reservas", storage: createJSONStorage(() => localStorage) }
  )
);
