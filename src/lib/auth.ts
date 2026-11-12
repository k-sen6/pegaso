"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface PerfilVendedor {
  nombre: string;
  sector: string;
  provincia: string;
  municipio: string;
  descripcion: string;
  /** WhatsApp del vendedor, normalizado a dígitos con +53. */
  telefono: string;
  direccion?: string;
  lat?: number | null;
  lng?: number | null;
}

const DRAFT_KEY = "pegaso.perfil.pendiente";

function slugify(texto: string): string {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "tienda";
}

/** Guarda el perfil para cuando se confirme el email (signup sin sesión). */
export function guardarBorradorPerfil(email: string, perfil: PerfilVendedor) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ email, perfil }));
  } catch {
    // sin storage: se ignora
  }
}

export function leerBorradorPerfil(): { email: string; perfil: PerfilVendedor } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limpiarBorradorPerfil() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

/**
 * Garantiza que el usuario autenticado tenga su fila en `vendedores`.
 * Se reutiliza el mismo UUID del usuario como id del vendedor para que
 * `productos.vendedor_id` apunte a una fila válida.
 */
export async function asegurarPerfilVendedor(
  user: User,
  perfil?: PerfilVendedor | null
): Promise<string> {
  if (!supabase) throw new Error("Backend no disponible.");

  const { data: existente, error } = await supabase
    .from("vendedores")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (existente) return existente.id;

  const base: PerfilVendedor = perfil ?? {
    nombre: (user.email ?? "Mi tienda").split("@")[0],
    sector: "servicios",
    provincia: "La Habana",
    municipio: "La Habana",
    descripcion: "",
    telefono: "",
  };

  const slug = `${slugify(base.nombre)}-${user.id.slice(0, 8)}`;
  const { data, error: errInsert } = await supabase
    .from("vendedores")
    .insert({
      id: user.id,
      slug,
      nombre: base.nombre,
      sector: base.sector,
      provincia: base.provincia,
      municipio: base.municipio,
      descripcion: base.descripcion,
      telefono: base.telefono || null,
      direccion: base.direccion || null,
      lat: base.lat ?? null,
      lng: base.lng ?? null,
      verificacion: "pendiente",
    })
    .select("id")
    .single();
  if (errInsert) throw errInsert;
  return data.id;
}

export interface ResultadoRegistro {
  requiereConfirmacion: boolean;
}

export async function registrar(
  email: string,
  password: string,
  perfil: PerfilVendedor
): Promise<ResultadoRegistro> {
  if (!supabase) throw new Error("Backend no disponible.");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.session?.user) {
    await asegurarPerfilVendedor(data.session.user, perfil);
    limpiarBorradorPerfil();
    return { requiereConfirmacion: false };
  }

  // Si el backend no devuelve sesión (p. ej. "Confirm email" activo), pero el
  // usuario ya quedó confirmado, intentamos entrar de inmediato.
  const { data: login, error: errLogin } = await supabase.auth.signInWithPassword(
    { email, password }
  );
  if (!errLogin && login.user) {
    await asegurarPerfilVendedor(login.user, perfil);
    limpiarBorradorPerfil();
    return { requiereConfirmacion: false };
  }

  guardarBorradorPerfil(email, perfil);
  return { requiereConfirmacion: true };
}

export async function iniciarSesion(email: string, password: string) {
  if (!supabase) throw new Error("Backend no disponible.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const borrador = leerBorradorPerfil();
  if (data.user) {
    await asegurarPerfilVendedor(data.user, borrador?.perfil ?? null);
    limpiarBorradorPerfil();
  }
  return data.session;
}

export async function cerrarSesion() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function useSesion() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, cargando };
}


/** Actualiza los datos públicos del perfil de la tienda. */
export async function actualizarPerfilVendedor(
  userId: string,
  datos: Partial<PerfilVendedor>
): Promise<void> {
  if (!supabase) throw new Error("Backend no disponible.");
  const { error } = await supabase
    .from("vendedores")
    .update({
      ...(datos.nombre !== undefined ? { nombre: datos.nombre } : {}),
      ...(datos.sector !== undefined ? { sector: datos.sector } : {}),
      ...(datos.provincia !== undefined ? { provincia: datos.provincia } : {}),
      ...(datos.municipio !== undefined ? { municipio: datos.municipio } : {}),
      ...(datos.descripcion !== undefined
        ? { descripcion: datos.descripcion }
        : {}),
      ...(datos.telefono !== undefined
        ? { telefono: datos.telefono || null }
        : {}),
      ...(datos.direccion !== undefined
        ? { direccion: datos.direccion || null }
        : {}),
      ...(datos.lat !== undefined ? { lat: datos.lat } : {}),
      ...(datos.lng !== undefined ? { lng: datos.lng } : {}),
    })
    .eq("id", userId);
  if (error) throw error;
}

/** Envía el correo de recuperación de contraseña. */
export async function enviarRecuperacion(email: string): Promise<void> {
  if (!supabase) throw new Error("Backend no disponible.");
  const origen =
    typeof window !== "undefined" ? window.location.origin : "";
  const ruta =
    typeof window !== "undefined"
      ? window.location.pathname.replace(/\/$/, "")
      : "";
  const base = ruta.slice(0, ruta.lastIndexOf("/"));
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origen}${base}/recuperar/`,
  });
  if (error) throw error;
}

/** Fija una contraseña nueva (con la sesión de recuperación activa). */
export async function actualizarPassword(password: string): Promise<void> {
  if (!supabase) throw new Error("Backend no disponible.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/** Borra fotos del usuario en Storage y elimina su cuenta. */
export async function eliminarCuenta(): Promise<void> {
  if (!supabase) throw new Error("Backend no disponible.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión activa.");

  try {
    const { data: archivos } = await supabase.storage.from("fotos").list(user.id);
    if (archivos && archivos.length > 0) {
      await supabase.storage
        .from("fotos")
        .remove(archivos.map((a) => `${user.id}/${a.name}`));
    }
  } catch {
    // si falla el storage, la cuenta igual se elimina
  }

  const { error } = await supabase.rpc("eliminar_mi_cuenta");
  if (error) throw error;
  await supabase.auth.signOut();
}
