import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed in production
  role: { 
    type: String, 
    enum: ['employee', 'manager', 'admin'], 
    default: 'employee' 
  },
  department: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  azureAdId: { type: String } // For Microsoft Entra ID mapping
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
