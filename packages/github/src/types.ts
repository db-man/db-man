/**
 * One of "STRING", "STRING_ARRAY", "NUMBER" or "BOOL".

| type         | Default UI Component |
| ------------ | -------------------- |
| STRING       | Input                |
| STRING_ARRAY | Select mode="tags"   |
| NUMBER       | InputNumber          |
| BOOL         | Switch               |

`{"type": "STRING_ARRAY"}` is the same as `{"type": "STRING_ARRAY","type:createUpdatePage":"Select"}`
 */
export type DbColumnType = 'STRING' | 'STRING_ARRAY' | 'NUMBER' | 'BOOL';

export interface DbColumn {
  /**
   * Required. The id of this column.
   */
  id: string;
  /**
   * Required. The name of this column.
   */
  name: string;
  /**
   * Required. The type of this column.
   */
  type: DbColumnType;
  /**
   * Only one column in table should have this field.
   * `true` to indicate this column is an uniq key of this table.
   */
  primary?: boolean;
}

export interface DbTable {
  /**
   * The name of the table.
   */
  name: string;
  /**
   * The columns of the table.
   * Array of column definition
   */
  columns: DbColumn[];
  /**
   * If true, the table is large, e.g. `users` table.
   * Optional, default is false. Set to true for large table file which is more than 1MB.
   * when single table file is more than 1MB, need to call blob api to get the content, otherwise will get 403 error
   */
  large: boolean;
}

/**
 * The database object.
 * For example, the following is a database object with two tables: users and posts.
 * ```json
 * {
 *   "users": [{
 *     "id": "id",
 *     "name": "name",
 *     "primary": true,
 *     "type": "STRING"
 *   }],
 *  "posts": [...]
 * }
 */
export type Database = Record<string, DbTable[]>;
