import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
  process.exit(1);
}

export const signToken = (userId: string): string => {
  const payload = { id: userId };
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' }); 
};

export const verifyToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; iat: number; exp: number };
    return { id: decoded.id };
  } catch (error) {
    return null; 
  }
};