"use client";

// Copia temporal de la grabación en ESTE dispositivo (IndexedDB), por si la transcripción o la nota fallan.
// Nunca se guarda en el servidor. Se borra cuando la nota se genera, al descartarla o a las 48 h.
const BASE = "docscribe";
const TIENDA = "audios";
const CLAVE = "pendiente";
const CADUCA_MS = 48 * 60 * 60 * 1000;

export type Pendiente = { blob: Blob; nombre: string; edad: string; creado: number };

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolver, rechazar) => {
    const req = indexedDB.open(BASE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(TIENDA);
    req.onsuccess = () => resolver(req.result);
    req.onerror = () => rechazar(req.error);
  });
}

function operar(modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<unknown> {
  return abrir().then(
    (db) =>
      new Promise((resolver, rechazar) => {
        const t = db.transaction(TIENDA, modo);
        const req = fn(t.objectStore(TIENDA));
        t.oncomplete = () => {
          db.close();
          resolver(req.result);
        };
        t.onerror = () => {
          db.close();
          rechazar(t.error);
        };
      })
  );
}

export async function guardarPendiente(p: Pendiente) {
  await operar("readwrite", (s) => s.put(p, CLAVE));
}

export async function leerPendiente(): Promise<Pendiente | null> {
  try {
    const p = (await operar("readonly", (s) => s.get(CLAVE))) as Pendiente | undefined;
    if (!p) return null;
    if (Date.now() - p.creado > CADUCA_MS) {
      await borrarPendiente();
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export async function borrarPendiente() {
  try {
    await operar("readwrite", (s) => s.delete(CLAVE));
  } catch {
    // sin IndexedDB (navegador privado): no hay nada que borrar
  }
}
