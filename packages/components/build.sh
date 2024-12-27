#!/bin/bash -ex

# Cannot call `./build.sh` directly, otherwise you will see an error "tsc: command not found"
# Instead, call `npm run build` to run this script

rm -rf dist
babel src --out-dir dist --extensions '.ts,.tsx,.js,.jsx,.snap' --copy-files --ignore 'src/**/*.js.snap,src/index.tsx' --no-copy-ignored --source-maps

# lib
rm -rf lib
babel src --out-dir lib --env-name commonjs --extensions '.js,.jsx,.ts,.tsx' --copy-files --ignore 'src/**/*.js.snap,src/index.tsx'

# es
rm -rf es
babel src --out-dir es --env-name es --extensions '.js,.jsx,.ts,.tsx' --copy-files --ignore 'src/**/*.js.snap,src/index.tsx'

# gen types in lib/ dir
tsc