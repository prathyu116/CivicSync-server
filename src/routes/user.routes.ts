// src/routes/user.routes.ts
import { Router } from 'express';
import { getMyIssues } from '../controllers/issue.controller'; // Keep controller logic there for now
import { authMiddleware } from '../middleware/auth.middleware';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Endpoint specific to the logged-in user's issues
router.get('/my-issues', authMiddleware, getMyIssues);

export default router;