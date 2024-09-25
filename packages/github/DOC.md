# DOC

## Dirs

- `src` - source code
- `dist` - commonjs code
- `es6` - ES6 code

## Build to commonjs

```json
{
  "scripts": {
    "build": "rm -rf dist && babel src --out-dir dist --extensions '.ts,.js' --copy-files --source-maps && tsc"
  }
}
```

1. We use babel to build the typescript code to commonjs code.
2. We use tsc to generate the declaration file (`*.d.ts`)

## Build to ES6

```json
{
  "scripts": {
    "build:es6": "rm -rf es6 && tsc --declaration false --emitDeclarationOnly false --target es6 --module es6 --outDir es6"
  }
}
```

This build the original typescript code to ES6 code.

From

```typescript
export const formatDate = (d: Date) => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
```

To

```js
export function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
```

Why not use `tsconfig.json`, but put in command line options?
Because the `tsconfig.json` already used to generate the declaration file (`*.d.ts`)

## References

- https://www.typescriptlang.org/docs/handbook/compiler-options.html
