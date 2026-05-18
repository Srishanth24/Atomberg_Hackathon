import Notification from '../models/Notification.js';

const getTeamsWebhookUrl = () => process.env.TEAMS_WEBHOOK_URL || process.env.MS_TEAMS_WEBHOOK_URL || '';

const buildTeamsCard = ({ title, message, type, linkData, userId }) => ({
  '@type': 'MessageCard',
  '@context': 'https://schema.org/extensions',
  themeColor: type === 'approval' ? '2E7D32' : type === 'escalation' ? 'C62828' : type === 'shared_update' ? '1565C0' : 'ED6C02',
  summary: title,
  title,
  text: message,
  sections: [
    {
      facts: [
        { name: 'Notification Type', value: type },
        { name: 'Target User', value: userId },
      ],
      markdown: true,
    },
  ],
  potentialAction: linkData ? [
    {
      '@type': 'OpenUri',
      name: 'Open related item',
      targets: [{ os: 'default', uri: linkData }],
    },
  ] : [],
});

const sendTeamsNotification = async (notification) => {
  const webhookUrl = getTeamsWebhookUrl();
  if (!webhookUrl) return;

  const teamsResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildTeamsCard(notification)),
  });

  if (!teamsResponse.ok) {
    throw new Error(`Teams webhook failed with status ${teamsResponse.status}`);
  }
};

/**
 * Enterprise Notification Service
 * Dispatches in-app notifications to target users for key workflow events.
 */
export const dispatchNotification = async ({ userId, type, title, message, linkData }) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      linkData
    });

    await notification.save();
    await sendTeamsNotification({ userId, type, title, message, linkData });

    console.log(`[NOTIFICATION DISPATCHED] To User: ${userId} | Type: ${type} | ${title}`);

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Failed to dispatch notification:', error);
    // Notification failure shouldn't crash the calling function
  }
};
