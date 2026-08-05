import { useRef, useState } from 'react';
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
import { IdenticonOrganico } from '../components/IdenticonOrganico';
import { Spinner } from '../components/Spinner';

export function Login() {
  const { usuario, carregando, entrar } = useAuth();
  const navegar = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [expandindo, setExpandindo] = useState(false);
  const [posicaoSimbolo, setPosicaoSimbolo] = useState<{ top: number; left: number } | null>(
    null
  );
  const refSimbolo = useRef<HTMLDivElement>(null);

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

  // Quem ja entrou nao tem o que fazer nesta tela -- exceto durante a
  // animacao de sucesso, que precisa terminar antes de navegar (senao
  // esse redirecionamento corta ela no meio).
  if (usuario && !sucesso) {
    return <Navigate to="/" replace />;
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    // Valida antes de chamar a API: evita uma ida e volta ao servidor
    // so pra dizer o que da pra checar no proprio navegador.
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setErroEmail(emailValido ? null : 'Informe um e-mail valido');
    setErroSenha(senha ? null : 'Informe a senha');
    if (!emailValido || !senha) {
      return;
    }

    setEnviando(true);

    try {
      await entrar(email, senha);
      // Mostra o "deu certo" por um instante e so entao comeca a
      // expandir o simbolo pela tela toda, navegando quando a
      // expansao (2.4s) estiver terminando.
      setSucesso(true);
      setTimeout(() => {
        // Guarda a posicao exata do simbolo na tela antes de fixa-lo,
        // senao ele "pula" para o canto ao virar position: fixed.
        const retangulo = refSimbolo.current?.getBoundingClientRect();
        if (retangulo) {
          setPosicaoSimbolo({ top: retangulo.top, left: retangulo.left });
        }
        setExpandindo(true);
      }, 500);
      setTimeout(() => navegar('/', { replace: true }), 2800);
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
    <main className="flex min-h-screen">
      {/* Painel ilustrativo: some em telas pequenas, so decorativo.
          Mesmo cartao de preview usado no Cadastro, para dar
          consistencia visual entre as duas telas -- aqui a semente do
          identicon e o e-mail digitado, ja que o login nao tem nome. */}
      <div className="hidden flex-1 flex-col items-center justify-center gap-6 bg-papel textura-pontos p-6 lg:flex">
        <h1 className="text-center text-3xl font-bold text-tinta">Service Desk</h1>

        <div
          ref={refSimbolo}
          style={
            expandindo && posicaoSimbolo
              ? { top: posicaoSimbolo.top, left: posicaoSimbolo.left }
              : undefined
          }
          className={
            'flex h-28 w-28 items-center justify-center bg-acento ' +
            (expandindo ? 'expandir-tela fixed z-50' : 'blob-vivo')
          }
        >
          {/* Some assim que a expansao comeca: as petalas pequenas nao
              acompanham bem um crescimento de 40x, entao fica so o
              fundo solido se expandindo. */}
          {!expandindo && (
            <div key={email} className="animate-[pulso_0.3s_ease-out]">
              <IdenticonOrganico nome={email} className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="text-center">
          <p
            style={{ fontFamily: 'ui-rounded, "Segoe UI Variable Display", var(--font-display)' }}
            className="text-lg font-semibold text-tinta"
          >
            {sucesso ? 'Login realizado!' : 'Bem-vindo de volta'}
          </p>
          <p
            style={{ fontFamily: 'ui-rounded, "Segoe UI Variable Display", var(--font-display)' }}
            className="mt-1 h-4 text-sm font-semibold text-tinta"
          >
            {email}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-superficie p-6">
        {/* Cartao flutuante estilo "modal", com icone circular e
            titulo centralizados, ao inves do formulario solto. */}
        <div className="w-full max-w-sm animate-[entrada_0.25s_ease-out] rounded-2xl bg-superficie p-8 text-center shadow-2xl shadow-black/20 ring-1 ring-black/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-acento/10">
          <IconeCadeado className="h-8 w-8 text-acento" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-tinta-card">Entrar</h1>
        <p className="mt-1 text-sm text-tinta-card-suave">
          Entre para acompanhar seus chamados
        </p>

        <form onSubmit={aoEnviar} className="mt-6 space-y-4 text-left">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-tinta-card-suave"
            >
              E-mail
            </label>
            <div className="relative mt-1">
              <IconeEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-card-suave" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErroEmail(null);
                }}
                className={
                  'w-full rounded-lg border-2 py-2 pl-10 pr-3 text-tinta-card outline-none transition-all focus:ring-4 ' +
                  (erroEmail
                    ? 'border-prioridade-urgente focus:ring-prioridade-urgente/10'
                    : 'border-linha-forte/50 focus:border-acento focus:ring-acento/10')
                }
              />
            </div>
            {erroEmail && (
              <p className="mt-1 text-xs text-prioridade-urgente">{erroEmail}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-xs font-semibold uppercase tracking-wider text-tinta-card-suave"
            >
              Senha
            </label>
            <div className="relative mt-1">
              <IconeCadeadoPequeno className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-card-suave" />
              <input
                id="senha"
                type={senhaVisivel ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErroSenha(null);
                }}
                className={
                  'w-full rounded-lg border-2 py-2 pl-10 pr-9 text-tinta-card outline-none transition-all focus:ring-4 ' +
                  (erroSenha
                    ? 'border-prioridade-urgente focus:ring-prioridade-urgente/10'
                    : 'border-linha-forte/50 focus:border-acento focus:ring-acento/10')
                }
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
            {erroSenha && (
              <p className="mt-1 text-xs text-prioridade-urgente">{erroSenha}</p>
            )}
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-acento px-4 py-2.5 font-medium text-white shadow-lg shadow-acento/30 transition-all hover:bg-acento/90 hover:shadow-acento/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
      </div>
    </main>
  );
}
