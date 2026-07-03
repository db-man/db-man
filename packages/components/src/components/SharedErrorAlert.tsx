import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

interface SharedErrorAlertProps {
  errorMessage?: string;
  onClose?: () => void;
}

export default function SharedErrorAlert({
  errorMessage,
  onClose,
}: SharedErrorAlertProps) {
  if (!errorMessage) {
    return null;
  }

  return (
    <Alert
      message="Something went wrong"
      description={errorMessage}
      type="error"
      showIcon
      closable
      onClose={onClose}
      style={{ marginBottom: 16 }}
    />
  );
}

SharedErrorAlert.propTypes = {
  errorMessage: PropTypes.string,
  onClose: PropTypes.func,
};
