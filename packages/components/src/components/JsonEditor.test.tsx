import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JsonEditor from './JsonEditor';

const value = JSON.stringify({ name: 'chenyang' }, null, '  ');

function renderEditor(props: Partial<Parameters<typeof JsonEditor>[0]> = {}) {
  const onTextAreaChange = jest.fn();
  const onJsonObjectChange = jest.fn();
  const onSave = jest.fn();
  render(
    <JsonEditor
      value={value}
      onTextAreaChange={onTextAreaChange}
      onJsonObjectChange={onJsonObjectChange}
      onSave={onSave}
      {...props}
    />
  );
  return { onTextAreaChange, onJsonObjectChange, onSave };
}

function getJsonTextarea() {
  const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(ta.tagName).toBe('TEXTAREA');
  return ta;
}

describe('JsonEditor', () => {
  it('renders the JSON text in a textarea', () => {
    renderEditor();
    expect(getJsonTextarea()).toHaveValue(value);
  });

  it('propagates text changes and parsed object for valid JSON', () => {
    const { onTextAreaChange, onJsonObjectChange } = renderEditor();
    fireEvent.change(getJsonTextarea(), {
      target: { value: '{"name": "new"}' },
    });
    expect(onTextAreaChange).toHaveBeenCalledWith('{"name": "new"}');
    expect(onJsonObjectChange).toHaveBeenCalledWith({ name: 'new' });
    expect(screen.queryByText(/There is something wrong/)).not.toBeInTheDocument();
  });

  it('shows an error and skips the object callback for invalid JSON', () => {
    const { onTextAreaChange, onJsonObjectChange } = renderEditor();
    fireEvent.change(getJsonTextarea(), { target: { value: 'not json' } });
    expect(onTextAreaChange).toHaveBeenCalledWith('not json');
    expect(onJsonObjectChange).not.toHaveBeenCalled();
    expect(screen.getByText(/There is something wrong in JSON text/)).toBeInTheDocument();
  });

  it('calls onSave on Cmd+S', () => {
    const { onSave } = renderEditor();
    fireEvent.keyDown(getJsonTextarea(), { code: 'KeyS', metaKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
