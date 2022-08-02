import React from 'react';
import PropTypes from 'prop-types';

import TextAreaFormFieldValue from './TextAreaFormFieldValue';

export default function TextAreaFormField(props) {
  const { label, value, onChange } = props;
  return (
    <div className="dm-form-field dm-string-form-field">
      <b>{label}</b>
      :
      {' '}
      <TextAreaFormFieldValue
        value={value}
        onChange={onChange}
        {...props} /* eslint-disable-line react/jsx-props-no-spreading */
      />
    </div>
  );
}

TextAreaFormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

TextAreaFormField.defaultProps = {
  value: '',
  onChange: () => {},
};
