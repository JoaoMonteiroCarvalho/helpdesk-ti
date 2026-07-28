import { Router } from 'express';
import * as comentarioController from '../controllers/comentarioController';

// mergeParams: true e obrigatorio aqui.
//
// Este router e montado dentro de chamadoRoutes, em "/:id/comentarios".
// Sem essa opcao, o router filho nao herda os parametros do pai e
// req.params.id chega undefined -- a rota casa normalmente e so o
// parametro some, o que torna o sintoma dificil de diagnosticar.
const router = Router({ mergeParams: true });

router.get('/', comentarioController.listar);
router.post('/', comentarioController.criar);

export default router;
