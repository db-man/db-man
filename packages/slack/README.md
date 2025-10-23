# slack

Prepare env var:

```
# Send message using Incoming Webhooks to a specific Slack channel - https://api.slack.com/apps/<app_id>/incoming-webhooks
DBM_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/<slack_workspace>/<channel>/<token>
# Send message using Slack bot/app - OAuth & Permissions - https://api.slack.com/apps/<app_id>/oauth
DBM_SLACK_BOT_OAUTH_TOKEN=xoxb-###-###-***
```

```js
import { sendSlackMsg } from '@db-man/slack';
sendSlackMsg('#hello-world', 'Hello, World!');
```
