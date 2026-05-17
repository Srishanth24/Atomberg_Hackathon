import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cycle: { type: String, required: true }, // e.g., "Q3 2026"
  goalsSnapshot: [{ 
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    title: String,
    weightage: Number
  }],
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Returned'], 
    default: 'Pending' 
  },
  managerComment: { type: String },
  decisionDate: { type: Date }
}, { timestamps: true });

export default mongoose.models.Approval || mongoose.model('Approval', approvalSchema);
