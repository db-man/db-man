#!/bin/bash -ex

# Build source code to commonjs or es6

if [ "$1" = "commonjs" ]; then
  rm -rf dist
  # generate commonjs source code (*.ts to *.js) into `dist` folder
  # copy non-ts files to `dist` folder (TODO do we have non-ts files?)
  # generate source map files (*.ts to *.js.map) into `dist` folder
  babel src --out-dir dist --extensions '.ts,.js' --copy-files --source-maps
  # base on `tsconfig.json`, generate type definition files into `dist`` folder
  tsc
elif [ "$1" = "es6" ]; then
  rm -rf es6
  # generate es6 source code (*.ts to *.js) into `es6` folder
  tsc --declaration false --emitDeclarationOnly false --target es6 --module es6 --outDir es6
fi