import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { columnType } from './types';
import StringFormFieldValue, { InputProps } from './StringFormFieldValue';
import RefTableLink from './RefTableLink';
import PageContext from '../contexts/page';
import PresetsButtons from './PresetsButtons';
import DbColumn from '../types/DbColumn';
import { useAppContext } from '../contexts/AppContext';
import { FieldValueWarning } from './FormValidations';

interface StringFormFieldProps {
  column: DbColumn;
  value?: string;
  inputProps?: InputProps;
  preview?: boolean;
  onChange: (value: string) => void;
}

const expectedType = 'string';

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
 * To render a form field for table_column.type="STRING"
 */
export default function StringFormField(props: StringFormFieldProps) {
  const { column, value, inputProps, preview, onChange } = props;
  const appCtx = useAppContext();
  const pageCtx = useContext(PageContext);

  return (
    <div className='dbm-form-field dbm-string-form-field'>
      <b>{column.name}</b>:{' '}
      {pageCtx.appModes.includes('split-table') &&
        column.id === pageCtx.primaryKey && (
          <>
            <Popover content={popoverContent} title='Primary Key Info'>
              <QuestionCircleOutlined />
            </Popover>{' '}
          </>
        )}
      <PresetsButtons column={column} onChange={onChange} />{' '}
      <RefTableLink
        column={column}
        tables={appCtx.dbs[pageCtx.dbName]}
        dbName={pageCtx.dbName}
        value={value}
      />
      <FieldValueWarning expectedType={expectedType} value={value} />
      <StringFormFieldValue
        inputProps={inputProps}
        preview={preview}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

StringFormField.propTypes = {
  value: PropTypes.string,
  preview: PropTypes.bool,
  column: columnType.isRequired,
  inputProps: PropTypes.shape({
    disabled: PropTypes.bool,
    autoFocus: PropTypes.bool,
    onKeyDown: PropTypes.func,
  }),
  onChange: PropTypes.func.isRequired,
};

StringFormField.defaultProps = {
  value: '',
  preview: false,
  // Props to pass directly to antd's Input component
  inputProps: {
    // disabled
    // autoFocus
    // onKeyDown
  },
};
