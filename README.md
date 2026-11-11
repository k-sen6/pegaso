# Pegaso

Plataforma cubana que conecta cooperativas verificadas con compradores
nacionales y oportunidades de financiamiento internacional (programa NAE —
UE / PNUD / MEP / Cooperación Francesa).

Iteración 1: fundaciones, sistema de diseño y home con datos de demostración.

## Stack

- Next.js 15 (App Router, React Server Components por defecto)
- TypeScript estricto
- Tailwind CSS v4 con tokens de diseño en `@theme` (`src/app/globals.css`)
- shadcn/ui (Radix UI) copiado al repo
- Geist Variable auto-hospedada con `next/font`
- Modo claro/oscuro con `next-themes` (prioridad: modo oscuro)
- lucide-react para iconos
- Export estático para GitHub Pages

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
```

El build de producción exporta HTML estático a `out/`:

```bash
npm run build
```

## Despliegue en GitHub Pages

El workflow `.github/workflows/pages.yml` construye y publica en cada push a
`main`. Para activarlo la primera vez: **Settings → Pages → Source: Deploy
from a branch no aplica; usar "GitHub Actions"**.

URL: `https://k-sen6.github.io/pegaso/`

## Estructura

```
src/
  app/                  # Rutas (App Router)
    page.tsx            # Home
    productos/          # Catálogo
    cooperativas/       # Directorio
    formacion/          # Cursos
    financiamiento/     # Programa NAE
    registro/           # Stub (formulario real en Iteración 4)
    offline/            # Fallback offline (ex /~offline: prefijo reservado en Next 15.5)
  components/           # Header, Footer, MobileNav, ConnectionIndicator, tarjetas...
  components/ui/        # Primitivos de shadcn/ui
  lib/mock/             # Datos de demostración (8 cooperativas, 38 productos, 15 cursos)
  lib/precio.ts         # Formato de precios en CUP
```

## Decisiones de diseño (Iteración 1)

- **Color:** primario terracota (`#ea580c` oscuro / `#c2410c` claro) sobre
  superficies neutras frías; semánticos (`success`, `warning`, `error`,
  `info`) definidos solo como tokens.
- **Modo oscuro por defecto:** los apagones dominan el contexto; se activa de
  fábrica y es conmutable.
- **Portadas sin red:** los productos usan gradiente determinista (OKLCH, hue
  por producto) + emoji: 0 KB de imágenes externas en la iteración 1.
- **Sin dependencias pesadas:** sin MUI/Chakra; el JS compartido es 103 kB
  (~34 kB gzip), por debajo del presupuesto de 150 kB gzip.
- **Español cubano** en copy, mensajes y CTAs ("Reservar", "Publicar producto").

## Roadmap

- **Iteración 2:** catálogo con filtros facetados y ficha de producto con
  vales QR.
- **Iteración 3:** perfiles de cooperativa y detalle de cursos.
- **Iteración 4:** autenticación y panel de cooperativa.
- **Iteración 5:** offline real con PowerSync + Service Worker.
- **Iteración 6:** pedidos, verificación y financiamiento NAE.

