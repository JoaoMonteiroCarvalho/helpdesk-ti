import { api } from './client';
import type { Chamado } from '../types/chamado';

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
export async function listar(): Promise<RespostaListagem> {
  return api.get<RespostaListagem>('/chamados');
}
