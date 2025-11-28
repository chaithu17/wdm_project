import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Register validation
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('role')
    .isIn(['student', 'tutor', 'both'])
    .withMessage('Role must be student, tutor, or both')
];

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
];

// Reset password validation
const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePasswordValidation, validate, changePassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

export default router;
