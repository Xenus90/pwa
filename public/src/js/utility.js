const dbPromise = idb.open('post-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', { keyPath: 'id' });
  }
});

const writeData = (storeName, data) => {
  return dbPromise
    .then(db => {
      let tx = db.transaction(storeName, 'readwrite');
      let store = tx.objectStore(storeName);
      store.put(data);
      return tx.complete;
    });
};

const readAllData = (storeName) => {
  return dbPromise
    .then(db => {
      let tx = db.transaction(storeName, 'readonly');
      let store = tx.objectStore(storeName);
      return store.getAll();
    });
};

const clearAllData = (storeName) => {
  return dbPromise
    .then(db => {
      let tx = db.transaction(storeName, 'readwrite');
      let store = tx.objectStore(storeName);
      store.clear();
      return tx.complete;
    });
};

const deleteItemFromData = (storeName, id) => {
  return dbPromise
    .then(db => {
      let tx = db.transaction(storeName, 'readwrite');
      let store = tx.objectStore(storeName);
      store.delete(id);
      return tx.complete;
    });
};
