// Compresión de fotos en el propio dispositivo, antes de cualquier red.
// Resultado: WebP ≤ 1280 px en su lado largo (~120–200 KB típico),
// para que la subida posterior por señal móvil sea liviana.
//
// La compresión corre en un Web Worker cuando el WebView lo permite, para que
// el modal no se congele con fotos grandes. Si el worker falla o no existe,
// se usa el mismo proceso en el hilo principal con tiempos límite.

import { conTiempo, nuevoId } from "@/lib/ids";

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

const CODIGO_WORKER = `
self.onmessage = async function (ev) {
  var d = ev.data || {};
  var id = d.id;
  try {
    var bmp = await createImageBitmap(d.file);
    function lienzo(maxLado) {
      var escala = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
      var w = Math.max(1, Math.round(bmp.width * escala));
      var h = Math.max(1, Math.round(bmp.height * escala));
      var c = new OffscreenCanvas(w, h);
      var ctx = c.getContext("2d");
      if (!ctx) throw new Error("No se pudo preparar el lienzo.");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, w, h);
      return { c: c, w: w, h: h };
    }
    async function aBlob(c, tipo, calidad) {
      try {
        return await c.convertToBlob({ type: tipo, quality: calidad });
      } catch (e) {
        return await c.convertToBlob({ type: "image/jpeg", quality: Math.min(0.9, calidad + 0.07) });
      }
    }
    var principal = lienzo(d.max);
    var card = lienzo(d.card);
    var thumb = lienzo(d.thumb);
    var mini = lienzo(d.mini);
    var blob = await aBlob(principal.c, "image/webp", 0.78);
    var cardBlob = await aBlob(card.c, "image/webp", 0.75);
    var thumbBlob = await aBlob(thumb.c, "image/webp", 0.7);
    var miniBlob = await aBlob(mini.c, "image/jpeg", 0.65);
    var miniatura = "";
    try {
      miniatura = new FileReaderSync().readAsDataURL(miniBlob);
    } catch (e) {
      miniatura = "";
    }
    bmp.close && bmp.close();
    self.postMessage({
      id: id,
      ok: true,
      blob: blob,
      cardBlob: cardBlob,
      thumbBlob: thumbBlob,
      miniatura: miniatura,
      pesoBytes: blob.size,
      pesoCard: cardBlob.size,
      pesoThumb: thumbBlob.size,
      pesoOriginal: d.file.size,
      ancho: principal.w,
      alto: principal.h
    });
  } catch (e) {
    self.postMessage({ id: id, ok: false, error: String((e && e.message) || e) });
  }
};
`;

function comprimirEnWorker(file: File): Promise<FotoComprimida> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(
      new Blob([CODIGO_WORKER], { type: "text/javascript" })
    );
    const id = nuevoId();
    let worker: Worker | null = null;
    let terminado = false;
    let temporizador = 0;

    const cerrar = (error?: Error, valor?: FotoComprimida) => {
      if (terminado) return;
      terminado = true;
      clearTimeout(temporizador);
      worker?.terminate();
      worker = null;
      URL.revokeObjectURL(url);
      if (valor) res(valor);
      else rej(error ?? new Error("No se pudo comprimir la imagen."));
    };

    temporizador = window.setTimeout(
      () => cerrar(new Error("La imagen tardó demasiado en procesarse.")),
      20000
    );

    try {
      worker = new Worker(url);
    } catch (e) {
      cerrar(e instanceof Error ? e : new Error("Worker no disponible."));
      return;
    }

    worker.onmessage = (ev: MessageEvent) => {
      const d = ev.data as {
        id?: string;
        ok?: boolean;
        error?: string;
        blob?: Blob;
        cardBlob?: Blob;
        thumbBlob?: Blob;
        miniatura?: string;
        pesoBytes?: number;
        pesoCard?: number;
        pesoThumb?: number;
        pesoOriginal?: number;
        ancho?: number;
        alto?: number;
      };
      if (!d || d.id !== id) return;
      if (!d.ok || !d.blob || !d.cardBlob || !d.thumbBlob) {
        cerrar(new Error(d.error || "No se pudo comprimir la imagen."));
        return;
      }
      cerrar(undefined, {
        blob: d.blob,
        cardBlob: d.cardBlob,
        thumbBlob: d.thumbBlob,
        miniatura: d.miniatura ?? "",
        pesoBytes: d.pesoBytes ?? d.blob.size,
        pesoCard: d.pesoCard ?? d.cardBlob.size,
        pesoThumb: d.pesoThumb ?? d.thumbBlob.size,
        pesoOriginal: d.pesoOriginal ?? file.size,
        ancho: d.ancho ?? 0,
        alto: d.alto ?? 0,
      });
    };
    worker.onerror = (ev) => {
      cerrar(new Error(ev.message || "No se pudo comprimir la imagen."));
    };
    worker.postMessage({
      id,
      file,
      max: MAX_LADO,
      card: MAX_CARD,
      thumb: MAX_THUMB,
      mini: MAX_MINI,
    });
  });
}

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
    const bmp = await conTiempo(
      createImageBitmap(file),
      12000,
      "La imagen tardó demasiado en abrirse."
    );
    return {
      ancho: bmp.width,
      alto: bmp.height,
      dibujar: (ctx, w, h) => ctx.drawImage(bmp, 0, 0, w, h),
      liberar: () => bmp.close?.(),
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await conTiempo(
        new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = () =>
            rej(
              new Error(
                "No se pudo leer la imagen. Prueba con JPG o PNG desde la galería."
              )
            );
          i.src = url;
        }),
        15000,
        "La imagen tardó demasiado en abrirse."
      );
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
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar el lienzo.");
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

async function comprimirEnHilo(file: File): Promise<FotoComprimida> {
  const fuente = await decodificar(file);
  try {
    // Deja pintar el spinner antes de bloquear con el dibujado.
    await new Promise((r) => setTimeout(r, 30));
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

/**
 * Comprime un File de cámara/galería.
 * Lanza Error con mensaje en español si el formato no es imagen o no se puede leer.
 */
export async function comprimirFoto(file: File): Promise<FotoComprimida> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error("El archivo no es una imagen.");
  }

  const puedeWorker =
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap !== "undefined";

  if (puedeWorker) {
    try {
      return await comprimirEnWorker(file);
    } catch {
      // El worker no pudo (WebView viejo, CSP o imagen rara): seguimos abajo.
    }
  }
  return comprimirEnHilo(file);
}

export function formatoPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
