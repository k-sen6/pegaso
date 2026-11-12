"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSesion, actualizarPassword, enviarRecuperacion } from "@/lib/auth";

export default function PaginaRecuperar() {
  const { session, cargando } = useSesion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function pedirEnlace(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando(true);
    try {
      await enviarRecuperacion(email.trim());
      setAviso(
        "Te enviamos un enlace. Revisa tu correo (y la carpeta de spam) para crear una contraseña nueva."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar el correo."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function cambiar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    try {
      await actualizarPassword(password);
      setAviso("Contraseña actualizada. Ya puedes entrar con ella.");
      setPassword("");
      setConfirmar("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar la contraseña."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Recuperar contraseña
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {session
          ? "Elige una contraseña nueva para tu cuenta."
          : "Escribe tu correo y te enviamos un enlace para crear una contraseña nueva."}
      </p>

      {cargando ? null : session ? (
        <form onSubmit={cambiar} className="mt-8 grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Nueva contraseña</span>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Repite la contraseña</span>
            <Input
              type="password"
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {aviso && (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              {aviso}{" "}
              <Link href="/entrar" className="underline">
                Entrar
              </Link>
            </p>
          )}

          <Button type="submit" disabled={enviando} className="mt-1 h-9">
            {enviando ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      ) : (
        <form onSubmit={pedirEnlace} className="mt-8 grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Correo electrónico</span>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {aviso && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              {aviso}
            </p>
          )}

          <Button type="submit" disabled={enviando} className="mt-1 h-9">
            {enviando ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/entrar" className="text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
