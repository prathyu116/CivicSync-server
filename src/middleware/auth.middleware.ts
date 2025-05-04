// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Explicitly type the return value as void
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Just send the response, don't return it
      res.status(401).json({ message: 'Authentication required: No token provided' });
      return; // Exit the function after sending response
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
       // Just send the response
      res.status(401).json({ message: 'Authentication required: Invalid token' });
      return; // Exit the function after sending response
    }

    // Attach user id to request object if token is valid
    req.user = { id: decoded.id };
    next(); // Call next() ONLY if authentication succeeds
  } catch (error) {
    // Catch potential errors during header access etc.
    // Just send the response
    res.status(401).json({ message: 'Authentication required: Error processing token' });
    return; // Exit the function after sending response
  }
};