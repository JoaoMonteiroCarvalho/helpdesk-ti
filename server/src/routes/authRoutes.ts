import { Router } from 'express';
import * as authController from '../controllers/authController';
import { autenticar } from '../middlewares/auth';

const router = Router();

// Publicas
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);

// Exige token valido
router.get('/perfil', autenticar, authController.perfil);

export default router;
