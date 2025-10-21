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
npm run tt
```

## Build

```sh
npm run build
```

## Publish

**Not use it, except reasons:**

- Only for testing
- Only want to publish this package except other packages like `@db-man/slack` (because leran will publish all packages)

**Please use `lerna` in root dir to publish the package**

Start to publish (Change `xoxb-###-###-***` to your Slack bot OAuth token)

```sh
DBM_SLACK_BOT_OAUTH_TOKEN=xoxb-###-###-*** npm run release
```
