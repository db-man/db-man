#!/bin/bash -ex

# test the package
CI=true npm run test-cra

# build the package
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