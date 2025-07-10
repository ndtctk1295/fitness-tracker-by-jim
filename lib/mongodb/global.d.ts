import { MongoClient } from 'mongodb';

declare global {
  // This prevents TypeScript errors when accessing _mongoClientPromise on global
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
