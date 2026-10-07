import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GithubDb } from '@db-man/github';
import { message } from 'antd';

import { STRING, STRING_ARRAY } from '../../../constants';
import PageContext, { PageContextType } from '../../../contexts/page';
import { AppContext, AppContextProps } from '../../../contexts/AppContext';
import DbColumn from '../../../types/DbColumn';
import ListPage from './index';

/**
 * IMPORTANT: never configure a mock at module scope in this repo.
 * CRA sets `resetMocks: true`, which wipes every mock implementation before
 * each test. The implementation must be set inside the test (or `beforeEach`).
 */
const mockGetTableRows = jest.fn();

/**
 * `ListPage` creates a module level `debounce(updateUrl, 500)`. Waiting the real
 * 500ms in every test would be slow and would not test anything extra: what we
 * care about is that an interaction eventually reaches `updateUrl` (and changes
 * the URL), not the exact delay. Shortening the delay keeps the real `updateUrl`
 * and the real `window.location` in play, just faster.
 */
jest.mock('lodash.debounce', () => {
  const realDebounce = jest.requireActual('lodash.debounce');
  return (fn: (...args: any[]) => void) => realDebounce(fn, 20);
});

/** A little longer than the 20ms debounce above. */
const flushDebouncedUrl = () =>
  new Promise((resolve) => setTimeout(resolve, 60));

