import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const connectDB = async () => {
  try {
    const dbURL = process.env.MONGODB_URL;

    console.log(`🔗 Connecting to MongoDB at: ${dbURL.replace(/:\/\/.*@/, "://<hidden>:<hidden>@")}`);

    await mongoose.connect(dbURL);

    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
