# Cannot call `./build.sh` directly, otherwise you will see an error "tsc: command not found"
# Instead, call `npm run build` to run this script

rm -rf dist
babel src --out-dir dist --extensions '.ts,.tsx,.js,.jsx,.snap' --copy-files --ignore 'src/**/*.js.snap,src/index.tsx' --no-copy-ignored --source-maps
tsc