import Handlebars from 'handlebars/dist/handlebars';
import { getRender, getColumnRender } from './ddRender';
describe('getColumnRender', () => {
  test('should return proper value', () => {
    const view = getColumnRender({
      id: 'url',
      'type:listPage': 'ImageLink'
    });
    expect(view('https://a.com/b.jpg', {
      url: 'https://a.com/b.jpg'
    }, 1)).toMatchSnapshot();
  });
  test('should return proper value2', () => {
    const view = getColumnRender({
      id: 'yrl',
      'type:listPage': ['ImageLink', '{"url":"{{record.url}}","imgSrc":"{{record.url}}"}']
    });
    expect(view('https://a.com/large/b.jpg', {
      url: 'https://a.com/large/b.jpg'
    })).toMatchSnapshot();
  });
  describe('given Link', () => {
    it('should match snapshot', () => {
      expect(getColumnRender({
        'type:listPage': ['Link', '{"href":"{{record.url}}","text":"{{record.url}}"}']
      })('https://foo.com', {
        url: 'https://foo.com'
      })).toMatchSnapshot();
    });
  });
  describe('given hidden column in a list page', () => {
    it('should return default render func', () => {
      const colFunc = getColumnRender({
        'type:listPage': 'HIDE'
      });
      expect(colFunc('foo')).toBe('foo');
    });
  });
});
describe('getRender', () => {
  describe('given simple arg', () => {
    it('should render properly', () => {
      const args = 'Link';
      const record = {
        url: 'https://foo.com'
      };
      expect(getRender(args)(record.url, record)).toMatchSnapshot();
    });
  });
  describe('given tpl', () => {
    it('should render properly', () => {
      const args = ['Link', '{"href":"{{record.url}}","text":"{{record.url}}"}'];
      const record = {
        url: 'https://foo.com'
      };
      expect(getRender(args)(record.url, record)).toMatchSnapshot();
    });
  });
  describe('TextAreaFormFieldValue', () => {
    it('should match snapshot', () => {
      const args = ['TextAreaFormFieldValue', '{"label":"{{extra.column.name}}","rows":2,"value":"{{record.note}}"}'];
      const column = {
        id: 'note',
        name: 'Note'
      };
      const record = {
        note: 'This is TODO'
      };
      expect(getRender(args, {
        column
      })(record.note, record)).toMatchSnapshot();
    });
  });
});
describe('handlebars helper getTableRecordByKey', () => {
  it('should return proper value', () => {
    const tables = [{
      name: 'rates',
      columns: [{
        id: 'url',
        primary: true
      }]
    }, {
      name: 'details',
      columns: [{
        id: 'itemId',
        primary: true
      }]
    }];
    const ratesTableRows = [{
      url: 'https://foo.jpg',
      tags: ['foo', 'bar']
    }, {
      url: 'https://bar.jpg',
      tags: ['foo2', 'bar2']
    }];
    const record = {
      itemId: '123',
      samples: ['https://foo.jpg', 'https://bar.jpg']
    };
    const tpl = Handlebars.compile(`[
{{#each record.samples}}
{{#if @index}},{{/if}}
{
  "url":"{{this}}",
  "imgSrc":"{{this}}_th.jpg",
  "description":"{{#with (
    getTableRecordByKey
    tables=../extra.tables
    tableName="rates"
    primaryKeyVal=this
    rows=../extra.rows
  )}}{{join tags ", "}}{{/with}}"
}
{{/each}}
]`);
    const json = tpl({
      record,
      extra: {
        tables,
        rows: ratesTableRows
      }
    });
    const result = JSON.parse(json);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://foo.jpg');
    expect(result[0].description).toBe('foo, bar');
  });
});