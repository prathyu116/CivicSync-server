import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required: No token provided' });
      return; 
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ message: 'Authentication required: Invalid token' });
      return; 
    }

    req.user = { id: decoded.id };
    next(); 
  } catch (error) {

    res.status(401).json({ message: 'Authentication required: Error processing token' });
    return; 
  }
};