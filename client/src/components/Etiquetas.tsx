import type { PrioridadeChamado, StatusChamado } from '../types/chamado';

// As classes precisam aparecer escritas por extenso: o Tailwind gera o
// CSS lendo o texto dos arquivos, entao uma classe montada em tempo de
// execucao nunca seria encontrada e o elemento apareceria sem cor.

const ROTULOS_STATUS: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  fechado: 'Fechado',
};

/** Texto do titulo de cada coluna do kanban, na cor de acento. */
export function EtiquetaStatus({ status }: { status: StatusChamado }) {
  return (
    <span className="text-sm font-medium text-status-aberto">
      {ROTULOS_STATUS[status]}
    </span>
  );
}

// So o texto muda de cor, sem fundo: as quatro prioridades tem o
// mesmo peso visual e a cor vira o unico sinal de urgencia.
const CORES_PRIORIDADE: Record<PrioridadeChamado, string> = {
  baixa: 'text-prioridade-baixa',
  media: 'text-prioridade-media',
  alta: 'text-prioridade-alta',
  urgente: 'text-prioridade-urgente',
};

const ROTULOS_PRIORIDADE: Record<PrioridadeChamado, string> = {
  baixa: 'baixa',
  media: 'média',
  alta: 'alta',
  urgente: 'urgente',
};

export function EtiquetaPrioridade({
  prioridade,
}: {
  prioridade: PrioridadeChamado;
}) {
  return (
    <span className={`text-sm font-medium ${CORES_PRIORIDADE[prioridade]}`}>
      {ROTULOS_PRIORIDADE[prioridade]}
    </span>
  );
}
