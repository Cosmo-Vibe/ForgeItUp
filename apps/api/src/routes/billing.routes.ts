import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const billingRouter = Router();

billingRouter.get('/plans', billingController.getPlans);
billingRouter.post('/subscribe', authMiddleware, billingController.subscribe);
billingRouter.post('/portal', authMiddleware, billingController.getPortalUrl);
billingRouter.get('/usage', authMiddleware, billingController.getUsage);
