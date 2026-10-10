import { getUrlParams, isSamePrimaryKey } from './utils';

describe('isSamePrimaryKey', () => {
  it('matches two equal strings', () => {
    expect(isSamePrimaryKey('foo', 'foo')).toBe(true);
  });

  it('matches two equal numbers', () => {
    expect(isSamePrimaryKey(1, 1)).toBe(true);
  });

  it('matches a number from a data file against the string from the URL', () => {
    // A NUMBER primary key column holds the JSON number 1 in the data file,
    // while the URL query holds the string '1'. `1 === '1'` is false.
    expect(isSamePrimaryKey(1, '1')).toBe(true);
    expect(isSamePrimaryKey('1', 1)).toBe(true);
  });

  it('matches the string form of a number as the app writes it into a URL', () => {
    // ListPage builds the link from the value read out of the data file, so the
    // URL holds `String(value)` and not the digits a human would type.
    expect(isSamePrimaryKey(1e22, '1e+22')).toBe(true);
  });

  it('does not match two different values', () => {
    expect(isSamePrimaryKey(1, 2)).toBe(false);
    expect(isSamePrimaryKey('foo', 'bar')).toBe(false);
    expect(isSamePrimaryKey(1, '1a')).toBe(false);
  });

  it('treats null and undefined as absent, matching nothing', () => {
    expect(isSamePrimaryKey(null, null)).toBe(false);
    expect(isSamePrimaryKey(undefined, undefined)).toBe(false);
    expect(isSamePrimaryKey(null, undefined)).toBe(false);
    expect(isSamePrimaryKey(undefined, '1')).toBe(false);
    expect(isSamePrimaryKey('1', undefined)).toBe(false);
    expect(isSamePrimaryKey(null, 1)).toBe(false);
  });

  it('does not treat the empty string as absent', () => {
    expect(isSamePrimaryKey('', '')).toBe(true);
  });
});

describe('getUrlParams', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('returns an empty object when there is no query string', () => {
    expect(getUrlParams()).toEqual({});
  });

  it('decodes the query string into an object', () => {
    window.history.replaceState({}, '', `/iam/users/update?userId=1&name=${encodeURIComponent('张 三')}`);

    expect(getUrlParams()).toEqual({ userId: '1', name: '张 三' });
  });
});
