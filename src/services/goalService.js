import { REALISTIC_GOALS } from '../data/mockData';

/**
 * Goal Service - Abstracts the API calls from the UI components.
 * In production, this uses fetch/axios to communicate with the Node.js backend.
 */
class GoalService {
  constructor() {
    this.goals = [...REALISTIC_GOALS];
  }

  // GET /api/goals
  async getEmployeeGoals(employeeId) {
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.goals.filter(g => g.employeeId === employeeId || !g.employeeId));
      }, 400);
    });
  }

  // POST /api/goals/create
  async createGoal(goalData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validation simulate
        if (!goalData.title || !goalData.weightage) {
          reject(new Error('Title and Weightage are required'));
          return;
        }

        const newGoal = {
          id: Date.now(),
          ...goalData,
          progress: 0,
          status: 'Draft',
          lifecycle: 'Draft',
          isApproved: false
        };
        
        this.goals.push(newGoal);
        resolve(newGoal);
      }, 500);
    });
  }

  // PUT /api/goals/approve/:id
  async approveGoal(goalId, managerComment) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex > -1) {
          this.goals[goalIndex] = {
            ...this.goals[goalIndex],
            status: 'On Track',
            lifecycle: 'Approved',
            isApproved: true,
            managerComment
          };
          resolve(this.goals[goalIndex]);
        }
      }, 300);
    });
  }

  // PUT /api/goals/checkin/:id
  async submitCheckin(goalId, actualAchievement, computedProgress) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex > -1) {
          this.goals[goalIndex] = {
            ...this.goals[goalIndex],
            actual: actualAchievement,
            progress: computedProgress
          };
          resolve(this.goals[goalIndex]);
        }
      }, 300);
    });
  }
}

export const goalService = new GoalService();
