import { api } from './client';
import type {
  CategoriaChamado,
  Chamado,
  Comentario,
  PrioridadeChamado,
  StatusChamado,
} from '../types/chamado';

interface RespostaListagem {
  chamados: Chamado[];
  total: number;
}

export interface FiltrosListagem {
  status?: StatusChamado;
  /** Chamados atendidos por este tecnico. */
  tecnicoId?: number;
  /** true = so chamados ainda sem tecnico atribuido. */
  semTecnico?: boolean;
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
  filtros: FiltrosListagem = {}
): Promise<RespostaListagem> {
  const params = new URLSearchParams();
  if (filtros.status) params.set('status', filtros.status);
  if (filtros.tecnicoId !== undefined) {
    params.set('tecnico_id', String(filtros.tecnicoId));
  }
  if (filtros.semTecnico) params.set('semTecnico', 'true');

  const query = params.toString();
  return api.get<RespostaListagem>(`/chamados${query ? `?${query}` : ''}`);
}

export interface DadosNovoChamado {
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
}

/**
 * Abre um chamado. O solicitante nao vai no corpo: a API usa o id do
 * token, para ninguem abrir chamado em nome de outra pessoa.
 */
export async function criar(dados: DadosNovoChamado): Promise<Chamado> {
  const resposta = await api.post<{ chamado: Chamado }>('/chamados', dados);
  return resposta.chamado;
}

interface RespostaDetalhe {
  chamado: Chamado;
  comentarios: Comentario[];
}

/** Busca um chamado com o historico de comentarios, em uma so chamada. */
export async function buscarPorId(id: number): Promise<RespostaDetalhe> {
  return api.get<RespostaDetalhe>(`/chamados/${id}`);
}

/** Tecnico assume o chamado. So funciona se ainda nao tiver tecnico. */
export async function assumir(id: number): Promise<Chamado> {
  const resposta = await api.patch<{ chamado: Chamado }>(
    `/chamados/${id}/assumir`
  );
  return resposta.chamado;
}

/** Tecnico altera o status do chamado. */
export async function atualizarStatus(
  id: number,
  status: StatusChamado
): Promise<Chamado> {
  const resposta = await api.patch<{ chamado: Chamado }>(
    `/chamados/${id}/status`,
    { status }
  );
  return resposta.chamado;
}

/** Adiciona um comentario ao chamado. O autor vem do token, na API. */
export async function comentar(
  chamadoId: number,
  texto: string
): Promise<Comentario> {
  const resposta = await api.post<{ comentario: Comentario }>(
    `/chamados/${chamadoId}/comentarios`,
    { texto }
  );
  return resposta.comentario;
}
