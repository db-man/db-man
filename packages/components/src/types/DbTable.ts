import { types } from '@db-man/github';
import DbColumn from './DbColumn';

/**
 * TODO: Use types.DbTable from '@db-man/github', instead of using DbTable in @db-man/components
 * But we need make sure types.DbTable from '@db-man/github' can include all UI fields e.g. `ui:listPage:isFilter`.
 */
// type DbTable = types.DbTable;

type DbTable = types.DbTable & {
  columns: DbColumn[];
};

export default DbTable;
