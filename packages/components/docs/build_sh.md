# build.sh

One example of using the Babel CLI to compile the source code in the `src` directory to the `lib` directory.

```
babel src --out-dir lib --env-name commonjs --extensions '.js,.jsx,.ts,.tsx' --copy-files --ignore 'src/**/*.js.snap,src/index.tsx'
```

- Using `--env-name commonjs` to specify the environment name, which is defined in `.babelrc.js`.
- Using `--extensions '.js,.jsx,.ts,.tsx'` to specify the file extensions that Babel should compile.
  - No need to put `.json` (e.g. `renderFuncTpl.json`) here because Babel will ignore JSON files by default.
- Using `--copy-files` to copy files that are not compiled by Babel, e.g. `pages/demos/renderFuncTpl.json` or `layout/App.css`.

## Build results

- `dist/`: UMD build for maximum compatibility across different environments.
- `es/`: ES module build for modern JavaScript environments and bundlers.
- `lib/`: CommonJS module build for Node.js and other CommonJS environments.
