import type { Producto } from "./types";

const p = (
  id: number,
  slug: string,
  nombre: string,
  precioCup: number,
  cooperativaId: string,
  sector: Producto["sector"],
  destacado: boolean,
  emoji: string,
  hue: number,
  descripcion: string
): Producto => ({
  id: `p${id}`,
  slug,
  nombre,
  precioCup,
  cooperativaId,
  sector,
  destacado,
  emoji,
  hue,
  descripcion,
});

export const PRODUCTOS: Producto[] = [
  // Cosecha del Valle (c1) — agroalimentario — Villa Clara
  p(1, "conserva-de-mango", "Conserva de mango en almíbar", 1800, "c1", "agroalimentario", true, "🥭", 40, "Fruta de madurez óptima, envase reciclable de 500 g."),
  p(2, "caja-de-viandas", "Caja de viandas (10 kg)", 4500, "c1", "agroalimentario", true, "🥔", 95, "Viandas frescas de la cosecha semanal, entregada en centro."),
  p(3, "tomate-organico", "Tomate orgánico (1 kg)", 350, "c1", "agroalimentario", false, "🍅", 10, "Cultivo sin agroquímico, de la huerta al comprador."),
  p(4, "mermelada-de-guayaba", "Mermelada de guayaba", 1200, "c1", "agroalimentario", false, "🍈", 340, "Dulce de cocción lenta, ideal para el desayuno."),
  p(5, "harina-de-maiz", "Harina de maíz molida", 800, "c1", "agroalimentario", false, "🌽", 50, "Molida en piedra, apta para frituras y tamales."),
  p(6, "cafe-tostado", "Cafe tostado molido (250 g)", 1400, "c1", "agroalimentario", false, "☕", 25, "Tueste medio de la sierra, aroma pronunciado."),
  p(7, "queso-fresco-de-amor", "Queso fresco de amor (500 g)", 1600, "c1", "agroalimentario", false, "🧀", 45, "Elaborado con leche fresca y cuajo natural."),

  // Telares del Malecón (c2) — textil — La Habana
  p(8, "guayabera-habana", "Guayabera Habana", 6500, "c2", "textil", true, "👔", 210, "Algodón peinado, confección con medidas ajustadas."),
  p(9, "uniforme-escolar-set", "Uniforme escolar (set)", 3800, "c2", "textil", true, "🧵", 195, "Pantalón y camisa resistentes al uso escolar diario."),
  p(10, "camisa-lino-verano", "Camisa de lino de verano", 4200, "c2", "textil", false, "👕", 180, "Tejido fresco para el calor habanero."),
  p(11, "toalla-artesanal", "Toalla artesanal tejida", 2200, "c2", "textil", false, "🧣", 25, "Algodón tejido en telar manual, 80x160 cm."),
  p(12, "blusa-bordada", "Blusa bordada a mano", 5000, "c2", "textil", false, "🩱", 320, "Bordado floral cubano, motivos de mariposa."),
  p(13, "cubre-sofa", "Cobertura de sofá", 3400, "c2", "textil", false, "🛋️", 30, "Tela resistente y lavable, confección a medida."),

  // Alfarería del Yumurí (c3) — artesanía — Matanzas
  p(14, "tazon-de-barro", "Tazón de barro esmaltado", 950, "c3", "artesania", true, "🏺", 15, "Cocción a leña, apto para microondas."),
  p(15, "plato-decorativo", "Plato decorativo de Yumurí", 1900, "c3", "artesania", false, "🎨", 48, "Motivos de la ciudad, esmaltado a mano."),
  p(16, "jarra-ceramica", "Jarra cerámica 1.5 L", 2400, "c3", "artesania", true, "🫖", 35, "Mantiene fresco el agua por evaporación natural."),
  p(17, "maceta-con-desagüe", "Maceta con desagüe", 700, "c3", "artesania", false, "🪴", 110, "Para interior y balcón, varios tamaños."),
  p(18, "vasija-de-inventario", "Vasija de almacén", 3200, "c3", "artesania", false, "🧺", 28, "Gran capacidad, para viandas y granos."),

  // Códigos Santiago (c4) — tic — Santiago de Cuba
  p(19, "pos-basico", "Sistema de venta (POS básico)", 18000, "c4", "tic", true, "💻", 220, "Inventario, comprobante e informe mensual en un solo lugar."),
  p(20, "pagina-web-5", "Página web (5 secciones)", 12000, "c4", "tic", true, "🌐", 260, "Alojada en Cuba, optimizada para móviles."),
  p(21, "soporte-digital", "Soporte digital mensual", 6000, "c4", "tic", false, "🛠️", 190, "Respaldo remoto y mantenimiento de tu sistema."),
  p(22, "inventario-movil", "Inventario móvil", 9000, "c4", "tic", false, "📱", 240, "Escanea y cuenta tu almacén desde tu teléfono."),

  // Cordillera de Cuero (c5) — artesanía — Holguín
  p(23, "bolso-bandolera", "Bolso bandolera de cuero", 5500, "c5", "artesania", true, "👜", 28, "Curtido vegetal, costura reforzada a mano."),
  p(24, "sandalias-costa", "Sandalias Costa", 2800, "c5", "artesania", true, "🩴", 20, "Cuero suave y suela recortada, cómodas de aventura."),
  p(25, "manilla-tejida", "Manilla tejida con cuero", 650, "c5", "artesania", false, "🧿", 200, "Diseño sencillo, cierre ajustable."),
  p(26, "cinturon-clasico", "Cinturón clásico", 2100, "c5", "artesania", false, "🪢", 30, "Herrajes de bronce, cuero de mesa entera."),
  p(27, "estuche-grabado", "Estuche grabado para celulares", 1300, "c5", "artesania", false, "📩", 15, "Grabado a buril, molde a la medida del modelo."),

  // Vientos del Este (c6) — servicios — Camagüey
  p(28, "kit-cumpleanos", "Kit cumpleaños (20 invitados)", 8500, "c6", "servicios", true, "🎉", 45, "Decoración, dulces y cumpleaños de cartel integrado."),
  p(29, "buffet-casero", "Buffet casero por hora", 1500, "c6", "servicios", false, "🍽️", 110, "Cocina cubana criolla a gusto del cliente."),
  p(30, "fotografia-evento", "Fotografía de evento", 6000, "c6", "servicios", false, "📷", 200, "Cobertura completa de la actividad, 150 fotos."),
  p(31, "logistica-vianda", "Logística de vianda semanal", 2200, "c6", "servicios", false, "🚲", 220, "Reparto a domicilio en la ciudad, pago por mes."),

  // Guajiros Digitales (c7) — tic — Pinar del Río
  p(32, "punto-de-venta-agro", "Punto de venta agropecuario", 15000, "c7", "tic", true, "🧾", 130, "Pensado para plazas y firmas de venta local."),
  p(33, "conectividad-wifi-zona", "WiFi de zona (kit base)", 11000, "c7", "tic", false, "📡", 190, "Equipo y configuración para zonas rurales."),
  p(34, "menu-digital-tv", "Menú digital para TVs", 7500, "c7", "tic", false, "📺", 210, "Cartelistas dinámicos para servicios."),
  p(35, "backup-nube-nacional", "Respaldo en nube nacional", 5000, "c7", "tic", false, "☁️", 200, "Cifrado en servidores cubanos, por mensualidad."),

  // Miel de Bayamo (c8) — agroalimentario — Granma
  p(36, "miel-pura-de-abeja", "Miel pura de abeja (1 kg)", 2400, "c8", "agroalimentario", true, "🍯", 40, "Cosecha de la montaña, análisis de laboratorio disponible."),
  p(37, "velas-de-cera", "Velas artesanales de cera", 900, "c8", "agroalimentario", false, "🕯️", 45, "Cera pura, sin aroma añadido."),
  p(38, "panal-a-la-altura", "Panal a la altura", 1800, "c8", "agroalimentario", false, "🐝", 50, "Cortado y envasado al día."),
];

export const PRODUCTOS_DESTACADOS = PRODUCTOS.filter((x) => x.destacado);
