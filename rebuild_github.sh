# After changing @db-man/github source code
# run this script to update the package in the components package

npx lerna run build --scope @db-man/github # build ts to js (in dist dir)
npm i # install the changed @db-man/github dependency
rm -rf packages/components/node_modules/.cache # remove create-react-app cache