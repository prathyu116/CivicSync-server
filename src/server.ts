// src/server.ts
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err: Error, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error(err.stack);
     // Close server & exit process
    server.close(() => process.exit(1));
});