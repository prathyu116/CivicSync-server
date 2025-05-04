import { Router } from 'express';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  voteForIssue,
  updateIssueStatus 
} from '../controllers/issue.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route to get all issues (with optional filters) and specific issue
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Protected Routes (Require authentication)
router.post('/', authMiddleware, createIssue);
router.put('/:id', authMiddleware, updateIssue);
router.patch('/:id/status', authMiddleware, updateIssueStatus); 
router.delete('/:id', authMiddleware, deleteIssue);
router.post('/:id/vote', authMiddleware, voteForIssue);


export default router;