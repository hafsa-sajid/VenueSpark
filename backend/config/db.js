import mongoose from "mongoose";

const connectDb = async () => {
  try {
    // Check karein aapki .env file mein 'MONGODB_URL' hi likha hai na? 
    // Agar wahan MONGODB_URI hai toh niche line change kar dein.
    const url = process.env.MONGODB_URL || process.env.MONGODB_URI;

    if (!url) {
      console.error("❌ ERROR: Connection string (MONGODB_URL) not found in .env file!");
      return; // Crash karne ke bajaye sirf return karein taaki error message dikhe
    }

    const conn = await mongoose.connect(url);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`- Database Name: ${conn.connection.name}`); 
  } catch (error) {
    console.error("❌ DB CONNECTION ERROR DETAILS:", error.message);
    if (error.message.includes("ENOTFOUND")) {
      console.error("👉 TIP: This is often a DNS issue. Try using a standard connection string (mongodb:// instead of mongodb+srv://) or change your system DNS to 8.8.8.8.");
    }
  }
};

export default connectDb;