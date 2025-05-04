// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile); // Protect profile route

export default router;