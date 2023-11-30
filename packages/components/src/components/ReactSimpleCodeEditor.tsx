import React from 'react';
import PropTypes from 'prop-types';
import Editor from 'react-simple-code-editor';
// @ts-ignore - no types available
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

export default function ReactSimpleCodeEditor({
  height,
  value,
  onChange,
}: {
  height?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Editor
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: '12px',
        height, // '50em' or undefined
        width: '60em',
        backgroundColor: 'white',
      }}
      value={value}
      highlight={(c) => highlight(c, languages.js)}
      padding={10}
      onValueChange={(c) => onChange(c)}
    />
  );
}

ReactSimpleCodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
