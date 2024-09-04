# .babelrc

```js
module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
  ignore: ['**/__snapshots__/*', '*.snap'],
};
```

- **@babel/preset-react**: The runtime: 'automatic' option enables the new JSX Transform.
- **@babel/preset-typescript**: This preset is used to handle TypeScript files.
- **@babel/plugin-proposal-class-properties**: This plugin is used to support class properties syntax.
- **ignore**: This option is used to ignore certain files or directories during the build process.

```jsx
import { Alert } from 'antd';
export const FieldValueWarning = () => {
  return (
    <Alert
      message={`(The type of this form field value should be ${expectedType}, but current type is ${typeof value})`}
      type='warning'
    />
  );
};
```

```js
import { Alert } from 'antd';
import { jsx as _jsx } from 'react/jsx-runtime';
export const FieldValueWarning = () => {
  return /*#__PURE__*/ _jsx(Alert, {
    message: `(The type of this form field value should be ${expectedType}, but current type is ${typeof value})`,
    type: 'warning',
  });
};
```

```js
export const FieldValueWarning = () => {
  if (typeof value === expectedType) return null;
  return /*#__PURE__*/ React.createElement(Alert, {
    message: `(The type of this form field value should be ${expectedType}, but current type is ${typeof value})`,
    type: 'warning',
  });
};
```
