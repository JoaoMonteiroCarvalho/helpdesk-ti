import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { DadosNovoUsuario, Usuario, UsuarioComSenha } from '../types';

// Colunas seguras para sair do banco rumo a API.
// senha_hash NAO esta aqui de proposito: assim, esquecer de remove-la
// vira impossivel em vez de virar um descuido.
const CAMPOS_PUBLICOS = 'id, nome, email, papel, criado_em';

/**
 * Busca o usuario com o hash da senha. Use apenas no login.
 * Devolve null quando o e-mail nao existe.
 */
export async function buscarPorEmailComSenha(
  email: string
): Promise<UsuarioComSenha | null> {
  // pool.execute usa prepared statement: o "?" e enviado ao MySQL
  // separado do valor, entao o conteudo de `email` nunca e interpretado
  // como SQL. Concatenar a string na query abriria SQL injection.
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT ${CAMPOS_PUBLICOS}, senha_hash FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  );

  return (linhas[0] as UsuarioComSenha) ?? null;
}

/** Busca um usuario pelo id, sem o hash da senha. */
export async function buscarPorId(id: number): Promise<Usuario | null> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ? LIMIT 1`,
    [id]
  );

  return (linhas[0] as Usuario) ?? null;
}

/** Busca um usuario pelo e-mail, sem o hash da senha. */
export async function buscarPorEmail(email: string): Promise<Usuario | null> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE email = ? LIMIT 1`,
    [email]
  );

  return (linhas[0] as Usuario) ?? null;
}

/**
 * Cria um usuario e devolve o registro recem-inserido.
 *
 * Recebe senhaHash, ja processada com bcrypt: o model nao conhece
 * senha em texto puro. Quem faz o hash e o controller.
 */
export async function criar(dados: DadosNovoUsuario): Promise<Usuario> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
    [dados.nome, dados.email, dados.senhaHash, dados.papel ?? 'usuario']
  );

  // insertId traz o id gerado pelo AUTO_INCREMENT.
  const criado = await buscarPorId(resultado.insertId);

  if (!criado) {
    throw new Error('Usuario inserido mas nao encontrado em seguida');
  }

  return criado;
}

/**
 * Indica se o e-mail ja esta em uso.
 *
 * Serve para responder um erro claro ao usuario, mas nao substitui a
 * restricao UNIQUE do banco: entre esta consulta e o INSERT, outra
 * requisicao pode cadastrar o mesmo e-mail. O banco e a garantia final.
 */
export async function emailJaCadastrado(email: string): Promise<boolean> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    'SELECT 1 FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );

  return linhas.length > 0;
}

/** Lista os usuarios, opcionalmente filtrando por papel. */
export async function listar(papel?: string): Promise<Usuario[]> {
  if (papel) {
    const [linhas] = await pool.execute<RowDataPacket[]>(
      `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE papel = ? ORDER BY nome`,
      [papel]
    );
    return linhas as Usuario[];
  }

  const [linhas] = await pool.query<RowDataPacket[]>(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY nome`
  );
  return linhas as Usuario[];
}
