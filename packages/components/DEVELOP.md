# Develop

## Start develop

```
npm i
npm run dev
npm run tdd
```

## Run cypress test

```sh
npx cypress run
```

## Publish

```
npm run release
```

## Publish (with lerna)

```sh
CI=true lerna run test-cra --scope @db-man/components
lerna run build  --scope @db-man/components
git add . && git commit -m 'Build' && git push
lerna publish --no-private # will include `lerna version patch --no-private -y`
```

## Preview demos

- http://localhost:3000/ - The whole App example
- http://localhost:3000/demos - Other examples
- http://localhost:3000/?example=dbconnections - Access example one by one

## Test build results

```sh
npm run build
```

Then check the generated files in `dist` dir. For example `dist/components/FormValidation.js`, the content should be like this:

```js
import { Alert } from 'antd';
import { jsx as _jsx } from 'react/jsx-runtime';
export const FieldValueWarning = ({ expectedType, value }) => {
  if (typeof value === expectedType) return null;
  return /*#__PURE__*/ _jsx(Alert, {
    message: `(The type of this form field value should be ${expectedType}, but current type is ${typeof value})`,
    type: 'warning',
  });
};
```

## FAQ

- Why `dist` dir should be pushed to repo?
  - Because in github.com/db-man/db-man.github.io, it depends current package from direct GitHub repo like this: `... "dependencies": { "@db-man/components": "github:db-man/components", ...`
