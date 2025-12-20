# Slack

## API - chat.postMessage

```sh
curl --location 'https://slack.com/api/chat.postMessage' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json; charset=utf-8' \
--data '{
    "channel": "#hello-world",
    "text": "Hello, World!"
}'
```

without `charset=utf-8` in `application/json; charset=utf-8` you will get below warnning:

```json
{
  ...
  "warning": "missing_charset", // This is the warning you will get
  "response_metadata": {
    "warnings": [
      "missing_charset" // This is the warning you will get
    ]
  }
}
```
