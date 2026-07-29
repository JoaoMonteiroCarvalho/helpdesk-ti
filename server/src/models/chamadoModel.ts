import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import {
  Chamado,
  ChamadoDetalhado,
  DadosNovoChamado,
  FiltrosChamado,
  StatusChamado,
} from '../types';

// SELECT reaproveitado pelas consultas que precisam dos nomes.
// LEFT JOIN no tecnico (e nao JOIN): o chamado ainda pode nao ter
// tecnico atribuido, e um JOIN comum descartaria essas linhas.
const SELECT_DETALHADO = `
  SELECT ch.*,
         s.nome  AS solicitante_nome,
         s.email AS solicitante_email,
         t.nome  AS tecnico_nome
    FROM chamados ch
    JOIN usuarios s ON s.id = ch.solicitante_id
    LEFT JOIN usuarios t ON t.id = ch.tecnico_id
`;

/**
 * Lista os chamados aplicando os filtros informados.
 *
 * As condicoes sao montadas dinamicamente, mas os VALORES sempre entram
 * como "?". O texto do SQL nunca recebe dado vindo do usuario.
 */
export async function listar(
  filtros: FiltrosChamado = {}
): Promise<ChamadoDetalhado[]> {
  const condicoes: string[] = [];
  // (string | number)[] e nao unknown[]: o mysql2 so aceita valores que
  // saiba converter para o protocolo do MySQL. O strict do TypeScript
  // recusa unknown aqui, e com razao.
  const valores: (string | number)[] = [];

  if (filtros.status) {
    condicoes.push('ch.status = ?');
    valores.push(filtros.status);
  }

  if (filtros.solicitante_id !== undefined) {
    condicoes.push('ch.solicitante_id = ?');
    valores.push(filtros.solicitante_id);
  }

  if (filtros.tecnico_id !== undefined) {
    condicoes.push('ch.tecnico_id = ?');
    valores.push(filtros.tecnico_id);
  }

  if (filtros.semTecnico) {
    // IS NULL nao aceita parametro: nao ha valor a passar.
    condicoes.push('ch.tecnico_id IS NULL');
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  // LEFT JOIN com subconsulta agrupada por chamado_id: traz a contagem
  // de comentarios sem rodar uma consulta por chamado (problema N+1).
  const sql = `
    SELECT ch.*,
           s.nome  AS solicitante_nome,
           s.email AS solicitante_email,
           t.nome  AS tecnico_nome,
           COALESCE(c.total, 0) AS total_comentarios
      FROM chamados ch
      JOIN usuarios s ON s.id = ch.solicitante_id
      LEFT JOIN usuarios t ON t.id = ch.tecnico_id
      LEFT JOIN (
        SELECT chamado_id, COUNT(*) AS total
          FROM comentarios
         GROUP BY chamado_id
      ) c ON c.chamado_id = ch.id
      ${where}
     ORDER BY ch.criado_em DESC
  `;

  const [linhas] = await pool.execute<RowDataPacket[]>(sql, valores);
  return linhas as ChamadoDetalhado[];
}

/** Busca um chamado pelo id, com os nomes de solicitante e tecnico. */
export async function buscarPorId(
  id: number
): Promise<ChamadoDetalhado | null> {
  const [linhas] = await pool.execute<RowDataPacket[]>(
    `${SELECT_DETALHADO} WHERE ch.id = ? LIMIT 1`,
    [id]
  );

  return (linhas[0] as ChamadoDetalhado) ?? null;
}

/** Cria um chamado. Status inicial e "aberto" (padrao do schema). */
export async function criar(
  dados: DadosNovoChamado
): Promise<ChamadoDetalhado> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO chamados (titulo, descricao, categoria, prioridade, solicitante_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      dados.titulo,
      dados.descricao,
      dados.categoria ?? 'outro',
      dados.prioridade ?? 'media',
      dados.solicitante_id,
    ]
  );

  const criado = await buscarPorId(resultado.insertId);

  if (!criado) {
    throw new Error('Chamado inserido mas nao encontrado em seguida');
  }

  return criado;
}

/**
 * Atualiza o status e mantem fechado_em coerente.
 *
 * O CASE roda no banco, na mesma instrucao do UPDATE: nao existe
 * intervalo em que o status seja "fechado" e a data esteja vazia.
 * Reabrir um chamado limpa a data automaticamente.
 *
 * Devolve false quando nenhum chamado tem o id informado.
 */
export async function atualizarStatus(
  id: number,
  status: StatusChamado
): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE chamados
        SET status = ?,
            fechado_em = CASE WHEN ? = 'fechado'
                              THEN CURRENT_TIMESTAMP
                              ELSE NULL END
      WHERE id = ?`,
    [status, status, id]
  );

  return resultado.affectedRows > 0;
}

/**
 * Atribui (ou troca) o tecnico responsavel, sem checar o estado atual.
 * Use para reatribuicao administrativa; para o tecnico se auto-atribuir,
 * prefira assumir().
 */
export async function atribuirTecnico(
  id: number,
  tecnicoId: number | null
): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE chamados SET tecnico_id = ? WHERE id = ?',
    [tecnicoId, id]
  );

  return resultado.affectedRows > 0;
}

/**
 * Tecnico assume um chamado que ainda nao tem responsavel.
 *
 * O "AND tecnico_id IS NULL" torna a operacao segura contra concorrencia:
 * se dois tecnicos clicarem ao mesmo tempo, o segundo UPDATE encontra a
 * coluna ja preenchida e afeta zero linhas. Retornamos false em vez de
 * sobrescrever o primeiro sem ninguem perceber.
 */
export async function assumir(id: number, tecnicoId: number): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'UPDATE chamados SET tecnico_id = ? WHERE id = ? AND tecnico_id IS NULL',
    [tecnicoId, id]
  );

  return resultado.affectedRows > 0;
}

/** Total de chamados por status. Util para um painel de resumo. */
export async function contarPorStatus(): Promise<Record<string, number>> {
  const [linhas] = await pool.query<RowDataPacket[]>(
    'SELECT status, COUNT(*) AS total FROM chamados GROUP BY status'
  );

  const contagem: Record<string, number> = {};
  for (const linha of linhas) {
    contagem[linha.status] = Number(linha.total);
  }
  return contagem;
}

/** Remove um chamado. Os comentarios saem junto, por ON DELETE CASCADE. */
export async function remover(id: number): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'DELETE FROM chamados WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
}

// Reexportado para quem precisa do tipo cru, sem os campos do JOIN.
export type { Chamado };
