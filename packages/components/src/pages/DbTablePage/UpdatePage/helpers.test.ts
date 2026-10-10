import { utils as githubUtils } from '@db-man/github';

import { getNewRows } from './helpers';

jest.mock('@db-man/github', () => ({
  utils: {
    formatDate: jest.fn(() => '2021-07-04 09:16:01'),
  },
}));

test('getNewRows should return proper value', () => {
  const formValues = { itemId: 'foo', name: 'Foo (Changed)' };
  const oldRows = [
    { itemId: 'foo', name: 'Foo' },
    { itemId: 'bar', name: 'Bar' },
  ];
  const primaryKey = 'itemId';
  const currentId = 'foo';
  const newRows = getNewRows(formValues, oldRows, primaryKey, currentId);
  expect(newRows[0]).toHaveProperty('itemId', 'foo');
  expect(newRows[0]).toHaveProperty('name', 'Foo (Changed)');
});

test('getNewRows should replace the row whose primary key is a number', () => {
  // The row read from the data file holds the number 1, while the URL query
  // holds the string '1'. Before, `row[primaryKey] !== currentId` was always
  // true, so the row was returned unchanged and the edit was lost silently.
  const formValues = { itemId: '1', name: 'Foo (Changed)' };
  const oldRows = [
    { itemId: 1, name: 'Foo' },
    { itemId: 2, name: 'Bar' },
  ];
  const primaryKey = 'itemId';
  const currentId = '1';

  const newRows = getNewRows(formValues, oldRows, primaryKey, currentId);

  expect(newRows).toHaveLength(2);
  expect(newRows[0]).toMatchObject({ itemId: '1', name: 'Foo (Changed)' });
  expect(newRows[1]).toEqual({ itemId: 2, name: 'Bar' });
});

test('getNewRows should leave every row alone when the id is not in the table', () => {
  const oldRows = [{ itemId: 1, name: 'Foo' }];

  const newRows = getNewRows(
    { itemId: '9', name: 'Nope' },
    oldRows,
    'itemId',
    '9',
  );

  expect(newRows).toEqual([{ itemId: 1, name: 'Foo' }]);
});
