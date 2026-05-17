import mongoose from 'mongoose';

const escalationSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  triggerType: { 
    type: String, 
    enum: ['Missing Goals', 'Pending Approval', 'Overdue Check-in'],
    required: true
  },
  daysOverdue: { type: Number, required: true },
  level: { 
    type: Number, 
    enum: [1, 2, 3], 
    required: true,
    index: true
  },
  severity: { type: String, enum: ['info', 'warning', 'danger'], index: true },
  status: { type: String, default: 'Active', index: true },
  resolvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Escalation || mongoose.model('Escalation', escalationSchema);
