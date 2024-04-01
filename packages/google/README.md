# cli

How to get api key and access token from Google:

1. https://developers.google.com/photos/library/reference/rest/v1/albums/list
2. Click "Execute" button
3. Check the "/v1/albums" API endpoint in the DevTools Network tab
4. The "key" in the query string is `API_KEY` in .env
5. The "Authorization" header is `ACCESS_TOKEN` in .env
