import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, definirAoExpirarSessao, definirToken } from '../api/client';
import { AuthContext } from './AuthContext';
import type { Usuario } from './AuthContext';

const CHAVE_TOKEN = 'helpdesk-ti:token';

// Formato das respostas de /auth/login e /auth/registrar.
interface RespostaSessao {
  usuario: Usuario;
  token: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE_TOKEN);
    definirToken(null);
    setUsuario(null);
  }, []);

  // Liga o 401 do cliente HTTP ao logout: qualquer requisicao que
  // encontre token vencido derruba a sessao, sem cada tela tratar isso.
  useEffect(() => {
    definirAoExpirarSessao(sair);
    return () => definirAoExpirarSessao(null);
  }, [sair]);

  // Restaura a sessao no carregamento da pagina.
  useEffect(() => {
    const token = localStorage.getItem(CHAVE_TOKEN);

    if (!token) {
      setCarregando(false);
      return;
    }

    definirToken(token);

    // Busca o usuario atual em vez de guardar o objeto no localStorage:
    // dados salvos congelam, e um papel alterado no banco continuaria
    // exibindo a interface antiga ate a pessoa deslogar.
    api
      .get<{ usuario: Usuario }>('/auth/perfil')
      .then((resposta) => setUsuario(resposta.usuario))
      .catch(() => {
        // Token invalido ou vencido: comeca deslogado.
        localStorage.removeItem(CHAVE_TOKEN);
        definirToken(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  function aplicarSessao(resposta: RespostaSessao) {
    localStorage.setItem(CHAVE_TOKEN, resposta.token);
    definirToken(resposta.token);
    setUsuario(resposta.usuario);
  }

  // Os erros sobem para a tela, que sabe como exibi-los ao usuario.
  async function entrar(email: string, senha: string) {
    aplicarSessao(
      await api.post<RespostaSessao>('/auth/login', { email, senha })
    );
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    aplicarSessao(
      await api.post<RespostaSessao>('/auth/registrar', { nome, email, senha })
    );
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, entrar, cadastrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}
