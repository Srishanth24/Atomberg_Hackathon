import mongoose from 'mongoose';

const cycleSettingSchema = new mongoose.Schema({
  activeCycle: { type: String, required: true, default: 'FY2026' },
  phase: { type: String, required: true, default: 'Goal Setting' },
  isGoalSettingOpen: { type: Boolean, default: true },
  q1Window: { type: String, default: 'July' },
  q2Window: { type: String, default: 'October' },
  q3Window: { type: String, default: 'January' },
  q4Window: { type: String, default: 'March-April' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.CycleSetting || mongoose.model('CycleSetting', cycleSettingSchema);