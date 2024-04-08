# cli

How to get api key and access token from Google:

1. Go to https://developers.google.com/photos/library/reference/rest/v1/albums/list
2. Click "Execute" button.
3. Check the "/v1/albums" API endpoint in the DevTools Network tab
4. The "key" in the query string is `API_KEY` in env var
5. The "Authorization" header is `ACCESS_TOKEN` in env var

How to run script

```bash
API_KEY=AIzaSyBeo1NGA__U7Xxy-aBE6yFm10pgq8TY-TM ACCESS_TOKEN=ya20.a1Ad52N3-Yc1g0LtyvzGnzUxNKbLhFoRjaLiXSsE_oLjDo7gZMMxIukBVDnmahvHvlrKghM7BrqpTDxLDikDl7kuzEOZt0aZ-kafYV-B0_R-c8GwkYbyfCCs5nKJvt2uZXBrzEurbezKFP21_zs-XDF9e33vXnTRhoxlBX2VOpZGhnawaCgYKATQSARMSFQHGX2MiyXgyYbt_inVUM-O7qcorpQ0182Q ALBUM_TITLE="Test for API" npx ts-node cli/getAllInAlbum.ts
```
