import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Spinner } from '../components/Spinner';

export function Cadastro() {
  const { usuario, carregando, cadastrar } = useAuth();
  const navegar = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

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

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      // O cadastro sempre cria papel "usuario"; a API ignora qualquer
      // outro valor enviado, entao nao existe campo de papel aqui.
      await cadastrar(nome, email, senha);
      navegar('/', { replace: true });
    } catch (falha) {
      setErro(
        falha instanceof ErroApi ? falha.message : 'Nao foi possivel cadastrar'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-papel textura-pontos p-6">
      <div className="w-full max-w-sm animate-[entrada_0.25s_ease-out] rounded-xl bg-superficie p-8 shadow-2xl ring-1 ring-black/10">
        <h1 className="text-2xl font-bold text-tinta-card">Chamados TI</h1>
        <p className="mt-1 text-sm text-tinta-card-suave">Crie sua conta</p>

        <form onSubmit={aoEnviar} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-tinta-card"
            >
              Nome
            </label>
            <input
              id="nome"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-linha-forte/40 px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-tinta-card"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-linha-forte/40 px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-tinta-card"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-linha-forte/40 px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
            />
          </div>

          {erro && (
            <p
              role="alert"
              className="animate-[entrada_0.15s_ease-out] rounded-lg bg-prioridade-urgente/10 px-3 py-2 text-sm text-prioridade-urgente"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-acento px-4 py-2 font-medium text-white transition-all hover:bg-acento/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            {enviando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-tinta-card-suave">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-acento hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
