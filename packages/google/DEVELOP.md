# DEVELOP

## cli_getAllInAlbum

### How to develop

```bash
API_KEY=AI...TM ACCESS_TOKEN=ya...2Q ALBUM_TITLE="Test for API" npx ts-node src/cli_getAllInAlbum.ts
```

### Script options

`WITH_FILE_TYPES=true` to include file types in the output

```bash
API_KEY=AI...TM ACCESS_TOKEN=ya...2Q ALBUM_TITLE="Test for API" WITH_FILE_TYPES=true npx @db-man/google
```

Without file types:

```json
[
  "IMG_20191001_123456.jpg",
  "IMG_20191001_123457.jpg",
  "IMG_20191001_123458.jpg"
]
```

With file types:

```json
[
  {
    "id": "AF...vw",
    "productUrl": "https://photos.google.com/...",
    "baseUrl": "https://lh3.googleusercontent.com/...",
    "mimeType": "image/jpeg",
    "mediaMetadata": {
      "creationTime": "2024-01-23T11:28:53Z",
      "width": "1376",
      "height": "442",
      "photo": {}
    },
    "filename": "IMG_20191001_123456.jpg"
  }
]
```
