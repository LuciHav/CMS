import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from '../config/nodemailer.js';


export const register = async (req, res) => {
  const { email, password } = req.body;

  // Validate the data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "failure", errors: errors.array() });
  }

  try {
    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "failure", message: "User with this email already exists!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user with the hashed password
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      isVerified: false,  // No need to handle OTP here
    });

    // Save the user to the database
    await newUser.save();

  


    // Create JWT token for the newly registered user
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token as a cookie only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ status: "failure", message: "Server error, please try again later." });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if the validation failed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "failure", errors: errors.array() });
  }

  try {
    // Find the user by email in the database
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "failure", msg: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: "failure", msg: "Invalid credentials" });
    }

    // Generate a JWT for authentication only if credentials are valid
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    // Set the token as a cookie only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    // Don't include token in the JSON response
    return res.status(200).json({
      status: "success",
      message: "Login successful"
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ status: "failure", message: "Server error, please try again later." });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the token by setting the cookie value to an empty string and maxAge to 0
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });

    res.status(200).json({
      status: "success",
      message: "You have successfully logged out."
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ status: "failure", message: "Server error during logout, please try again." });
  }
};


export const sendVerifyOtp = async (req, res) => {
  try {
    const { userID } = req.body;

    // Find the user by userID
    const user = await UserModel.findById(userID);
    
    // If user is already verified, return a response
    if (user.isVerified) {
      return res.status(400).json({
        status: "failure",
        message: "User is already verified.",
      });
    }

    // Generate a new OTP and its expiration time
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

    // Update the user with the new OTP and its expiration
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    
    // Save the updated user to the database
    await user.save();

    // Send the OTP to the user's email
    const emailSent = await sendEmail(
      user.email, // Send to the user's email
      "Verify Your Email - OTP",
      `Your OTP for verification is: ${otp}`,
      `<h3>Your OTP for verification: <b>${otp}</b></h3>`
    );

    if (!emailSent) {
      return res.status(500).json({
        status: "failure",
        message: "Error sending OTP. Please try again later.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email. Please verify your email.",
    });
  } catch (error) {
    console.error("Error during OTP sending:", error);
    res.status(500).json({
      status: "failure",
      message: "Server error, please try again later.",
    });
  }
};
export const verifyEmail = async (req, res) => {
  const { userID, otp } = req.body;

  if (!userID || !otp) {
    return res.status(400).json({ status: "failure", message: "User ID and OTP are required." });
  }

  try {
    // Find the user by ID
    const user = await UserModel.findById(userID);

    if (!user) {
      return res.status(404).json({ status: "failure", message: "User not found." });
    }

    // Check if the OTP has expired
    if (Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ status: "failure", message: "OTP has expired." });
    }

    // Check if the OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ status: "failure", message: "Invalid OTP." });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.otp = ''; // Clear OTP after successful verification
    user.otpExpiresAt = ''; // Clear OTP expiration time
    await user.save();

    // Send success response
    res.status(200).json({ status: "success", message: "Email verified successfully." });
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).json({ status: "failure", message: "Server error, please try again later." });
  }
};
// The function can be used as middleware or in a route handler to check authentication
export const isauthenticated = async (req, res, next) => {
  try {
    const { userId } = req.cookies; // Assuming you're storing the userId in the cookies

    // Check if userId exists in cookies
    if (!userId) {
      return res.status(401).json({
        status: "failure",
        message: "No user ID provided, user not authenticated.",
      });
    }

    // Fetch the user from the database based on userId from cookies
    const user = await User.findById(userId);

    // Check if user exists and if isVerified is true
    if (user && user.isVerified) {
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(401).json({
        status: "failure",
        message: "User is not verified, unauthorized login.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      message: "Error occurred while checking authentication.",
    });
  }
};


//send password otp



export const sendReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Check if the email exists in the database
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'failure', message: 'User not found.' });
    }

    // Step 2: Generate a reset token using crypto
    const resetToken = crypto.randomBytes(5).toString('hex');
    const resetTokenExpiresAt = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes

    // Step 3: Save the hashed token and expiration time in the database
    user.resetOtp = crypto.createHash('sha256').update(resetToken).digest('hex'); // Hash the token
    user.resetOtpExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Step 4: Send the reset token to the user's email
    const mailSubject = 'Password Reset Request';
    const mailBody = `
      <h3>Password Reset Request</h3>
      <p>You have requested to reset your password. Please use the following token:</p>
      <b>${resetToken}</b>
      <p>This token will expire in 15 minutes.</p>
    `;
   
    const emailSent = await sendEmail(
      user.email,  // The recipient's email
      mailSubject, // Subject of the email
      mailBody,    // The body of the email in HTML format
      mailBody     // Plain text version of the email body
    );

    if (!emailSent) {
      return res.status(500).json({ status: 'failure', message: 'Error sending reset email. Please try again later.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to your email. Please use it within 15 minutes.',
    });

  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).json({ status: 'failure', message: 'An error occurred. Please try again later.' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  // Check if all fields are provided
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ status: 'failure', message: 'Email, reset token, and new password are required.' });
  }

  try {
    // Step 1: Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'failure', message: 'User not found.' });
    }

    // Step 2: Check if the reset token exists and hasn't expired
    if (!user.resetOtp) {
      return res.status(400).json({ status: 'failure', message: 'No reset request found for this user.' });
    }

    // Check if the reset token has expired
    if (Date.now() > user.resetOtpExpiresAt) {
      return res.status(400).json({ status: 'failure', message: 'Reset token has expired.' });
    }

    // Step 3: Compare the provided reset token with the one stored in the database
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    if (user.resetOtp !== hashedResetToken) {
      return res.status(400).json({ status: 'failure', message: 'Invalid reset token.' });
    }

    // Step 4: Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Step 5: Update the password in the database
    user.password = hashedPassword;
    user.resetOtp = ''; // Clear the reset token
    user.resetOtpExpiresAt = ''; // Clear the reset token expiration
    await user.save();

    // Step 6: Send success response
    res.status(200).json({ status: 'success', message: 'Password has been successfully reset.' });

  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ status: 'failure', message: 'An error occurred while resetting the password. Please try again later.' });
  }
};