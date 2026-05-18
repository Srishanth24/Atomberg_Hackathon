import mongoose from 'mongoose';

const sharedGoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thrustArea: { type: String },
  uom: { type: String, required: true },
  target: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Typically Dept Head or Admin
  assignedDepartments: [{ type: String }],
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  primaryOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  globalProgress: { type: Number, default: 0 } // Computed average of all linked employee goals
}, { timestamps: true });

export default mongoose.models.SharedGoal || mongoose.model('SharedGoal', sharedGoalSchema);
