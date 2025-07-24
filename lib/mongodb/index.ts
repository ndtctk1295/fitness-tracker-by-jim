import { MongoClient } from 'mongodb';
import mongoose, { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToMongoDB(): Promise<Mongoose> {
  // Check for MongoDB URI when the function is called, not at module import time
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      // Mongoose-specific options
      bufferCommands: false, // Disable mongoose buffering
      
      // Connection Pooling Configuration
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
      
      // Connection Management
      retryWrites: true, // Retry write operations if they fail
      retryReads: true, // Retry read operations if they fail      // Compression
      compressors: ['zlib' as const], // Enable compression for better performance
      zlibCompressionLevel: 6 as const, // Compression level (1-9, higher = better compression)
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    
    // Connection Event Monitoring
    setupConnectionMonitoring(cached.conn);
    
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

function setupConnectionMonitoring(connection: Mongoose) {
  const db = connection.connection;
  
  // Connection established
  db.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Connection ready state: ${db.readyState}`);
  });
  
  // Connection error
  db.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  
  // Connection disconnected
  db.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
    cached.conn = null; // Reset cache on disconnect
  });
  
  // Connection reconnected
  db.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
  
  // Connection buffer full
  db.on('fullsetup', () => {
    console.log('📡 MongoDB replica set connected');
  });
}

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    readyState: number;
    host: string | undefined;
    name: string | undefined;
  };
}> {
  try {
    const connection = await connectToMongoDB();
    const db = connection.connection;
    
    return {
      status: db.readyState === 1 ? 'healthy' : 'unhealthy',
      details: {
        readyState: db.readyState,
        host: db.host,
        name: db.name,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        readyState: 0,
        host: undefined,
        name: undefined,
      },
    };
  }
}

export default connectToMongoDB;


export async function getMongoClient(): Promise<MongoClient> {
  const mongooseConnection = await connectToMongoDB();
  
  // Extract the underlying MongoDB client from Mongoose
  const client = mongooseConnection.connection.getClient();
  
  if (!client) {
    throw new Error('Failed to get MongoDB client from Mongoose connection');
  }
  
  return client;
}

// Create a promise that NextAuth can use
export const mongoClientPromise: Promise<MongoClient> = getMongoClient();