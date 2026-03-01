import { Router } from 'express';
import { generationsController } from '../controllers/generation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { subscriptionGuard } from '../middleware/subscription.middleware';
import { generationRateLimit as rateLimitMiddleware } from '../middleware/rate-limit.middleware';

export const generationsRouter = Router();

// All routes require auth
generationsRouter.use(authMiddleware);

generationsRouter.post(
  '/',
  subscriptionGuard,
  rateLimitMiddleware,
  generationsController.create,
);

generationsRouter.get('/', generationsController.list);
generationsRouter.get('/:id', generationsController.get);
generationsRouter.get('/:id/download', generationsController.getDownloadUrl);
generationsRouter.delete('/:id', generationsController.delete);
generationsRouter.post('/:id/fork', subscriptionGuard, generationsController.fork);
