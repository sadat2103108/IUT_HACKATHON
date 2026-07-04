import { sendDiscordMessage } from '../bot/index.js';

export async function dispatchDiscordAlert(alert) {
  if (!alert) return;

  const message = `🚨 ${alert.title}\n${alert.message}`;
  await sendDiscordMessage(message);
}
