import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  // Check if mongoose already has an active or connecting state
  if (mongoose.connection.readyState !== 0) {
    return; 
  }
  // Prevent multiple server instances from running
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  }
};

/**
 * Drop database, close all connections, and stop the server.
 */
module.exports.closeDatabase = async () => {
  if (mongod) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  }
};

/**
 * Remove all data from all collections between tests.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports.getModel = (name, schema) => {
  return connection.model(name, schema);
};