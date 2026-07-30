import { Router } from 'express';
import * as chamadoController from '../controllers/chamadoController';
import comentarioRoutes from './comentarioRoutes';
import { autenticar, autorizar } from '../middlewares/auth';

const router = Router();

// Todas as rotas de chamados exigem autenticacao. Aplicar aqui evita
// repetir o middleware em cada linha e, principalmente, evita esquecer
// dele em uma rota nova.
router.use(autenticar);

// ATENCAO A ORDEM: esta rota precisa vir antes de "/:id".
// O Express testa na ordem de registro, entao "/:id" registrado antes
// capturaria "/resumo" tratando "resumo" como se fosse um id.
router.get('/resumo', autorizar('tecnico'), chamadoController.resumo);

// Leitura: o escopo varia por papel, tratado dentro do controller.
router.get('/', chamadoController.listar);
router.get('/:id', chamadoController.buscarPorId);

// Abertura de chamado: qualquer usuario autenticado.
router.post('/', chamadoController.criar);

// Acoes de atendimento: exclusivas de tecnicos.
router.patch('/:id/status', autorizar('tecnico'), chamadoController.atualizarStatus);
router.patch('/:id/assumir', autorizar('tecnico'), chamadoController.assumir);

// Comentarios vivem dentro de um chamado, refletindo o ON DELETE CASCADE
// do schema. A permissao vem de graca: para comentar e preciso conseguir
// ver o chamado, e o :id ja esta na URL.
router.use('/:id/comentarios', comentarioRoutes);

export default router;
