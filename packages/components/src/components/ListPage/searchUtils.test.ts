import {
  searchKeywordInText,
  searchKeywordInArray,
  searchStringInArray,
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

describe('searchKeywordInArray', () => {
  describe('Basic matching', () => {
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
        description: 'whole word',
      },
      {
        filter: '',
        array: ['foo'],
        expected: true,
        description: 'empty search string',
      },
    ])(
      '$description: filter="$filter" array=$array',
      ({ filter, array, expected }) => {
        expect(searchKeywordInArray(filter, array)).toBe(expected);
      }
    );
  });

  describe('Logical "OR" and "AND"', () => {
    describe('"OR" Matching', () => {
      test('should return true when matching any part of "a b"', () => {
        expect(searchKeywordInArray('a b', ['a'])).toBe(true);
      });
    });

    describe('"AND" Matching', () => {
      test.each([
        ['a+b', ['a', 'b'], true, 'both present'],
        ['a+b', ['a'], false, 'only a present'],
        ['a+b', ['b'], false, 'only b present'],
      ])(
        'should return %s when "%s" and array is %s',
        (filter, array, expected, description) => {
          expect(searchKeywordInArray(filter, array)).toBe(expected);
        }
      );
    });
  });

  describe('Inverse exact match', () => {
    test.each([
      {
        filter: '!a',
        array: ['b'],
        expected: true,
        description: 'does not contain a',
      },
      {
        filter: '!a',
        array: ['a'],
        expected: false,
        description: 'contains a only',
      },
      {
        filter: '!a',
        array: ['a', 'b'],
        expected: false,
        description: 'contains a among others',
      },
      {
        filter: '!a',
        array: ['c', 'd'],
        expected: true,
        description: 'does not contain a with unrelated elements',
      },
    ])(
      'should return $expected when $description',
      ({ filter, array, expected }) => {
        expect(searchKeywordInArray(filter, array)).toBe(expected);
      }
    );
  });
});

test('searchKeywordInText should return proper value', () => {
  expect(searchKeywordInText('oo', 'foo')).toBe(true);
  expect(searchKeywordInText('oo', '')).toBe(false);
});
