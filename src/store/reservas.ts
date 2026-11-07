// Store de reservas mínimo sin dependencias: useSyncExternalStore + localStorage.
// Las reservas viven SOLO en el dispositivo; con Supabase (Iteración 5) se sincronizan.

export type ModoPago = "efectivo" | "transferencia";

export interface Reserva {
  id: string;
  productoId: string;
  nombreProducto: string;
  modo: ModoPago;
  estado: "local";
  fechaISO: string;
}

interface ReservasState {
  reservas: Reserva[];
}

const KEY = "pegaso-reservas";
const DEFAULT: ReservasState = { reservas: [] };

let estado: ReservasState = DEFAULT;
let hidratado = false;
const suscriptores = new Set<() => void>();

function notificar() {
  suscriptores.forEach((f) => f());
}

function persistir() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(estado));
  } catch {
    // sin storage: solo memoria
  }
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  try {
    const crudo = window.localStorage.getItem(KEY);
    if (crudo) estado = { ...DEFAULT, ...JSON.parse(crudo) };
  } catch {
    // corrupto o sin localStorage: default
  }
}

function nuevoId(): string {
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 1296).toString(36).padStart(2, "0");
  return `${t}${r}`.toUpperCase();
}

export const reservasStore = {
  suscribir(fn: () => void) {
    suscriptores.add(fn);
    return () => suscriptores.delete(fn);
  },
  obtener(): ReservasState {
    hidratar();
    return estado;
  },
  agregar(datos: Omit<Reserva, "id" | "estado" | "fechaISO">): Reserva {
    hidratar();
    const reserva: Reserva = {
      id: nuevoId(),
      estado: "local",
      fechaISO: new Date().toISOString(),
      ...datos,
    };
    estado = { reservas: [reserva, ...estado.reservas] };
    persistir();
    notificar();
    return reserva;
  },
  quitar(id: string) {
    hidratar();
    estado = { reservas: estado.reservas.filter((r) => r.id !== id) };
    persistir();
    notificar();
  },
};

export const reservasServidor: ReservasState = DEFAULT;
