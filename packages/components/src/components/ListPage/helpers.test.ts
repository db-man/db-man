import { STRING, STRING_ARRAY } from '../../constants';
import DbColumn from '../../types/DbColumn';
import {
  getFilteredData,
  getSortedData,
  isAllFilterInvalid,
  searchKeywordInText,
  stringArrayFilter,
  searchStringInArray,
  searchKeywordInTags,
  searchKeywordsInTagsWithLogicAnd,
  searchKeywordsInTagsWithLogicOr,
} from './helpers';

describe('searchKeywordInTags', () => {
  it('should return proper value', () => {
    expect(searchKeywordInTags('', ['dog', 'red', 'short'])).toBe(true);
    expect(searchKeywordInTags('do', ['dog', 'red', 'short'])).toBe(true);
    expect(searchKeywordInTags('dog', ['dog', 'red', 'short'])).toBe(true);
    expect(searchKeywordInTags('dogs', ['dog', 'red', 'short'])).toBe(false);
  });
});

describe('searchStringInArray', () => {
  it('should return proper value', () => {
    expect(searchStringInArray('do', ['dog', 'red', 'short'])).toBe(true);
    expect(searchStringInArray('dog', ['dog', 'red', 'short'])).toBe(true);
  });
});

describe('searchKeywordsInTagsWithLogicAnd', () => {
  it('should return proper value', () => {
    expect(
      searchKeywordsInTagsWithLogicAnd(['ap', 'ba'], ['apple', 'banana'])
    ).toBe(true);
    expect(
      searchKeywordsInTagsWithLogicAnd(['ap', 'ba'], ['apple', 'pair'])
    ).toBe(false);
  });
});

describe('searchKeywordsInTagsWithLogicOr', () => {
  it('should return proper value', () => {
    expect(searchKeywordsInTagsWithLogicOr(['ap', 'ba'], ['apple'])).toBe(true);
    expect(
      searchKeywordsInTagsWithLogicOr(['ap', 'ba'], ['banana', 'pair'])
    ).toBe(true);
    expect(searchKeywordsInTagsWithLogicOr(['ap', 'ba'], ['pair'])).toBe(false);
  });
});

describe('stringArrayFilter', () => {
  describe('when search with one part', () => {
    it('should return true when searching with part of the word', () => {
      expect(stringArrayFilter('f', ['foo'])).toBe(true);
    });
    it('should return true when searching with full of the word', () => {
      expect(stringArrayFilter('foo', ['foo'])).toBe(true);
    });
    it('should return true when searching with empty string', () => {
      expect(stringArrayFilter('', ['foo'])).toBe(true);
    });
  });

  describe('when search with 2 parts', () => {
    it('should return true when matching a OR b', () => {
      expect(stringArrayFilter('a b', ['a'])).toBe(true);
    });
    it('should return true when matching a AND b', () => {
      expect(stringArrayFilter('a+b', ['a', 'b'])).toBe(true);
      expect(stringArrayFilter('a+b', ['a'])).toBe(false);
      expect(stringArrayFilter('a+b', ['b'])).toBe(false);
    });
  });
});

describe('getFilteredData', () => {
  const originalRows = [
    { id: 'foo1', tags: ['bar', 'bar1'] },
    { id: 'foo2', tags: ['bar2', 'bar'] },
    { id: 'foo3', tags: ['bar2', 'bar1'] },
  ];
  const filterCols: DbColumn[] = [
    { id: 'name', name: 'Name', type: STRING },
    { id: 'tags', name: 'Tags', type: STRING_ARRAY },
  ];
  it('should reture 3 rows when fitler by bar1 OR bar2', () => {
    expect(
      getFilteredData(filterCols, { tags: 'bar1 bar2' }, originalRows)
    ).toEqual([
      { id: 'foo1', tags: ['bar', 'bar1'] },
      { id: 'foo2', tags: ['bar2', 'bar'] },
      { id: 'foo3', tags: ['bar2', 'bar1'] },
    ]);
  });
  it('should reture 1 row when fitler by bar1 AND bar2', () => {
    expect(
      getFilteredData(filterCols, { tags: 'bar1+bar2' }, originalRows)
    ).toEqual([{ id: 'foo3', tags: ['bar2', 'bar1'] }]);
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
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
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
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
        },
      ],
      { name: 'foo', tags: '' },
      [{ name: 'foo' }]
    )
  ).toEqual([{ name: 'foo' }]);
  expect(
    getFilteredData(
      [
        { id: 'name', name: 'Name', type: STRING },
        { id: 'tags', name: 'Tags', type: STRING_ARRAY },
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
        },
        {
          id: 'tags',
          name: 'Tags',
          type: 'STRING_ARRAY',
        },
      ],
      { name: 'foo', tags: 'bar' },
      [{ name: 'foo', tags: ['bar'] }]
    )
  ).toEqual([{ name: 'foo', tags: ['bar'] }]);
});

test('isAllFilterInvalid should return proper value', () => {
  expect(isAllFilterInvalid({}, ['foo'])).toBe(true);
  expect(isAllFilterInvalid({ foo: '' }, ['foo'])).toBe(true);
  expect(isAllFilterInvalid({ foo: '1' }, ['foo'])).toBe(false);
});

test('searchKeywordInText should return proper value', () => {
  expect(searchKeywordInText('oo', 'foo')).toBe(true);
  expect(searchKeywordInText('oo', '')).toBe(false);
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
