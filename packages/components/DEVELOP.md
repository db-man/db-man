## dev

Dev

```
npm start
```

Publish

```
npm test --watchAll=false
npm run build
git add . && git commit -m 'Build'
npm version patch
git push && git push origin v0.1.2
npm publish --access=public
```