// DEPRECATED: Use src/types/DataTable.ts instead
export type DataType = { [key: string]: any };
export type DataRowType = Array<DataType>;

/**
 * e.g. { name: 'foo', age: 12 }
 * ```
 * export type ValueType = { [key: string]: any };
 * ```
 */
export type RowType = Record<string, any>;
