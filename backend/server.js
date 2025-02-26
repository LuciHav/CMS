import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRoutes from './routes/authroutes.js';


const app = express();

// Load environment variables (no need for require('dotenv').config(); because of "dotenv/config")
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/", (req, res) => {
  res.send("ff");
});

// Use the auth routes
app.use('/api/auth', authRoutes);  // Uncommented the auth routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is running. Open the link: http://localhost:${PORT}`);
});
