import Notification from '../models/Notification.js';

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

    // In production, save to database
    // await notification.save();

    console.log(`[NOTIFICATION DISPATCHED] To User: ${userId} | Type: ${type} | ${title}`);
    
    // Here we could also hook into external services like Microsoft Teams
    // e.g., await teamsService.sendAdaptiveCard(userId, title, message);

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Failed to dispatch notification:', error);
    // Notification failure shouldn't crash the calling function
  }
};
