const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Please make sure MongoDB is running or update MONGODB_URI in .env file');
    console.log('For local MongoDB: mongodb://localhost:27017/assignment-portal');
    console.log('For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/assignment-portal');
    // Don't exit in development mode to allow testing frontend
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
