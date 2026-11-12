"use client";

import Link from "next/link";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cerrarSesion, useSesion } from "@/lib/auth";

export function SesionPanel() {
  const { session, cargando } = useSesion();

  if (cargando) return null;

  if (!session) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4">
        <p className="mr-auto text-sm text-muted-foreground">
          Inicia sesión para publicar y gestionar tus productos.
        </p>
        <Button asChild size="sm">
          <Link href="/entrar">
            <LogIn className="size-4" aria-hidden="true" /> Entrar
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/registro">
            <UserPlus className="size-4" aria-hidden="true" /> Crear cuenta
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4">
      <p className="mr-auto text-sm">
        <span className="text-muted-foreground">Sesión: </span>
        <span className="font-medium">{session.user.email}</span>
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          void cerrarSesion();
        }}
      >
        <LogOut className="size-4" aria-hidden="true" /> Salir
      </Button>
    </div>
  );
}
