import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import * as usuarioModel from '../models/usuarioModel';
import { PayloadToken } from '../middlewares/auth';

// Custo do bcrypt. Cada unidade dobra o tempo de calculo.
// 10 leva ~100ms: lento o bastante para inviabilizar forca bruta,
// rapido o bastante para nao travar o login.
const CUSTO_BCRYPT = 10;

const TAMANHO_MINIMO_SENHA = 6;

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function gerarToken(usuario: PayloadToken): string {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, papel: usuario.papel },
    env.JWT_SECRET,
    // O tipo de expiresIn no @types/jsonwebtoken e restrito a formatos
    // conhecidos em tempo de compilacao; o valor vem do .env, entao a
    // checagem so pode acontecer em execucao.
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

/**
 * POST /api/auth/registrar
 *
 * O papel NAO e lido do corpo da requisicao: todo cadastro publico
 * nasce como "usuario". Aceitar papel aqui permitiria que qualquer
 * pessoa se cadastrasse como tecnico.
 */
export async function registrar(req: Request, res: Response): Promise<void> {
  const { nome, email, senha } = req.body ?? {};

  if (typeof nome !== 'string' || nome.trim().length < 2) {
    res.status(400).json({ erro: 'Nome deve ter ao menos 2 caracteres' });
    return;
  }

  if (typeof email !== 'string' || !emailValido(email)) {
    res.status(400).json({ erro: 'E-mail invalido' });
    return;
  }

  if (typeof senha !== 'string' || senha.length < TAMANHO_MINIMO_SENHA) {
    res.status(400).json({
      erro: `Senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres`,
    });
    return;
  }

  const emailNormalizado = email.trim().toLowerCase();

  if (await usuarioModel.emailJaCadastrado(emailNormalizado)) {
    res.status(409).json({ erro: 'E-mail ja cadastrado' });
    return;
  }

  try {
    const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

    const usuario = await usuarioModel.criar({
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash,
      papel: 'usuario',
    });

    res.status(201).json({ usuario, token: gerarToken(usuario) });
  } catch (erro) {
    // A checagem acima nao elimina a corrida: outra requisicao pode ter
    // cadastrado o mesmo e-mail no intervalo. Quem garante e o UNIQUE.
    if ((erro as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ erro: 'E-mail ja cadastrado' });
      return;
    }
    throw erro;
  }
}

/**
 * POST /api/auth/login
 *
 * A resposta e identica para e-mail inexistente e senha errada, de
 * proposito: diferenciar permitiria descobrir quem tem conta no sistema.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, senha } = req.body ?? {};

  if (typeof email !== 'string' || typeof senha !== 'string') {
    res.status(400).json({ erro: 'Informe e-mail e senha' });
    return;
  }

  const usuario = await usuarioModel.buscarPorEmailComSenha(
    email.trim().toLowerCase()
  );

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    // Mesma mensagem para e-mail inexistente e senha errada, para nao
    // revelar quais e-mails estao cadastrados.
    res.status(401).json({ erro: 'E-mail ou senha invalidos' });
    return;
  }

  // Monta a resposta sem o hash. O model traz senha_hash nesta consulta
  // porque o login precisa dela; daqui em diante ela nao circula mais.
  const { senha_hash: _hash, ...dadosPublicos } = usuario;

  res.json({ usuario: dadosPublicos, token: gerarToken(usuario) });
}

/**
 * GET /api/auth/perfil
 * Rota protegida: exige token valido. Devolve o usuario logado.
 */
export async function perfil(req: Request, res: Response): Promise<void> {
  // req.usuario e preenchido pelo middleware autenticar.
  const id = req.usuario!.id;

  // Rele do banco em vez de confiar no token: o papel pode ter mudado
  // depois que o token foi emitido.
  const usuario = await usuarioModel.buscarPorId(id);

  if (!usuario) {
    res.status(404).json({ erro: 'Usuario nao encontrado' });
    return;
  }

  res.json({ usuario });
}
