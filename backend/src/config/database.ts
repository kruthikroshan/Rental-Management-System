import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental_db';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`🏠 Host: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    // Execute a simple query to test connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Database ping successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Database ping failed:', error);
    return false;
  }
};

export const initializeDatabase = connectDB;

export default connectDB;

