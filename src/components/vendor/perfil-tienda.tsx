"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Navigation, Save, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  actualizarPerfilVendedor,
  eliminarCuenta,
  useSesion,
} from "@/lib/auth";
import { PROVINCIAS, SECTORES } from "@/lib/perfil-opciones";
import { enlaceMapa, telefonoValido } from "@/lib/whatsapp";

interface FormPerfil {
  nombre: string;
  sector: string;
  provincia: string;
  municipio: string;
  descripcion: string;
  telefono: string;
  direccion: string;
  lat: number | null;
  lng: number | null;
}

const VACIO: FormPerfil = {
  nombre: "",
  sector: "servicios",
  provincia: "La Habana",
  municipio: "",
  descripcion: "",
  telefono: "",
  direccion: "",
  lat: null,
  lng: null,
};

export function PerfilTienda() {
  const { session, cargando: cargandoSesion } = useSesion();
  const router = useRouter();
  const [form, setForm] = useState<FormPerfil>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<string | null>(null);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    if (cargandoSesion) return;
    if (!session?.user || !supabase) {
      setCargando(false);
      return;
    }
    let vivo = true;
    (async () => {
      const { data } = await supabase
        .from("vendedores")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!vivo) return;
      if (data) {
        setForm({
          nombre: data.nombre ?? "",
          sector: data.sector ?? "servicios",
          provincia: data.provincia ?? "La Habana",
          municipio: data.municipio ?? "",
          descripcion: data.descripcion ?? "",
          telefono: data.telefono ?? "",
          direccion: data.direccion ?? "",
          lat: data.lat ?? null,
          lng: data.lng ?? null,
        });
      }
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [session, cargandoSesion]);

  if (cargandoSesion || cargando) return null;
  if (!session?.user) return null;

  const userId = session.user.id;
  const mapa = enlaceMapa(form);
  const sinTelefono = !telefonoValido(form.telefono);

  function usarUbicacion() {
    if (!("geolocation" in navigator)) {
      setGeo("Tu navegador no permite geolocalización. Escribe la dirección.");
      return;
    }
    setGeo("Obteniendo ubicación…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setGeo("Ubicación guardada. Puedes ajustar la dirección a mano.");
      },
      () => {
        setGeo(
          "No pudimos obtener tu ubicación. Revisa los permisos o escribe la dirección."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    if (!form.nombre.trim() || !form.municipio.trim()) {
      setError("El nombre de la tienda y el municipio son obligatorios.");
      return;
    }
    if (!telefonoValido(form.telefono)) {
      setError("Escribe un WhatsApp válido (8 dígitos, ej. 5 123 4567).");
      return;
    }
    setGuardando(true);
    try {
      await actualizarPerfilVendedor(userId, {
        nombre: form.nombre.trim(),
        sector: form.sector,
        provincia: form.provincia,
        municipio: form.municipio.trim(),
        descripcion: form.descripcion.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        lat: form.lat,
        lng: form.lng,
      });
      setMensaje("Perfil actualizado. Los compradores ya pueden contactarte.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrarCuenta() {
    const ok = confirm(
      "¿Eliminar tu cuenta y todos tus productos? Esta acción no se puede deshacer."
    );
    if (!ok) return;
    setBorrando(true);
    setError(null);
    try {
      await eliminarCuenta();
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la cuenta."
      );
      setBorrando(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Perfil de mi tienda</h2>
        <p className="text-sm text-muted-foreground">
          Tu WhatsApp y tu ubicación son lo que ven los compradores.
        </p>
      </div>

      {sinTelefono && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Añade tu WhatsApp para que los botones de contacto de tus productos
            funcionen.
          </span>
        </div>
      )}

      <form onSubmit={guardar} className="grid gap-4 rounded-xl border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Nombre de la tienda</span>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Sector</span>
            <select
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {SECTORES.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Provincia</span>
            <select
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Municipio</span>
            <Input
              value={form.municipio}
              onChange={(e) => setForm({ ...form, municipio: e.target.value })}
              required
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Descripción</span>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            placeholder="Qué vendes y cómo trabajas"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">WhatsApp</span>
          <Input
            type="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="+53 5 123 4567"
            autoComplete="tel"
            inputMode="tel"
          />
          <span className="text-xs text-muted-foreground">
            Público. Los compradores te escriben por aquí.
          </span>
        </label>

        <div className="grid gap-2 rounded-lg border bg-muted/20 p-3">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Dirección de recogida</span>
            <Input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle, número, entre calles, referencia"
              autoComplete="street-address"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={usarUbicacion}>
              <Navigation className="size-4 mr-1" aria-hidden="true" />
              Usar mi ubicación actual
            </Button>
            {form.lat !== null && form.lng !== null && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForm({ ...form, lat: null, lng: null })}
              >
                Quitar coordenadas
              </Button>
            )}
            {mapa && (
              <a
                href={mapa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <MapPin className="size-4" aria-hidden="true" />
                Ver en el mapa
              </a>
            )}
          </div>
          {form.lat !== null && form.lng !== null && (
            <p className="text-xs text-muted-foreground">
              Coordenadas: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
            </p>
          )}
          {geo && <p className="text-xs text-muted-foreground">{geo}</p>}
          <p className="text-xs text-muted-foreground">
            La dirección exacta se muestra en tu tienda y en el enlace de
            WhatsApp. El directorio solo muestra provincia/municipio.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {mensaje && (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            {mensaje}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" disabled={guardando} className="btn-premium h-11 px-6">
            {guardando ? (
              <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4 mr-2" aria-hidden="true" />
            )}
            Guardar perfil
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={borrarCuenta}
            disabled={borrando}
          >
            {borrando ? (
              <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4 mr-2" aria-hidden="true" />
            )}
            Eliminar mi cuenta
          </Button>
        </div>
      </form>
    </section>
  );
}
