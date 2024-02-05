# db-man

## Develop

```sh
lerna bootstrap # install all dependencies (npm install)
lerna run build # build all packages (github+components)
lerna run dev --scope @db-man/components # start dev env
```

### How to debug @db-man/github in @db-man/components

After @db-man/github changed source code, will need this affects @db-man/components.

```sh
lerna run build --scope @db-man/github # build ts to js (in dist dir)
lerna bootstrap # install the changed @db-man/github dependency
```

## Publish

```sh
lerna publish --no-private
```
