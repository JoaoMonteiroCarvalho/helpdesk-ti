import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';

// Ponto unico de montagem das rotas. Conforme voce criar os arquivos
// de rota, registre-os aqui:
//   import chamadoRoutes from './chamadoRoutes';
//   router.use('/chamados', chamadoRoutes);
const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API do helpdesk-ti no ar' });
});

router.use('/auth', authRoutes);

export default router;
