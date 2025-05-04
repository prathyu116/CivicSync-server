import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import userRoutes from './routes/user.routes'; 

dotenv.config();

connectDB();

const app: Express = express();


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 

app.get('/', (req: Request, res: Response) => {
  res.send('CivicSync API Running');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes); 

// --- Error Handling Middleware ---
// 404 Handler (Not Found) - Place after all routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});


export default app;