import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StringFormFieldValue from './StringFormFieldValue';

describe('StringFormFieldValue', () => {
  it('renders an input with the given value', () => {
    render(<StringFormFieldValue value='foo' />);
    expect(screen.getByRole('textbox')).toHaveValue('foo');
  });

  it('calls onChange with the new value when typing', () => {
    const onChange = jest.fn();
    render(<StringFormFieldValue value='' onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'bar' },
    });
    expect(onChange).toHaveBeenCalledWith('bar', expect.anything());
  });

  it('passes inputProps through to the input', () => {
    render(
      <StringFormFieldValue
        inputProps={{ placeholder: 'pl', disabled: true }}
      />
    );
    expect(screen.getByPlaceholderText('pl')).toBeDisabled();
  });

  it('marks the input as error when inputProps.status is error', () => {
    render(
      <StringFormFieldValue inputProps={{ status: 'error' }} value='foo' />
    );
    expect(screen.getByRole('textbox').className).toContain(
      'ant-input-status-error'
    );
  });

  it('renders an image preview when preview is set', () => {
    render(
      <StringFormFieldValue value='https://example.com/a.png' preview />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/a.png');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/a.png'
    );
  });

  it('renders no image when preview is set but value is empty', () => {
    const { container } = render(<StringFormFieldValue value='' preview />);
    expect(container.querySelector('a')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });
});
