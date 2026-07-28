import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Papel } from '../types';

// Reexportado por conveniencia: quem ja importa deste modulo continua
// funcionando. A definicao vive em src/types.
export type { Papel };

// O que guardamos dentro do token. Nunca coloque senha aqui:
// o payload de um JWT e apenas codificado em base64, nao criptografado.
export interface PayloadToken {
  id: number;
  email: string;
  papel: Papel;
}

// Ensina ao TypeScript que req.usuario existe depois do middleware autenticar.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

/**
 * Verifica o token JWT enviado no cabecalho Authorization: Bearer <token>.
 * Em caso de sucesso, preenche req.usuario e segue para o proximo handler.
 */
export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token nao fornecido' });
    return;
  }

  if (!env.JWT_SECRET) {
    res.status(500).json({ erro: 'JWT_SECRET nao configurado no servidor' });
    return;
  }

  const token = cabecalho.slice('Bearer '.length);

  try {
    req.usuario = jwt.verify(token, env.JWT_SECRET) as PayloadToken;
    next();
  } catch {
    res.status(401).json({ erro: 'Token invalido ou expirado' });
  }
}

/**
 * Restringe a rota a determinados papeis. Use sempre depois de autenticar:
 *   router.patch('/:id/status', autenticar, autorizar('tecnico'), atualizarStatus);
 */
export function autorizar(...papeisPermitidos: Papel[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ erro: 'Nao autenticado' });
      return;
    }

    if (!papeisPermitidos.includes(req.usuario.papel)) {
      res.status(403).json({ erro: 'Acesso negado para o seu perfil' });
      return;
    }

    next();
  };
}
