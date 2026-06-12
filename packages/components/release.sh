#!/bin/bash -ex

# test the package
CI=true npm run test-cra

# build the package
export REACT_APP_DBM_BUILD_DATE=$(date -u +'%Y-%m-%d %H:%M:%S UTC')
npm run build
git add .
git commit -m 'Build'

# bump the version
npm version patch
# push changes in package.json
git push
# push git tags
git push --tags

npm publish --access=public