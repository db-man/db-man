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
