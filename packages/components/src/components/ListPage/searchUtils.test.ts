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
  describe('when searching with one part', () => {
    test.each([
      {
        filter: 'f',
        array: ['foo'],
        expected: true,
        description: 'part of the word',
      },
      {
        filter: 'foo',
        array: ['foo'],
        expected: true,
        description: 'full of the word',
      },
      {
        filter: '',
        array: ['foo'],
        expected: true,
        description: 'empty string',
      },
    ])(
      'should return $expected when searching with $description',
      ({ filter, array, expected }) => {
        expect(stringArrayFilter(filter, array)).toBe(expected);
      }
    );
  });

  describe('when search with 2 parts', () => {
    test.each([
      {
        filter: 'a b',
        array: ['a'],
        expected: true,
        description: 'matching a OR b',
      },
      {
        filter: 'a+b',
        array: ['a', 'b'],
        expected: true,
        description: 'matching a AND b, both present',
      },
      {
        filter: 'a+b',
        array: ['a'],
        expected: false,
        description: 'matching a AND b, only a present',
      },
      {
        filter: 'a+b',
        array: ['b'],
        expected: false,
        description: 'matching a AND b, only b present',
      },
    ])(
      'should return $expected when $description',
      ({ filter, array, expected }) => {
        expect(stringArrayFilter(filter, array)).toBe(expected);
      }
    );

    test.each([
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
        array: ['b'],
        expected: true,
        description: 'array does not contain a',
      },
    ])(
      'should return $expected when inverse exact match and $description',
      ({ filter, array, expected }) => {
        expect(stringArrayFilter(filter, array)).toBe(expected);
      }
    );
  });

  // describe('when considering edge cases', () => {
  //   test.each([
  //     {
  //       filter: 'a',
  //       array: [null, 'a'],
  //       expected: true,
  //       description: 'array contains null and matching string',
  //     },
  //     {
  //       filter: 'a',
  //       array: [undefined, 'a'],
  //       expected: true,
  //       description: 'array contains undefined and matching string',
  //     },
  //     {
  //       filter: 'a',
  //       array: [],
  //       expected: false,
  //       description: 'an empty array',
  //     },
  //     // Assuming the function should return false for non-string or empty inputs.
  //     {
  //       filter: null,
  //       array: ['a'],
  //       expected: false,
  //       description: 'filter is null',
  //     },
  //     {
  //       filter: undefined,
  //       array: ['a'],
  //       expected: false,
  //       description: 'filter is undefined',
  //     },
  //   ])(
  //     'should return $expected when $description',
  //     ({ filter, array, expected }) => {
  //       expect(stringArrayFilter(filter, array)).toBe(expected);
  //     }
  //   );
  // });
});

test('searchKeywordInText should return proper value', () => {
  expect(searchKeywordInText('oo', 'foo')).toBe(true);
  expect(searchKeywordInText('oo', '')).toBe(false);
});
