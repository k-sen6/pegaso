// Compresión de fotos en el propio dispositivo, antes de cualquier red.
// Resultado: WebP ≤ 1280 px en su lado largo (~120–200 KB típico),
// para que la subida posterior por señal móvil sea liviana.

export interface FotoComprimida {
  /** Versión que se enviará al servidor (máx 1280 px, WebP) */
  blob: Blob;
  /** Miniatura para la vista previa local (máx 480 px, JPEG dataURL) */
  miniatura: string;
  pesoBytes: number;
  ancho: number;
  alto: number;
}

const MAX_LADO = 1280;
const MAX_MINI = 480;

function dibujarAjustado(
  bitmap: ImageBitmap,
  maxLado: number
): HTMLCanvasElement {
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  return lienzo;
}

function lienzoABlob(
  lienzo: HTMLCanvasElement,
  tipo: string,
  calidad: number
): Promise<Blob> {
  return new Promise((res, rej) => {
    lienzo.toBlob((b) => (b ? res(b) : rej(new Error("toBlob null"))), tipo, calidad);
  });
}

function lienzoADataUrl(lienzo: HTMLCanvasElement, tipo: string, calidad: number): string {
  return lienzo.toDataURL(tipo, calidad);
}

/**
 * Comprime un File de cámara/galería.
 * Lanza Error con mensaje en español si el formato no es imagen.
 */
export async function comprimirFoto(file: File): Promise<FotoComprimida> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const lienzo = dibujarAjustado(bitmap, MAX_LADO);
    const mini = dibujarAjustado(bitmap, MAX_MINI);
    const blob = await lienzoABlob(lienzo, "image/webp", 0.75);
    const miniatura = lienzoADataUrl(mini, "image/jpeg", 0.65);
    return {
      blob,
      miniatura,
      pesoBytes: blob.size,
      ancho: lienzo.width,
      alto: lienzo.height,
    };
  } finally {
    bitmap.close?.();
  }
}

export function formatoPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
