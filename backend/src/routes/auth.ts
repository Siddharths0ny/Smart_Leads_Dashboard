import { Router } from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, getAllUsers);

export default router;
