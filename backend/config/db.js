import mongoose from "mongoose";

let isConnected = false; 

const connectDb = async () => {
  // Disable buffering so we don't get the 10s timeout error
  // Instead, queries will fail immediately if not connected
  mongoose.set("bufferCommands", false);

  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const url = process.env.MONGODB_URL || process.env.MONGODB_URI;

    if (!url) {
      throw new Error("Connection string (MONGODB_URL/MONGODB_URI) not found!");
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    const conn = await mongoose.connect(url, options);
    
    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB CONNECTION ERROR:", error.message);
    isConnected = false;
    throw error; // Rethrow so the middleware knows it failed
  }
};

export default connectDb;