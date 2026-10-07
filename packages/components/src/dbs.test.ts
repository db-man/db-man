import { LS_KEY_DBS_SCHEMA, STRING } from './constants';
import {
  getColumns,
  getPrimaryKey,
  getTablePrimaryKey,
  getTablesByDbName,
} from './dbs';
import DbColumn from './types/DbColumn';

const userColumns: DbColumn[] = [
  { id: 'userId', name: 'User ID', type: STRING, primary: true },
  { id: 'name', name: 'Name', type: STRING },
];

const dbsSchema = {
  iam: {
    name: 'iam',
    description: 'iam desc',
    tables: [
      { name: 'users', columns: userColumns },
      { name: 'roles', columns: [{ id: 'code', name: 'Code', type: STRING }] },
    ],
  },
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(LS_KEY_DBS_SCHEMA, JSON.stringify(dbsSchema));
});

describe('getTablesByDbName', () => {
  it('should return the tables of the given database', () => {
    expect(getTablesByDbName('iam').map((t: { name: string }) => t.name)).toEqual(
      ['users', 'roles']
    );
  });

  it('should return an empty array when no schema is stored', () => {
    localStorage.removeItem(LS_KEY_DBS_SCHEMA);

    expect(getTablesByDbName('iam')).toEqual([]);
  });

  it('should return an empty array when the database has no tables', () => {
    localStorage.setItem(
      LS_KEY_DBS_SCHEMA,
      JSON.stringify({ iam: { name: 'iam', description: 'iam desc' } })
    );

    expect(getTablesByDbName('iam')).toEqual([]);
  });

  it('should throw when the database is not in the schema', () => {
    // Known bug: the guard only covers "no schema at all", not "schema has no
    // such database", so `dbs2[dbName].tables` blows up. Callers are protected
    // only because `Database.tsx` short circuits to NotFound first.
    expect(() => getTablesByDbName('nope')).toThrow(TypeError);
  });
});

describe('getColumns', () => {
  it('should return the columns of the given table', () => {
    expect(getColumns({ dbName: 'iam', tableName: 'users' })).toEqual(
      userColumns
    );
  });

  it('should return an empty array for an unknown table', () => {
    expect(getColumns({ dbName: 'iam', tableName: 'nope' })).toEqual([]);
  });
});

describe('getPrimaryKey', () => {
  it('should return the id of the primary column', () => {
    expect(getPrimaryKey(userColumns)).toBe('userId');
  });

  it('should return an empty string when no column is the primary one', () => {
    expect(getPrimaryKey([{ id: 'name', name: 'Name', type: STRING }])).toBe('');
    expect(getPrimaryKey([])).toBe('');
  });
});

describe('getTablePrimaryKey', () => {
  it('should return the primary key of the named table', () => {
    expect(getTablePrimaryKey(getTablesByDbName('iam'), 'users')).toBe('userId');
  });

  it('should return an empty string for a table without primary key', () => {
    expect(getTablePrimaryKey(getTablesByDbName('iam'), 'roles')).toBe('');
  });

  it('should return an empty string for an unknown table', () => {
    expect(getTablePrimaryKey(getTablesByDbName('iam'), 'nope')).toBe('');
  });
});
