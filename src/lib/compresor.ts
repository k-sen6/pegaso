// Compresión de fotos en el propio dispositivo, antes de cualquier red.
// Resultado: WebP ≤ 1280 px en su lado largo (~120–200 KB típico),
// para que la subida posterior por señal móvil sea liviana.

export interface FotoComprimida {
  /** Versión principal (máx 1280 px, WebP) para el detalle */
  blob: Blob;
  /** Versión de tarjeta (máx 640 px, WebP) */
  cardBlob: Blob;
  /** Miniatura de red (máx 320 px, WebP) */
  thumbBlob: Blob;
  /** Miniatura para la vista previa local (máx 480 px, JPEG dataURL) */
  miniatura: string;
  pesoBytes: number;
  pesoCard: number;
  pesoThumb: number;
  /** Tamaño del archivo original, para mostrar el ahorro */
  pesoOriginal: number;
  ancho: number;
  alto: number;
}

const MAX_LADO = 1280;
const MAX_CARD = 640;
const MAX_THUMB = 320;
const MAX_MINI = 480;

interface Fuente {
  ancho: number;
  alto: number;
  dibujar: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  liberar?: () => void;
}

/**
 * Decodifica la imagen. `createImageBitmap` es lo más rápido, pero en Safari
 * (y con fotos HEIC de iPhone) a veces falla; en ese caso caemos a <img>, que
 * usa el decodificador nativo del navegador.
 */
async function decodificar(file: File): Promise<Fuente> {
  try {
    const bmp = await createImageBitmap(file);
    return {
      ancho: bmp.width,
      alto: bmp.height,
      dibujar: (ctx, w, h) => ctx.drawImage(bmp, 0, 0, w, h),
      liberar: () => bmp.close?.(),
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () =>
          rej(
            new Error(
              "No se pudo leer la imagen. Prueba con JPG o PNG desde la galería."
            )
          );
        i.src = url;
      });
      return {
        ancho: img.naturalWidth || img.width,
        alto: img.naturalHeight || img.height,
        dibujar: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function dibujarAjustado(fuente: Fuente, maxLado: number): HTMLCanvasElement {
  const escala = Math.min(1, maxLado / Math.max(fuente.ancho, fuente.alto));
  const ancho = Math.max(1, Math.round(fuente.ancho * escala));
  const alto = Math.max(1, Math.round(fuente.alto * escala));
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  fuente.dibujar(ctx, ancho, alto);
  return lienzo;
}

function lienzoABlob(
  lienzo: HTMLCanvasElement,
  tipo: string,
  calidad: number
): Promise<Blob> {
  return new Promise((res, rej) => {
    lienzo.toBlob(
      (b) => (b ? res(b) : rej(new Error("No se pudo comprimir la imagen."))),
      tipo,
      calidad
    );
  });
}

function lienzoADataUrl(
  lienzo: HTMLCanvasElement,
  tipo: string,
  calidad: number
): string {
  return lienzo.toDataURL(tipo, calidad);
}

async function blobWebp(
  lienzo: HTMLCanvasElement,
  calidad: number
): Promise<Blob> {
  return lienzoABlob(lienzo, "image/webp", calidad).catch(() =>
    lienzoABlob(lienzo, "image/jpeg", Math.min(0.9, calidad + 0.07))
  );
}

/**
 * Comprime un File de cámara/galería.
 * Lanza Error con mensaje en español si el formato no es imagen o no se puede leer.
 */
export async function comprimirFoto(file: File): Promise<FotoComprimida> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error("El archivo no es una imagen.");
  }

  const fuente = await decodificar(file);
  try {
    const lienzo = dibujarAjustado(fuente, MAX_LADO);
    const card = dibujarAjustado(fuente, MAX_CARD);
    const thumb = dibujarAjustado(fuente, MAX_THUMB);
    const mini = dibujarAjustado(fuente, MAX_MINI);

    const [blob, cardBlob, thumbBlob] = await Promise.all([
      blobWebp(lienzo, 0.78),
      blobWebp(card, 0.75),
      blobWebp(thumb, 0.7),
    ]);
    const miniatura = lienzoADataUrl(mini, "image/jpeg", 0.65);

    return {
      blob,
      cardBlob,
      thumbBlob,
      miniatura,
      pesoBytes: blob.size,
      pesoCard: cardBlob.size,
      pesoThumb: thumbBlob.size,
      pesoOriginal: file.size,
      ancho: lienzo.width,
      alto: lienzo.height,
    };
  } finally {
    fuente.liberar?.();
  }
}

export function formatoPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
