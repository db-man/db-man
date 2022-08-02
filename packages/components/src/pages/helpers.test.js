import { github, githubDb } from '@db-man/github';
import reloadDbsSchemaAsync from './helpers';

jest.mock('@db-man/github');

beforeEach(() => {
  github.getFile.mockReset();
  githubDb.getDbTablesSchemaAsync.mockReset();
});

describe('reloadDbsSchemaAsync', () => {
  it('should get localStorage', () => {
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    Object.getPrototypeOf(window.localStorage).getItem = jest.fn(() => 'dbs');
    Object.getPrototypeOf(window.localStorage).setItem = jest.fn();

    github.getFile.mockResolvedValue([]);
    githubDb.getDbTablesSchemaAsync.mockResolvedValue({});

    expect.assertions(2);

    return reloadDbsSchemaAsync().then(() => {
      expect(localStorage.getItem).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });
});
