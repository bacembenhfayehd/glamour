import express from 'express'
import { validateLogin, validateRegister } from '../middleware/validaton.js';
import { getProfile, login, logout, refreshToken, register } from '../controllers/auth-controller.js';
import authenticate from '../middleware/auth.js';



const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
export default router ;