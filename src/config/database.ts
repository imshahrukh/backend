import mongoose from 'mongoose';

// Cached connection for serverless optimization
let cachedConnection: typeof mongoose | null = null;

/**
 * Connect to MongoDB database
 * Optimized for serverless environments with connection caching
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Configure mongoose for serverless
    mongoose.set('strictQuery', false);

    // Connect with optimized settings for serverless
    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // Don't call process.exit in serverless environment
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cachedConnection = null;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  cachedConnection = null;
});

// Only handle SIGINT in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
}

