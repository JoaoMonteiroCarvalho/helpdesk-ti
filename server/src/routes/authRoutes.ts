import { Router } from 'express';
import * as authController from '../controllers/authController';
import { autenticar, autorizar } from '../middlewares/auth';

const router = Router();

// Publicas
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);

// Exige token valido
router.get('/perfil', autenticar, authController.perfil);

// Exige token valido E papel "tecnico".
// A ordem importa: autenticar preenche req.usuario, que autorizar le.
router.get('/tecnicos', autenticar, autorizar('tecnico'), authController.listarTecnicos);

export default router;
