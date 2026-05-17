import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import goalRoutes from './routes/goalRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditLog } from './middleware/audit.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(auditLog);

app.use('/api/goals', goalRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
