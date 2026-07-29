import { api } from './client';
import type { Chamado, StatusChamado } from '../types/chamado';

interface RespostaListagem {
  chamados: Chamado[];
  total: number;
}

/**
 * Lista os chamados visiveis para quem esta autenticado.
 *
 * O escopo e decidido pela API a partir do token: tecnico recebe
 * todos, usuario comum recebe apenas os proprios. Nao ha filtragem
 * aqui de proposito -- filtrar no navegador significaria ter os dados
 * alheios carregados na memoria, a um DevTools de distancia.
 */
export async function listar(
  status?: StatusChamado
): Promise<RespostaListagem> {
  // O filtro vai para a API em vez de acontecer no navegador: o
  // endpoint ja aceita ?status= e a coluna tem indice no banco.
  const query = status ? `?status=${status}` : '';
  return api.get<RespostaListagem>(`/chamados${query}`);
}
