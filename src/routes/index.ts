import { Router } from 'express';
import { adminRoutes } from './admin.routes';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';

const routes = Router();

routes.get('/health', (_req, res) =>
  res.status(200).json({
    status: 'ok',
    service: 'MedClinic API',
    stage: 'Etapa 1 — Autenticação e Autorização',
    timestamp: new Date().toISOString(),
  }),
);

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/admin', adminRoutes);

export { routes };
