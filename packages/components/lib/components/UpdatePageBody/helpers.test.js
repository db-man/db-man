import { getNewRows } from './helpers';
test('getNewRows should return proper value', () => {
  const formValues = {
    itemId: 'foo',
    name: 'Foo (Changed)'
  };
  const oldRows = [{
    itemId: 'foo',
    name: 'Foo'
  }, {
    itemId: 'bar',
    name: 'Bar'
  }];
  const primaryKey = 'itemId';
  const currentId = 'foo';
  const newRows = getNewRows(formValues, oldRows, primaryKey, currentId);
  expect(newRows[0]).toHaveProperty('itemId', 'foo');
  expect(newRows[0]).toHaveProperty('name', 'Foo (Changed)');
});