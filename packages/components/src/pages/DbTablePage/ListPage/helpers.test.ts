import DbColumn from '../../../types/DbColumn';
import { STRING, STRING_ARRAY } from '../../../constants';
import { getFilteredData, getSortedData } from './helpers';

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
});
