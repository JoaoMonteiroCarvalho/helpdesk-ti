import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import chamadoRoutes from './chamadoRoutes';

// Ponto unico de montagem das rotas. Conforme voce criar os arquivos
// de rota, registre-os aqui:
//   import comentarioRoutes from './comentarioRoutes';
//   router.use('/comentarios', comentarioRoutes);
const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API do helpdesk-ti no ar' });
});

router.use('/auth', authRoutes);
router.use('/chamados', chamadoRoutes);

export default router;
