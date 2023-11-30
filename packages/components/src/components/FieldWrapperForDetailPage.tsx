import React, { ReactNode, useContext } from 'react';
import PropTypes from 'prop-types';

import RefTableLink from './RefTableLink';
import PageContext from '../contexts/page';

import { columnType } from './types';
import * as constants from '../constants';
import DbColumn from '../types/DbColumn';
import { useAppContext } from '../contexts/AppContext';

interface FieldWrapperProps {
  column: DbColumn;
  value: number | boolean | string | string[];
  children: ReactNode;
}

/**
 * Form field wrapper for detail page
 * TODO When value is an array, how to render RefTableLink
 */
const FieldWrapperForDetailPage = ({
  column,
  value,
  children,
}: FieldWrapperProps) => {
  const { dbName } = useContext(PageContext);
  const { dbs } = useAppContext();
  const typeClassName =
    column.type === constants.STRING_ARRAY
      ? 'dm-string-array-form-field'
      : 'dm-string-form-field';
  return (
    <div
      // key={column.id}
      className={`dm-form-field ${typeClassName}`}
      data-debug={JSON.stringify(column)}
    >
      <div className='dm-field-label'>
        <b>
          {column.name} (<code>{column.id}</code>)
          {column.type === constants.STRING_ARRAY
            ? ` (count:${value ? (value as string[]).length : 0})`
            : null}
        </b>
        :{' '}
        {column.referenceTable && typeof value === 'string' && (
          <RefTableLink
            dbName={dbName}
            tables={dbs[dbName]}
            value={value}
            column={column}
          />
        )}
      </div>
      {children}
    </div>
  );
};

FieldWrapperForDetailPage.propTypes = {
  column: columnType.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.bool,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  children: PropTypes.node,
};
FieldWrapperForDetailPage.defaultProps = {
  value: '',
  children: null,
};

export default FieldWrapperForDetailPage;
