// Enterprise Mock Data Structure
// Provides highly realistic relational dummy data simulating a large-scale database.

export const DEPARTMENTS = [
  { id: 'DEPT-01', name: 'Engineering & Technology', head: 'M1', employeeCount: 145 },
  { id: 'DEPT-02', name: 'Sales & Revenue', head: 'M4', employeeCount: 89 },
  { id: 'DEPT-03', name: 'Marketing & Comms', head: 'M5', employeeCount: 34 },
  { id: 'DEPT-04', name: 'Customer Success', head: 'M6', employeeCount: 67 },
  { id: 'DEPT-05', name: 'Operations & Supply Chain', head: 'M2', employeeCount: 210 },
  { id: 'DEPT-06', name: 'Finance & Strategy', head: 'M3', employeeCount: 22 }
];

export const MANAGERS = [
  { id: 'M1', name: 'Tony Stark', title: 'VP of Engineering', email: 'tstark@company.com', deptId: 'DEPT-01', reports: 5 },
  { id: 'M2', name: 'Nick Fury', title: 'Director of Operations', email: 'nfury@company.com', deptId: 'DEPT-05', reports: 8 },
  { id: 'M3', name: 'Pepper Potts', title: 'Chief Financial Officer', email: 'ppotts@company.com', deptId: 'DEPT-06', reports: 3 },
  { id: 'M4', name: 'Peggy Carter', title: 'VP of Sales', email: 'pcarter@company.com', deptId: 'DEPT-02', reports: 12 }
];

export const EMPLOYEES = [
  { id: 'E1', name: 'Peter Parker', title: 'Senior Developer', managerId: 'M1', deptId: 'DEPT-01' },
  { id: 'E2', name: 'Natasha Romanoff', title: 'Account Executive', managerId: 'M4', deptId: 'DEPT-02' },
  { id: 'E3', name: 'Bruce Banner', title: 'Data Scientist', managerId: 'M1', deptId: 'DEPT-01' },
  { id: 'E4', name: 'Clint Barton', title: 'Operations Specialist', managerId: 'M2', deptId: 'DEPT-05' }
];

export const SHARED_KPIS = [
  { id: 'KPI-100', title: 'Reduce AWS Infrastructure Costs by 15%', uom: 'Min (Numeric / %)', target: 15, currentGlobalProgress: 12, deptId: 'DEPT-01', owner: 'M1' },
  { id: 'KPI-101', title: 'Achieve $5M in Enterprise ARR', uom: 'Min (Numeric / %)', target: 5000000, currentGlobalProgress: 3200000, deptId: 'DEPT-02', owner: 'M4' },
  { id: 'KPI-102', title: 'Zero Critical Compliance Breaches', uom: 'Zero-based', target: 0, currentGlobalProgress: 0, deptId: 'DEPT-06', owner: 'M3' },
  { id: 'KPI-103', title: 'Decrease Customer Churn to < 5%', uom: 'Max (Numeric / %)', target: 5, currentGlobalProgress: 4.2, deptId: 'DEPT-04', owner: 'M6' }
];

export const GOALS = [
  { id: 'G-1001', employeeId: 'E1', title: 'Migrate Legacy Database to Postgres', thrustArea: 'Infrastructure', target: '2026-11-30', actual: null, uom: 'Timeline', progress: 0, status: 'approved', weightage: 30, linkedSharedGoalId: 'KPI-100' },
  { id: 'G-1002', employeeId: 'E2', title: 'Close 5 Enterprise Deals in Q3', thrustArea: 'Revenue Growth', target: 5, actual: 2, uom: 'Min (Numeric / %)', progress: 40, status: 'locked', weightage: 40, linkedSharedGoalId: 'KPI-101' },
  { id: 'G-1003', employeeId: 'E1', title: 'Maintain 0 Severity-1 Outages', thrustArea: 'Operational Excellence', target: 0, actual: 0, uom: 'Zero-based', progress: 100, status: 'approved', weightage: 20, linkedSharedGoalId: null },
  { id: 'G-1004', employeeId: 'E1', title: 'Complete AWS Solutions Architect Cert', thrustArea: 'Team Building', target: '2026-08-15', actual: '2026-08-10', uom: 'Timeline', progress: 100, status: 'draft', weightage: 50, linkedSharedGoalId: null },
  { id: 'G-1005', employeeId: 'E3', title: 'Deploy Predictive ML Model Pipeline', thrustArea: 'Product Development', target: 100, actual: 80, uom: 'Min (Numeric / %)', progress: 80, status: 'returned', weightage: 100, linkedSharedGoalId: null }
];

