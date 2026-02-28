import { Router } from 'express';
import { minecraftController } from '../controllers/minecraft.controller';

export const minecraftRouter = Router();

minecraftRouter.get('/versions', minecraftController.getVersions);
minecraftRouter.get('/versions/:version/loaders', minecraftController.getCompatibleLoaders);
minecraftRouter.post('/detect-loader', minecraftController.detectLoader);
