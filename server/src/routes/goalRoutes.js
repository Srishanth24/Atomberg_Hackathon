import express from 'express';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', requireRole(['employee', 'manager', 'admin']), (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/', requireRole(['employee', 'manager', 'admin']), (req, res) => {
  res.json({ success: true, data: req.body });
});

export default router;
