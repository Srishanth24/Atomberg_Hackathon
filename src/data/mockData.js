// Mock Data Layer with Enterprise Realistic Data

export const DEPARTMENTS = [
  'Engineering & Technology',
  'Sales & Revenue',
  'Marketing & Comms',
  'Customer Success',
  'Human Resources',
  'Operations & Supply Chain',
  'Finance & Strategy'
];

export const MANAGERS = [
  { id: 'M1', name: 'Tony Stark', title: 'VP of Engineering', dept: 'Engineering & Technology' },
  { id: 'M2', name: 'Nick Fury', title: 'Director of Operations', dept: 'Operations & Supply Chain' },
  { id: 'M3', name: 'Pepper Potts', title: 'CFO', dept: 'Finance & Strategy' },
  { id: 'M4', name: 'Peggy Carter', title: 'VP of Sales', dept: 'Sales & Revenue' }
];

export const KPI_LIBRARY = [
  { id: 'KPI-1', title: 'Reduce Infrastructure Costs by 15%', uom: 'Min (Numeric / %)', target: 15 },
  { id: 'KPI-2', title: 'Increase Enterprise ARR', uom: 'Min (Numeric / %)', target: 2000000 },
  { id: 'KPI-3', title: 'Maintain Net Retention Rate > 120%', uom: 'Min (Numeric / %)', target: 120 },
  { id: 'KPI-4', title: 'Reduce Critical Bugs by 30%', uom: 'Max (Numeric / %)', target: 30 },
  { id: 'KPI-5', title: 'Zero Compliance Breaches', uom: 'Zero-based', target: 0 },
];

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
