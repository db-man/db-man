# Develop

## Start develop

```
npm i
npm run dev
```

## Run cypress test

```sh
npx cypress run
```

## Publish

```
npm run release
```

## Publish (with lerna)

```sh
CI=true lerna run test-cra --scope @db-man/components
lerna run build  --scope @db-man/components
git add . && git commit -m 'Build' && git push
lerna publish --no-private # will include `lerna version patch --no-private -y`
```

## Preview demos

- http://localhost:3000/ - The whole App example
- http://localhost:3000/demos - Other examples
- http://localhost:3000/?example=dbconnections - Access example one by one

## FAQ

- Why `dist` dir should be pushed to repo?
  - Because in github.com/db-man/db-man.github.io, it depends current package from direct GitHub repo like this: `... "dependencies": { "@db-man/components": "github:db-man/components", ...`
