// Fuente única entre el pipeline de imágenes (tools/imagenes.mjs) y la UI.
// tema = tema visual del producto; archivo = nombre de archivo publicado en /pegaso/img/.

export const TEMAS: { tema: string; terminos: string[] }[] = [
  { tema: "mango", terminos: ["mango fruit", "mango"] },
  { tema: "viandas", terminos: ["yuca cassava", "root vegetables", "viandas"] },
  { tema: "tomate", terminos: ["tomate", "tomato"] },
  { tema: "guayaba", terminos: ["guava jam", "guava"] },
  { tema: "maiz", terminos: ["cornmeal", "maiz"] },
  { tema: "cafe", terminos: ["coffee beans", "cafe tostado"] },
  { tema: "queso", terminos: ["queso fresco", "cheese"] },
  { tema: "guayabera", terminos: ["guayabera", "linen shirt"] },
  { tema: "uniforme", terminos: ["school uniform", "shirt fabric"] },
  { tema: "lino", terminos: ["linen shirt", "linen clothing"] },
  { tema: "toalla", terminos: ["handwoven towel", "cotton towel"] },
  { tema: "blusa", terminos: ["embroidered blouse", "embroidery"] },
  { tema: "tela", terminos: ["fabric rolls", "fabric"] },
  { tema: "barro", terminos: ["pottery clay", "handmade pottery"] },
  { tema: "ceramica", terminos: ["ceramic plate decor", "ceramics"] },
  { tema: "jarra", terminos: ["ceramic pitcher", "clay jug"] },
  { tema: "maceta", terminos: ["flower pot", "maceta"] },
  { tema: "vasija", terminos: ["clay pot storage", "ceramic jar"] },
  { tema: "pos", terminos: ["point of sale terminal", "pos system"] },
  { tema: "web", terminos: ["laptop website", "web design"] },
  { tema: "soporte", terminos: ["computer support", "technician laptop"] },
  { tema: "inventario", terminos: ["barcode scanner", "scan phone"] },
  { tema: "bolso", terminos: ["leather bag", "leathercraft"] },
  { tema: "sandalias", terminos: ["leather sandals", "sandles"] },
  { tema: "manilla", terminos: ["woven bracelet", "leather bracelet"] },
  { tema: "cinturon", terminos: ["leather belt", "belt"] },
  { tema: "estuche", terminos: ["engraved leather", "wood engraving"] },
  { tema: "cumpleanos", terminos: ["birthday party", "party decoration"] },
  { tema: "buffet", terminos: ["buffet food", "party food"] },
  { tema: "fotografia", terminos: ["event photographer", "camera event"] },
  { tema: "reparto", terminos: ["delivery bicycle", "cargo bike"] },
  { tema: "wifi", terminos: ["wifi antenna", "network equipment"] },
  { tema: "menu-tv", terminos: ["digital signage", "tv screen store"] },
  { tema: "nube", terminos: ["cloud data", "server room"] },
  { tema: "miel", terminos: ["miel", "honey jar"] },
  { tema: "velas", terminos: ["velas", "candles handmade"] },
  { tema: "panal", terminos: ["honeycomb", "panal miel"] },
  { tema: "generica", terminos: ["cuba market", "artisan market"] },
];

export function archivoDeTema(tema: string): string {
  return `p-${tema}`;
}

/** productId pN → archivo base por tema (los temas compartidos comparten archivo). */
export const TEMA_DE_PRODUCTO: Record<string, string> = {
  p1: "mango",
  p2: "viandas",
  p3: "tomate",
  p4: "guayaba",
  p5: "maiz",
  p6: "cafe",
  p7: "queso",
  p8: "guayabera",
  p9: "uniforme",
  p10: "lino",
  p11: "toalla",
  p12: "blusa",
  p13: "tela",
  p14: "barro",
  p15: "ceramica",
  p16: "jarra",
  p17: "maceta",
  p18: "vasija",
  p19: "pos",
  p20: "web",
  p21: "soporte",
  p22: "inventario",
  p23: "bolso",
  p24: "sandalias",
  p25: "manilla",
  p26: "cinturon",
  p27: "estuche",
  p28: "cumpleanos",
  p29: "buffet",
  p30: "fotografia",
  p31: "reparto",
  p32: "pos",
  p33: "wifi",
  p34: "menu-tv",
  p35: "nube",
  p36: "miel",
  p37: "velas",
  p38: "panal",
};

/** Voice archivo base por tema (con _NOTE de coherencia: los que comparten tema comparten archivo). */
export const TEMA_ARCHIVO: Record<string, string> = Object.fromEntries(
  TEMAS.map((t) => [t.tema, archivoDeTema(t.tema)])
);
