# cli

## cli_getAllInAlbum

### How to get api key and access token from Google

1. Go to https://developers.google.com/photos/library/reference/rest/v1/albums/list, open DevTools
2. Click "Execute" button.
3. Check the "/v1/albums" API endpoint in the DevTools Network tab
4. The "key" in the query string is `API_KEY` in env var
5. The "Authorization" header is `ACCESS_TOKEN` in env var (remove "Bearer")

### How to run script

```bash
API_KEY=AI...TM ACCESS_TOKEN=ya...2Q ALBUM_TITLE="Test for API" npx @db-man/google
```
