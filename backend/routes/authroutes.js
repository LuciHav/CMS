import express from 'express';
import { register, login, logout, sendVerifyOtp, verifyEmail, isauthenticated, sendReset,resetPassword }  from '../controllers/authController.js';
import Joi from 'joi';
import userAuth from '../Middlewares/userAuth.js';

const router = express.Router();

// Joi validation schema for Register
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters'
  })
});

// Joi validation schema for Login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email'
  }),
  password: Joi.string().required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required'
  })
});

// Register route
router.post('/register', async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  await register(req, res);
});

// Login route
router.post('/login', async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  await login(req, res);
});

// Logout route
router.post('/logout',userAuth, logout);
router.post('/send-verify-otp', userAuth,sendVerifyOtp);
router.post('/verify-account', userAuth,verifyEmail);
router.post('/is-auth', userAuth,isauthenticated);
router.post('/sendreset',sendReset);
const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required.',
      'string.email': 'Please provide a valid email address.',
    }),
    resetToken: Joi.string().required().messages({
      'string.empty': 'Reset token is required.',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.empty': 'New password is required.',
      'string.min': 'Password must be at least 8 characters long.',
    }),
    userID: Joi.string().optional()  // Allow userID to be an optional field
  });
  
  

  // Route for resetting password with validation using Joi
  router.post('/reset-password',  async (req, res, next) => {
    try {
      // Validate the request body using Joi
      const { error } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'failure',
          message: error.details[0].message,
        });
      }
  
      // If validation passes, call the resetPassword function directly
      await resetPassword(req, res);  // Call this once here
    } catch (err) {
      next(err);
    }
  });
  

export default router;
