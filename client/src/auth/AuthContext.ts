import { createContext, useContext } from 'react';

export type Papel = 'tecnico' | 'usuario';

/**
 * Usuario como a API devolve. criado_em e string, nao Date: JSON nao
 * tem tipo de data, entao a conversao fica a cargo de quem exibir.
 */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  criado_em: string;
}

export interface ContextoAuth {
  usuario: Usuario | null;
  /**
   * true enquanto a sessao esta sendo restaurada no carregamento.
   *
   * Distingue "ainda nao sei" de "deslogado". Sem esse terceiro estado,
   * a rota protegida veria usuario === null durante a verificacao e
   * mandaria para o login mesmo quem esta autenticado.
   */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

export const AuthContext = createContext<ContextoAuth | null>(null);

/**
 * Acessa o contexto de autenticacao.
 *
 * Lanca erro se usado fora do <AuthProvider>. Sem essa checagem, o
 * contexto viria null e o erro apareceria longe da causa real, como
 * uma leitura de propriedade de null dentro de alguma tela.
 */
export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  }

  return contexto;
}
