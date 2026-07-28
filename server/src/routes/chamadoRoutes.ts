import { Router } from 'express';
import * as chamadoController from '../controllers/chamadoController';
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
router.patch('/:id/tecnico', autorizar('tecnico'), chamadoController.atribuirTecnico);

export default router;
