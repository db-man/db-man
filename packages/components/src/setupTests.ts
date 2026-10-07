// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const localStorageMock = (function mock() {
  let store: { [key: string]: string } = {
    dbm_github_personal_access_token: '',
    dbm_github_repo_path: 'dbs',
    dbm_github_owner: 'db-man',
    dbm_github_repo_name: 'db',
    dbm_dbs_schema:
      '{"iam":[{"name":"users","columns":[{"id":"userId","name":"User ID","primary":true},{"id":"name","name":"Name"},{"id":"age","name":"Age","type":"NUMBER"},{"id":"active","name":"Active","type":"BOOL"},{"id":"tags","name":"Tags","type":"STRING_ARRAY"}]}]}',
    dbm_db_connections:
      '[{"key":"1","owner":"db-man","token":"123","repo":"db","path":"dbs"}]',
  };

  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: any) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * jsdom shims required by antd.
 *
 * antd's `Row` (via `_util/responsiveObserver`) calls `window.matchMedia` in a
 * `useEffect`, and `Table`/`Segmented` use `ResizeObserver`. jsdom implements
 * neither, so without these shims any test that renders an antd component
 * throws `TypeError: window.matchMedia is not a function` and can never pass.
 *
 * IMPORTANT: these must be plain functions, NOT `jest.fn()`.
 * create-react-app sets `resetMocks: true` (see
 * node_modules/react-scripts/scripts/utils/createJestConfig.js), which resets
 * every mock before each test. A module-scope `jest.fn()` would therefore be
 * wiped out and silently return `undefined` at assertion time.
 */
const noop = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop, // deprecated, but antd still calls it
    removeListener: noop, // deprecated
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

// jsdom's own `window.scrollTo` logs "Not implemented" to the console.
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: noop,
});
