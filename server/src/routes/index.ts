import { Router, Request, Response } from 'express';

// Ponto unico de montagem das rotas. Conforme voce criar os arquivos
// de rota, registre-os aqui:
//   import authRoutes from './authRoutes';
//   router.use('/auth', authRoutes);
const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API do helpdesk-ti no ar' });
});

export default router;
