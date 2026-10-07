import {
  deleteDatabaseAsync,
  getAllRecordsAsync,
  openAsync,
} from './indexedDBHelpers';

/**
 * jsdom implements no IndexedDB at all, so these tests drive the promise
 * wiring with a hand written request object: every function here is only a
 * thin adapter between the callback API and a promise, and that adapter is
 * what we want to pin down.
 */
type FakeRequest = {
  onsuccess?: (event: unknown) => void;
  onerror?: (event: unknown) => void;
  onupgradeneeded?: (event: unknown) => void;
  result?: unknown;
};

const setIndexedDB = (mock: unknown) => {
  Object.defineProperty(global, 'indexedDB', {
    writable: true,
    configurable: true,
    value: mock,
  });
};

afterAll(() => {
  delete (global as { indexedDB?: unknown }).indexedDB;
});

describe('deleteDatabaseAsync', () => {
  it('should resolve with the event when the deletion succeeds', async () => {
    const request: FakeRequest = {};
    const deleteDatabase = jest.fn(() => request);
    setIndexedDB({ deleteDatabase });

    const promise = deleteDatabaseAsync('db1');
    const event = { type: 'success' };
    request.onsuccess?.(event);

    await expect(promise).resolves.toBe(event);
    expect(deleteDatabase).toHaveBeenCalledWith('db1');
  });

  it('should reject with the event when the deletion fails', async () => {
    const request: FakeRequest = {};
    setIndexedDB({ deleteDatabase: jest.fn(() => request) });

    const promise = deleteDatabaseAsync('db1');
    const event = { type: 'error' };
    request.onerror?.(event);

    await expect(promise).rejects.toBe(event);
  });
});

describe('openAsync', () => {
  it('should resolve with the database taken from the event target', async () => {
    const db = { name: 'db1' };
    const request: FakeRequest = {};
    const open = jest.fn(() => request);
    setIndexedDB({ open });

    const promise = openAsync('db1', 2);
    request.onsuccess?.({ target: { result: db } });

    await expect(promise).resolves.toBe(db);
    expect(open).toHaveBeenCalledWith('db1', 2);
  });

  it('should reject with the event when opening fails', async () => {
    const request: FakeRequest = {};
    setIndexedDB({ open: jest.fn(() => request) });

    const promise = openAsync('db1', 2);
    const event = { type: 'error' };
    request.onerror?.(event);

    await expect(promise).rejects.toBe(event);
  });

  it('should forward the onupgradeneeded callback when given', () => {
    const onupgradeneeded = jest.fn();
    const request: FakeRequest = {};
    setIndexedDB({ open: jest.fn(() => request) });

    openAsync('db1', 2, { onupgradeneeded });

    expect(request.onupgradeneeded).toBe(onupgradeneeded);
  });

  it('should not set onupgradeneeded when no callback is given', () => {
    const request: FakeRequest = {};
    setIndexedDB({ open: jest.fn(() => request) });

    openAsync('db1', 2);

    expect(request.onupgradeneeded).toBeUndefined();
  });
});

describe('getAllRecordsAsync', () => {
  it('should read every record of the store', async () => {
    const rows = [{ id: '1' }, { id: '2' }];
    const request: FakeRequest = { result: rows };
    const getAll = jest.fn(() => request);
    const objectStore = jest.fn(() => ({ getAll }));
    const transaction = jest.fn(() => ({ objectStore }));

    const promise = getAllRecordsAsync(
      { transaction } as unknown as IDBDatabase,
      'users'
    );
    request.onsuccess?.({});

    await expect(promise).resolves.toEqual(rows);
    expect(transaction).toHaveBeenCalledWith('users', 'readonly');
    expect(objectStore).toHaveBeenCalledWith('users');
  });

  it('should reject with the event when reading fails', async () => {
    const request: FakeRequest = {};
    const db = {
      transaction: () => ({ objectStore: () => ({ getAll: () => request }) }),
    };

    const promise = getAllRecordsAsync(db as unknown as IDBDatabase, 'users');
    const event = { type: 'error' };
    request.onerror?.(event);

    await expect(promise).rejects.toBe(event);
  });
});
