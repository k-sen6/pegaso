// Persistencia de Blobs en IndexedDB (la cola de subidas guarda fotos
// de 150 KB sin tocar la cuota de localStorage). Abrimos un wrapper mínimo.

const DB = "pegaso-subidas-db";
const STORE = "fotos";

function abrir(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function transaccion(modo: IDBTransactionMode) {
  return abrir().then((db) => db.transaction(STORE, modo).objectStore(STORE));
}

export async function guardarBlob(clave: string, blob: Blob): Promise<void> {
  const store = await transaccion("readwrite");
  return new Promise((res, rej) => {
    const req = store.put(blob, clave);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

export async function leerBlob(clave: string): Promise<Blob | undefined> {
  const store = await transaccion("readonly");
  return new Promise((res, rej) => {
    const req = store.get(clave);
    req.onsuccess = () => res(req.result as Blob | undefined);
    req.onerror = () => rej(req.error);
  });
}

export async function borrarBlob(clave: string): Promise<void> {
  const store = await transaccion("readwrite");
  return new Promise((res, rej) => {
    const req = store.delete(clave);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}
