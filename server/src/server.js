import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import escalationRoutes from './routes/escalationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import sharedGoalRoutes from './routes/sharedGoalRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import cycleRoutes from './routes/cycleRoutes.js';
import hierarchyRoutes from './routes/hierarchyRoutes.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditLog } from './middleware/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(auditLog);

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shared-goals', sharedGoalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cycle-settings', cycleRoutes);
app.use('/api/org-hierarchy', hierarchyRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
