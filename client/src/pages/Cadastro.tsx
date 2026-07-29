import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';

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
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Carregando...</p>
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">helpdesk-ti</h1>
        <p className="mt-1 text-sm text-slate-600">Crie sua conta</p>

        <form onSubmit={aoEnviar} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-slate-700"
            >
              Nome
            </label>
            <input
              id="nome"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-slate-700"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {enviando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
