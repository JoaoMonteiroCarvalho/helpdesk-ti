import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { EtiquetaPrioridade, EtiquetaStatus } from '../components/Etiquetas';
import { Spinner } from '../components/Spinner';
import type { Chamado, Comentario, StatusChamado } from '../types/chamado';

const OPCOES_STATUS: { valor: StatusChamado; rotulo: string }[] = [
  { valor: 'aberto', rotulo: 'Aberto' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'fechado', rotulo: 'Fechado' },
];

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DetalheChamado() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroComentario, setErroComentario] = useState<string | null>(null);

  useEffect(() => {
    chamadosApi
      .buscarPorId(Number(id))
      .then((resposta) => {
        setChamado(resposta.chamado);
        setComentarios(resposta.comentarios);
      })
      .catch((falha) =>
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : 'Nao foi possivel carregar o chamado'
        )
      )
      .finally(() => setCarregando(false));
  }, [id]);

  async function aoAssumir() {
    setErroAcao(null);
    try {
      setChamado(await chamadosApi.assumir(Number(id)));
    } catch (falha) {
      setErroAcao(
        falha instanceof ErroApi ? falha.message : 'Nao foi possivel assumir'
      );
    }
  }

  async function aoMudarStatus(novoStatus: StatusChamado) {
    setErroAcao(null);
    try {
      setChamado(await chamadosApi.atualizarStatus(Number(id), novoStatus));
    } catch (falha) {
      setErroAcao(
        falha instanceof ErroApi ? falha.message : 'Nao foi possivel atualizar'
      );
    }
  }

  async function aoEnviarComentario(evento: React.FormEvent) {
    evento.preventDefault();
    setErroComentario(null);
    setEnviando(true);

    try {
      const novo = await chamadosApi.comentar(Number(id), texto);
      setComentarios((atual) => [...atual, novo]);
      setTexto('');
    } catch (falha) {
      setErroComentario(
        falha instanceof ErroApi
          ? falha.message
          : 'Nao foi possivel enviar o comentario'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-papel">
      <header className="border-b border-linha px-8 py-5">
        <Link
          to="/chamados"
          className="text-sm text-tinta-suave transition-colors hover:text-tinta"
        >
          &larr; Voltar para os chamados
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {carregando && (
          <div className="flex items-center gap-2 text-tinta-suave">
            <Spinner />
            Carregando...
          </div>
        )}

        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-prioridade-urgente/10 px-4 py-3 text-sm text-prioridade-urgente"
          >
            {erro}
          </p>
        )}

        {chamado && (
          <div className="animate-[entrada_0.2s_ease-out]">
            <div className="rounded-xl bg-superficie p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-xl font-semibold text-tinta-card">
                  {chamado.titulo}
                </h1>
                <div className="flex shrink-0 items-center gap-3">
                  <EtiquetaStatus status={chamado.status} />
                  <EtiquetaPrioridade prioridade={chamado.prioridade} />
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-tinta-card-suave">
                {chamado.descricao}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-tinta-card-suave">Aberto por</dt>
                  <dd className="font-medium text-tinta-card">
                    {chamado.solicitante_nome}
                  </dd>
                </div>
                <div>
                  <dt className="text-tinta-card-suave">Tecnico</dt>
                  <dd className="font-medium text-tinta-card">
                    {chamado.tecnico_nome ?? 'nao atribuido'}
                  </dd>
                </div>
                <div>
                  <dt className="text-tinta-card-suave">Categoria</dt>
                  <dd className="font-medium text-tinta-card">
                    {chamado.categoria}
                  </dd>
                </div>
                <div>
                  <dt className="text-tinta-card-suave">Criado em</dt>
                  <dd className="font-medium text-tinta-card">
                    {formatarData(chamado.criado_em)}
                  </dd>
                </div>
              </dl>

              {usuario?.papel === 'tecnico' && (
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-linha-forte/30 pt-4">
                  {!chamado.tecnico_nome && (
                    <button
                      type="button"
                      onClick={aoAssumir}
                      className="rounded-lg bg-acento px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-acento/90 active:scale-[0.98]"
                    >
                      Assumir chamado
                    </button>
                  )}

                  <label className="flex items-center gap-2 text-sm text-tinta-card-suave">
                    Status
                    <select
                      value={chamado.status}
                      onChange={(e) =>
                        aoMudarStatus(e.target.value as StatusChamado)
                      }
                      className="rounded-lg border border-linha-forte/40 bg-superficie px-2 py-1.5 text-tinta-card outline-none transition-colors focus:border-acento"
                    >
                      {OPCOES_STATUS.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                          {opcao.rotulo}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {erroAcao && (
                <p
                  role="alert"
                  className="mt-3 animate-[entrada_0.15s_ease-out] text-sm text-prioridade-urgente"
                >
                  {erroAcao}
                </p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-tinta">
                Comentarios ({comentarios.length})
              </h2>

              {comentarios.length === 0 && (
                <p className="mt-2 text-sm text-tinta-suave">
                  Nenhum comentario ainda.
                </p>
              )}

              <ul className="mt-3 space-y-3">
                {comentarios.map((comentario, indice) => (
                  <li
                    key={comentario.id}
                    style={{ animationDelay: `${indice * 30}ms` }}
                    className="animate-[entrada_0.2s_ease-out_backwards] rounded-lg bg-superficie p-4 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-tinta-card">
                        {comentario.autor_nome}
                      </span>
                      <span className="text-xs text-tinta-card-suave">
                        {formatarData(comentario.criado_em)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-tinta-card-suave">
                      {comentario.texto}
                    </p>
                  </li>
                ))}
              </ul>

              <form onSubmit={aoEnviarComentario} className="mt-4 space-y-2">
                <textarea
                  required
                  rows={3}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escreva um comentario"
                  className="w-full rounded-lg border border-linha-forte/40 bg-superficie px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
                />

                {erroComentario && (
                  <p
                    role="alert"
                    className="animate-[entrada_0.15s_ease-out] text-sm text-prioridade-urgente"
                  >
                    {erroComentario}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex items-center gap-2 rounded-lg bg-acento px-4 py-2 text-sm font-medium text-white transition-all hover:bg-acento/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando && (
                    <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />
                  )}
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
