import { ValueType } from '.';
import DbColumn from '../../types/DbColumn';
import { UiType } from '../../types/UiType';

/**
 * Check duplicated primary key
 * For example, if `id` is primary key, then there should not be two id=1 record in table
 */
export const validatePrimaryKey = (
  value: string,
  content: ValueType[],
  primaryKey: string
) => {
  const found = content.find((item) => item[primaryKey] === value);
  if (found) {
    return false;
  }
  return true;
};

/**
 * @param {*} column
 * @param {string} uiType e.g. "MultiLineInputBox"
 * @returns {is:bool,preview:bool}
 */
export const isType = (column: DbColumn, uiType: UiType) => {
  // type="MultiLineInputBox"
  // type=["MultiLineInputBox"]
  // type=["MultiLineInputBox", "WithPreview"]
  const type = column['type:createUpdatePage'];
  if (Array.isArray(type)) {
    const is = type[0] === uiType;
    const preview = type[1] === 'WithPreview';
    return { is, preview };
  }
  const is = column['type:createUpdatePage'] === uiType;
  return { is, preview: false };
};

export const obj2str = (obj: ValueType) => JSON.stringify(obj, null, '  ');
export const str2obj = (str: string) => JSON.parse(str) as ValueType;

export const getFormInitialValues = (
  columns: DbColumn[],
  formValues: ValueType
) => {
  const initFormValues: {
    [key: string]: any;
  } = {};
  // Initialize form values with default values defined in table schema when form values are empty
  columns.forEach((col: DbColumn) => {
    if (!formValues[col.id]) {
      let defaultValue = '';
      switch (col['type:createUpdatePage']) {
        case 'RadioGroup':
          [defaultValue] = col.enum!;
          break;
        default:
          defaultValue = '';
      }
      if (defaultValue) {
        initFormValues[col.id] = defaultValue;
      }
    }
  });
  return initFormValues;
};
