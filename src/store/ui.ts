import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UiState {
  /** Descarga real de imágenes (AVIF/WebP ligero). Apagado por defecto: 2G seguro. */
  imagenes: boolean;
  toggleImagenes: () => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      imagenes: false,
      toggleImagenes: () => set((s) => ({ imagenes: !s.imagenes })),
    }),
    { name: "pegaso-ui", storage: createJSONStorage(() => localStorage) }
  )
);
