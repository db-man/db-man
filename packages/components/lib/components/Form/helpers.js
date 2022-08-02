/**
 * Check duplicated primary key
 * For example, if `id` is primary key, then there should not be two id=1 record in table
 */
export const validatePrimaryKey = (value, content, primaryKey) => {
  const found = content.find(item => item[primaryKey] === value);

  if (found) {
    return false;
  }

  return true;
};
/**
 * @param {*} column
 * @param {string} uiType e.g. "MultipleInputs"
 * @returns {is:bool,preview:bool}
 */

export const isType = (column, uiType) => {
  // type="MultipleInputs"
  // type=["MultipleInputs"]
  // type=["MultipleInputs", "WithPreview"]
  const type = column['type:createUpdatePage'];

  if (Array.isArray(type)) {
    const is = type[0] === uiType;
    const preview = type[1] === 'WithPreview';
    return {
      is,
      preview
    };
  }

  const is = column['type:createUpdatePage'] === uiType;
  return {
    is,
    preview: false
  };
};