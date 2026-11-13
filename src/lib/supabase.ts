// Cliente Supabase del frontend (solo claves públicas: URL + anon).
// El service_role JAMÁS se usa ni se empaqueta en el bundle.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Tabla<Row> = {
  Row: Row;
  Insert: Partial<Row> & { producto_id?: string | null };
  Update: Partial<Row>;
  Relationships: [];
};

export interface PegasoTypes {
  public: {
    Tables: {
      vendedores: Tabla<{
        id: string;
        slug: string;
        nombre: string;
        sector: string;
        provincia: string;
        municipio: string;
        descripcion: string;
        verificacion: string;
        foto_url: string | null;
        telefono: string | null;
        direccion: string | null;
        lat: number | null;
        lng: number | null;
        created_at: string;
      }>;
      productos: Tabla<{
        id: string;
        slug: string;
        nombre: string;
        descripcion: string;
        precio_cup: number;
        sector: string;
        destacado: boolean;
        hue: number;
        vendedor_id: string;
        created_at: string;
      }>;
      fotos: Tabla<{
        id: string;
        producto_id: string | null;
        nombre_producto: string;
        url: string | null;
        thumb_url: string | null;
        card_url: string | null;
        peso_bytes: number;
        ancho: number;
        alto: number;
        estado: string;
        created_at: string;
      }>;
      reservas: Tabla<{
        id: string;
        producto_slug: string;
        modo: string;
        estado: string;
        sincronizado: boolean;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      eliminar_mi_cuenta: { Args: Record<string, never>; Returns: null };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Claves públicas de Supabase (la anon está diseñada para el cliente).
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://guptzbnzkprdrgilrdrx.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cHR6Ym56a3ByZHJnaWxyZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMTc0NDcsImV4cCI6MjEwOTU5MzQ0N30.-lIwFwPSCOp77QiiemTJL8PlR6fPaa3ir4-T-GnSpiE";

/** null sin backend configurado → la PWA sigue 100% offline con mocks. */
export const supabase: SupabaseClient<PegasoTypes> | null =
  url && anon ? createClient<PegasoTypes>(url, anon) : null;

export const NUBE_CONFIGURADA = Boolean(supabase);
