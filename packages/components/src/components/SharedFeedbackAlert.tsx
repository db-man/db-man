import React from 'react';
import { Alert } from 'antd';

interface FeedbackState {
  type: 'success' | 'error';
  message: React.ReactNode;
}

interface SharedFeedbackAlertProps {
  feedback: FeedbackState | null;
  onClose?: () => void;
}

export default function SharedFeedbackAlert({
  feedback,
  onClose,
}: SharedFeedbackAlertProps) {
  if (!feedback) {
    return null;
  }

  return (
    <Alert
      message={feedback.type === 'success' ? 'Success' : 'Something went wrong'}
      description={feedback.message}
      type={feedback.type}
      showIcon
      closable
      onClose={onClose}
      style={{ marginBottom: 16 }}
    />
  );
}
