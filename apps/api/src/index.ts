import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger';
import { authRouter } from './routes/auth.routes';
import { generationsRouter } from './routes/generations.routes';
import { minecraftRouter } from './routes/minecraft.routes';
import { billingRouter } from './routes/billing.routes';
import { userRouter } from './routes/user.routes';
import { stripeWebhookRouter } from './routes/stripe-webhook.routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { generalRateLimit } from './middleware/rate-limit.middleware';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ============================================================
// Security & Middleware
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Stripe webhook needs raw body
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res) => (res.statusCode >= 400 ? 'error' : 'info'),
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);

// Rate limiting
app.use(generalRateLimit);

// ============================================================
// Health Check
// ============================================================

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' });
});

// ============================================================
// Routes
// ============================================================

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/generations', generationsRouter);
app.use('/api/v1/minecraft', minecraftRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/webhooks/stripe', stripeWebhookRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================

app.listen(PORT, () => {
  logger.info(`ForgeItUp API running on port ${PORT}`);
});

export default app;
