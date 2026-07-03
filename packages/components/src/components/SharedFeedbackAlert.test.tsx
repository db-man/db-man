import React from 'react';
import { render, screen } from '@testing-library/react';

import SharedFeedbackAlert from './SharedFeedbackAlert';

describe('SharedFeedbackAlert', () => {
  it('renders an error alert when feedback type is error', () => {
    render(
      <SharedFeedbackAlert
        feedback={{ type: 'error', message: 'Failed to save' }}
      />,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });

  it('renders a success alert when feedback type is success', () => {
    render(
      <SharedFeedbackAlert
        feedback={{ type: 'success', message: 'Saved successfully' }}
      />,
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('renders nothing when there is no feedback', () => {
    const { container } = render(<SharedFeedbackAlert feedback={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
