import { getChangedFilesBySha, getChangedDbTables } from './mergeV2.mjs';

// no print console.debug
jest.spyOn(console, 'debug').mockImplementation(() => undefined);

describe('getChangedFilesBySha', () => {
  it('should return proper value', async () => {
    const actual = await getChangedFilesBySha(
      '0392fb65486180f2071b0cbdcc94ebc3f591e0b4'
    );
    expect(actual).toBe(`package-lock.json
packages/components/package.json
packages/components/src/pages/DbTablePage/InsightsPage.tsx
`);
  });
});

// get changed db tables from git log
describe('getChangedDbTables', () => {
  it('should return proper value', async () => {
    const actual = await getChangedDbTables(
      `db_files_dir/iam/users/789900000005.json
db_files_dir/iam/users/789900000006.json
`
    );
    expect(actual).toEqual(['iam/users']);
  });

  it('should return proper value when multiple records from different tables changed', async () => {
    const actual = await getChangedDbTables(
      `db_files_dir/iam/users/789900000005.json
db_files_dir/iam/roles/developer.json
`
    );
    expect(actual).toEqual(['iam/users', 'iam/roles']);
  });
});
