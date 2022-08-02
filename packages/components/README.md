# components

[![CI status][github-action-badge]][github-action-url] [![codecov][codecov-badge]][codecov-url]

[github-action-badge]: https://github.com/db-man/components/actions/workflows/test.yml/badge.svg
[github-action-url]: https://github.com/db-man/components/actions/workflows/test.yml
[codecov-badge]: https://codecov.io/gh/db-man/components/branch/main/graph/badge.svg
[codecov-url]: https://app.codecov.io/gh/db-man/components

A database portal to manage GitHub database.

A sample GitHub database: [https://github.com/db-man/db](https://github.com/db-man/db)

## How to use

```
npx create-react-app my-app
cd my-app
yarn add @db-man/components antd
```

Modify `src/App.jsx`

```jsx
import { App } from '@db-man/components'
import './App.css'
export default function () {
  return <App />
}
```

Add below 2 lines to top of `src/App.css`.

```css
@import '~@db-man/components/lib/layout/App.css';
@import '~antd/dist/antd.css';
```

## Topics

* [Table column definition](DOC.md)