export const APPROVAL_STATES = [
  { id: 'APP-01', employeeId: 'E3', managerId: 'M1', cycle: 'Q3 2026', status: 'Pending', submissionDate: '2026-05-15', totalWeightage: 100, goalCount: 1 },
  { id: 'APP-02', employeeId: 'E2', managerId: 'M4', cycle: 'Q3 2026', status: 'Approved', submissionDate: '2026-05-10', decisionDate: '2026-05-11', totalWeightage: 100, goalCount: 4 }
];

export const ESCALATIONS = [
  { id: 'ESC-001', employeeId: 'E1', managerId: 'M1', triggerType: 'Pending Approval', daysOverdue: 6, level: 2, severity: 'warning', status: 'Active' },
  { id: 'ESC-002', employeeId: 'E2', managerId: 'M4', triggerType: 'Overdue Check-in', daysOverdue: 14, level: 3, severity: 'danger', status: 'Escalated to HR' },
  { id: 'ESC-003', employeeId: 'E4', managerId: 'M2', triggerType: 'Missing Goals', daysOverdue: 2, level: 1, severity: 'info', status: 'Resolved' }
];

export const QUARTERLY_CHECKINS = [
  { id: 'CHK-001', goalId: 'G-1002', quarter: 'Q3', actualAchievement: 2, computedProgress: 40, status: 'Behind', employeeNotes: 'Deals stuck in legal review.', managerFeedback: 'Focus on pushing the Stark Ind. deal first.' },
  { id: 'CHK-002', goalId: 'G-1003', quarter: 'Q3', actualAchievement: 0, computedProgress: 100, status: 'On Track', employeeNotes: 'All systems stable.', managerFeedback: 'Great work maintaining 100% uptime.' }
];

export const ORG_ANALYTICS = {
  totalEmployees: 1245,
  adoptionRate: 94.2,
  cycle: 'Q3 2026',
  goalsLocked: 4230,
  averageProgress: 68.4,
  escalationCount: 23,
  departmentCompletion: [
    { dept: 'Engineering & Technology', completion: 78 },
    { dept: 'Sales & Revenue', completion: 65 },
    { dept: 'Marketing & Comms', completion: 82 },
    { dept: 'Customer Success', completion: 91 },
    { dept: 'Operations & Supply Chain', completion: 54 }
  ]
};

export const REALISTIC_GOALS = [
  { id: 101, title: 'Migrate legacy DB to Cloud', thrustArea: 'Infrastructure', target: '2026-11-30', actual: null, uom: 'Timeline', progress: 0, status: 'On Track', lifecycle: 'Approved', weightage: 30, isApproved: true, employeeId: 'E1' },
  { id: 102, title: 'Close 5 Enterprise Deals in Q3', thrustArea: 'Revenue Growth', target: 5, actual: 2, uom: 'Min (Numeric / %)', progress: 40, status: 'Behind', lifecycle: 'Approved', weightage: 40, isApproved: true, employeeId: 'E2' },
  { id: 103, title: 'Maintain 0 Severity-1 Outages', thrustArea: 'Operational Excellence', target: 0, actual: 0, uom: 'Zero-based', progress: 100, status: 'Completed', lifecycle: 'Approved', weightage: 20, isApproved: true, employeeId: 'E1' },
  { id: 104, title: 'Hire 3 Senior Developers', thrustArea: 'Team Building', target: 3, actual: 1, uom: 'Min (Numeric / %)', progress: 33, status: 'Draft', lifecycle: 'Draft', weightage: 10, isApproved: false, employeeId: 'E1' },
];

export const ESCALATION_DATA = [
  { id: 'ESC-001', employee: 'Peter Parker', manager: 'Tony Stark', dept: 'Engineering', daysOverdue: 6, level: 2, severity: 'warning', status: 'Pending Manager Action' },
  { id: 'ESC-002', employee: 'Natasha Romanoff', manager: 'Nick Fury', dept: 'Operations', daysOverdue: 14, level: 3, severity: 'danger', status: 'Escalated to HR' },
  { id: 'ESC-003', employee: 'Clint Barton', manager: 'Peggy Carter', dept: 'Sales & Revenue', daysOverdue: 2, level: 1, severity: 'info', status: 'Automated Employee Reminder' },
];
