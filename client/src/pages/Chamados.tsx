import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { EtiquetaPrioridade } from '../components/Etiquetas';
import type { Chamado, StatusChamado } from '../types/chamado';

// Colunas do kanban, na ordem em que aparecem na tela. Usa o status
// como divisor porque e o dado que ja existe no schema -- o sistema
// nao tem prazo/SLA para replicar as colunas de um Zendesk real.
const COLUNAS: { status: StatusChamado; titulo: string; cor: string }[] = [
  { status: 'aberto', titulo: 'Aberto', cor: 'border-t-amber-400' },
  { status: 'em_andamento', titulo: 'Em andamento', cor: 'border-t-blue-400' },
  { status: 'fechado', titulo: 'Fechado', cor: 'border-t-emerald-400' },
];

function CartaoChamado({ chamado }: { chamado: Chamado }) {
  return (
    <Link
      to={`/chamados/${chamado.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-900">
          {chamado.titulo}
        </h3>
        <EtiquetaPrioridade prioridade={chamado.prioridade} />
      </div>

      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
        {chamado.descricao}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar nome={chamado.solicitante_nome} />
          {chamado.tecnico_nome && (
            <>
              <span className="text-xs text-slate-300">→</span>
              <Avatar nome={chamado.tecnico_nome} />
            </>
          )}
        </div>

        {!!chamado.total_comentarios && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            💬 {chamado.total_comentarios}
          </span>
        )}
      </div>
    </Link>
  );
}

function Coluna({
  titulo,
  cor,
  chamados,
}: {
  titulo: string;
  cor: string;
  chamados: Chamado[];
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className={`flex items-center justify-between border-t-4 ${cor} rounded-t-lg bg-white px-4 py-3 shadow-sm`}>
        <h2 className="text-sm font-semibold text-slate-700">{titulo}</h2>
        <span className="text-xs text-slate-400">{chamados.length}</span>
      </div>

      <div className="mt-3 space-y-3">
        {chamados.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            Nenhum chamado
          </p>
        )}
        {chamados.map((chamado) => (
          <CartaoChamado key={chamado.id} chamado={chamado} />
        ))}
      </div>
    </div>
  );
}

export function Chamados() {
  const { usuario, sair } = useAuth();

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    chamadosApi
      .listar()
      .then((resposta) => setChamados(resposta.chamados))
      .catch((falha) =>
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : 'Nao foi possivel carregar os chamados'
        )
      )
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">helpdesk-ti</h1>
            <p className="text-sm text-slate-500">
              {usuario?.nome}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {usuario?.papel}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/chamados/novo"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Novo chamado
            </Link>
            <button
              type="button"
              onClick={sair}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {carregando && <p className="text-slate-500">Carregando...</p>}

        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {!carregando && !erro && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUNAS.map((coluna) => (
              <Coluna
                key={coluna.status}
                titulo={coluna.titulo}
                cor={coluna.cor}
                chamados={chamados.filter((c) => c.status === coluna.status)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
