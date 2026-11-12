"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit3, Image, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { comprimirFoto, formatoPeso } from "@/lib/compresor";
import { cn } from "cn";

const SECTORES = [
  "agroalimentario",
  "textil",
  "artesania",
  "servicios",
  "tic",
] as const;

const SECTOR_LABELS: Record<string, string> = {
  agroalimentario: "Agroalimentario",
  textil: "Textil",
  artesania: "Artesanía",
  servicios: "Servicios",
  tic: "TIC",
};

interface ProductoForm {
  nombre: string;
  descripcion: string;
  precio_cup: number;
  sector: string;
  destacado: boolean;
  imagen: File | null;
  miniatura: string | null;
  blob: Blob | null;
  pesoBytes: number;
  ancho: number;
  alto: number;
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

export default function PanelProductosVendedor() {
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoForm>({
    nombre: "",
    descripcion: "",
    precio_cup: 0,
    sector: "agroalimentario",
    destacado: false,
    imagen: null,
    miniatura: null,
    blob: null,
    pesoBytes: 0,
    ancho: 0,
    alto: 0,
  });
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputImagen = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    if (!session?.user) {
      setProductos([]);
      setCargando(false);
      return;
    }
    const sb = supabase;
    if (!sb) {
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      const { data, error } = await sb
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProductos(data ?? []);
    } catch {
      // sin red
    } finally {
      setCargando(false);
    }
  }

  function resetForm() {
    setForm({
      nombre: "",
      descripcion: "",
      precio_cup: 0,
      sector: "agroalimentario",
      destacado: false,
      imagen: null,
      miniatura: null,
      blob: null,
      pesoBytes: 0,
      ancho: 0,
      alto: 0,
    });
    setEditandoId(null);
  }

  function abrirNuevo() {
    resetForm();
    setAbierto(true);
  }

  function editar(p: ProductoRow) {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio_cup: p.precio_cup,
      sector: p.sector,
      destacado: p.destacado,
      imagen: null,
      miniatura: null,
      blob: null,
      pesoBytes: 0,
      ancho: 0,
      alto: 0,
    });
    setEditandoId(p.id);
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

  const handleImagen = (file: File) => {
    setSubiendo(true);
    comprimirFoto(file).then((res) => {
      setForm({
        ...form,
        imagen: file,
        blob: res.blob,
        miniatura: res.miniatura,
        pesoBytes: res.pesoBytes,
        ancho: res.ancho,
        alto: res.alto,
      });
      setSubiendo(false);
    }).catch(() => {
      setSubiendo(false);
      setError("No se pudo procesar la imagen.");
    });
  };

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
    // Obtener usuario autenticado
    const { data: { user} } = await sb.auth.getUser();
    if (!user) {
      setError("No hay sesión de usuario activa.");
      return;
    }
    setSubiendo(true);
    setError(null);

    try {
      let fotoUrl: string | null = null;

      if (form.blob) {
        const fotoId = `prod-${Date.now()}`;
        const { error: uploadError } = await sb.storage
          .from("fotos")
          .upload(`${fotoId}.webp`, form.blob, {
            contentType: "image/webp",
            upsert: true,
          });
        if (uploadError) throw uploadError;
        const { data: urlData } = await sb.storage
          .from("fotos")
          .getPublicUrl(`${fotoId}.webp`);
        fotoUrl = urlData.publicUrl;
      }

      const productoData = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio_cup: form.precio_cup,
        sector: form.sector,
        destacado: form.destacado,
        vendedor_id: user.id,
      };

      if (editandoId) {
        await sb.from("productos").update(productoData).eq("id", editandoId);
        if (fotoUrl) {
          await sb.from("fotos").insert({
            producto_id: editandoId,
            nombre_producto: form.nombre.trim(),
            url: fotoUrl,
            peso_bytes: form.pesoBytes,
            ancho: form.ancho,
            alto: form.alto,
            estado: "sincronizada",
          });
        }
      } else {
        const { data: nuevo, error: err } = await sb
          .from("productos")
          .insert(productoData)
          .select()
          .single();
        if (err) throw err;
        if (fotoUrl && nuevo) {
          await sb.from("fotos").insert({
            producto_id: nuevo.id,
            nombre_producto: form.nombre.trim(),
            url: fotoUrl,
            peso_bytes: form.pesoBytes,
            ancho: form.ancho,
            alto: form.alto,
            estado: "sincronizada",
          });
        }
      }

      resetForm();
      setAbierto(false);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu catálogo. Los cambios se reflejan al instante.
          </p>
        </div>
        <Button
          onClick={abrirNuevo}
          className="btn-premium h-[48px] px-6"
          disabled={subiendo}
        >
          <Plus className="size-5 mr-2" aria-hidden="true" />
          {subiendo ? "Guardando..." : "Nuevo producto"}
        </Button>
      </div>

      {error && (
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
              Agregar primero producto
            </Button>
          </div>
        ) : (
          productos.map((p) => (
            <article
              key={p.id}
              className="rounded-xl border bg-card p-4 shadow-card transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                    p.destacado
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {p.destacado ? "Destacado" : "Normal"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
              <h3 className="font-semibold text-lg leading-snug mb-2 truncate">
                {p.nombre}
              </h3>
              <p className="text-2xl font-bold text-primary mb-3">
                {formatoPeso(p.precio_cup * 100)}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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
            </article>
          ))
        )}
      </div>

      {/* Modal crear/editar */}
      {abierto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-2xl bg-card rounded-2xl border p-6 shadow-premium animate-fade-in"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editandoId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAbierto(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); guardarProducto(); }} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Nombre del producto
                  </label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Conserva de mango"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Sector
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="h-[44px] rounded-lg border bg-card px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {SECTORES.map((s) => (
                      <option key={s} value={s}>
                        {SECTOR_LABELS[s]}
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
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  className="rounded-lg border bg-card px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full"
                  placeholder="Describe tu producto..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Precio (CUP)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.precio_cup}
                    onChange={(e) => setForm({ ...form, precio_cup: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-[44px] rounded-lg border bg-card px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.destacado}
                      onChange={(e) =>
                        setForm({ ...form, destacado: e.target.checked })
                      }
                      className="rounded border text-primary"
                    />
                    Destacado en catálogo
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Imagen del producto
                </label>
                <div
                  onClick={() => inputImagen.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                    form.miniatura
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-accent/5",
                  )}
                >
                  <Image className="size-12 mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-sm font-medium">
                    {form.miniatura ? "Cambiar imagen" : "Seleccionar imagen"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se comprimirá automáticamente (~150 KB)
                  </p>
                  <input
                    ref={inputImagen}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleImagen(file);
                    }}
                  />
                </div>
              </div>

              {form.miniatura && (
                <div className="flex items-center gap-3">
                  <img
                    src={form.miniatura}
                    alt="Vista previa"
                    className="size-20 rounded-lg object-cover border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{form.nombre || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatoPeso(form.pesoBytes)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={subiendo || !form.nombre.trim() || !form.blob}
                  className="btn-premium"
                >
                  {subiendo ? (
                    <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                  ) : (
                    <Image className="size-4 mr-2" aria-hidden="true" />
                  )}
                  Guardar producto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
