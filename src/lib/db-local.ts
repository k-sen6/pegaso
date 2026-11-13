// Almacenamiento local de Pegaso (IndexedDB). Sin dependencias.
// Guarda el snapshot del catálogo para que la app pinte al instante,
// incluso sin red, y la cola de escrituras pendientes.

const DB = "pegaso-local";
const VERSION = 1;
const CACHE = "cache";
const OUTBOX = "outbox";

export interface EntradaCache<T> {
  valor: T;
  ts: number;
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CACHE)) db.createObjectStore(CACHE);
      if (!db.objectStoreNames.contains(OUTBOX)) {
        db.createObjectStore(OUTBOX, { keyPath: "id" });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function lista(modo: IDBTransactionMode, nombre: string): Promise<IDBObjectStore> {
  return abrir().then((db) => db.transaction(nombre, modo).objectStore(nombre));
}

async function pedir<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function guardarCache<T>(clave: string, valor: T): Promise<void> {
  const store = await lista("readwrite", CACHE);
  await pedir(store.put({ valor, ts: Date.now() } satisfies EntradaCache<T>, clave));
}

export async function leerCache<T>(
  clave: string
): Promise<EntradaCache<T> | undefined> {
  const store = await lista("readonly", CACHE);
  return pedir(store.get(clave) as IDBRequest<EntradaCache<T> | undefined>);
}

export interface Pendiente {
  id: string;
  tipo: "producto-crear" | "producto-editar" | "producto-borrar";
  datos: Record<string, unknown>;
  productoId?: string;
  fotoId?: string;
  foto?: {
    full: Blob;
    card: Blob;
    thumb: Blob;
    ancho: number;
    alto: number;
    peso: number;
    preview: string;
  };
  quitarFoto?: boolean;
  intentos: number;
  creado: number;
  error?: string;
}

export async function listarPendientes(): Promise<Pendiente[]> {
  const store = await lista("readonly", OUTBOX);
  return pedir(store.getAll() as IDBRequest<Pendiente[]>);
}

export async function guardarPendiente(p: Pendiente): Promise<void> {
  const store = await lista("readwrite", OUTBOX);
  await pedir(store.put(p));
}

export async function borrarPendiente(id: string): Promise<void> {
  const store = await lista("readwrite", OUTBOX);
  await pedir(store.delete(id));
}

export async function contarPendientes(): Promise<number> {
  const store = await lista("readonly", OUTBOX);
  return pedir(store.count());
}
