import AuditLog from '../models/AuditLog.js';

/**
 * Service to handle all audit logging throughout the application
 */
export const logAuditEvent = async ({ action, user, role, entityType, entityId, previousValue, newValue }) => {
  try {
    const logEntry = new AuditLog({
      action,
      user,
      role,
      entityType,
      entityId,
      previousValue,
      newValue
    });

    // In a real database, this would save to MongoDB
    // await logEntry.save();
    
    console.log(`[AUDIT] ${action} on ${entityType} by ${user} (${role})`);
    return logEntry;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Note: Do not throw error here, auditing failure should not break the main app flow
  }
};
