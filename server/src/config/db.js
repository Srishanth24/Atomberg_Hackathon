import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required to start the API server.');
  }

  // Atlas mongodb+srv URLs depend on DNS SRV lookups. Some campus/ISP DNS
  // resolvers time out on SRV records, so prefer public resolvers for Node.
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};
