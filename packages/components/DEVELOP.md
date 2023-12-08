# Develop

## Start develop

```
npm i
npm run dev
```

## Publish

```
npm run release
```

## Preview demos

- http://localhost:3000/ - The whole App example
- http://localhost:3000/demos - Other examples
- http://localhost:3000/?example=dbconnections - Access example one by one

## FAQ

- Why `dist` dir should be pushed to repo?
  - Because in github.com/db-man/db-man.github.io, it depends current package from direct GitHub repo like this: `... "dependencies": { "@db-man/components": "github:db-man/components", ...`
