// Estado de conexión compartido entre web y APK (eventos + plugin Network).
"use client";

import { useSyncExternalStore } from "react";

let estado = true;
let iniciado = false;
const oyentes = new Set<() => void>();

function notificar() {
  oyentes.forEach((f) => f());
}

function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  estado = navigator.onLine;
  window.addEventListener("online", () => {
    estado = true;
    notificar();
  });
  window.addEventListener("offline", () => {
    estado = false;
    notificar();
  });
}

export function actualizarRed(online: boolean) {
  estado = online;
  notificar();
}

export function useRed(): boolean {
  return useSyncExternalStore(
    (fn) => {
      iniciar();
      oyentes.add(fn);
      return () => oyentes.delete(fn);
    },
    () => {
      iniciar();
      return estado;
    },
    () => true
  );
}

export function redAhora(): boolean {
  iniciar();
  return estado;
}
