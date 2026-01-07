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
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for serverless cold starts
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Use IPv4, skip trying IPv6
    });

    cachedConnection = connection;

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    return connection;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
    });
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

