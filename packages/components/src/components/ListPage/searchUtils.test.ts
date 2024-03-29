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
  });
});

test('searchKeywordInText should return proper value', () => {
  expect(searchKeywordInText('oo', 'foo')).toBe(true);
  expect(searchKeywordInText('oo', '')).toBe(false);
});
