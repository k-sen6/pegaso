"use client";

import { useEffect } from "react";
import { actualizarRed } from "@/store/red";
import { procesarPendientes } from "@/lib/outbox";
import { sincronizarCatalogo } from "@/lib/catalogo";

/**
 * Puente nativo: barra de estado transparente, splash con salida suave,
 * botón atrás de Android, red real y vaciado de la cola offline.
 */
export function Nativo() {
  useEffect(() => {
    let limpiar: (() => void) | undefined;
    let vivo = true;

    function vaciarCola() {
      void procesarPendientes().then((hechos) => {
        if (hechos > 0) void sincronizarCatalogo(true);
      });
    }

    void vaciarCola();
    window.addEventListener("online", vaciarCola);

    async function configurarNativo() {
      const [{ Capacitor }, red] = await Promise.all([
        import("@capacitor/core"),
        import("@capacitor/network"),
      ]);

      const quitarRed = await red.Network.addListener(
        "networkStatusChange",
        (s) => actualizarRed(s.connected)
      );
      const inicial = await red.Network.getStatus();
      actualizarRed(inicial.connected);

      let quitarAtras: (() => void) | undefined;

      if (Capacitor.isNativePlatform()) {
        const [splash, status, app] = await Promise.all([
          import("@capacitor/splash-screen"),
          import("@capacitor/status-bar"),
          import("@capacitor/app"),
        ]);

        try {
          await status.StatusBar.setOverlaysWebView({ overlay: true });
          await status.StatusBar.setStyle({ style: status.Style.Dark });
          await status.StatusBar.setBackgroundColor({ color: "#00000000" });
        } catch {
          // El tema nativo ya es oscuro; algunos Android ignoran el color.
        }

        window.setTimeout(() => {
          void splash.SplashScreen.hide({ fadeOutDuration: 260 });
        }, 140);

        const hAtras = await app.App.addListener("backButton", ({ canGoBack }) => {
          const enInicio =
            window.location.pathname === "/" ||
            window.location.pathname === "" ||
            window.location.pathname === "/index.html";
          if (enInicio) {
            void app.App.exitApp();
            return;
          }
          if (canGoBack || window.history.length > 1) {
            window.history.back();
          } else {
            window.location.assign("/");
          }
        });
        quitarAtras = () => void hAtras.remove();
      }

      limpiar = () => {
        void quitarRed.remove();
        quitarAtras?.();
        window.removeEventListener("online", vaciarCola);
      };

      if (!vivo) limpiar();
    }

    void configurarNativo();

    return () => {
      vivo = false;
      limpiar?.();
      window.removeEventListener("online", vaciarCola);
    };
  }, []);

  return null;
}
