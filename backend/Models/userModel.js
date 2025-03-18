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
    default: () => Date.now() + 15 * 60 * 1000, // Set OTP expiry to 15 minutes from now
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
    default: () => Date.now() + 15 * 60 * 1000, // Set reset OTP expiry to 15 minutes from now
  },
});

const UserModel = mongoose.models.user || mongoose.model("user", userSchema);

export default UserModel;
