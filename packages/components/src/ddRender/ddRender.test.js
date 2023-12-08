import Handlebars from 'handlebars/dist/handlebars';
import { getRender, getColumnRender } from './ddRender';

describe('getColumnRender', () => {
  test('should return proper value', () => {
    const view = getColumnRender('type:listPage', {
      id: 'url',
      'type:listPage': 'ImageLink',
    });
    expect(
      view('https://a.com/b.jpg', { url: 'https://a.com/b.jpg' }, 1)
    ).toMatchSnapshot();
  });

  test('should return proper value2', () => {
    const view = getColumnRender('type:listPage', {
      id: 'yrl',
      'type:listPage': [
        'ImageLink',
        '{"url":"{{record.url}}","imgSrc":"{{record.url}}"}',
      ],
    });
    expect(
      view('https://a.com/large/b.jpg', { url: 'https://a.com/large/b.jpg' })
    ).toMatchSnapshot();
  });

  describe('given Link', () => {
    it('should match snapshot', () => {
      expect(
        getColumnRender('type:listPage', {
          'type:listPage': [
            'Link',
            '{"href":"{{record.url}}","text":"{{record.url}}"}',
          ],
        })('https://foo.com', { url: 'https://foo.com' })
      ).toMatchSnapshot();
    });
  });

  describe('given ImageLink', () => {
    it('should match snapshot', () => {
      expect(
        getColumnRender('type:listPage', {
          'type:listPage': [
            'ImageLink',
            '{"url":"{{record.photos.[0]}}","imgSrc":"{{record.photos.[0]}}"}',
          ],
        })('https://foo.com/a.jpg', {
          id: 'foo',
          photos: ['https://foo.com/a.jpg'],
        })
      ).toMatchSnapshot();
    });
    it('should match snapshot when photos is undefined', () => {
      expect(
        getColumnRender('type:listPage', {
          'type:listPage': [
            'ImageLink',
            '{"url":"{{record.photos.[0]}}","imgSrc":"record.photos.[0]"}',
          ],
        })('', { id: 'foo' })
      ).toMatchSnapshot();
    });
  });

  describe('given hidden column in a list page', () => {
    it('should return default render func', () => {
      const view = getColumnRender('type:listPage', {
        'type:listPage': 'HIDE',
      });
      expect(view('foo')).toBe('foo');
    });
  });

  describe('default render function', () => {
    it('type is STRING', () => {
      const view = getColumnRender('type:getPage', {
        id: 'name',
        name: 'Name',
        type: 'STRING',
      });
      expect(view('David', { name: 'David' })).toBe('David');
      expect(view(undefined, { name: undefined })).toBe('NO_VALUE');
    });
    it('type is STRING_ARRAY', () => {
      const view = getColumnRender('type:getPage', {
        id: 'tags',
        name: 'Tags',
        type: 'STRING_ARRAY',
      });
      expect(view(['dog', 'cat'], { tags: ['dog', 'cat'] })).toBe('dog, cat');
      expect(view(undefined, { tags: undefined })).toBe('NO_VALUE');
    });
    it('type is NUMBER', () => {
      const view = getColumnRender('type:getPage', {
        id: 'age',
        name: 'Age',
        type: 'NUMBER',
      });
      expect(view(12, { age: 12 })).toBe('12');
      expect(view(undefined, { age: undefined })).toBe('NO_VALUE');
    });
    it('type is BOOL', () => {
      const view = getColumnRender('type:getPage', {
        id: 'active',
        name: 'Active',
        type: 'BOOL',
      });
      expect(view(true, { active: true })).toBe('true');
      expect(view(undefined, { active: undefined })).toBe('NO_VALUE');
    });
  });
});

describe('getRender', () => {
  describe('given simple arg', () => {
    it('should render properly', () => {
      const args = 'Link';
      const record = { url: 'https://foo.com' };
      expect(getRender(args)(record.url, record)).toMatchSnapshot();
    });
  });
  describe('given tpl', () => {
    it('should render properly', () => {
      const args = [
        'Link',
        '{"href":"{{record.url}}","text":"{{record.url}}"}',
      ];
      const record = { url: 'https://foo.com' };
      expect(getRender(args)(record.url, record)).toMatchSnapshot();
    });
  });
  describe('TextAreaFormFieldValue', () => {
    it('should match snapshot', () => {
      const args = [
        'TextAreaFormFieldValue',
        '{"label":"{{extra.column.name}}","rows":2,"value":"{{record.note}}"}',
      ];
      const column = { id: 'note', name: 'Note' };
      const record = { note: 'This is TODO' };
      expect(
        getRender(args, { column })(record.note, record)
      ).toMatchSnapshot();
    });
  });
});

describe('handlebars helper getTableRecordByKey', () => {
  it('should return proper value', () => {
    const tables = [
      { name: 'users', columns: [{ id: 'userId', primary: true }] },
      { name: 'imgs', columns: [{ id: 'url', primary: true }] },
    ];
    const imgsTableRows = [
      { url: 'https://foo.jpg', tags: ['foo', 'bar'] },
      { url: 'https://bar.jpg', tags: ['foo2', 'bar2'] },
    ];
    const userRecord = {
      userId: '123',
      photos: ['https://foo.jpg', 'https://bar.jpg'],
    };
    // loop each photos of one user from `users` table
    // for each photo link, try to search in `imgs` table
    // when found, get the tags of record from `imgs` table
    const tpl = Handlebars.compile(`[
{{#each userRecord.photos}}
{{#if @index}},{{/if}}
{
  "url":"{{this}}",
  "imgSrc":"{{this}}_th.jpg",
  "description":"{{#with (
    getTableRecordByKey
    tables=../extra.tables
    tableName="imgs"
    primaryKeyVal=this
    rows=../extra.rows
  )}}{{join tags ", "}}{{/with}}"
}
{{/each}}
]`);
    const json = tpl({
      userRecord,
      extra: {
        tables,
        rows: imgsTableRows,
      },
    });
    const result = JSON.parse(json);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://foo.jpg');
    expect(result[0].description).toBe('foo, bar');
  });
});