const columns: DbColumn[] = [
  { id: 'userId', name: 'User ID', type: STRING, primary: true },
  { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
];

const context: PageContextType = {
  appModes: [],
  dbs: {},
  dbName: 'iam',
  tableName: 'users',
  action: 'list',
  columns,
  primaryKey: 'userId',
  tables: [],
  githubDb: { getTableRows: mockGetTableRows } as unknown as GithubDb,
};

const appContext = (tables: any[] = []): AppContextProps => ({
  dbs: {},
  getTablesByDbName: () => tables,
  getViewsByDbName: () => [],
  getViewByDbNameViewName: () => null,
});

const ui = ({
  cols = columns,
  tableName = 'users',
  contextTableName = tableName,
  tables = [],
}: {
  cols?: DbColumn[];
  tableName?: string;
  contextTableName?: string;
  tables?: any[];
} = {}) => (
  <BrowserRouter>
    <AppContext.Provider value={appContext(tables)}>
      <PageContext.Provider
        value={{ ...context, columns: cols, tableName: contextTableName }}
      >
        <ListPage tableName={tableName} />
      </PageContext.Provider>
    </AppContext.Provider>
  </BrowserRouter>
);

const renderListPage = (options?: Parameters<typeof ui>[0]) =>
  render(ui(options));

const row = (
  userId: string,
  name: string,
  createdAt = '2021-07-04 09:16:01'
) => ({ userId, name, createdAt, updatedAt: createdAt });

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 12 rows: more than one page with the default page size of 10, and names that
 * sort in an obvious order (A..L).
 */
const manyRows = Array.from({ length: 12 }, (_, i) => ({
  userId: `u${i}`,
  name: String.fromCharCode(65 + i),
  createdAt: `2021-01-01 00:00:${pad(i)}`,
  updatedAt: `2021-01-01 00:00:${pad(i)}`,
}));

/** The visible rows of the antd table, as arrays of cell texts. */
const tableRows = () =>
  Array.from(
    document.querySelectorAll('.ant-table-tbody tr.ant-table-row')
  ).map((tr) =>
    Array.from(tr.querySelectorAll('td')).map((td) => td.textContent)
  );

/** The "Name" column of the visible rows, i.e. the order they are shown in. */
const visibleNames = () => tableRows().map((cells) => cells[1]);

const activePage = () =>
  document.querySelector('.ant-pagination-item-active')?.textContent;

/** antd renders the Segmented control as `role="option"` items. */
const switchView = (name: string) =>
  fireEvent.click(screen.getByRole('option', { name }));

const pressKey = (key: string) => fireEvent.keyDown(window, { key });

/**
 * antd renders toasts into a container appended to `document.body`, outside of
 * the React tree testing-library cleans up. `destroy()` has to be called inside
 * `act`, otherwise React 18 defers the removal and the toast survives into the
 * next test.
 */
const clearToasts = () => act(() => message.destroy());

const clickColumnHeader = (name: string) => {
  // The column title also shows up as a filter label above the table, so the
  // header cell has to be picked by element, not by text.
  const header = Array.from(
    document.querySelectorAll('.ant-table-thead th')
  ).find((th) => th.textContent === name);
  expect(header).toBeDefined();
  fireEvent.click(header!);
};

describe('ListPage', () => {
  beforeEach(() => {
    mockGetTableRows.mockReset();
    // `ListPage` reads `page` / `pageSize` / `view` / `sorter` from the URL at
    // mount, so every test has to start from a clean URL.
    window.history.replaceState({}, '', '/');
    clearToasts();
  });

  afterEach(async () => {
    // Let a pending `debouncedUpdateUrl` fire inside this test, so the URL it
    // pushes cannot silently change the starting state of the next one.
    await flushDebouncedUrl();
    window.history.replaceState({}, '', '/');
    clearToasts();
  });

  it('shows a loading tip, then renders the rows returned by githubDb', async () => {
    let resolveGetTableRows: (value: unknown) => void = () => {};
    mockGetTableRows.mockReturnValue(
      new Promise((resolve) => {
        resolveGetTableRows = resolve;
      })
    );

    renderListPage();

    // While the request is in flight, the loading tip is shown
    expect(screen.getByText(/Loading iam\/users/i)).toBeInTheDocument();

    resolveGetTableRows({ content: [row('123', 'David')] });

    expect(await screen.findByText('David')).toBeInTheDocument();
    expect(screen.queryByText(/Loading iam\/users/i)).not.toBeInTheDocument();
    expect(mockGetTableRows).toHaveBeenCalledWith(
      'iam',
      'users',
      expect.anything()
    );
  });

  it('renders an error alert when fetching the rows fails', async () => {
    mockGetTableRows.mockRejectedValue(new Error('boom'));

    renderListPage();

    expect(
      await screen.findByText(/Failed to get data: boom/i)
    ).toBeInTheDocument();
  });

  it('warns about rows sharing the same primary key', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('123', 'David'), row('123', 'Ben')],
    });

    renderListPage();

    expect(
      await screen.findByText(/Duplicated row keys/i)
    ).toBeInTheDocument();
  });

  it('warns about rows which have no primary key', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('123', 'David'), { name: 'NoKey' }],
    });

    renderListPage();

    expect(await screen.findByText(/Invalid rows/i)).toBeInTheDocument();
  });

  it('filters the displayed rows by the filter input', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('123', 'David'), row('456', 'Ben')],
    });

    renderListPage();
    expect(await screen.findByText('Ben')).toBeInTheDocument();

    // The first text box above the table is the "Name" filter
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Dav' },
    });

    await waitFor(() =>
      expect(screen.queryByText('Ben')).not.toBeInTheDocument()
    );
    expect(screen.getByText('David')).toBeInTheDocument();

    // The filter is also written into the URL by the debounced `updateUrl`
    await flushDebouncedUrl();
    expect(window.location.search).toContain(
      `filter=${encodeURIComponent(JSON.stringify({ name: 'Dav' }))}`
    );
  });

  it('sorts by the sorter read from the URL', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('1', 'David'), row('2', 'Ben')],
    });
    window.history.replaceState(
      {},
      '',
      `/?sorter=${encodeURIComponent(
        JSON.stringify({ columnKey: 'name', order: 'ascend' })
      )}`
    );

    renderListPage();
    await screen.findByText('David');

    expect(visibleNames()).toEqual(['Ben', 'David']);
  });

  it('sorts by createdAt descending when the URL has no sorter', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('1', 'David', '2021-01-02'), row('2', 'Ben', '2021-01-01')],
    });

    renderListPage();
    await screen.findByText('David');

    expect(visibleNames()).toEqual(['David', 'Ben']);
  });

  it('hides the columns marked as HIDE on the list page', async () => {
    mockGetTableRows.mockResolvedValue({ content: [row('1', 'David')] });

    renderListPage({
      cols: [
        ...columns,
        {
          id: 'secret',
          name: 'Secret',
          type: STRING,
          'type:listPage': 'HIDE',
        } as DbColumn,
      ],
    });

    await screen.findByText('David');

    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders Update and Detail links for every row', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('https://example.com?id=1&name=John', 'David')],
    });

    renderListPage();
    await screen.findByText('David');

    const encoded = encodeURIComponent('https://example.com?id=1&name=John');
    expect(screen.getByRole('link', { name: 'Update' })).toHaveAttribute(
      'href',
      `/iam/users/update?userId=${encoded}`
    );
    expect(screen.getByRole('link', { name: 'Detail' })).toHaveAttribute(
      'href',
      `/iam/users/get?userId=${encoded}`
    );
  });

  it('renders ref-table links for a column with a referenceTable', async () => {
    mockGetTableRows.mockResolvedValue({ content: [row('123', 'David')] });

    renderListPage({
      cols: [
        {
          id: 'userId',
          name: 'User ID',
          type: STRING,
          primary: true,
          referenceTable: 'users_ref',
        },
      ],
      tables: [
        {
          name: 'users_ref',
          columns: [{ id: 'refId', name: 'Ref ID', type: STRING, primary: true }],
        },
      ],
    });
    await screen.findByText('123');

    // The ref-table links live behind a Popover, opened by the square icon
    const icon = document.querySelector('.anticon-right-square');
    expect(icon).not.toBeNull();
    fireEvent.click(icon!);

    expect(await screen.findByRole('link', { name: '123' })).toHaveAttribute(
      'href',
      '/iam/users_ref/get?refId=123'
    );
  });

  it('renders the ref-table link only for STRING_ARRAY columns that have values', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [
        { userId: 'r1', tags: [], createdAt: '2021-01-01', updatedAt: '2021-01-01' },
        {
          userId: 'r2',
          tags: ['t1'],
          createdAt: '2021-01-02',
          updatedAt: '2021-01-02',
        },
      ],
    });

    renderListPage({
      cols: [
        { id: 'userId', name: 'User ID', type: STRING, primary: true },
        {
          id: 'tags',
          name: 'Tags',
          type: STRING_ARRAY,
          referenceTable: 'tags_ref',
        },
      ],
      tables: [
        {
          name: 'tags_ref',
          columns: [{ id: 'tagId', name: 'Tag ID', type: STRING, primary: true }],
        },
      ],
    });
    await screen.findByText(/Total 2 items/i);

    // The empty array must not get a ref-table popover, the filled one must
    expect(document.querySelectorAll('.anticon-right-square')).toHaveLength(1);
  });

  it('re-fetches and hides the old rows when the tableName changes', async () => {
    mockGetTableRows.mockImplementation((_dbName: string, table: string) =>
      Promise.resolve({
        content: table === 'users' ? [row('1', 'David')] : [row('2', 'Ben')],
      })
    );

    const { rerender } = renderListPage();
    expect(await screen.findByText('David')).toBeInTheDocument();

    rerender(ui({ tableName: 'groups' }));

    // The rows belong to the previous table, so they must not be shown
    expect(screen.queryByText('David')).not.toBeInTheDocument();

    expect(await screen.findByText('Ben')).toBeInTheDocument();
    expect(mockGetTableRows).toHaveBeenLastCalledWith(
      'iam',
      'groups',
      expect.anything()
    );
  });

  it('hides the rows while the context points at a different table', async () => {
    mockGetTableRows.mockResolvedValue({ content: [row('1', 'David')] });

    const { rerender } = renderListPage();
    expect(await screen.findByText('David')).toBeInTheDocument();

    // Only the context moves on, without `props.tableName` changing, so no
    // re-fetch is triggered. This isolates the window between a route change and
    // the effect that loads the new table: the rows still on screen belong to the
    // previous table, so they must not be rendered.
    rerender(ui({ tableName: 'users', contextTableName: 'groups' }));

    expect(screen.queryByText('David')).not.toBeInTheDocument();
    expect(document.querySelector('.ant-table')).toBeNull();
  });

  it('switches to the image view and paginates through the cards', async () => {
    const imageColumns: DbColumn[] = [
      { id: 'userId', name: 'User ID', type: STRING, primary: true },
      {
        id: 'photos',
        name: 'Photos',
        type: STRING_ARRAY,
        'ui:listPage:isImageViewKey': true,
      },
    ];
    mockGetTableRows.mockResolvedValue({
      content: manyRows.map(({ userId }) => ({
        userId,
        photos: [`https://img.example.com/${userId}.jpg`],
      })),
    });

    renderListPage({ cols: imageColumns });
    await screen.findByText('u0');

    switchView('Image View');

    expect(document.querySelector('.dbm-card-table')).not.toBeNull();
    expect(screen.queryByText('Total 1 items')).not.toBeInTheDocument();
    // Page size is the default 10, so only the first 10 cards are rendered
    expect(document.querySelectorAll('.dbm-dd-image-link')).toHaveLength(10);

    fireEvent.click(
      screen.getByTitle('Next Page').querySelector('button') as HTMLElement
    );

    expect(document.querySelectorAll('.dbm-dd-image-link')).toHaveLength(2);
    await flushDebouncedUrl();
    expect(window.location.search).toContain('page=2');
  });

  it('warns when the image view has no key column', async () => {
    mockGetTableRows.mockResolvedValue({ content: [row('1', 'David')] });

    renderListPage();
    await screen.findByText('David');

    switchView('Image View');

    expect(
      await screen.findByText(/Which column data to render the image list/i)
    ).toBeInTheDocument();
  });

  it('renders no view at all when the URL asks for an unknown view', async () => {
    let resolveRows: (value: unknown) => void = () => {};
    mockGetTableRows.mockReturnValue(
      new Promise((resolve) => {
        resolveRows = resolve;
      })
    );
    window.history.replaceState({}, '', '/?view=nonsense');

    renderListPage();

    // Hold the response back, so the component is definitely still loading and
    // the view switch has not been reached yet
    expect(screen.getByText(/Loading iam\/users/i)).toBeInTheDocument();

    resolveRows({ content: [row('1', 'David')] });
    await waitFor(() =>
      expect(screen.queryByText(/Loading iam\/users/i)).not.toBeInTheDocument()
    );

    expect(document.querySelector('.ant-table')).toBeNull();
    expect(document.querySelector('.dbm-card-table')).toBeNull();
    expect(document.querySelector('.dbm-random-list')).toBeNull();
  });

  it('switches to the random view and changes the page size', async () => {
    mockGetTableRows.mockResolvedValue({
      content: manyRows.map(({ userId, name }) => row(userId, name)),
    });

    renderListPage();
    await screen.findByText('A');

    switchView('Random View');

    expect(document.querySelector('.dbm-random-list')).not.toBeNull();

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByTitle('16'));

    await flushDebouncedUrl();
    expect(window.location.search).toContain('pageSize=16');
  });

  it('paginates with the table pager', async () => {
    mockGetTableRows.mockResolvedValue({ content: manyRows });

    renderListPage();
    await screen.findByText(/Total 12 items/i);
    expect(activePage()).toBe('1');

    fireEvent.click(
      screen.getByTitle('Next Page').querySelector('button') as HTMLElement
    );

    await waitFor(() => expect(activePage()).toBe('2'));

    // The debounced `updateUrl` writes the new page into the URL
    await flushDebouncedUrl();
    expect(window.location.search).toContain('page=2');
    expect(window.location.search).toContain('pageSize=10');
  });

  it('re-sorts the rows when a column header is clicked', async () => {
    mockGetTableRows.mockResolvedValue({ content: manyRows });

    renderListPage();
    await screen.findByText(/Total 12 items/i);

    // The default sorter is `createdAt` descending, so the newest row is first
    expect(visibleNames()[0]).toBe('L');

    clickColumnHeader('Name');

    await waitFor(() => expect(visibleNames()[0]).toBe('A'));

    // Clicking the same header again flips the order
    clickColumnHeader('Name');

    await waitFor(() => expect(visibleNames()[0]).toBe('L'));

    // The sorter is also written into the URL by the debounced `updateUrl`
    await flushDebouncedUrl();
    expect(window.location.search).toContain(
      `sorter=${encodeURIComponent(
        JSON.stringify({ columnKey: 'name', order: 'descend' })
      )}`
    );
  });

  it('navigates with the arrow keys and stops at both ends', async () => {
    mockGetTableRows.mockResolvedValue({ content: manyRows });

    renderListPage();
    await screen.findByText(/Total 12 items/i);

    pressKey('ArrowRight');
    await waitFor(() => expect(activePage()).toBe('2'));

    // Already on the last page
    pressKey('ArrowRight');
    expect(await screen.findByText('This is the last page!')).toBeInTheDocument();
    expect(activePage()).toBe('2');

    pressKey('ArrowLeft');
    await waitFor(() => expect(activePage()).toBe('1'));

    // Already on the first page
    pressKey('ArrowLeft');
    expect(await screen.findByText('This is the first page!')).toBeInTheDocument();
    expect(activePage()).toBe('1');

    await flushDebouncedUrl();
    expect(window.location.search).toContain('page=1');
  });

  it('does not navigate with the arrow keys while a filter input is focused', async () => {
    mockGetTableRows.mockResolvedValue({ content: manyRows });

    renderListPage();
    await screen.findByText(/Total 12 items/i);

    const filterInput = screen.getAllByRole('textbox')[0];
    filterInput.focus();

    pressKey('ArrowRight');

    expect(activePage()).toBe('1');
    expect(screen.queryByText('This is the last page!')).not.toBeInTheDocument();
  });

  it('ignores keys other than the arrow keys', async () => {
    mockGetTableRows.mockResolvedValue({ content: manyRows });

    renderListPage();
    await screen.findByText(/Total 12 items/i);

    pressKey('a');
    pressKey('Enter');

    expect(activePage()).toBe('1');
    expect(window.location.search).toBe('');
  });

  it('falls back to rendering the raw value for a column with an unknown type', async () => {
    mockGetTableRows.mockResolvedValue({ content: [row('123', 'David')] });

    renderListPage({
      cols: [
        {
          id: 'userId',
          name: 'User ID',
          type: 'SOME_NEW_TYPE',
          primary: true,
          referenceTable: 'users_ref',
        } as unknown as DbColumn,
      ],
      tables: [
        {
          name: 'users_ref',
          columns: [{ id: 'refId', name: 'Ref ID', type: STRING, primary: true }],
        },
      ],
    });

    // No renderer is registered for this type, so the raw value is shown, and
    // the ref-table icon is still added because the value is not empty
    expect(await screen.findByText('123')).toBeInTheDocument();
    expect(document.querySelectorAll('.anticon-right-square')).toHaveLength(1);
  });

  it('fetches the rows twice on mount', async () => {
    mockGetTableRows.mockResolvedValue({ content: [row('123', 'David')] });

    renderListPage();
    await screen.findByText('David');

    // KNOWN BEHAVIOUR, NOT A DESIRED ONE. The mount effect (index.tsx:106-120)
    // and the `props.tableName` effect (index.tsx:168-170) both run on mount, so
    // every mount issues the same request twice. Pinned here so that a fix (or a
    // regression on top of a fix) is noticed.
    expect(mockGetTableRows).toHaveBeenCalledTimes(2);
  });

  it('aborts the in-flight request when it unmounts', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    mockGetTableRows.mockResolvedValue({ content: [row('1', 'David')] });

    const { unmount } = renderListPage();
    await screen.findByText('David');

    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
