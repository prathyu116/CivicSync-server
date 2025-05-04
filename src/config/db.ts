import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in .env file");
  process.exit(1); 
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    const error = err as Error; 
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;