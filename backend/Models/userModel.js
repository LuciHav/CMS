import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: '', // Default empty value for OTP
  },
  otpExpiresAt: {
    type: Date,
    default: Date.now, // Default to current time (won't expire immediately)
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetOtp: {
    type: String,
    default: '', // Default empty value for reset OTP
  },
  resetOtpExpiresAt: {
    type: Date,
    default: Date.now, // Default to current time (won't expire immediately)
  },
});

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
