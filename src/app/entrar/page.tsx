"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { iniciarSesion } from "@/lib/auth";

export default function PaginaEntrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
      router.push("/mi-cuenta");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo iniciar sesión. Verifica tus datos."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Accede para gestionar tus productos.
      </p>

      <form onSubmit={enviar} className="mt-8 grid gap-4">
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

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Contraseña</span>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={enviando} className="mt-1 h-9">
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
