import React from 'react';
import PropTypes from 'prop-types';

import { columnType } from './types';
import * as constants from '../constants';
import DbColumn from '../types/DbColumn';

/**
 * Form field wrapper for create/update page
 */
const FieldWrapperForCreateUpdatePage = ({
  column,
  children,
}: {
  column: DbColumn;
  children: React.ReactNode;
}) => {
  const typeClassName =
    column.type === constants.STRING_ARRAY
      ? 'dbm-string-array-form-field'
      : 'dbm-string-form-field';
  return (
    <div
      // key={column.id}
      className={`dbm-form-field ${typeClassName}`}
      data-debug={JSON.stringify(column)}
    >
      <div className='dbm-field-label'>
        <b>{column.name}</b>:{' '}
      </div>
      {children}
    </div>
  );
};

FieldWrapperForCreateUpdatePage.propTypes = {
  column: columnType.isRequired,
  // value: PropTypes.oneOfType([
  //   PropTypes.number,
  //   PropTypes.bool,
  //   PropTypes.string,
  //   PropTypes.arrayOf(PropTypes.string),
  // ]),
  children: PropTypes.node,
};
// FieldWrapper2.contextType = PageContext;

export default FieldWrapperForCreateUpdatePage;
