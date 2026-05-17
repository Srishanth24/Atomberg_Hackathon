import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  year: { type: Number, required: true },
  actualAchievement: { type: mongoose.Schema.Types.Mixed, required: true },
  computedProgress: { type: Number, required: true }, // Auto-computed using UoM rules
  employeeNotes: { type: String },
  managerFeedback: { type: String },
  status: { 
    type: String, 
    enum: ['Not Started', 'On Track', 'Behind', 'Completed'] 
  }
}, { timestamps: true });

export default mongoose.models.Checkin || mongoose.model('Checkin', checkinSchema);
