"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Loader2,
  X,
  Camera,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { comprimirFoto, formatoPeso } from "@/lib/compresor";
import { asegurarPerfilVendedor } from "@/lib/auth";
import { formatoPrecioCup } from "@/lib/precio";
import { cn } from "cn";
import { SECTORES, SECTOR_LABELS } from "@/lib/perfil-opciones";

function slugProducto(nombre: string): string {
  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "producto"}-${Date.now().toString(36)}`;
}

interface ProductoForm {
  nombre: string;
  descripcion: string;
  precio_cup: number;
  sector: string;
  destacado: boolean;
  miniatura: string | null;
  fotoActual: string | null;
  blob: Blob | null;
  pesoBytes: number;
  pesoOriginal: number;
  ancho: number;
  alto: number;
  quitarFoto: boolean;
}

interface ProductoRow {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio_cup: number;
  sector: string;
  destacado: boolean;
  vendedor_id: string;
  created_at: string;
}

const FORM_VACIO: ProductoForm = {
  nombre: "",
  descripcion: "",
  precio_cup: 0,
  sector: "agroalimentario",
  destacado: false,
  miniatura: null,
  fotoActual: null,
  blob: null,
  pesoBytes: 0,
  pesoOriginal: 0,
  ancho: 0,
  alto: 0,
  quitarFoto: false,
};

export default function PanelProductosVendedor({
  mostrarTitulo = true,
}: {
  mostrarTitulo?: boolean;
}) {
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [fotos, setFotos] = useState<Map<string, string>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoForm>(FORM_VACIO);
  const [subiendo, setSubiendo] = useState(false);
  const [comprimiendo, setComprimiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const inputGaleria = useRef<HTMLInputElement>(null);
  const inputCamara = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargar();
  }, []);

  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alEscape);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alEscape);
    };
  }, [abierto]);

  async function cargar() {
    const sb = supabase;
    if (!sb) {
      setCargando(false);
      return;
    }
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setProductos([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      const vendedorId = await asegurarPerfilVendedor(user, null);
      const { data, error } = await sb
        .from("productos")
        .select("*")
        .eq("vendedor_id", vendedorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const lista = data ?? [];
      setProductos(lista);

      if (lista.length > 0) {
        const { data: fotosData } = await sb
          .from("fotos")
          .select("producto_id, url, created_at")
          .eq("estado", "sincronizada")
          .in(
            "producto_id",
            lista.map((p) => p.id)
          )
          .order("created_at", { ascending: false });
        const mapa = new Map<string, string>();
        for (const f of fotosData ?? []) {
          if (f.producto_id && f.url && !mapa.has(f.producto_id)) {
            mapa.set(f.producto_id, f.url);
          }
        }
        setFotos(mapa);
      } else {
        setFotos(new Map());
      }
    } catch {
      // sin red
    } finally {
      setCargando(false);
    }
  }

  function resetForm() {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setErrorImagen(null);
  }

  function abrirNuevo() {
    resetForm();
    setError(null);
    setAbierto(true);
  }

  function editar(p: ProductoRow) {
    setForm({
      ...FORM_VACIO,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio_cup: p.precio_cup,
      sector: p.sector,
      destacado: p.destacado,
      fotoActual: fotos.get(p.id) ?? null,
    });
    setEditandoId(p.id);
    setError(null);
    setErrorImagen(null);
    setAbierto(true);
  }

  async function eliminar(p: ProductoRow) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    const sb = supabase;
    if (!sb) return;
    try {
      await sb.from("productos").delete().eq("id", p.id);
      await cargar();
    } catch {
      setError("No se pudo eliminar el producto.");
    }
  }

  async function handleImagen(file: File) {
    setErrorImagen(null);
    setComprimiendo(true);
    try {
      const res = await comprimirFoto(file);
      setForm((prev) => ({
        ...prev,
        blob: res.blob,
        miniatura: res.miniatura,
        pesoBytes: res.pesoBytes,
        pesoOriginal: res.pesoOriginal,
        ancho: res.ancho,
        alto: res.alto,
        quitarFoto: false,
      }));
    } catch (e) {
      setErrorImagen(
        e instanceof Error ? e.message : "No se pudo procesar la imagen."
      );
    } finally {
      setComprimiendo(false);
    }
  }

  function quitarImagen() {
    setForm((prev) => ({
      ...prev,
      blob: null,
      miniatura: null,
      pesoBytes: 0,
      pesoOriginal: 0,
      ancho: 0,
      alto: 0,
      quitarFoto: Boolean(prev.fotoActual),
    }));
    setErrorImagen(null);
  }

  async function guardarProducto() {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!form.precio_cup || form.precio_cup <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }
    const sb = supabase;
    if (!sb) {
      setError("Backend no disponible.");
      return;
    }
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setError("No hay sesión de usuario activa.");
      return;
    }
    let vendedorId: string;
    try {
      vendedorId = await asegurarPerfilVendedor(user, null);
    } catch {
      setError("No se pudo preparar tu perfil de vendedor.");
      return;
    }

    setSubiendo(true);
    setError(null);

    try {
      let fotoUrl: string | null = null;
      let errorFoto: string | null = null;

      if (form.blob) {
        const tipo = form.blob.type || "image/webp";
        const ext = tipo.includes("jpeg")
          ? "jpg"
          : tipo.includes("png")
            ? "png"
            : "webp";
        const ruta = `${user.id}/prod-${Date.now()}.${ext}`;
        const { error: uploadError } = await sb.storage
          .from("fotos")
          .upload(ruta, form.blob, {
            contentType: tipo,
            upsert: true,
          });
        if (uploadError) throw uploadError;
        const { data: urlData } = sb.storage.from("fotos").getPublicUrl(ruta);
        fotoUrl = urlData.publicUrl;
      }

      const productoData = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio_cup: form.precio_cup,
        sector: form.sector,
        destacado: form.destacado,
        vendedor_id: vendedorId,
      };

      if (editandoId) {
        const { error: errUpdate } = await sb
          .from("productos")
          .update(productoData)
          .eq("id", editandoId);
        if (errUpdate) throw errUpdate;

        if (form.quitarFoto) {
          await sb.from("fotos").delete().eq("producto_id", editandoId);
        }
        if (fotoUrl) {
          const { error: errFoto } = await sb.from("fotos").insert({
            producto_id: editandoId,
            nombre_producto: form.nombre.trim(),
            url: fotoUrl,
            peso_bytes: form.pesoBytes,
            ancho: form.ancho,
            alto: form.alto,
            estado: "sincronizada",
          });
          if (errFoto) errorFoto = errFoto.message;
        }
      } else {
        const { data: nuevo, error: err } = await sb
          .from("productos")
          .insert({ ...productoData, slug: slugProducto(form.nombre) })
          .select()
          .single();
        if (err) throw err;
        if (fotoUrl && nuevo) {
          const { error: errFoto } = await sb.from("fotos").insert({
            producto_id: nuevo.id,
            nombre_producto: form.nombre.trim(),
            url: fotoUrl,
            peso_bytes: form.pesoBytes,
            ancho: form.ancho,
            alto: form.alto,
            estado: "sincronizada",
          });
          if (errFoto) errorFoto = errFoto.message;
        }
      }

      resetForm();
      setAbierto(false);
      await cargar();

      if (errorFoto) {
        setError(
          `El producto se guardó, pero la foto no: ${errorFoto}. Intenta de nuevo.`
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo guardar el producto."
      );
    } finally {
      setSubiendo(false);
    }
  }

  const preview = form.miniatura ?? form.fotoActual;
  const ocupado = subiendo || comprimiendo;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {mostrarTitulo && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis productos</h1>
            <p className="text-muted-foreground">
              Gestiona tu catálogo. Los cambios se reflejan al instante.
            </p>
          </div>
        )}
        <Button
          onClick={abrirNuevo}
          className="btn-premium h-[48px] px-6"
          disabled={subiendo}
        >
          <Plus className="size-5 mr-2" aria-hidden="true" />
          Nuevo producto
        </Button>
      </div>

      {error && !abierto && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Lista de productos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cargando ? (
          <div className="col-span-full h-64 animate-pulse rounded-xl bg-muted flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : productos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed text-muted-foreground">
            <Plus className="size-12 mb-3 opacity-50" aria-hidden="true" />
            <p>Aún no tienes productos</p>
            <Button onClick={abrirNuevo} className="mt-4">
              Agregar primer producto
            </Button>
          </div>
        ) : (
          productos.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full bg-muted">
                <img
                  src={fotos.get(p.id) ?? "/pegaso/img/generica.avif"}
                  alt={p.nombre}
                  className="size-full object-cover"
                  loading="lazy"
                />
                {p.destacado && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Destacado
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-lg leading-snug truncate">
                    {p.nombre}
                  </h3>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary mb-2">
                  {formatoPrecioCup(p.precio_cup)}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                  {p.descripcion}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {SECTOR_LABELS[p.sector] ?? p.sector}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editar(p)}
                    className="flex-1"
                  >
                    <Edit3 className="size-4 mr-1" aria-hidden="true" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => eliminar(p)}
                  >
                    <Trash2 className="size-4 mr-1" aria-hidden="true" />
                    Borrar
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal crear/editar */}
      {abierto && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !subiendo && setAbierto(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border bg-card shadow-premium animate-fade-in sm:max-w-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={editandoId ? "Editar producto" : "Nuevo producto"}
          >
            {/* Cabecera fija */}
            <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
              <h2 className="text-xl font-bold">
                {editandoId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !subiendo && setAbierto(false)}
                aria-label="Cerrar"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>

            {/* Contenido con scroll */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ocupado) guardarProducto();
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Nombre del producto
                    </label>
                    <Input
                      value={form.nombre}
                      onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                      }
                      placeholder="Ej. Conserva de mango"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Sector
                    </label>
                    <select
                      value={form.sector}
                      onChange={(e) =>
                        setForm({ ...form, sector: e.target.value })
                      }
                      className="h-11 w-full rounded-lg border bg-card px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {SECTORES.map((s) => (
                        <option key={s.valor} value={s.valor}>
                          {s.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Describe tu producto..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Precio (CUP)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={form.precio_cup}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          precio_cup: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="h-11"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.destacado}
                        onChange={(e) =>
                          setForm({ ...form, destacado: e.target.checked })
                        }
                        className="size-4 rounded border text-primary"
                      />
                      Destacar en catálogo
                    </label>
                  </div>
                </div>

                {/* Subidor de imagen */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Imagen del producto
                  </label>

                  {preview ? (
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                      <img
                        src={preview}
                        alt="Vista previa"
                        className="size-24 shrink-0 rounded-lg border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {form.nombre || "Imagen del producto"}
                        </p>
                        {form.blob ? (
                          <p className="text-xs text-muted-foreground">
                            {form.ancho}×{form.alto}px ·{" "}
                            {formatoPeso(form.pesoOriginal)} →{" "}
                            {formatoPeso(form.pesoBytes)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Imagen actual
                          </p>
                        )}
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputGaleria.current?.click()}
                          >
                            Cambiar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={quitarImagen}
                          >
                            Quitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setArrastrando(true);
                      }}
                      onDragLeave={() => setArrastrando(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setArrastrando(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImagen(file);
                      }}
                      className={cn(
                        "rounded-xl border-2 border-dashed p-5 text-center transition-colors",
                        arrastrando
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      )}
                    >
                      {comprimiendo ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2
                            className="size-8 animate-spin text-primary"
                            aria-hidden="true"
                          />
                          <p className="text-sm font-medium">
                            Comprimiendo imagen…
                          </p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon
                            className="mx-auto mb-2 size-10 opacity-40"
                            aria-hidden="true"
                          />
                          <p className="text-sm font-medium">
                            Arrastra una foto o elige una opción
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Se comprime automáticamente antes de subir
                          </p>
                          <div className="mt-3 flex justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => inputCamara.current?.click()}
                            >
                              <Camera
                                className="size-4 mr-1"
                                aria-hidden="true"
                              />
                              Cámara
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => inputGaleria.current?.click()}
                            >
                              <UploadCloud
                                className="size-4 mr-1"
                                aria-hidden="true"
                              />
                              Galería
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    ref={inputGaleria}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImagen(file);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={inputCamara}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImagen(file);
                      e.target.value = "";
                    }}
                  />

                  {errorImagen && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {errorImagen}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>

              {/* Pie fijo */}
              <div className="flex shrink-0 justify-end gap-3 border-t px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => !subiendo && setAbierto(false)}
                  disabled={subiendo}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={ocupado || !form.nombre.trim()}
                  className="btn-premium"
                >
                  {subiendo ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin mr-2"
                        aria-hidden="true"
                      />
                      Guardando…
                    </>
                  ) : comprimiendo ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin mr-2"
                        aria-hidden="true"
                      />
                      Preparando…
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        className="size-4 mr-2"
                        aria-hidden="true"
                      />
                      Guardar producto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
