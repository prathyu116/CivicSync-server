import express, { Express, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors'; 
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import userRoutes from './routes/user.routes'; 

dotenv.config();

connectDB();

const app: Express = express();

// --- CORS Configuration ---
const clientURL = process.env.CLIENT_URL;
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === clientURL) {
      callback(null, true); // Allow
    } else {
      console.error(`CORS Error: Request from origin ${origin} blocked.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`)); // Deny
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};

app.use(cors(corsOptions));
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
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});


export default app;