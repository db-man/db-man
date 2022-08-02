# DOC

## Column definition

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
### `type` (Optional)

Fill "STRING" or "STRING_ARRAY".

### `primary`

Only one column in table should have this field.
`true` to indicate this column is an uniq key of this table.

### `placeholder`

Only used in CreatePage or UpdatePage, only used in Input component (of type=STRING).

### `enum`

```json
{
  "id": "vehicleType",
  "name": "Vehicle Type",
  "type": "string",
  "enum": ["car", "bike"]
}
```

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

* .github/workflows/merge.yml - https://github.com/db-man/split-table-db/blob/main/.github/workflows/merge.yml
* .github/workflows/split.yml - https://github.com/db-man/split-table-db/blob/main/.github/workflows/split.yml
* merge.mjs - https://github.com/db-man/split-table-db/blob/main/merge.mjs
* split.mjs - https://github.com/db-man/split-table-db/blob/main/split.mjs
* cli/utils.mjs - https://github.com/db-man/split-table-db/blob/main/cli/utils.mjs