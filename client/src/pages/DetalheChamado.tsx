import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { EtiquetaPrioridade, EtiquetaStatus } from '../components/Etiquetas';
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
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link to="/chamados" className="text-sm text-slate-500 hover:underline">
            &larr; Voltar para os chamados
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {carregando && <p className="text-slate-500">Carregando...</p>}

        {erro && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        {chamado && (
          <>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-xl font-semibold text-slate-900">
                  {chamado.titulo}
                </h1>
                <div className="flex shrink-0 gap-2">
                  <EtiquetaStatus status={chamado.status} />
                  <EtiquetaPrioridade prioridade={chamado.prioridade} />
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-slate-700">
                {chamado.descricao}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Aberto por</dt>
                  <dd className="font-medium text-slate-900">
                    {chamado.solicitante_nome}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tecnico</dt>
                  <dd className="font-medium text-slate-900">
                    {chamado.tecnico_nome ?? 'nao atribuido'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Categoria</dt>
                  <dd className="font-medium text-slate-900">
                    {chamado.categoria}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Criado em</dt>
                  <dd className="font-medium text-slate-900">
                    {formatarData(chamado.criado_em)}
                  </dd>
                </div>
              </dl>

              {usuario?.papel === 'tecnico' && (
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  {!chamado.tecnico_nome && (
                    <button
                      type="button"
                      onClick={aoAssumir}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      Assumir chamado
                    </button>
                  )}

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    Status
                    <select
                      value={chamado.status}
                      onChange={(e) =>
                        aoMudarStatus(e.target.value as StatusChamado)
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5"
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
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {erroAcao}
                </p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-slate-900">
                Comentarios ({comentarios.length})
              </h2>

              {comentarios.length === 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  Nenhum comentario ainda.
                </p>
              )}

              <ul className="mt-3 space-y-3">
                {comentarios.map((comentario) => (
                  <li
                    key={comentario.id}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        {comentario.autor_nome}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatarData(comentario.criado_em)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                />

                {erroComentario && (
                  <p role="alert" className="text-sm text-red-700">
                    {erroComentario}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:bg-slate-400"
                >
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
