import { Router } from 'express';
import { apiKeysController } from '../controllers/api-keys.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const apiKeysRouter = Router();

apiKeysRouter.use(authMiddleware);

apiKeysRouter.get('/', apiKeysController.list);
apiKeysRouter.post('/', apiKeysController.create);
apiKeysRouter.delete('/:id', apiKeysController.revoke);
