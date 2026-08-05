import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { IconeUsuario } from '../components/Icones';
import { IdenticonOrganico } from '../components/IdenticonOrganico';
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
    <main className="flex min-h-screen">
      {/* Painel de preview: mostra em tempo real como a conta vai
          aparecer no sistema (mesmo cartao usuario/avatar da Sidebar),
          conforme a pessoa digita nome e-mail. Some em telas pequenas. */}
      <div className="hidden flex-1 flex-col items-center justify-center gap-8 bg-papel textura-pontos p-6 lg:flex">
        <div>
          <h1 className="text-center text-3xl font-bold text-tinta">Service Desk</h1>
          <p className="mt-2 max-w-xs text-center text-sm text-tinta-suave">
            Veja como sua conta vai aparecer no sistema
          </p>
        </div>

        {/* Cartao em formato de "escudo" (topo bem arredondado de um
            lado so), cor solida cheia e avatar grande centralizado --
            estilo de cartao de perfil, diferente do resto do sistema
            que usa cartoes retangulares. A cada mudanca de nome/email
            da um pequeno salto (pulso de escala). */}
        <div
          key={nome + email}
          style={{ borderRadius: '50% 16px 16px 16px' }}
          className="w-64 animate-[pulso_0.3s_ease-out] bg-acento px-6 pb-8 pt-16 text-center shadow-2xl shadow-black/40"
        >
          {/* Moldura em formato de blob organico (border-radius
              assimetrico) ao redor do avatar, em vez de um circulo
              perfeito -- ecoa a curva irregular do proprio card. */}
          <div
            style={{ borderRadius: '42% 58% 55% 45% / 55% 45% 55% 45%' }}
            className="mx-auto flex h-28 w-28 items-center justify-center bg-white/10"
          >
            <IdenticonOrganico nome={nome} className="h-16 w-16" />
          </div>
          <p className="mt-4 truncate text-base font-semibold text-white">
            {nome || 'Seu nome'}
          </p>
          <p className="truncate text-xs text-white/70">
            {email || 'seu.email@exemplo.com'}
          </p>

          {/* Separador ondulado (SVG), quebrando a rigidez de uma
              linha reta entre o bloco de identidade e o rotulo. */}
          <svg viewBox="0 0 200 12" className="mx-auto mt-4 h-3 w-full text-white/20">
            <path
              d="M0 6c16.7-6 33.3 6 50 0s33.3-6 50 0 33.3 6 50 0 33.3-6 50 0"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          <span className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white">
            Usuario
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-superficie p-6">
        <div className="w-full max-w-sm animate-[entrada_0.25s_ease-out]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acento/10 lg:hidden">
          <IconeUsuario className="h-6 w-6 text-acento" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-tinta-card">Criar conta</h1>
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
      </div>
    </main>
  );
}
