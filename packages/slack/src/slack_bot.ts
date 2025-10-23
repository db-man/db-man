/**
 * Path: src/slack_bot.ts
 * Description:
 *   Send a message to a Slack channel using Slack bot
 * Usage:
 *   sendSlackMsg('#hello-world', 'Hello, World!');
 *
 * Slack Bot API:
 * ```sh
 * curl -X POST \
 *   -H 'Authorization: Bearer xoxb-###-###-***' \
 *   -H 'Content-type: application/json' \
 *   --data '{"channel": "#pi-train-signals","text":"Hello, World!"}' \
 *   https://slack.com/api/chat.postMessage
 * ```
 */

import axios from 'axios';

/**
 * Send message to Slack channel
 * @param {string} channel - Slack channel (e.g., '#pi-train-signals')
 * @param {string} msg - Message to send
 *
 * Note: To disable Slack notifications, simply don't set DBM_SLACK_BOT_OAUTH_TOKEN
 *       To enable, set: export DBM_SLACK_BOT_OAUTH_TOKEN=xoxb-your-token
 */
export const sendSlackMsg = (channel: string, msg: string) => {
  const token = process.env.DBM_SLACK_BOT_OAUTH_TOKEN;
  if (!token) {
    console.warn(
      'Slack notifications disabled (DBM_SLACK_BOT_OAUTH_TOKEN not set)'
    );
    return;
  }

  const data = {
    channel: channel,
    text: msg,
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  axios
    .post('https://slack.com/api/chat.postMessage', data, { headers })
    .then((response) => {
      console.log('Slack message sent successfully:', response.data);
    })
    .catch((error) => {
      console.error('Error sending Slack message:', error);
    });
};

export const authTest = () => {
  const token = process.env.DBM_SLACK_BOT_OAUTH_TOKEN;
  if (!token) {
    console.warn(
      'Slack notifications disabled (DBM_SLACK_BOT_OAUTH_TOKEN not set)'
    );
    return;
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  axios
    .post('https://slack.com/api/auth.test', { token }, { headers })
    .then((response) => {
      console.log('Slack authentication test successful:', response.data);
    })
    .catch((error) => {
      console.error('Error testing Slack authentication:', error);
    });
};

/**
 * Debug:
 * ```sh
 * DBM_SLACK_BOT_OAUTH_TOKEN=xoxb-###-###-*** npx tsx src/slack_bot.ts --auth-test
 * DBM_SLACK_BOT_OAUTH_TOKEN=xoxb-###-###-*** npx tsx src/slack_bot.ts
 * ```
 */
if (require.main === module) {
  const options = process.argv.slice(2);
  if (options.includes('--auth-test')) {
    authTest();
  } else {
    sendSlackMsg('#general', 'Hello, World!');
  }
}
