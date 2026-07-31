// //src/app/lib/checkout/Mongoose.ts
import mongoose, { ConnectOptions, Mongoose } from 'mongoose';
import { MongooseCache } from '@/types'; // Central types collection import

const MONGODB_URI = process.env.MONGODB_URI;
const PAYLOAD_MONGODB_URI = process.env.PAYLOAD_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// 🛡️ CRITICAL SECURITY GUARDRAIL: Ensures Cluster A and Cluster B never point to the same DB
if (PAYLOAD_MONGODB_URI && MONGODB_URI === PAYLOAD_MONGODB_URI) {
  throw new Error(
    'CRITICAL CONFIGURATION ERROR: MONGODB_URI (Transactions DB) and PAYLOAD_MONGODB_URI (Content DB) cannot point to the same database cluster. Strictly isolate database environments.'
  );
}

// Storing in a guaranteed non-nullable constant to satisfy compiler without using non-null assertion (!)
const databaseUri: string = MONGODB_URI;

// Global scope declaration to avoid No-Var compilation blocks and ensure dev persistence
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Strict fallback initialization of cache to avoid repeating optional/non-null syntax downstream
let cached: MongooseCache = globalThis.mongooseCache || { conn: null, promise: null };

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * @description Establishes a connection-pooled database connection dedicated 
 * STRICTLY to Database Cluster A (Transactions, Users, Sessions, Orders).
 * Engineered specifically to handle high-concurrency under serverless runtimes.
 * 
 * @returns {Promise<Mongoose>} Active Mongoose connection instance.
 */
async function connectMongoose(): Promise<Mongoose> {
  const readyState = mongoose.connection.readyState;

  // 🛡️ FIX: If connection is dead/disconnected (readyState 0) or disconnecting (readyState 3),
  // clear cache immediately to avoid entering the "Connection Black Hole"
  if (readyState === 0 || readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  // Reuse connection only if it is fully active (readyState 1 = Connected)
  if (cached.conn && readyState === 1) {
    return cached.conn;
  }

  // If connection promise does not exist, initialize a new connection attempt
  if (!cached.promise) {
    // 🛡️ FIX: Safe integer parsing fallback mechanisms to prevent NaN-based pool failures
    const parsedMax = process.env.MONGODB_MAX_POOL_SIZE 
      ? parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10) 
      : NaN;
    const maxPoolSize = !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : 10;
      
    const parsedMin = process.env.MONGODB_MIN_POOL_SIZE 
      ? parseInt(process.env.MONGODB_MIN_POOL_SIZE, 10) 
      : NaN;
    // Setting minPoolSize to 0 ensures idle Lambda containers release connections back to Atlas
    const minPoolSize = !isNaN(parsedMin) && parsedMin >= 0 ? parsedMin : 0;

    // =================================================================
    // 🔥 SERVERLESS HIGH-AVAILABILITY CONNECTION OPTIONS
    // =================================================================
    const opts: ConnectOptions = {
      bufferCommands: false,       // Fail fast on connection drop to prevent execution hangs
      maxPoolSize,                 // Maximum active connections allowed per container instance
      minPoolSize,                 // Releases connection holds when serverless context goes idle
      socketTimeoutMS: 45000,      // Purge hanging sockets
      connectTimeoutMS: 10000,     // Timeout execution attempts if connection handshake is sluggish
      maxIdleTimeMS: 270000,       // Matches Payload CMS setup: auto-close idle connections after 4.5 minutes
    };

    // Direct promise assignment to bypass redundant execution microtasks
    cached.promise = mongoose.connect(databaseUri, opts);
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset cache state on rejection so future incoming requests can trigger fresh connections
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default connectMongoose;