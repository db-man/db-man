/**
 * Path: src/slack_webhook.ts
 * Description:
 *   Send a message to a Slack channel using webhook
 * Usage:
 *   sendSlackMsgWebhook('Hello, World!');
 *
 * Slack Webhook API:
 * ```sh
 * curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/<slack_workspace>/<channel>/<token>
 * ```
 */

import axios from 'axios';

/**
 * Send message to Slack channel using webhook
 * @param {string} msg - Message to send
 *
 * Note: To disable Slack notifications, simply don't set DBM_SLACK_WEBHOOK_URL
 *       To enable, set: export DBM_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
 */
export const sendSlackMsgWebhook = (msg: string) => {
  const url = process.env.DBM_SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn(
      'Slack notifications disabled (DBM_SLACK_WEBHOOK_URL not set)'
    );
    return;
  }

  const data = {
    text: msg,
  };

  axios
    .post(url, data)
    .then((response) => {
      console.log('Slack message sent successfully:', response.data);
    })
    .catch((error) => {
      console.error('Error sending Slack message:', error);
    });
};

/**
 * Debug:
 * ```sh
 * DBM_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/<slack_workspace>/<channel>/<token> npx tsx src/slack_webhook.ts
 * ```
 */
if (require.main === module) {
  sendSlackMsgWebhook('Hello, World!');
}
