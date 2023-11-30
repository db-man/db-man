import React from 'react';
import { render, screen } from '@testing-library/react';
import MultiLineInputBox from './MultiLineInputBox';

describe('MultiLineInputBox', () => {
  it('renders "foo" in text box', () => {
    render(<MultiLineInputBox value={['foo']} />);
    const el = screen.getByText(/foo/i);
    expect(el).toBeInTheDocument();
  });
});
