import type { PrioridadeChamado, StatusChamado } from '../types/chamado';

// As classes precisam aparecer escritas por extenso: o Tailwind gera o
// CSS lendo o texto dos arquivos, entao uma classe montada em tempo de
// execucao nunca seria encontrada e o elemento apareceria sem cor.
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

const BASE = 'rounded-full px-2.5 py-0.5 text-xs font-medium';

export function EtiquetaStatus({ status }: { status: StatusChamado }) {
  return (
    <span className={`${BASE} ${CORES_STATUS[status]}`}>
      {ROTULOS_STATUS[status]}
    </span>
  );
}

export function EtiquetaPrioridade({
  prioridade,
}: {
  prioridade: PrioridadeChamado;
}) {
  return (
    <span className={`${BASE} ${CORES_PRIORIDADE[prioridade]}`}>
      {prioridade}
    </span>
  );
}
