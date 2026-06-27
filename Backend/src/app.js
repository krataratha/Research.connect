import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';
import apiRouter from './routes/index.js';

const app = express();

// 1. Global Middlewares
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Development logging
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Static file routing (for file uploads)
app.use('/uploads', express.static('uploads'));

// 2. Mount API Routes
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 3. Fallback 404 Router Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
