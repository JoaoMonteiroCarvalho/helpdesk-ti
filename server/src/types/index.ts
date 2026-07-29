// Tipos do dominio, espelhando os ENUM definidos em database/schema.sql.
// Manter os dois lados iguais e essencial: se voce adicionar um status no
// banco, adicione aqui tambem, senao o TypeScript nao vai reconhece-lo.

export type Papel = 'tecnico' | 'usuario';

export type StatusChamado = 'aberto' | 'em_andamento' | 'fechado';

export type PrioridadeChamado = 'baixa' | 'media' | 'alta' | 'urgente';

export type CategoriaChamado =
  | 'hardware'
  | 'software'
  | 'rede'
  | 'acesso'
  | 'outro';

// Listas em tempo de execucao, para validar o que chega pela requisicao.
// O TypeScript so existe na compilacao; o corpo de um POST chega como
// dado desconhecido e precisa ser checado aqui.
export const STATUS_VALIDOS: StatusChamado[] = [
  'aberto',
  'em_andamento',
  'fechado',
];

export const PRIORIDADES_VALIDAS: PrioridadeChamado[] = [
  'baixa',
  'media',
  'alta',
  'urgente',
];

export const CATEGORIAS_VALIDAS: CategoriaChamado[] = [
  'hardware',
  'software',
  'rede',
  'acesso',
  'outro',
];

// ---------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------

/**
 * Usuario como a API pode devolver: sem o hash da senha.
 * Este e o tipo que trafega para o frontend.
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  criado_em: Date;
}

/**
 * Usuario incluindo o hash. Use SOMENTE no login, para comparar a senha.
 * Nunca devolva um objeto deste tipo em uma resposta HTTP.
 */
export interface UsuarioComSenha extends Usuario {
  senha_hash: string;
}

export interface DadosNovoUsuario {
  nome: string;
  email: string;
  senhaHash: string;
  papel?: Papel;
}

// ---------------------------------------------------------------------
// Chamados
// ---------------------------------------------------------------------

/** Chamado como esta gravado na tabela. */
export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  solicitante_id: number;
  tecnico_id: number | null;
  criado_em: Date;
  atualizado_em: Date;
  fechado_em: Date | null;
}

/**
 * Chamado acrescido dos nomes vindos do JOIN com usuarios.
 * Evita que o frontend precise de uma requisicao extra so para
 * descobrir quem abriu e quem atende.
 */
export interface ChamadoDetalhado extends Chamado {
  solicitante_nome: string;
  solicitante_email: string;
  tecnico_nome: string | null;
  /**
   * So preenchido na listagem, para o card mostrar quantos comentarios
   * o chamado tem sem precisar buscar a lista inteira.
   */
  total_comentarios?: number;
}

export interface DadosNovoChamado {
  titulo: string;
  descricao: string;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeChamado;
  solicitante_id: number;
}

/** Filtros aceitos pela listagem. Todos opcionais e combinaveis. */
export interface FiltrosChamado {
  status?: StatusChamado;
  solicitante_id?: number;
  tecnico_id?: number;
  /** true = apenas chamados que ainda nao foram assumidos */
  semTecnico?: boolean;
}

// ---------------------------------------------------------------------
// Comentarios
// ---------------------------------------------------------------------

export interface Comentario {
  id: number;
  chamado_id: number;
  autor_id: number;
  texto: string;
  criado_em: Date;
}

/** Comentario com os dados do autor, para montar o historico na tela. */
export interface ComentarioDetalhado extends Comentario {
  autor_nome: string;
  autor_papel: Papel;
}

export interface DadosNovoComentario {
  chamado_id: number;
  autor_id: number;
  texto: string;
}
