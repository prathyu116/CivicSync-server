import { Router } from 'express';
import { getMyIssues } from '../controllers/issue.controller'; 
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Endpoint specific to the logged-in user's issues
router.get('/my-issues', authMiddleware, getMyIssues);

export default router;