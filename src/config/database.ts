import mongoose from 'mongoose';

// Cache the connection to reuse in serverless environments
let cachedConnection: typeof mongoose | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    // If connection already exists and is ready, reuse it
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection');
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gbs-ecommerce';
    
    // Connection options optimized for serverless environments
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
    };

    cachedConnection = await mongoose.connect(mongoUri, options);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // In serverless, don't exit process, just throw error
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

export const ensureDatabaseConnection = async (): Promise<void> => {
  // Check if already connected (readyState: 1 = connected)
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  // If connecting (readyState: 2 = connecting), wait for it
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Database connection timeout'));
      }, 5000);
      
      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });
      
      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
  
  // Otherwise, connect (readyState: 0 = disconnected, 3 = disconnecting)
  await connectDatabase();
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

