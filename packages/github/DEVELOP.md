# Develop

## Install

```
npm i
```

## Test

```sh
npm test -- --watch
```

Test with real world token

```sh
GH_TOKEN=ghp_123 npm run tt
```

## Build

```sh
npm run build
```

## Publish

**Not use it, except reasons:**

- Only for testing
- Only want to publish this package except other packages like `@db-man/components` (because leran will publish all packages)

**Please use `lerna` in root dir to publish the package**

Start to publish (Change `ghp_123` to your GitHub personal access token)

```sh
GH_TOKEN=ghp_123 npm run release
```
