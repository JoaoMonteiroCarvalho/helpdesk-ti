import { useEffect, useState } from 'react';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { Chamado, PrioridadeChamado, StatusChamado } from '../types/chamado';

// As classes precisam aparecer escritas por extenso no codigo.
// O Tailwind gera o CSS lendo o texto dos arquivos no build, entao
// algo como `bg-${cor}-100` nunca e encontrado e a classe nao existe
// no CSS final -- o elemento simplesmente aparece sem cor.
const CORES_STATUS: Record<StatusChamado, string> = {
  aberto: 'bg-amber-100 text-amber-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  fechado: 'bg-emerald-100 text-emerald-800',
};

const ROTULOS_STATUS: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  fechado: 'Fechado',
};

const CORES_PRIORIDADE: Record<PrioridadeChamado, string> = {
  baixa: 'bg-slate-100 text-slate-700',
  media: 'bg-sky-100 text-sky-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CartaoChamado({ chamado }: { chamado: Chamado }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-semibold text-slate-900">{chamado.titulo}</h2>

        <div className="flex shrink-0 gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES_STATUS[chamado.status]}`}
          >
            {ROTULOS_STATUS[chamado.status]}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES_PRIORIDADE[chamado.prioridade]}`}
          >
            {chamado.prioridade}
          </span>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {chamado.descricao}
      </p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <div className="flex gap-1">
          <dt>Aberto por</dt>
          <dd className="font-medium text-slate-700">
            {chamado.solicitante_nome}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt>Tecnico</dt>
          <dd className="font-medium text-slate-700">
            {chamado.tecnico_nome ?? 'nao atribuido'}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt>Categoria</dt>
          <dd className="font-medium text-slate-700">{chamado.categoria}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Criado em</dt>
          <dd className="font-medium text-slate-700">
            {formatarData(chamado.criado_em)}
          </dd>
        </div>
      </dl>
    </li>
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
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">helpdesk-ti</h1>
            <p className="text-sm text-slate-500">
              {usuario?.nome}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {usuario?.papel}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Chamados</h2>
          {!carregando && !erro && (
            <span className="text-sm text-slate-500">
              {chamados.length}{' '}
              {chamados.length === 1 ? 'chamado' : 'chamados'}
            </span>
          )}
        </div>

        {carregando && <p className="mt-8 text-slate-500">Carregando...</p>}

        {erro && (
          <p
            role="alert"
            className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {/* Estado vazio explicito: sem ele, quem nao tem chamado nenhum
            veria uma pagina em branco sem saber se quebrou. */}
        {!carregando && !erro && chamados.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-slate-600">Nenhum chamado por aqui.</p>
            <p className="mt-1 text-sm text-slate-500">
              {usuario?.papel === 'tecnico'
                ? 'Nenhum chamado foi aberto ainda.'
                : 'Voce ainda nao abriu nenhum chamado.'}
            </p>
          </div>
        )}

        {!carregando && !erro && chamados.length > 0 && (
          <ul className="mt-6 space-y-3">
            {chamados.map((chamado) => (
              <CartaoChamado key={chamado.id} chamado={chamado} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
