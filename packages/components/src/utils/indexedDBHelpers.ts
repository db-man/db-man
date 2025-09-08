export const deleteDatabaseAsync = (dbName: string) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = (event) => {
      resolve(event);
    };
  });
};

export const openAsync = (
  dbName: string,
  version: number,
  callbacks?: {
    onupgradeneeded: IDBOpenDBRequest['onupgradeneeded'];
  }
) => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    if (callbacks) {
      request.onupgradeneeded = callbacks.onupgradeneeded;
    }
  });
};

export const getAllRecordsAsync = (db: IDBDatabase, storeName: string) => {
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = (event) => {
      resolve(request.result);
    };
  });
};
