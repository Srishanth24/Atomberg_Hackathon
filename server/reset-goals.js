import mongoose from 'mongoose';
import Goal from './models/Goal.js';

await mongoose.connect('mongodb://localhost:27017/goalsync');
const result = await Goal.deleteMany({});
console.log(`✓ Deleted ${result.deletedCount} goals`);
await mongoose.disconnect();
process.exit(0);
