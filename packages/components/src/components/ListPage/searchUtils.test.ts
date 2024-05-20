import {
  searchKeywordInText,
  stringArrayFilter,
  searchStringInArray,
  searchKeywordsInTagsWithLogicAnd,
  searchKeywordsInTagsWithLogicOr,
  searchExactStringNotInArray,
  searchKeywordInNumberText,
} from './searchUtils';

describe('searchKeywordInNumberText', () => {
  it('should return proper value', () => {
    expect(searchKeywordInNumberText('234', 123456)).toBe(true);
    expect(searchKeywordInNumberText('012', 123456)).toBe(false);
  });
});

describe('searchStringInArray', () => {
  it('should return proper value', () => {
    expect(searchStringInArray('', ['dog', 'red', 'short'])).toBe(true);
    expect(searchStringInArray('do', ['dog', 'red', 'short'])).toBe(true);
    expect(searchStringInArray('dog', ['dog', 'red', 'short'])).toBe(true);
    expect(searchStringInArray('dogs', ['dog', 'red', 'short'])).toBe(false);
  });
});

describe('searchExactStringNotInArray', () => {
  it('should return proper value for inverse exact match', () => {
    expect(searchExactStringNotInArray('dog', ['dog', 'cat', 'fish'])).toBe(
      false
    );
    expect(searchExactStringNotInArray('dog', ['cat', 'fish'])).toBe(true);
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
    it('should return proper value when inverse exact match', () => {
      expect(stringArrayFilter('!a', ['a'])).toBe(false);
      expect(stringArrayFilter('!a', ['a', 'b'])).toBe(false);
      expect(stringArrayFilter('!a', ['b'])).toBe(true);
    });
  });

  describe('when inverse exact match', () => {
    test.each([
      {
        filter: '!a',
        array: ['b'],
        expected: true,
        description: 'array does not contain a',
      },
      {
        filter: '!a',
        array: ['a'],
        expected: false,
        description: 'array contains a only',
      },
      {
        filter: '!a',
        array: ['a', 'b'],
        expected: false,
        description: 'array contains a among others',
      },
      {
        filter: '!a',
        array: ['c', 'd'],
        expected: true,
        description: 'array does not contain a with unrelated elements',
      },
      // Potentially add edge case tests here
    ])(
      'should return $expected when $description',
      ({ filter, array, expected }) => {
        expect(stringArrayFilter(filter, array)).toBe(expected);
      }
    );
  });
});

test('searchKeywordInText should return proper value', () => {
  expect(searchKeywordInText('oo', 'foo')).toBe(true);
  expect(searchKeywordInText('oo', '')).toBe(false);
});
