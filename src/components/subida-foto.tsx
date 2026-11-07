"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
  type DragEvent,
} from "react";
import {
  Camera,
  FolderOpen,
  CheckCircle2,
  Loader2,
  Clock,
  ImagePlus,
  ImageOff,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { comprimirFoto, formatoPeso } from "@/lib/compresor";
import { guardarBlob, leerBlob, borrarBlob } from "@/lib/blob-db";
import { cn } from "cn";

export interface Subida {
  id: string;
  productoNombre: string;
  fotoId: string; // clave IndexedDB
  pesoBytes: number;
  ancho: number;
  alto: number;
  estado: "pendiente" | "fallida";
  fechaISO: string;
}

const KEY = "pegaso-subidas";
const SIN_DATOS: Subida[] = [];

let lista: Subida[] = SIN_DATOS;
let hidratado = false;
const subs = new Set<() => void>();

function notificar() {
  subs.forEach((f) => f());
}

function persistir() {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista));
  } catch {
    // sin storage: la cola vive solo en memoria
  }
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  try {
    const crudo = localStorage.getItem(KEY);
    if (crudo) lista = JSON.parse(crudo);
  } catch {
    // corrupto o sin localStorage: cola vacía
  }
}

function nuevoId(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, "0")}`.toUpperCase();
}

export const subirStore = {
  suscribir(fn: () => void) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
  obtener(): Subida[] {
    hidratar();
    return lista;
  },
  agregar(datos: Omit<Subida, "id" | "estado" | "fechaISO">): Subida {
    hidratar();
    const subida: Subida = {
      id: nuevoId(),
      estado: "pendiente",
      fechaISO: new Date().toISOString(),
      ...datos,
    };
    lista = [subida, ...lista];
    persistir();
    notificar();
    return subida;
  },
  quitar(id: string) {
    hidratar();
    const objetivo = lista.find((s) => s.id === id);
    lista = lista.filter((s) => s.id !== id);
    persistir();
    notificar();
    if (objetivo) borrarBlob(objetivo.fotoId).catch(() => {});
  },
  marcarFallida(id: string) {
    hidratar();
    lista = lista.map((s) => (s.id === id ? { ...s, estado: "fallida" as const } : s));
    persistir();
    notificar();
  },
};

/**
 * Envío real a Supabase Storage: sube el blob ya comprimido y registra
 * la fila en `fotos`. Sin backend configurado puede lanzar; la cola local
 * nunca se pierde (el caller reintenta).
 */
export async function enviarSubida(subida: Subida, blob: Blob): Promise<string> {
  const { supabase } = await import("@/lib/supabase");
  if (!supabase) throw new Error("Sin backend configurado: queda en cola local.");
  const nombre = `${subida.id}.webp`;
  const { error: errSubida } = await supabase.storage
    .from("fotos")
    .upload(nombre, blob, { contentType: "image/webp", upsert: true });
  if (errSubida) throw errSubida;
  const { data } = supabase.storage.from("fotos").getPublicUrl(nombre);
  const { error: errFila } = await supabase.from("fotos").insert({
    producto_id: null,
    nombre_producto: subida.productoNombre,
    url: data.publicUrl,
    peso_bytes: subida.pesoBytes,
    ancho: subida.ancho,
    alto: subida.alto,
    estado: "sincronizada",
  });
  if (errFila) throw errFila;
  return data.publicUrl;
}

// ---- Componente UI ----

interface VistaPrevia {
  miniatura: string;
  pesoBytes: number;
  ancho: number;
  alto: number;
}

export function SubirFoto() {
  const subidas = useSyncExternalStore(
    subirStore.suscribir,
    subirStore.obtener,
    () => SIN_DATOS,
  );
  const [vista, setVista] = useState<VistaPrevia | null>(null);
  const [blobActual, setBlobActual] = useState<Blob | null>(null);
  const [nombre, setNombre] = useState("");
  const [comprimiendo, setComprimiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [miniaturas, setMiniaturas] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState(false);
  const [subiendoId, setSubiendoId] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const inputCamara = useRef<HTMLInputElement>(null);

  const procesar = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    setError(null);
    setComprimiendo(true);
    try {
      const res = await comprimirFoto(file);
      setBlobActual(res.blob);
      setVista({
        miniatura: res.miniatura,
        pesoBytes: res.pesoBytes,
        ancho: res.ancho,
        alto: res.alto,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo comprimir la foto.");
      setVista(null);
      setBlobActual(null);
    } finally {
      setComprimiendo(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    procesar(e.dataTransfer.files);
  };

  const guardar = async () => {
    if (!blobActual || !vista) return;
    const fotoId = `foto-${nuevoId()}`;
    await guardarBlob(fotoId, blobActual);
    subirStore.agregar({
      productoNombre: nombre.trim() || "Foto sin título",
      fotoId,
      pesoBytes: vista.pesoBytes,
      ancho: vista.ancho,
      alto: vista.alto,
    });
    setVista(null);
    setBlobActual(null);
    setNombre("");
  };

  const intentar = async (subida: Subida) => {
    setSubiendoId(subida.id);
    setError(null);
    try {
      const blob = await leerBlob(subida.fotoId);
      if (!blob) throw new Error("La foto no está en el dispositivo.");
      await enviarSubida(subida, blob);
      subirStore.quitar(subida.id);
    } catch (e) {
      setError(
        e instanceof Error ? `${e.message} (sigue en cola)` : "No se pudo subir. Sigue en cola."
      );
      subirStore.marcarFallida(subida.id);
    } finally {
      setSubiendoId(null);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Zona de carga */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          drag ? "border-primary bg-primary/5" : "border-muted-foreground/30 bg-card",
        )}
      >
        {comprimiendo ? (
          <>
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <p className="font-medium">Comprimiendo en el teléfono…</p>
            <p className="text-sm text-muted-foreground">0 bytes de red por ahora.</p>
          </>
        ) : vista ? (
          <>
            <img
              src={vista.miniatura}
              alt="Vista previa de la foto comprimida"
              className="max-h-56 w-full max-w-xs rounded-lg object-cover"
            />
            <p className="text-sm text-muted-foreground">
              {vista.ancho}×{vista.alto}px ·{" "}
              <span className="font-medium text-foreground">{formatoPeso(vista.pesoBytes)}</span>
            </p>
          </>
        ) : (
          <>
            <ImagePlus className="size-8 text-primary" aria-hidden="true" />
            <p className="font-medium">
              {drag ? "Suelta la foto aquí" : "Arrastra una foto, o"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => inputCamara.current?.click()}
              >
                <Camera className="size-4" aria-hidden="true" />
                Hacer foto
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputArchivo.current?.click()}
              >
                <FolderOpen className="size-4" aria-hidden="true" />
                Elegir archivo…
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Se comprimirá en tu teléfono a ~150 KB. Sube por señal móvil sin drama.
            </p>
          </>
        )}
      </div>

      <input
        ref={inputCamara}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => procesar(e.target.files ?? [])}
        aria-label="Hacer foto con la cámara"
      />
      <input
        ref={inputArchivo}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => procesar(e.target.files ?? [])}
        aria-label="Seleccionar foto de la galería"
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {vista && (
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del producto (opcional)"
            aria-label="Nombre del producto"
            className="max-w-xs flex-1"
          />
          <Button type="button" disabled={!blobActual} onClick={guardar}>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Añadir a la cola
          </Button>
        </div>
      )}

      {/* Cola de subidas */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <UploadCloud className="size-5 text-primary" aria-hidden="true" />
          Subidas pendientes
          {subidas.length > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {subidas.length}
            </span>
          )}
        </h3>
        {subidas.length === 0 ? (
          <EmptyState
            className="mt-3"
            titulo="Sin subidas por ahora"
            mensaje="Cuando conectemos Supabase, estas fotos se enviarán solas al volver la señal."
          />
        ) : (
          <ul className="mt-3 grid gap-2.5">
            {subidas.map((subida) => (
              <li
                key={subida.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <Miniatura
                  fotoId={subida.fotoId}
                  miniaturas={miniaturas}
                  setMiniaturas={setMiniaturas}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{subida.productoNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatoPeso(subida.pesoBytes)} · {subida.ancho}×{subida.alto}px ·{" "}
                    {new Intl.DateTimeFormat("es-ES", {
                      day: "numeric",
                      month: "short",
                    }).format(new Date(subida.fechaISO))}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                    subida.estado === "pendiente"
                      ? "border-warning/40 bg-warning/10 text-warning"
                      : "border-destructive/40 bg-destructive/10 text-destructive",
                  )}
                >
                  <Clock className="size-3" aria-hidden="true" />
                  {subida.estado === "pendiente" ? "En cola" : "Falló"}
                </span>
                {subida.estado === "pendiente" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={subiendoId === subida.id}
                    onClick={() => intentar(subida)}
                  >
                    {subiendoId === subida.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <UploadCloud className="size-4" aria-hidden="true" />
                    )}
                    Subir ahora
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={subiendoId === subida.id}
                    onClick={() => intentar(subida)}
                  >
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                      data-invisible={subiendoId !== subida.id}
                    />
                    Reintentar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => subirStore.quitar(subida.id)}
                  aria-label={`Eliminar subida ${subida.productoNombre}`}
                >
                  <ImageOff className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Miniatura({
  fotoId,
  miniaturas,
  setMiniaturas,
}: {
  fotoId: string;
  miniaturas: Record<string, string>;
  setMiniaturas: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const cacheada = miniaturas[fotoId];
  if (!cacheada) {
    leerBlob(fotoId)
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setMiniaturas((m) => ({ ...m, [fotoId]: url }));
      })
      .catch(() => {});
  }
  return cacheada ? (
    <img src={cacheada} alt="" className="size-10 shrink-0 rounded-md object-cover" />
  ) : (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
      <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
    </span>
  );
}
