export const SECTORES = [
  { valor: "agroalimentario", etiqueta: "Agroalimentario" },
  { valor: "textil", etiqueta: "Textil" },
  { valor: "artesania", etiqueta: "Artesanía" },
  { valor: "servicios", etiqueta: "Servicios" },
  { valor: "tic", etiqueta: "TIC" },
] as const;

export const PROVINCIAS = [
  "Pinar del Río",
  "Artemisa",
  "La Habana",
  "Mayabeque",
  "Matanzas",
  "Cienfuegos",
  "Villa Clara",
  "Sancti Spíritus",
  "Ciego de Ávila",
  "Camagüey",
  "Las Tunas",
  "Holguín",
  "Granma",
  "Santiago de Cuba",
  "Guantánamo",
  "Isla de la Juventud",
] as const;

export const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  SECTORES.map((s) => [s.valor, s.etiqueta])
);
