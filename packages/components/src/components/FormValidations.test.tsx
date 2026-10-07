import React from 'react';
import { render, screen } from '@testing-library/react';
import { FieldValueWarning, FieldSchemaWarning } from './FormValidations';

describe('FieldValueWarning', () => {
  it('renders nothing when the value type is expected', () => {
    const { container } = render(
      <FieldValueWarning expectedTypes={['string', 'undefined']} value='foo' />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when value is undefined and undefined is expected', () => {
    const { container } = render(
      <FieldValueWarning expectedTypes={['string', 'undefined']} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a warning when the value type mismatches', () => {
    render(<FieldValueWarning expectedTypes={['string']} value={123 as any} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('number');
    expect(alert).toHaveTextContent('string');
  });
});

describe('FieldSchemaWarning', () => {
  it('renders nothing when the schema type matches', () => {
    const { container } = render(
      <FieldSchemaWarning expectedType='object' fieldSchema={['a', 'b'] as any} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a warning when the schema type mismatches', () => {
    render(<FieldSchemaWarning expectedType='object' fieldSchema='a' />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('should be object');
    expect(alert).toHaveTextContent('string');
  });
});
