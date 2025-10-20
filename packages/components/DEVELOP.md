# Develop

## Start develop

```
npm i
npm run dev
npm run tdd
npm run tdd src/pages/DbTablePage/helpers.test.ts
```

## Run tests

### Run unit tests

```sh
npm run test
```

### Run cypress test

Create GitHub personal access token for `CYPRESS_DBM_GH_TOKEN`.
In the Cypress source code, will use `Cypress.env('DBM_GH_TOKEN')` to get this token.

```sh
CYPRESS_DBM_GH_TOKEN=ghp_123 npx cypress run # run all tests
CYPRESS_DBM_GH_TOKEN=ghp_123 npx cypress open # open cypress GUI for debugging
```

## Build

```sh
npm run build
```

## Publish

Publish (deprecated, check out `DEVELOP.md` in root dir)

```sh
npm run release
```

Publish (with lerna) (deprecated, check out `DEVELOP.md` in root dir)

```sh
CI=true lerna run test-cra --scope @db-man/components
lerna run build  --scope @db-man/components
git add . && git commit -m 'Build' && git push
lerna publish --no-private # will include `lerna version patch --no-private -y`
```

## Preview demos

- http://localhost:3000/ - The whole App example
- http://localhost:3000/demos - Other examples
  - http://localhost:3000/demos/RadioGroup - demo for one component
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
- Why has `eslint-config-react-app` in `devDependencies`?
  - Acutally `react-script` already has this package as `dependencies`, but npm workspace didn't support it very well, so if not install it in `devDependencies`, will see error `[eslint] Failed to load config "react-app" to extend from`. https://github.com/db-man/db-man/issues/7
