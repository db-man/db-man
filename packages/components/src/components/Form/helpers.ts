import { ValueType } from '.';
import { TYPE_CREATE_UPDATE_PAGE } from '../../constants';
import DbColumn from '../../types/DbColumn';
import { UiType } from '../../types/UiType';

export const FILENAME_TOO_LONG =
  'Filename length is too long, please keep it under 255 characters';

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
  const type = column[TYPE_CREATE_UPDATE_PAGE];
  if (Array.isArray(type)) {
    const is = type[0] === uiType;
    const preview = type[1] === 'WithPreview';
    return { is, preview };
  }
  const is = column[TYPE_CREATE_UPDATE_PAGE] === uiType;
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
    if (formValues[col.id]) {
      return;
    }
    let defaultValue = '';
    switch (col[TYPE_CREATE_UPDATE_PAGE]) {
      case 'RadioGroup':
        defaultValue = '';
        if (col['ui:createUpdatePage:enum']) {
          [defaultValue] = col['ui:createUpdatePage:enum'];
        }
        break;
      default:
        defaultValue = '';
    }
    if (defaultValue) {
      initFormValues[col.id] = defaultValue;
    }
  });
  return initFormValues;
};

const isFilenameTooLong = (val: string) => (val + '.json').length > 255;

/**
 *
 * @param param0
 * @returns error message if the value is invalid, otherwise return true
 */
export const checkFieldValue = ({
  column,
  primaryKey,
  value,
}: {
  column: DbColumn;
  primaryKey: string;
  value: string;
}) => {
  // When db mode is split-table, single record will be created as a file on filesystem
  // But on some filesystem, e.g. macOS or Linux, the filename length limit is 255.
  // So we need to check the length of filename, and warn user if it is too long.
  if (column.id === primaryKey) {
    if (isFilenameTooLong(value)) {
      return FILENAME_TOO_LONG;
    }
  }
  return '';
};
