import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {
  scheduleEmails,
  sendEmailsNow,
  getScheduledEmails,
  getSentEmails,
  getRateLimitInfo,
} from './controllers/scheduleEmail';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Email Scheduler API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      scheduleEmails: 'POST /api/schedule-emails',
      sendEmailsNow: 'POST /api/send-now',
      scheduledEmails: 'GET /api/scheduled-emails',
      sentEmails: 'GET /api/sent-emails',
      rateLimitStatus: 'GET /api/rate-limit-status',
    },
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.post('/api/schedule-emails', scheduleEmails);
app.post('/api/send-now', sendEmailsNow);
app.get('/api/scheduled-emails', getScheduledEmails);
app.get('/api/sent-emails', getSentEmails);
app.get('/api/rate-limit-status', getRateLimitInfo);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

export default app;
