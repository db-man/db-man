# cli

How to get api key and access token from Google:

1. Go to https://developers.google.com/photos/library/reference/rest/v1/albums/list
2. Click "Execute" button.
3. Check the "/v1/albums" API endpoint in the DevTools Network tab
4. The "key" in the query string is `API_KEY` in env var
5. The "Authorization" header is `ACCESS_TOKEN` in env var

How to run script

```bash
API_KEY=AI...TM ACCESS_TOKEN=ya...2Q ALBUM_TITLE="Test for API" npx @db-man/google
```

## Options

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
