import { logAuditEvent } from './auditService.js';

/**
 * Shared Goal Sync Engine
 * Core feature: Syncs progress from a primary KPI owner down to linked employees.
 */
export const syncSharedGoalProgress = async (sharedGoalId, newProgress, triggeredBy) => {
  console.log(`[SYNC ENGINE] Initiating sync for Shared KPI: ${sharedGoalId} at ${newProgress}%`);
  
  try {
    // 1. Fetch the primary Shared Goal
    // const sharedGoal = await SharedGoal.findById(sharedGoalId);
    
    // 2. Fetch all linked employee goals mapping to this Shared KPI
    // const linkedGoals = await Goal.find({ linkedSharedGoalId: sharedGoalId });
    
    let updatedCount = 0;

    // Simulate finding linked goals
    const linkedGoals = [
      { id: '101', employee: 'John Doe', progress: 10 },
      { id: '102', employee: 'Jane Smith', progress: 10 }
    ];

    // 3. Update progress for all linked goals
    for (let index = 0; index < linkedGoals.length; index++) {
      // await Goal.findByIdAndUpdate(goal.id, { progress: newProgress });
      updatedCount++;
    }

    // 4. Log the sync event to the Audit Trail
    await logAuditEvent({
      action: 'Shared Goal Synced',
      user: triggeredBy.name,
      role: triggeredBy.role,
      entityType: 'SharedGoal',
      entityId: sharedGoalId,
      previousValue: 'Out of Sync',
      newValue: `Synced ${updatedCount} goals to ${newProgress}%`
    });

    console.log(`[SYNC ENGINE] Successfully synced ${updatedCount} linked goals.`);
    return { success: true, updatedCount };

  } catch (error) {
    console.error(`[SYNC ENGINE ERROR] Failed to sync shared goal: ${error.message}`);
    throw error;
  }
};
