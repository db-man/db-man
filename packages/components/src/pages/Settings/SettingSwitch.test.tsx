import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import SettingSwitch from './SettingSwitch';

const LS_KEY = 'dbm_is_dark_theme';

describe('SettingSwitch', () => {
  beforeEach(() => {
    localStorage.removeItem(LS_KEY);

    // jsdom does not implement navigation, and `SettingSwitch` calls
    // `window.location.reload()` on change. jsdom's own `reload` is a
    // non-configurable property, so it cannot be spied on — replace the whole
    // `location` object instead (this test file does not navigate).
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { reload: jest.fn() },
    });
  });

  it('renders the label and the storage key', () => {
    render(<SettingSwitch label='Dark Theme' storageKey={LS_KEY} />);

    expect(screen.getByText(/Dark Theme/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(LS_KEY))).toBeInTheDocument();
  });

  it('is switched off when nothing is stored', () => {
    render(<SettingSwitch label='Dark Theme' storageKey={LS_KEY} />);

    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('is switched on when localStorage holds "true"', () => {
    localStorage.setItem(LS_KEY, 'true');

    render(<SettingSwitch label='Dark Theme' storageKey={LS_KEY} />);

    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('stores the new value and reloads the page when toggled', () => {
    render(<SettingSwitch label='Dark Theme' storageKey={LS_KEY} />);

    fireEvent.click(screen.getByRole('switch'));

    expect(localStorage.getItem(LS_KEY)).toBe('true');
    expect(window.location.reload).toHaveBeenCalled();
  });
});
