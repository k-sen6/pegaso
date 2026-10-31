export type EstadoVerificacion = "verificado" | "pendiente" | "rechazado";

export type Sector =
  | "agroalimentario"
  | "textil"
  | "artesania"
  | "servicios"
  | "tic";

export const SECTORES: Sector[] = [
  "agroalimentario",
  "textil",
  "artesania",
  "servicios",
  "tic",
];

export const NOMBRE_SECTOR: Record<Sector, string> = {
  agroalimentario: "Agroalimentario",
  textil: "Textil",
  artesania: "Artesanía",
  servicios: "Servicios",
  tic: "TIC",
};

export interface Cooperativa {
  id: string;
  slug: string;
  nombre: string;
  sector: Sector;
  provincia: string;
  municipio: string;
  descripcion: string;
  verificacion: EstadoVerificacion;
  nivel: "basico" | "avanzado";
  productosCount: number;
}

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precioCup: number;
  cooperativaId: string;
  sector: Sector;
  destacado: boolean;
  /** Único emoji de portada (Iteración 1: sin imágenes externas, cero KB de red) */
  emoji: string;
  /** Hue base (0-360) para portada determinista */
  hue: number;
}

export type NivelCurso = "basico" | "intermedio" | "avanzado";
export type FormatoCurso = "presencial" | "semi-presencial" | "virtual";

export interface Curso {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  nivel: NivelCurso;
  formato: FormatoCurso;
  duracionHoras: number;
  descargable: boolean;
  cooperativaODestino: string;
}
