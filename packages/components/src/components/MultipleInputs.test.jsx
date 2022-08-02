import React from 'react';
import { render, screen } from '@testing-library/react';
import MultipleInputs from './MultipleInputs';

describe('MultipleInputs', () => {
  it('renders "foo" in text box', () => {
    render(<MultipleInputs value={['foo']} />);
    const el = screen.getByText(/foo/i);
    expect(el).toBeInTheDocument();
  });
});
