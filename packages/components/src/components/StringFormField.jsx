import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

import { columnType } from './types';
import StringFormFieldValue from './StringFormFieldValue';
import RefTableLink from './RefTableLink';
import PageContext from '../contexts/page';
import { dbs } from '../dbs';

export default function StringFormField(props) {
  const {
    label, column, value, inputProps, preview, onChange,
  } = props;
  const { dbName } = useContext(PageContext);
  const renderWarning = () => {
    if (typeof value === 'string') return null;
    return <Alert message={`(This form field type should be string, but current type is ${typeof value})`} type="warning" />;
  };
  return (
    <div className="dm-form-field dm-string-form-field">
      <b>{label}</b>
      :
      {' '}
      <RefTableLink
        column={column}
        tables={dbs[dbName]}
        dbName={dbName}
        value={value}
      />
      {renderWarning()}
      <StringFormFieldValue
        inputProps={inputProps}
        size="small"
        preview={preview}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

StringFormField.propTypes = {
  label: PropTypes.string.isRequired,
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
