# db-man

Use GitHub as a database.

Features:

- Has a web portal to manage the database. ([packages/components](packages/components/README.md))
- Abstract the GitHub API to a database. ([packages/github](packages/github/README.md))
- Insights on the database. ([packages/insights](packages/insights/README.md))

Start a local server for development:

```sh
npm i
npm run build -w packages/github
npm run dev
```

Tutorial:

- How to create a new database. ([DOC](DOC.md))
