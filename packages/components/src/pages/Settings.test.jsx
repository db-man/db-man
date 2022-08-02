import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from './Settings';

describe('Settings', () => {
  it('renders Settings', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<Settings />);
    const el = screen.getByText(/Settings/i);
    expect(el).toBeInTheDocument();
  });
});
