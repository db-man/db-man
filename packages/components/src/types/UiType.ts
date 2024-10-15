/**
 * Used when `type="STRING"`, and `type:createUpdatePage="RadioGroup"`.
 * Only used on create/update page.
 * To render some Radio components with given text, click one of the Radio to fill the text in input box.
 *
 * ```json
 * {
 *   "id": "vehicleType",
 *   "name": "Vehicle Type",
 *   "type": "STRING",
 *   "ui:createUpdatePage:enum": ["car", "bike"]
 * }
 * ```
 */
type RadioGroupUiType = 'RadioGroup';
export type RadioGroupUiTypeEnum = string[];

type SimpleUiType = string | RadioGroupUiType;

type DynamicUiType = any; // TODO

export type UiType = SimpleUiType | DynamicUiType;

export type GetPageUiType = RenderArgs;

/**
 * If is 'HIDE', the column will not be shown on the list page.
 * ```json
 * {
 *   "id": "product_id",
 *   "type:listPage": "HIDE"
 * }
 * ```
 * @example https://github.com/db-man/split-table-db/blob/main/dbs/iam/dbcfg.json (table: users, column: notes)
 */
export type ListPageUiType = RenderArgs | 'HIDE';

export type ListPageRandomViewUiType = RenderArgs;

type RenderFuncName = string;
type RenderFuncTpl = string;
/**
 * Use `RenderArgs` to custom UI component
 *
 * For example: "Link" or ["Link", "{{record.url}}"]
 *
 * Another example: on list page, choose the UI component to use for this column.
 *
 * Below is an example of using `ImageLink` component. The string after "ImageLink" is a template (Handlebars).
 * It will transform the `record` which passing from antd `Table` component, into a props object like `{url:'',imgSrc:''}`.
 * This props will pass to `ImageLink` component.
 *
 * ```json
 * {
 *   "id": "product_id",
 *   "type:listPage": [
 *     "ImageLink",
 *     "{\"url\":\"https://brickset.com/{{record.product_id}}-1\",\"imgSrc\":\"https://img.brickset.com/{{record.product_id}}-1.jpg\"}"
 *   ]
 * }
 * ```
 * @example https://github.com/db-man/split-table-db/blob/main/dbs/iam/dbcfg.json (table: users, column: userId)
 */
export type RenderArgs = string | [RenderFuncName, RenderFuncTpl];
