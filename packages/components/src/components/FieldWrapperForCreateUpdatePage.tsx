import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { columnType } from './types';
import * as constants from '../constants';
import DbColumn from '../types/DbColumn';
import PageContext from '../contexts/page';

const popoverContent = (
  <div>
    <p>
      When db mode is split-table, single record will be created as a file on
      filesystem.
      <br />
      But on some filesystem, e.g. macOS or Linux, the filename length limit is
      255.
      <br />
      So we need to check the length of filename, and warn user if it is too
      long.
    </p>
  </div>
);

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

  const pageCtx = useContext(PageContext);

  return (
    <div
      // key={column.id}
      className={`dbm-form-field ${typeClassName}`}
      data-debug={JSON.stringify(column)}
    >
      <div className="dbm-field-label">
        <b>
          {column.name} ({column.id})
        </b>
        :{' '}
        {pageCtx.appModes.includes('split-table') &&
          column.id === pageCtx.primaryKey && (
            <>
              <Popover content={popoverContent} title="Primary Key Info">
                <QuestionCircleOutlined />
              </Popover>{' '}
            </>
          )}
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
