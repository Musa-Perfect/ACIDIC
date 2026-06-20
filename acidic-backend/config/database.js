const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI || typeof process.env.MONGODB_URI !== 'string') {
      throw new Error('MONGODB_URI is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error('Database connection error:', error);
    // In dev/smoke-test environments, allow API to start even without DB.
    // Endpoints that rely on Mongo will still fail, but the server will be reachable.
    return;
  }
};

module.exports = connectDatabase;