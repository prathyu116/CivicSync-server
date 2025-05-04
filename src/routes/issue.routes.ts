// src/routes/issue.routes.ts
import { Router } from 'express';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  voteForIssue,
  updateIssueStatus // Import the new status controller
} from '../controllers/issue.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route to get all issues (with optional filters) and specific issue
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Protected Routes (Require authentication)
router.post('/', authMiddleware, createIssue);
router.put('/:id', authMiddleware, updateIssue);
router.patch('/:id/status', authMiddleware, updateIssueStatus); // Use PATCH for status update
router.delete('/:id', authMiddleware, deleteIssue);
router.post('/:id/vote', authMiddleware, voteForIssue);

// Note: /my-issues route is moved below as it's user-specific

export default router;