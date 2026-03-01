import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin.middleware';

export const adminRouter = Router();

// All admin routes are protected by adminMiddleware (returns 404 in prod)
adminRouter.use(adminMiddleware);

adminRouter.get('/stats', adminController.getStats);
adminRouter.get('/users', adminController.getUsers);
adminRouter.patch('/users/:id', adminController.updateUser);
adminRouter.delete('/users/:id', adminController.deleteUser);
adminRouter.get('/generations', adminController.getGenerations);
adminRouter.get('/api-keys', adminController.getApiKeys);
adminRouter.delete('/api-keys/:id', adminController.revokeApiKey);
adminRouter.get('/queue', adminController.getQueueStats);
adminRouter.get('/health', adminController.getSystemHealth);
