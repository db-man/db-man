# DOC

## Table of content

<!-- toc -->

## Database connections

| key | owner  | token | repo           | path | modes       |
| --- | ------ | ----- | -------------- | ---- | ----------- |
| 1   | db-man | ...   | db             | dbs  |             |
| 2   | db-man | ...   | split-table-db | dbs  | split-table |

When a database is set `split-table`, when update a table record, will only update the table record file, not the whole table file.

## Database structure

- dbs/iam/columns.json All tables in this database, and all columns in each table
- dbs/iam/users.data.json Table data file
- dbs/iam/users/\*.json Table record files. These files are split from `users.data.json` file. (Only in `split-table` mode)

## Table definition

Table is defined in `columns.json` file.

See `src/types/DbTable.ts`

An example:

```json
{
  "name": "users",
  "columns": [
    { "id": "userId", "name": "User ID", "primary": true },
    { "id": "name", "name": "Name" },
    { "id": "age", "name": "Age", "type": "NUMBER" },
    { "id": "active", "name": "Active", "type": "BOOL" },
    { "id": "tags", "name": "Tags", "type": "STRING_ARRAY" },
    {
      "id": "notes",
      "name": "Notes",
      "type": "STRING",
      "type:createUpdatePage": "TextArea"
    }
  ],
  "large": true
}
```

## Column definition

See `src/types/Column.ts`

An example:

```json
{
  "id": "userId",
  "name": "User ID",
  "type": "string",
  "primary": true
}
```

### `id` (Required)

### `name` (Required)

### `type` (Required)

See `src/types/Column.ts::DbColumnType`

### `primary`

See `src/types/Column.ts`

### `placeholder`

See `src/types/Column.ts::ColumnPlaceholder`

### `enum`

See `src/types/Column.ts::RadioGroupUiTypeEnum`

### `ui:presets`

See `src/types/Column.ts::Column`

### `type:listPage`

#### Hide this column

Set `HIDE` will hide this column in table.

```json
{
  "id": "product_id",
  "type:listPage": "HIDE"
}
```

#### Custom UI component

On list page, choose the UI component to use for this column.

Below is an example of using `ImageLink` component. The string after "ImageLink" is a template (Handlebars).
It will transform the `record` which passing from antd `Table` component, into a props object like `{url:'',imgSrc:''}`.
This props will pass to `ImageLink` component.

```json
{
  "id": "product_id",
  "type:listPage": [
    "ImageLink",
    "{\"url\":\"https://brickset.com/{{record.product_id}}-1\",\"imgSrc\":\"https://img.brickset.com/{{record.product_id}}-1.jpg\"}"
  ]
}
```

## Split table

- .github/workflows/merge.yml - https://github.com/db-man/split-table-db/blob/main/.github/workflows/merge.yml
- .github/workflows/split.yml - https://github.com/db-man/split-table-db/blob/main/.github/workflows/split.yml
- merge.mjs - https://github.com/db-man/split-table-db/blob/main/merge.mjs
- split.mjs - https://github.com/db-man/split-table-db/blob/main/split.mjs
- cli/utils.mjs - https://github.com/db-man/split-table-db/blob/main/cli/utils.mjs

## Database examples

- [https://github.com/db-man/db](https://github.com/db-man/db)
- [https://github.com/db-man/split-table-db](https://github.com/db-man/split-table-db)

## Glossary

```json
{
  "id": "product_id",
  "type:listPage": [
    "ImageLink",
    "{\"url\":\"https://brickset.com/{{record.product_id}}-1\",\"imgSrc\":\"https://img.brickset.com/{{record.product_id}}-1.jpg\"}"
  ]
}
```

- `"type:listPage"` - render key
- `["ImageLink","{\"url\":\"http://a.com/{{record.id}}\",\"imgSrc\":\"http://b.com/{{record.name}}.jpg\"}"]` - render expression
  - `ImageLink` - render expression built-in function name
  - `"{\"url\":\"http://a.com/{{record.id}}\",\"imgSrc\":\"http://b.com/{{record.name}}.jpg\"}"]` - render expression function template
