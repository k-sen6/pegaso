"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrar, type PerfilVendedor } from "@/lib/auth";
import { telefonoValido } from "@/lib/whatsapp";
import { PROVINCIAS, SECTORES } from "@/lib/perfil-opciones";

export default function PaginaRegistro() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState<PerfilVendedor>({
    nombre: "",
    sector: "agroalimentario",
    provincia: "La Habana",
    municipio: "",
    descripcion: "",
    telefono: "",
    direccion: "",
  });
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);

    if (!perfil.nombre.trim() || !perfil.municipio.trim()) {
      setError("Completa el nombre de tu tienda y el municipio.");
      return;
    }
    if (!telefonoValido(perfil.telefono)) {
      setError("Escribe un WhatsApp válido (8 dígitos, ej. 5 123 4567).");
      return;
    }
    if (!perfil.direccion?.trim()) {
      setError("Añade una dirección para que los clientes sepan dónde recoger.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const { requiereConfirmacion } = await registrar(email.trim(), password, {
        ...perfil,
        nombre: perfil.nombre.trim(),
        municipio: perfil.municipio.trim(),
        descripcion: perfil.descripcion.trim(),
        telefono: perfil.telefono.trim(),
        direccion: perfil.direccion?.trim(),
      });
      if (requiereConfirmacion) {
        setAviso(
          "Cuenta creada. Revisa tu correo y confirma el enlace para poder iniciar sesión."
        );
        setPassword("");
      } else {
        router.push("/mi-cuenta");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registra tu tienda para publicar productos.
      </p>

      <form onSubmit={enviar} className="mt-8 grid gap-4">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Nombre de la tienda</span>
          <Input
            value={perfil.nombre}
            onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
            placeholder="Ej. Cosecha del Valle"
            autoComplete="organization"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Sector</span>
            <select
              value={perfil.sector}
              onChange={(e) => setPerfil({ ...perfil, sector: e.target.value })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {SECTORES.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Provincia</span>
            <select
              value={perfil.provincia}
              onChange={(e) => setPerfil({ ...perfil, provincia: e.target.value })}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Municipio</span>
          <Input
            value={perfil.municipio}
            onChange={(e) => setPerfil({ ...perfil, municipio: e.target.value })}
            placeholder="Ej. Sagua la Grande"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Descripción (opcional)</span>
          <Input
            value={perfil.descripcion}
            onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
            placeholder="Qué vendes y cómo trabajas"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">WhatsApp para clientes</span>
          <Input
            type="tel"
            required
            value={perfil.telefono}
            onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
            placeholder="+53 5 123 4567"
            autoComplete="tel"
            inputMode="tel"
          />
          <span className="text-xs text-muted-foreground">
            Será público: los compradores te escriben por aquí.
          </span>
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Dirección de recogida</span>
          <Input
            required
            value={perfil.direccion ?? ""}
            onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })}
            placeholder="Calle, número, entre calles, referencia"
            autoComplete="street-address"
          />
          <span className="text-xs text-muted-foreground">
            Puedes ajustar el mapa después desde Mi cuenta.
          </span>
        </label>

        <hr className="my-1 border-border" />

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
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
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
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/entrar" className="text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
