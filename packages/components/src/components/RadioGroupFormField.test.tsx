import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RadioGroupFormField from './RadioGroupFormField';

const column = {
  id: 'level',
  name: 'Level',
  type: 'STRING',
  'ui:createUpdatePage:enum': ['low', 'high'],
} as any;

describe('RadioGroupFormField', () => {
  it('renders a radio option for each enum value', () => {
    render(
      <RadioGroupFormField
        value='low'
        disabled={false}
        column={column}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('radio', { name: 'low' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'high' })).toBeInTheDocument();
  });

  it('checks the radio matching the value', () => {
    render(
      <RadioGroupFormField
        value='low'
        disabled={false}
        column={column}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('radio', { name: 'low' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'high' })).not.toBeChecked();
  });

  it('calls onChange with the picked value', () => {
    const onChange = jest.fn();
    render(
      <RadioGroupFormField
        value='low'
        disabled={false}
        column={column}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'high' }));
    expect(onChange).toHaveBeenCalledWith('high');
  });

  it('disables all radios when disabled is true', () => {
    render(
      <RadioGroupFormField
        value='low'
        disabled
        column={column}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('radio', { name: 'low' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'high' })).toBeDisabled();
  });

  it('renders the schema warning and no radios when enum is missing', () => {
    const badColumn = { id: 'level', name: 'Level', type: 'STRING' } as any;
    render(
      <RadioGroupFormField
        value='low'
        disabled={false}
        column={badColumn}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('should be object');
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
