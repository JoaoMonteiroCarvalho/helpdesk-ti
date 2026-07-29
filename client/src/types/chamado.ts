// Espelha os tipos do backend em server/src/types/index.ts, que por sua
// vez espelham os ENUM de database/schema.sql. Ao adicionar um valor
// em um dos lados, adicione nos outros.
//
// Datas chegam como string: JSON nao tem tipo de data, e a conversao
// fica a cargo de quem exibe.

export type StatusChamado = 'aberto' | 'em_andamento' | 'fechado';

export type PrioridadeChamado = 'baixa' | 'media' | 'alta' | 'urgente';

export type CategoriaChamado =
  | 'hardware'
  | 'software'
  | 'rede'
  | 'acesso'
  | 'outro';

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  solicitante_id: number;
  tecnico_id: number | null;
  criado_em: string;
  atualizado_em: string;
  fechado_em: string | null;
  // Vem do JOIN feito pela API, evitando uma requisicao extra so para
  // descobrir quem abriu e quem atende.
  solicitante_nome: string;
  solicitante_email: string;
  tecnico_nome: string | null;
}

export interface Comentario {
  id: number;
  chamado_id: number;
  autor_id: number;
  texto: string;
  criado_em: string;
  autor_nome: string;
  autor_papel: 'tecnico' | 'usuario';
}
