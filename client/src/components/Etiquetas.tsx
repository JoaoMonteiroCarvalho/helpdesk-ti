import type { PrioridadeChamado, StatusChamado } from '../types/chamado';

// As classes precisam aparecer escritas por extenso: o Tailwind gera o
// CSS lendo o texto dos arquivos, entao uma classe montada em tempo de
// execucao nunca seria encontrada e o elemento apareceria sem cor.

const ROTULOS_STATUS: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  fechado: 'Fechado',
};

const PONTO_STATUS: Record<StatusChamado, string> = {
  aberto: 'bg-status-aberto',
  em_andamento: 'bg-status-andamento',
  fechado: 'bg-status-fechado',
};

/** Ponto + texto, usado nos titulos das colunas do kanban. */
export function EtiquetaStatus({ status }: { status: StatusChamado }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-tinta">
      <span className={`h-1.5 w-1.5 rounded-full ${PONTO_STATUS[status]}`} />
      {ROTULOS_STATUS[status]}
    </span>
  );
}

// Prioridade e sempre uma pilula cinza-clara com texto colorido: o
// fundo nao muda de cor, so o texto -- assim as quatro prioridades
// tem o mesmo peso visual e a cor vira o unico sinal de urgencia.
const CORES_PRIORIDADE: Record<PrioridadeChamado, string> = {
  baixa: 'text-prioridade-baixa',
  media: 'text-prioridade-media',
  alta: 'text-prioridade-alta',
  urgente: 'text-prioridade-urgente',
};

const ROTULOS_PRIORIDADE: Record<PrioridadeChamado, string> = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function EtiquetaPrioridade({
  prioridade,
}: {
  prioridade: PrioridadeChamado;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-realce px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${CORES_PRIORIDADE[prioridade]}`}
    >
      {ROTULOS_PRIORIDADE[prioridade]}
    </span>
  );
}
