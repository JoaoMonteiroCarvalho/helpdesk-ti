import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import {
  Comentario,
  ComentarioDetalhado,
  DadosNovoComentario,
} from '../types';

const SELECT_DETALHADO = `
  SELECT co.*,
         u.nome  AS autor_nome,
         u.papel AS autor_papel
    FROM comentarios co
    JOIN usuarios u ON u.id = co.autor_id
`;

/**
 * Historico de um chamado, do mais antigo para o mais recente:
 * e a ordem natural de leitura de uma conversa.
 *
 * Aproveita o indice (chamado_id, criado_em) do schema.
 */
export async function listarPorChamado(
  chamadoId: number
): Promise<ComentarioDetalhado[]> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `${SELECT_DETALHADO} WHERE co.chamado_id = ? ORDER BY co.criado_em ASC, co.id ASC`,
    [chamadoId]
  );

  return linhas as ComentarioDetalhado[];
}

export async function buscarPorId(
  id: number
): Promise<ComentarioDetalhado | null> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `${SELECT_DETALHADO} WHERE co.id = ? LIMIT 1`,
    [id]
  );

  return (linhas[0] as ComentarioDetalhado) ?? null;
}

/**
 * Cria um comentario.
 *
 * Se chamado_id ou autor_id nao existirem, o MySQL rejeita pela chave
 * estrangeira (ER_NO_REFERENCED_ROW_2). O controller deve tratar isso
 * como 404, nao como erro interno.
 */
export async function criar(
  dados: DadosNovoComentario
): Promise<ComentarioDetalhado> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'INSERT INTO comentarios (chamado_id, autor_id, texto) VALUES (?, ?, ?)',
    [dados.chamado_id, dados.autor_id, dados.texto]
  );

  const criado = await buscarPorId(resultado.insertId);

  if (!criado) {
    throw new Error('Comentario inserido mas nao encontrado em seguida');
  }

  return criado;
}

/** Quantidade de comentarios de um chamado. */
export async function contarPorChamado(chamadoId: number): Promise<number> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM comentarios WHERE chamado_id = ?',
    [chamadoId]
  );

  return Number(linhas[0].total);
}

/** Remove um comentario. */
export async function remover(id: number): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'DELETE FROM comentarios WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
}

export type { Comentario };
