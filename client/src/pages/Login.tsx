import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import {
  IconeCadeado,
  IconeCadeadoPequeno,
  IconeEnvelope,
  IconeOlho,
  IconeOlhoFechado,
} from '../components/Icones';
import { Spinner } from '../components/Spinner';

export function Login() {
  const { usuario, carregando, entrar } = useAuth();
  const navegar = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Enquanto a sessao esta sendo restaurada nao da para decidir nada:
  // usuario ainda e null mesmo para quem esta autenticado.
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-papel textura-pontos">
        <div className="flex items-center gap-2 text-tinta-suave">
          <Spinner />
          Carregando...
        </div>
      </main>
    );
  }

  // Quem ja entrou nao tem o que fazer nesta tela.
  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await entrar(email, senha);
      navegar('/', { replace: true });
    } catch (falha) {
      // A API responde com a mesma mensagem para e-mail inexistente e
      // senha errada, de proposito: diferenciar permitiria descobrir
      // quem tem conta no sistema.
      setErro(
        falha instanceof ErroApi ? falha.message : 'Nao foi possivel entrar'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-papel textura-pontos p-6">
      <div className="w-full max-w-sm animate-[entrada_0.25s_ease-out] rounded-xl bg-superficie p-8 shadow-2xl ring-1 ring-black/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acento/10">
          <IconeCadeado className="h-7 w-7 text-acento" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-tinta-card">Chamados TI</h1>
        <p className="mt-1 text-sm text-tinta-card-suave">
          Entre para acompanhar seus chamados
        </p>

        <form onSubmit={aoEnviar} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-tinta-card"
            >
              E-mail
            </label>
            <div className="relative mt-1">
              <IconeEnvelope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-card-suave" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-linha-forte/40 py-2 pl-9 pr-3 text-tinta-card outline-none transition-all focus:border-acento focus:ring-2 focus:ring-acento/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-tinta-card"
            >
              Senha
            </label>
            <div className="relative mt-1">
              <IconeCadeadoPequeno className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-card-suave" />
              <input
                id="senha"
                type={senhaVisivel ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-linha-forte/40 py-2 pl-9 pr-9 text-tinta-card outline-none transition-all focus:border-acento focus:ring-2 focus:ring-acento/20"
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel((atual) => !atual)}
                aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tinta-card-suave transition-colors hover:text-tinta-card"
              >
                {senhaVisivel ? (
                  <IconeOlhoFechado className="h-4 w-4" />
                ) : (
                  <IconeOlho className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {erro && (
            <p
              role="alert"
              className="animate-[entrada_0.15s_ease-out] rounded-lg bg-prioridade-urgente/10 px-3 py-2 text-sm text-prioridade-urgente"
            >
              {erro}
            </p>
          )}

          {/* Desabilitado durante o envio: sem isso, dois cliques rapidos
              disparam dois logins. */}
          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-acento px-4 py-2 font-medium text-white transition-all hover:bg-acento/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-tinta-card-suave">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-acento hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
