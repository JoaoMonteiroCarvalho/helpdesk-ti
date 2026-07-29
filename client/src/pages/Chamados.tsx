import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { EtiquetaPrioridade } from '../components/Etiquetas';
import type { Chamado, StatusChamado } from '../types/chamado';

// Colunas do kanban, na ordem em que aparecem na tela. Usa o status
// como divisor porque e o dado que ja existe no schema -- o sistema
// nao tem prazo/SLA para replicar as colunas de um Zendesk real.
//
// As classes de cor precisam aparecer por extenso: o Tailwind gera o
// CSS lendo o texto dos arquivos, e uma classe montada em tempo de
// execucao nunca seria encontrada.
const COLUNAS: { status: StatusChamado; titulo: string; cabecalho: string }[] = [
  { status: 'aberto', titulo: 'Aberto', cabecalho: 'bg-amber-400' },
  { status: 'em_andamento', titulo: 'Em andamento', cabecalho: 'bg-blue-400' },
  { status: 'fechado', titulo: 'Fechado', cabecalho: 'bg-emerald-400' },
];

const TITULOS_VISTA: Record<string, string> = {
  '': 'Todos os chamados',
  meus: 'Meus chamados',
  semTecnico: 'Chamados sem tecnico',
};

function CartaoChamado({
  chamado,
  arrastavel,
}: {
  chamado: Chamado;
  arrastavel: boolean;
}) {
  // disabled vem da tela: usuario comum nao pode mudar status (a API
  // ja recusa com 403), entao nem oferecemos o arrasto para ele.
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: chamado.id, disabled: !arrastavel });

  const estilo = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      {...listeners}
      {...attributes}
      className={
        'rounded-xl bg-white p-3.5 shadow-sm transition-shadow duration-150 ' +
        (arrastavel ? 'cursor-grab active:cursor-grabbing ' : '') +
        (isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md')
      }
    >
      <Link
        to={`/chamados/${chamado.id}`}
        // Se comecar a arrastar, o clique nao deve navegar: dnd-kit so
        // dispara o drag apos um pequeno deslocamento do mouse, entao
        // um clique parado ainda funciona como link normalmente.
        onClick={(evento) => isDragging && evento.preventDefault()}
        className="block"
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
    </div>
  );
}

function Coluna({
  status,
  titulo,
  cabecalho,
  chamados,
  arrastavel,
}: {
  status: StatusChamado;
  titulo: string;
  cabecalho: string;
  chamados: Chamado[];
  arrastavel: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={
        'w-72 shrink-0 rounded-2xl p-2 transition-colors ' +
        (isOver ? 'bg-slate-200' : 'bg-slate-100/80')
      }
    >
      <div
        className={`flex items-center justify-between rounded-xl ${cabecalho} px-3 py-2`}
      >
        <h2 className="text-sm font-semibold text-white">{titulo}</h2>
        <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold text-white">
          {chamados.length}
        </span>
      </div>

      <div className="mt-2 space-y-2">
        {chamados.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
            Nenhum chamado
          </p>
        )}
        {chamados.map((chamado, indice) => (
          <div
            key={chamado.id}
            className="animate-[entrada_0.2s_ease-out_backwards]"
            style={{ animationDelay: `${indice * 30}ms` }}
          >
            <CartaoChamado chamado={chamado} arrastavel={arrastavel} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Chamados() {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroArraste, setErroArraste] = useState<string | null>(null);

  // "meus" e "semTecnico" sao os atalhos da sidebar (ver Sidebar.tsx),
  // lidos daqui via query string em vez de rotas separadas para cada
  // vista, ja que todas usam o mesmo layout de kanban.
  const meus = searchParams.get('meus') === '1';
  const semTecnico = searchParams.get('semTecnico') === '1';
  const vista = semTecnico ? 'semTecnico' : meus ? 'meus' : '';

  useEffect(() => {
    setCarregando(true);
    setErro(null);

    chamadosApi
      .listar({
        tecnicoId: meus && usuario?.papel === 'tecnico' ? usuario.id : undefined,
        semTecnico,
      })
      .then((resposta) => setChamados(resposta.chamados))
      .catch((falha) =>
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : 'Nao foi possivel carregar os chamados'
        )
      )
      .finally(() => setCarregando(false));
  }, [meus, semTecnico, usuario]);

  async function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over) return;

    const chamadoId = Number(active.id);
    const novoStatus = over.id as StatusChamado;
    const atual = chamados.find((c) => c.id === chamadoId);

    if (!atual || atual.status === novoStatus) return;

    // Atualizacao otimista: muda a tela na hora para o arraste parecer
    // instantaneo, e desfaz se a API recusar.
    setErroArraste(null);
    setChamados((lista) =>
      lista.map((c) => (c.id === chamadoId ? { ...c, status: novoStatus } : c))
    );

    try {
      await chamadosApi.atualizarStatus(chamadoId, novoStatus);
    } catch (falha) {
      setChamados((lista) =>
        lista.map((c) => (c.id === chamadoId ? { ...c, status: atual.status } : c))
      );
      setErroArraste(
        falha instanceof ErroApi
          ? falha.message
          : 'Nao foi possivel mover o chamado'
      );
    }
  }

  const podeArrastar = usuario?.papel === 'tecnico';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <header className="border-b border-slate-200/60 bg-white/60 px-6 py-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {TITULOS_VISTA[vista]}
        </h2>
      </header>

      <main className="px-6 py-6">
        {carregando && <p className="text-slate-500">Carregando...</p>}

        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {erroArraste && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erroArraste}
          </p>
        )}

        {!carregando && !erro && (
          <DndContext onDragEnd={aoSoltar}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUNAS.map((coluna) => (
                <Coluna
                  key={coluna.status}
                  status={coluna.status}
                  titulo={coluna.titulo}
                  cabecalho={coluna.cabecalho}
                  chamados={chamados.filter((c) => c.status === coluna.status)}
                  arrastavel={podeArrastar}
                />
              ))}
            </div>
          </DndContext>
        )}
      </main>
    </div>
  );
}
