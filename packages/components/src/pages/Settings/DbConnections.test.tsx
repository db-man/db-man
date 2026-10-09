import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import DbConnections, { StorageType } from './DbConnections';
import * as constants from '../../constants';

jest.mock('./helpers', () => ({
  reloadDbsSchemaAsync: jest.fn(),
  saveConnectionToLocalStorage: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { reloadDbsSchemaAsync, saveConnectionToLocalStorage } = jest.requireMock(
  './helpers'
);

const connections = [
  { key: '1', token: 'tok', owner: 'db-man', repo: 'db', path: 'dbs' },
];

function makeStorage(initial: Record<string, string> = {}) {
  const store: Record<string, string> = {
    [constants.LS_KEY_DB_CONNECTIONS]: JSON.stringify(connections),
    [constants.LS_KEY_GITHUB_OWNER]: 'db-man',
    [constants.LS_KEY_GITHUB_REPO_NAME]: 'db',
    ...initial,
  };
  const storage: StorageType = {
    get: jest.fn((k: string) => store[k] ?? null),
    set: jest.fn((k: string, v: string) => {
      store[k] = v;
    }),
    remove: jest.fn((k: string) => {
      delete store[k];
    }),
  };
  return storage;
}

function renderPage(storage = makeStorage()) {
  render(<DbConnections storage={storage} />);
  return { storage };
}

beforeEach(() => {
  (reloadDbsSchemaAsync as jest.Mock).mockReset();
  (reloadDbsSchemaAsync as jest.Mock).mockResolvedValue(undefined);
  (saveConnectionToLocalStorage as jest.Mock).mockReset();
  localStorage.removeItem(constants.LS_QUERY_PAGE_SELECTED_TABLE_NAMES);
});

describe('DbConnections', () => {
  it('shows the currently enabled connection', () => {
    renderPage();
    expect(
      screen.getByText(/Enabled connection: db-man\/db/)
    ).toBeInTheDocument();
  });

  it('renders the stored connections with an Enable button per row', () => {
    renderPage();
    expect(screen.getByDisplayValue('tok')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Enable' })).toHaveLength(1);
  });

  it('enables a connection and reloads the db schema', async () => {
    const { storage } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Enable' }));

    await waitFor(() => {
      expect(reloadDbsSchemaAsync).toHaveBeenCalledWith(
        'tok',
        'db-man',
        'db',
        expect.anything()
      );
    });
    expect(saveConnectionToLocalStorage).toHaveBeenCalledWith(
      'tok',
      'db-man',
      'db'
    );
    // The UI state of the query page is cleared before switching connections
    expect(storage.get).toHaveBeenCalledWith(constants.LS_KEY_DB_CONNECTIONS);
  });

  it('saves the table data into the given storage', async () => {
    const { storage } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(storage.set).toHaveBeenCalledWith(
        constants.LS_KEY_DB_CONNECTIONS,
        expect.any(String)
      );
    });
    const saved = JSON.parse(
      (storage.set as jest.Mock).mock.calls[0][1] as string
    );
    expect(saved).toHaveLength(2);
  });

  it('exports the connections to a JSON file', () => {
    const createObjectURL = jest.fn((_blob: Blob) => 'blob:mock');
    const revokeObjectURL = jest.fn();
    (window.URL as any).createObjectURL = createObjectURL;
    (window.URL as any).revokeObjectURL = revokeObjectURL;
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const storage = makeStorage();

    renderPage(storage);
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(storage.get).toHaveBeenCalledWith(constants.LS_KEY_DB_CONNECTIONS);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe('application/json');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });

  it('resets every stored key and tells the user to refresh', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { storage } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    const removedKeys = (storage.remove as jest.Mock).mock.calls.map(
      (call) => call[0]
    );
    expect(removedKeys).toEqual([
      constants.LS_KEY_DB_CONNECTIONS,
      constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN,
      constants.LS_KEY_GITHUB_OWNER,
      constants.LS_KEY_GITHUB_REPO_NAME,
      constants.LS_KEY_GITHUB_REPO_PATH,
      constants.LS_KEY_GITHUB_REPO_MODES,
      constants.LS_KEY_DBS_SCHEMA,
      constants.LS_IS_DARK_THEME,
      constants.LS_SHOW_DOWNLOAD_BUTTON,
    ]);
    expect(alertSpy).toHaveBeenCalledWith('Finish reset, refresh the webpage.');

    alertSpy.mockRestore();
  });

  it('imports connections from a JSON file', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { storage } = renderPage();
    const imported = JSON.stringify({
      [constants.LS_KEY_DB_CONNECTIONS]: JSON.stringify([
        { key: '9', token: 't9', owner: 'o9', repo: 'r9', path: 'dbs' },
      ]),
    });
    const file = new File([imported], 'DbManExportData.json', {
      type: 'application/json',
    });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });

    fireEvent.change(input);

    await waitFor(() => {
      expect(storage.set).toHaveBeenCalledWith(
        constants.LS_KEY_DB_CONNECTIONS,
        JSON.stringify([
          { key: '9', token: 't9', owner: 'o9', repo: 'r9', path: 'dbs' },
        ])
      );
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Finish importing, refresh and enable one connection.'
    );

    alertSpy.mockRestore();
  });

  it('starts with an empty table when no connections are stored', () => {
    const storage = makeStorage({ [constants.LS_KEY_DB_CONNECTIONS]: '' });
    renderPage(storage);
    expect(screen.queryByDisplayValue('tok')).not.toBeInTheDocument();
    expect(screen.queryAllByText('Edit')).toHaveLength(0);
  });
});
