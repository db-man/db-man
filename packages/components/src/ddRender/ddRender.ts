import * as constants from '../constants';
import DbColumn, { RenderKeyType } from '../types/DbColumn';
import { RowType } from '../types/Data';
import { RenderArgs } from '../types/UiType';
import ddRenderFnMapping from './ddRenderFnMapping';

// Default render func when "type:listPage" or "type:getPage" not defined in db table column
const defaultRendersForListPage = {
  [constants.NUMBER]: (val: number) => val,
  [constants.STRING]: (val: string) => val,
  [constants.STRING_ARRAY]: (val: string[]) => val && val.join(', '),
  [constants.BOOL]: (val: boolean) => (val === undefined ? '' : String(val)),
};
const defaultRendersForGetPage = {
  [constants.NUMBER]: (val: number) =>
    val === undefined ? 'NO_VALUE' : String(val),
  [constants.STRING]: (val: string) => (val === undefined ? 'NO_VALUE' : val),
  [constants.STRING_ARRAY]: (val: string[]) =>
    val === undefined ? 'NO_VALUE' : val && val.join(', '),
  [constants.BOOL]: (val: boolean) =>
    val === undefined ? 'NO_VALUE' : String(val),
};

/**
 * @param {string|string[]} args e.g. "Link" or ["Link", "{{record.url}}"]
 * @param {Object} tplExtra
 */
export const getRender = (args: RenderArgs, tplExtra?: any) => {
  // the column render function defined in Table component of antd
  // renderFn = (val, record, index) => ()
  let renderFn;

  if (!args) {
    return renderFn;
  }

  if (typeof args === 'string') {
    const fn = ddRenderFnMapping[args];
    if (fn) {
      renderFn = fn;
    }
  }

  if (Array.isArray(args)) {
    const [renderFnName] = args;
    renderFn = (val: any, record: RowType, index?: number) =>
      ddRenderFnMapping[renderFnName](val, record, index, args, tplExtra);
  }

  return renderFn;
};

type ColumnRenderType = (
  renderKey: RenderKeyType,
  column: DbColumn,
  tplExtra?: any
) => (val: any, record: RowType, index?: number) => any;

/**
 * column def:
 * {
 *   "type:listPage": ["Link", "{{record.url}}"]
 * }
 */
export const getColumnRender: ColumnRenderType = (
  renderKey,
  column,
  tplExtra
) => {
  // should only used for "type:listPage" or "type:getPage"
  if (
    !renderKey ||
    [constants.TYPE_LIST_PAGE, constants.TYPE_GET_PAGE].indexOf(renderKey) < 0
  ) {
    console.error('getColumnRender: invalid renderKey', renderKey);
  }

  const customRender = getRender(column[renderKey], tplExtra);
  if (customRender) {
    return customRender;
  }

  if (renderKey === constants.TYPE_GET_PAGE) {
    return defaultRendersForGetPage[column.type || constants.STRING];
  }

  // the column render function defined in Table component of antd
  // renderFn = (val, record, index) => ()
  return defaultRendersForListPage[column.type || constants.STRING];
};

// export const getRenderResultByColumn = (
//   value: any,
//   record: RowType,
//   index: number,
//   args: RenderArgs,
//   column: Column
// ) => getColumnRender(constants.TYPE_LIST_PAGE, column)(value, record, index);
