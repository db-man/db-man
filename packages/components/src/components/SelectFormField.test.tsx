import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectFormField from './SelectFormField';

const options = [
  { label: 'Foo', value: 'foo' },
  { label: 'Bar', value: 'bar' },
];

describe('SelectFormField', () => {
  it('renders the selected value', () => {
    render(<SelectFormField options={options} value='foo' />);
    expect(screen.getByText('Foo')).toBeInTheDocument();
  });

  it('calls onChange when an option is picked', async () => {
    const onChange = jest.fn();
    render(
      <SelectFormField options={options} value='foo' onChange={onChange} />
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(await screen.findByText('Bar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Bar'));
    expect(onChange).toHaveBeenCalledWith('bar', expect.anything());
  });

  it('renders without value and without onChange', () => {
    render(<SelectFormField options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
