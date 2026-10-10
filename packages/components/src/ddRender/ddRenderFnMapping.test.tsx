// @ts-ignore Ignore handlebars type error
import Handlebars from 'handlebars/dist/handlebars';

import './ddRenderFnMapping';

const tables = [
  {
    name: 'imgs',
    columns: [{ id: 'imgId', name: 'Image ID', type: 'NUMBER', primary: true }],
  },
] as any;

const getTableRecordByKey = (hash: any) =>
  Handlebars.helpers.getTableRecordByKey({ hash });

describe('Handlebars compilation', () => {
  it('escapes query parameters in URLs using double-curly braces', () => {
    const tpl = Handlebars.compile(
      `{"href":"{{record.url}}","text":"{{record.url}}"}`,
    );
    const json = tpl({
      record: { url: 'https://foobar.com?barfoo=123' },
      extra: undefined,
    });
    expect(json).toEqual(
      '{"href":"https://foobar.com?barfoo&#x3D;123","text":"https://foobar.com?barfoo&#x3D;123"}',
    );
  });

  it('renders raw, unescaped URLs using triple-curly braces', () => {
    // Using triple curlies {{{...}}} bypasses Handlebars' HTML escaping mechanism,
    // preserving the raw string input as-is (keeping '=' and other special characters intact).
    // Otherwise it will render into `https://foobar.com?barfoo&#x3D;123` instead of `https://foobar.com?barfoo=123`
    const tpl = Handlebars.compile(
      `{"href":"{{{record.url}}}","text":"{{{record.url}}}"}`,
    );
    const json = tpl({
      record: { url: 'https://foobar.com?barfoo=123' },
      extra: undefined,
    });
    expect(json).toEqual(
      '{"href":"https://foobar.com?barfoo=123","text":"https://foobar.com?barfoo=123"}',
    );
  });
});

describe('getTableRecordByKey', () => {
  const rows = [
    { imgId: 1, tags: ['a'] },
    { imgId: 2, tags: ['b'] },
  ];

  it('finds a record whose primary key is a number when the template passes a string', () => {
    // A template reached from a URL passes the key as a string, e.g.
    // `primaryKeyVal=this` while iterating `record.photoUrls`.
    expect(
      getTableRecordByKey({
        tables,
        tableName: 'imgs',
        primaryKeyVal: '2',
        rows,
      }),
    ).toMatchObject({ imgId: 2, tags: ['b'] });
  });

  it('finds a record whose primary key is a string when the template passes a number', () => {
    expect(
      getTableRecordByKey({
        tables,
        tableName: 'imgs',
        primaryKeyVal: 2,
        rows: [{ imgId: '2', tags: ['b'] }],
      }),
    ).toMatchObject({ imgId: '2' });
  });

  it('returns undefined when no record matches', () => {
    expect(
      getTableRecordByKey({
        tables,
        tableName: 'imgs',
        primaryKeyVal: '9',
        rows,
      }),
    ).toBeUndefined();
  });

  it('does not pick a row which has no primary key when the template passes none', () => {
    expect(
      getTableRecordByKey({
        tables,
        tableName: 'imgs',
        primaryKeyVal: undefined,
        rows: [{ tags: ['a'] }],
      }),
    ).toBeUndefined();
  });

  it('returns null when the template passes no rows', () => {
    expect(
      getTableRecordByKey({
        tables,
        tableName: 'imgs',
        primaryKeyVal: '1',
        rows: undefined,
      }),
    ).toBeNull();
  });
});
