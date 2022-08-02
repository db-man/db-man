import * as constants from '../constants';
import ddRenderFnMapping from './ddRenderFnMapping'; // Default render func when "type:listPage" or "type:getPage" not defined in db table column

const defaultRenders = {
  [constants.NUMBER]: val => val,
  [constants.STRING]: val => val,
  [constants.STRING_ARRAY]: val => val && val.join(', '),
  [constants.BOOL]: val => val === undefined ? '' : String(val)
};
/**
 * @param {string|string[]} args
 * @param {Object} tplExtra
 */

export const getRender = (args, tplExtra) => {
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

    renderFn = (val, record, index) => ddRenderFnMapping[renderFnName](val, record, index, args, tplExtra);
  }

  return renderFn;
};
/**
 * column def:
 * {
 *   "type:listPage": ["Link", "{{record.url}}"]
 * }
 */

export const getColumnRender = column => {
  const customRender = getRender(column['type:listPage']);

  if (customRender) {
    return customRender;
  } // the column render function defined in Table component of antd
  // renderFn = (val, record, index) => ()


  return defaultRenders[column.type || constants.STRING];
};
export const getDetailPageColumnRender = (column, tplExtra) => {
  const customRender = getRender(column['type:getPage'], tplExtra);

  if (customRender) {
    return customRender;
  } // the column render function defined in Table component of antd
  // renderFn = (val, record, index) => ()


  return defaultRenders[column.type || constants.STRING];
};
export const getRenderResultByColumn = (value, record, index, args, column) => getColumnRender(column)(value, record, index); // eslint-disable-line max-len