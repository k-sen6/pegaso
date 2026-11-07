// Store UI mínimo sin dependencias: useSyncExternalStore + localStorage.
// (Sustituye a zustand: menos peso y sin riesgo de excepciones de cliente.)

export interface UiState {
  /** Descarga real de imágenes (AVIF/WebP ligero). Apagado por defecto: 2G seguro. */
  imagenes: boolean;
}

const KEY = "pegaso-ui";
const DEFAULT: UiState = { imagenes: false };

let estado: UiState = DEFAULT;
let hidratado = false;
const suscriptores = new Set<() => void>();

function notificar() {
  suscriptores.forEach((f) => f());
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  try {
    const crudo = window.localStorage.getItem(KEY);
    if (crudo) estado = { ...DEFAULT, ...JSON.parse(crudo) };
  } catch {
    // estado corrupto o sin localStorage: seguimos con default
  }
}

export const ui = {
  suscribir(fn: () => void) {
    suscriptores.add(fn);
    return () => suscriptores.delete(fn);
  },
  obtener(): UiState {
    hidratar();
    return estado;
  },
  toggleImagenes() {
    hidratar();
    estado = { ...estado, imagenes: !estado.imagenes };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(estado));
    } catch {
      // sin storage privado: el cambio vale solo esta sesión
    }
    notificar();
  },
};

export const uiServidor: UiState = DEFAULT;
