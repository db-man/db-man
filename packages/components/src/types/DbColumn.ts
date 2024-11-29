import { ColumnType as AntdColumnType } from 'antd/es/table';
import {
  GetPageUiType,
  ListPageUiType,
  RadioGroupUiTypeEnum,
  ListPageRandomViewUiType,
  UiType,
} from './UiType';
import { RowType } from './Data';
import { types } from '@db-man/github';

// Only used in CreatePage or UpdatePage, only used in Input component (of type=STRING).
type ColumnPlaceholder = string;

export type RenderKeyType =
  | 'type:createUpdatePage'
  | 'type:getPage'
  | 'type:listPage'
  | 'ui:listPage:randomView';

// TODO: how to sync this whitelist with `DbColumn` defined in @db-man/github?
export const TABLE_COLUMN_KEYS = [
  // data column from @db-man/github
  'id',
  'name',
  'type',
  'primary',
  'description',
  'referenceTable',
  // extend UI column
  'type:createUpdatePage',
  'type:getPage',
  'type:listPage',
  'ui:createUpdatePage:enum',
  'ui:createUpdatePage:placeholder',
  'ui:createUpdatePage:presets',
  'ui:listPage:isFilter', // If true, on the list page, the field/column will be shown in the filter section above the table.
  'ui:listPage:isImageViewKey',
  'ui:listPage:randomView',
] as const; // "as const" makes TypeScript treat this as a readonly tuple
type TableColumnKeysType = typeof TABLE_COLUMN_KEYS;
export type TableColumnKeyType = TableColumnKeysType[number];

/**
 * Extend UI type for DbColumn.
 * Need to sync with columns in `SchemaPage.tsx`.
 */
type DbColumnExtendsUiType = {
  'type:createUpdatePage'?: UiType;
  'type:getPage'?: GetPageUiType;
  'type:listPage'?: ListPageUiType;
  /**
   * In the Form page, e.g. to create a new user, use it to show a dropdown list with "Maintainer" and "Developer".
   */
  'ui:createUpdatePage:enum'?: RadioGroupUiTypeEnum;
  /**
   * Only used in CreatePage or UpdatePage, only used in Input component (of type=STRING).
   */
  'ui:createUpdatePage:placeholder'?: ColumnPlaceholder;
  /**
   * - Only used on create/update page.
   *   - When `type="STRING_ARRAY"`, and default UI component `Select` is used.
   *     - To render some buttons on top of the dropdown, click button to quick append a new tag into the dropdown.
   *   - When `type="STRING"`, and default UI component `Input` is used.
   *     - To render some buttons on top of the input box, click button to quick input a new text into the input box.
   */
  'ui:createUpdatePage:presets'?: string[];
  /**
   * If true, on the list page, the field/column will be shown in the filter section above the table.
   */
  'ui:listPage:isFilter'?: boolean;
  'ui:listPage:isImageViewKey'?: string;
  /**
   * On the List Page, Random View, choose the UI component to use for one of the list item.
   *
   * Below is an example of using `ImageLink` component. The string after "ImageLink" is a template (Handlebars).
   * It will transform the `record` which passing from antd `Table` component, into a props object like `{url:'',imgSrc:''}`.
   * This props will pass to `ImageLink` component.
   *
   * ```json
   * {
   *   "id": "product_id",
   *   "ui:listPage:randomView": [
   *     [
   *       "ImageLink",
   *       "{\"url\":\"{{record.photos.[0]}}\",\"imgSrc\":\"{{record.photos.[0]}}\"}"
   *     ]
   *   ]
   * }
   * ```
   */
  'ui:listPage:randomView'?: ListPageRandomViewUiType;
  /**
   * Pass to the Column of Ant Design Table.
   * TODO maybe we should use `tableColProps` instead of `tableProps`?
   */
  tableProps?: any;
};

// export default interface DbColumn extends AntdColumnType<RowType> {
type DbColumn = AntdColumnType<RowType> &
  types.DbColumn &
  DbColumnExtendsUiType;

export default DbColumn;
