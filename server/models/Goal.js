import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  thrustArea: { 
    type: String, 
    enum: ['Revenue Growth', 'Customer Success', 'Product Development', 'Operational Excellence'] 
  },
  uom: { 
    type: String, 
    enum: ['Min (Numeric / %)', 'Max (Numeric / %)', 'Timeline', 'Zero-based'],
    required: true
  },
  target: { type: mongoose.Schema.Types.Mixed, required: true },
  weightage: { type: Number, required: true, min: 10, max: 100 },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'returned', 'locked'],
    default: 'draft',
    index: true
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  linkedSharedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'SharedGoal', index: true },
}, { timestamps: true });

// Compound index for querying specific employee's status efficiently
goalSchema.index({ employeeId: 1, status: 1 });

export default mongoose.models.Goal || mongoose.model('Goal', goalSchema);
