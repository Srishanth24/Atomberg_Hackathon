import express from 'express';
import Goal from '../../models/Goal.js';
import AuditLog from '../../models/AuditLog.js';
import { apiResponse } from '../../utils/responseFormatter.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { protect } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

// Helper to escape CSV cells
const escapeCSVCell = (value) => {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Helper to generate CSV
const generateCSV = (data, headers) => {
  const csvHeaders = headers.map(escapeCSVCell).join(',');
  const csvRows = data.map(row =>
    headers.map(header => escapeCSVCell(row[header])).join(',')
  ).join('\n');
  return `${csvHeaders}\n${csvRows}`;
};

// Helper to generate Excel HTML
const generateExcelHTML = (data, headers) => {
  const headerRow = `<tr>${headers.map(h => `<th style="background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ccc;">${String(h)}</th>`).join('')}</tr>`;
  const dataRows = data.map((row, idx) =>
    `<tr>${headers.map(header => `<td style="padding: 8px; border: 1px solid #ccc; background-color: ${idx % 2 === 0 ? '#f9f9f9' : 'white'}">${String(row[header] ?? '')}</td>`).join('')}</tr>`
  ).join('');

  return `<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body>
  <table>${headerRow}${dataRows}</table>
</body>
</html>`;
};

router.get('/achievement', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const goals = await Goal.find({})
    .populate('employeeId', 'name email department')
    .sort({ updatedAt: -1 });

  const reportData = goals.map(goal => ({
    employee: goal.employeeId?.name,
    email: goal.employeeId?.email,
    department: goal.employeeId?.department,
    goalTitle: goal.title,
    thrustArea: goal.thrustArea,
    plannedTarget: goal.target,
    actualAchievement: goal.actual ?? '',
    uom: goal.uom,
    progress: goal.progress,
    status: goal.status,
    weightage: goal.weightage,
  }));

  apiResponse(res, 200, 'Achievement report generated successfully', reportData);
}));

router.get('/achievement/export', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const format = req.query.format || 'csv'; // 'csv' or 'excel'

  const goals = await Goal.find({})
    .populate('employeeId', 'name email department')
    .sort({ updatedAt: -1 });

  const reportData = goals.map(goal => ({
    Employee: goal.employeeId?.name || 'N/A',
    Email: goal.employeeId?.email || 'N/A',
    Department: goal.employeeId?.department || 'N/A',
    'Goal Title': goal.title || 'N/A',
    'Thrust Area': goal.thrustArea || 'N/A',
    'Planned Target': goal.target || 'N/A',
    'Actual Achievement': goal.actual ?? 'N/A',
    UOM: goal.uom || 'N/A',
    'Progress %': goal.progress || 0,
    Status: goal.status || 'N/A',
    Weightage: goal.weightage || 'N/A',
  }));

  const headers = Object.keys(reportData[0] || {});

  if (format === 'excel') {
    const html = generateExcelHTML(reportData, headers);
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="achievement-report.xls"');
    res.send(html);
  } else {
    const csv = generateCSV(reportData, headers);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="achievement-report.csv"');
    res.send(csv);
  }
}));

router.get('/audit', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(200);
  apiResponse(res, 200, 'Audit logs fetched successfully', logs.map(log => ({
    id: log._id,
    action: log.action,
    user: log.user,
    role: log.role,
    entityType: log.entityType,
    previousValue: log.previousValue,
    updatedValue: log.newValue,
    timestamp: log.timestamp,
  })));
}));

router.get('/audit/export', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const format = req.query.format || 'csv'; // 'csv' or 'excel'

  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(500);

  const reportData = logs.map(log => ({
    Action: log.action || 'N/A',
    User: log.user || 'N/A',
    Role: log.role || 'N/A',
    'Entity Type': log.entityType || 'N/A',
    'Previous Value': log.previousValue || 'N/A',
    'Updated Value': log.newValue || 'N/A',
    Timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : 'N/A',
  }));

  const headers = Object.keys(reportData[0] || {});

  if (format === 'excel') {
    const html = generateExcelHTML(reportData, headers);
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log-report.xls"');
    res.send(html);
  } else {
    const csv = generateCSV(reportData, headers);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log-report.csv"');
    res.send(csv);
  }
}));

router.get('/export', protect, authorizeRoles('manager', 'admin'), asyncHandler(async (req, res) => {
  const goals = await Goal.find({}).populate('employeeId', 'name email department');
  apiResponse(res, 200, 'Report generated successfully', goals);
}));

export default router;
