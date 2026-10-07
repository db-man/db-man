import DbColumn from '../../../types/DbColumn';
import { STRING, STRING_ARRAY } from '../../../constants';
import {
  filterCols,
  findDuplicates,
  getColumnSortOrder,
  getFilteredData,
  getFilteredSortedData,
  getInitialFilter,
  getInitialSorterFromUrl,
  getSortedData,
  updateUrl,
} from './helpers';

/** The sorter object antd hands to the table helpers. */
type Sorter = { columnKey: string; order: string };

const resetUrl = () => window.history.pushState({}, '', '/');

describe('getFilteredData', () => {
  const originalRows = [
    {
      id: 'foo1',
      tags: ['bar', 'bar1'],
      createdAt: '2024-01-08 22:45:52',
      updatedAt: '2024-01-08 22:45:52',
    },
    {
      id: 'foo2',
      tags: ['bar2', 'bar'],
      createdAt: '2024-02-08 22:45:52',
      updatedAt: '2024-02-08 22:45:52',
    },
    {
      id: 'foo3',
      tags: ['bar2', 'bar1'],
      createdAt: '2024-04-08 22:45:52',
      updatedAt: '2024-04-08 22:45:52',
    },
  ];
  const cols: DbColumn[] = [
    { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
    {
      id: 'tags',
      name: 'Tags',
      type: STRING_ARRAY,
      'ui:listPage:isFilter': true,
    },
  ];
  it('should reture 3 rows when fitler by bar1 OR bar2', () => {
    expect(getFilteredData(cols, { tags: 'bar1 bar2' }, originalRows)).toEqual([
      ...originalRows,
    ]);
  });
  it('should reture 1 row when fitler by bar1 AND bar2', () => {
    expect(getFilteredData(cols, { tags: 'bar1+bar2' }, originalRows)).toEqual([
      originalRows[2],
    ]);
  });
  test('getFilteredData should return proper value when filtering by createdAt', () => {
    expect(
      getFilteredData(cols, { createdAt: '2024-01-08' }, originalRows)
    ).toEqual([originalRows[0]]);
    expect(
      getFilteredData(cols, { createdAt: '2024-02' }, originalRows)
    ).toEqual([originalRows[1]]);
    expect(getFilteredData(cols, { createdAt: '2024' }, originalRows)).toEqual([
      ...originalRows,
    ]);
  });
});

test('getFilteredData should return proper value', () => {
  expect(
    getFilteredData(
      [
        {
          id: 'name',
          name: 'Name',
          type: STRING,
        },
        { id: 'tags', name: 'Tags', type: STRING_ARRAY },
      ],
      { name: '', tags: '' },
      []
    )
  ).toEqual([]);
  expect(
    getFilteredData(
      [
        {
          id: 'name',
          name: 'Name',
          type: 'STRING',
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
        },
      ],
      { name: 'foo', tags: '' },
      []
    )
  ).toEqual([]);

  expect(
    getFilteredData(
      [
        {
          id: 'name',
          name: 'Name',
          type: 'STRING',
          'ui:listPage:isFilter': true,
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
          'ui:listPage:isFilter': true,
        },
      ],
      { name: 'foo', tags: '' },
      [{ name: 'bar' }]
    )
  ).toEqual([]);

  expect(
    getFilteredData(
      [
        {
          id: 'name',
          name: 'Name',
          type: 'STRING',
          'ui:listPage:isFilter': true,
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
          'ui:listPage:isFilter': true,
        },
      ],
      { name: 'foo', tags: '' },
      [{ name: 'foo' }]
    )
  ).toEqual([{ name: 'foo' }]);
  expect(
    getFilteredData(
      [
        {
          id: 'name',
          name: 'Name',
          type: STRING,
          'ui:listPage:isFilter': true,
        },
        {
          id: 'tags',
          name: 'Tags',
          type: STRING_ARRAY,
          'ui:listPage:isFilter': true,
        },
      ],
      { name: 'foo', tags: 'bar' },
      [{ name: 'foo' }]
    )
  ).toEqual([]);
  expect(
    getFilteredData(
      [
        {
          id: 'name',
          name: 'Name',
          type: 'STRING',
          'ui:listPage:isFilter': true,
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
          'ui:listPage:isFilter': true,
        },
      ],
      { name: 'foo', tags: 'bar' },
      [{ name: 'foo', tags: ['bar'] }]
    )
  ).toEqual([{ name: 'foo', tags: ['bar'] }]);
});

describe('getSortedData', () => {
  it('should return proper value', () => {
    expect(
      getSortedData([{ id: 1 }, { id: 3 }, { id: 2 }], {
        columnKey: 'id',
        order: 'ascend',
      })
    ).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it('should not put empty date at first', () => {
    expect(
      getSortedData([{ date: '2021' }, { date: '2022' }, {}], {
        columnKey: 'date',
        order: 'descend',
      })
    ).toEqual([{ date: '2022' }, { date: '2021' }, {}]);
  });

  it('should not mutate the array it was given', () => {
    const data = [{ id: '2' }, { id: '1' }];

    getSortedData(data, { columnKey: 'id', order: 'ascend' });

    expect(data).toEqual([{ id: '2' }, { id: '1' }]);
  });
});

describe('filterCols', () => {
  it('should keep only the columns marked as filterable', () => {
    const columns: DbColumn[] = [
      { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
      { id: 'notes', name: 'Notes', type: STRING },
    ];

    expect(filterCols(columns).map((col) => col.id)).toEqual(['name']);
  });
});

describe('getFilteredData short circuit', () => {
  const cols: DbColumn[] = [
    { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
  ];

  it('should return the very same array when no filter value is set', () => {
    const rows = [{ name: 'foo' }];

    expect(getFilteredData(cols, {}, rows)).toBe(rows);
  });

  it('should not mutate the columns it was given', () => {
    // createdAt and updatedAt are appended to the filterable columns internally.
    const columns: DbColumn[] = [
      { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
    ];

    getFilteredData(columns, {}, []);

    expect(columns).toHaveLength(1);
  });
});

describe('getFilteredSortedData', () => {
  const cols: DbColumn[] = [
    { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
  ];
  const rows = [{ name: 'foo2' }, { name: 'foo1' }];

  it('should only filter when no column is sorted', () => {
    expect(getFilteredSortedData(cols, {}, {} as Sorter, rows)).toEqual(rows);
  });

  it('should sort the rows which survived the filter', () => {
    expect(
      getFilteredSortedData(
        cols,
        {},
        { columnKey: 'name', order: 'ascend' },
        rows
      )
    ).toEqual([{ name: 'foo1' }, { name: 'foo2' }]);
  });

  it('should treat null rows as an empty table', () => {
    expect(
      getFilteredSortedData(
        cols,
        {},
        { columnKey: 'name', order: 'ascend' },
        null
      )
    ).toEqual([]);
  });
});

describe('getColumnSortOrder', () => {
  it('should return the order of the sorted column', () => {
    expect(
      getColumnSortOrder('name', { columnKey: 'name', order: 'ascend' })
    ).toBe('ascend');
  });

  it('should return null for a column which is not the sorted one', () => {
    expect(
      getColumnSortOrder('tags', { columnKey: 'name', order: 'ascend' })
    ).toBeNull();
  });

  it('should return null when nothing is sorted', () => {
    expect(getColumnSortOrder('name', { columnKey: 'name' } as Sorter)).toBeNull();
  });
});

describe('findDuplicates', () => {
  it('should return one entry per extra occurrence', () => {
    expect(findDuplicates(['a', 'b', 'a', 'a', 'c'])).toEqual(['a', 'a']);
  });

  it('should return an empty array when every value is unique', () => {
    expect(findDuplicates(['a', 'b', 'c'])).toEqual([]);
    expect(findDuplicates([])).toEqual([]);
  });

  it('should not mutate the array it was given', () => {
    const arr = ['b', 'a', 'b'];

    findDuplicates(arr);

    expect(arr).toEqual(['b', 'a', 'b']);
  });
});

describe('updateUrl', () => {
  afterEach(resetUrl);

  it('should write plain string states into the query string', () => {
    updateUrl({ filter: 'foo', page: '2' });

    const params = new URLSearchParams(window.location.search);
    expect(params.get('filter')).toBe('foo');
    expect(params.get('page')).toBe('2');
  });

  it('should JSON encode object states', () => {
    // `updateUrl` guards on `typeof state === 'object'` at runtime, which the
    // declared string value type does not allow, so the callers cast.
    const states = { filter: { name: 'foo' } } as unknown as {
      [key: string]: string;
    };

    updateUrl(states);

    expect(new URLSearchParams(window.location.search).get('filter')).toBe(
      '{"name":"foo"}'
    );
  });
});

describe('getInitialFilter', () => {
  const cols: DbColumn[] = [
    { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
    {
      id: 'tags',
      name: 'Tags',
      type: STRING_ARRAY,
      'ui:listPage:isFilter': true,
    },
  ];

  afterEach(resetUrl);

  it('should init every column with an empty value', () => {
    expect(getInitialFilter(cols)).toEqual({ name: '', tags: '' });
  });

  it('should read the filter from the URL', () => {
    window.history.pushState(
      {},
      '',
      `/?filter=${encodeURIComponent('{"name":"foo"}')}`
    );

    expect(getInitialFilter(cols)).toEqual({ name: 'foo' });
  });

  it('should ignore a filter param which is not a JSON object', () => {
    window.history.pushState({}, '', '/?filter=foo');

    expect(getInitialFilter(cols)).toEqual({ name: '', tags: '' });
  });

  it('should fall back to the empty filter when the param is broken JSON', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    window.history.pushState(
      {},
      '',
      `/?filter=${encodeURIComponent('{"name":')}`
    );

    expect(getInitialFilter(cols)).toEqual({ name: '', tags: '' });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});

describe('getInitialSorterFromUrl', () => {
  afterEach(resetUrl);

  it('should return undefined when the URL carries no sorter', () => {
    expect(getInitialSorterFromUrl()).toBeUndefined();
  });

  it('should read the sorter from the URL', () => {
    const sorter = { columnKey: 'name', order: 'descend' };
    window.history.pushState(
      {},
      '',
      `/?sorter=${encodeURIComponent(JSON.stringify(sorter))}`
    );

    expect(getInitialSorterFromUrl()).toEqual(sorter);
  });

  it('should ignore a sorter param which is not a JSON object', () => {
    window.history.pushState({}, '', '/?sorter=name');

    expect(getInitialSorterFromUrl()).toBeUndefined();
  });

  it('should return undefined when the param is broken JSON', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    window.history.pushState(
      {},
      '',
      `/?sorter=${encodeURIComponent('{"columnKey":')}`
    );

    expect(getInitialSorterFromUrl()).toBeUndefined();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
