import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { EtiquetaPrioridade, EtiquetaStatus } from '../components/Etiquetas';
import { IconeBusca, IconeComentario } from '../components/Icones';
import { Spinner } from '../components/Spinner';
import type { CategoriaChamado, Chamado, StatusChamado } from '../types/chamado';

// Colunas do kanban, na ordem em que aparecem na tela. Usa o status
// como divisor porque e o dado que ja existe no schema -- o sistema
// nao tem prazo/SLA para replicar as colunas de um Zendesk real.
// O rotulo de cada uma vem de EtiquetaStatus, entao aqui so a ordem.
const STATUS_EM_ORDEM: StatusChamado[] = ['aberto', 'em_andamento', 'fechado'];

const TITULOS_VISTA: Record<string, string> = {
  '': 'Todos os chamados',
  meus: 'Meus chamados',
  semTecnico: 'Chamados sem tecnico',
};

const CATEGORIAS: { valor: CategoriaChamado; rotulo: string }[] = [
  { valor: 'hardware', rotulo: 'Hardware' },
  { valor: 'software', rotulo: 'Software' },
  { valor: 'rede', rotulo: 'Rede' },
  { valor: 'acesso', rotulo: 'Acesso' },
  { valor: 'outro', rotulo: 'Outro' },
];

const ROTULOS_STATUS: Record<StatusChamado, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  fechado: 'Fechado',
};

// Cor da barra lateral do card: usa a mesma cor da etiqueta de
// prioridade, so que como faixa solida em vez de texto.
const BARRA_PRIORIDADE: Record<Chamado['prioridade'], string> = {
  baixa: 'bg-prioridade-baixa',
  media: 'bg-prioridade-media',
  alta: 'bg-prioridade-alta',
  urgente: 'bg-prioridade-urgente',
};

/** So o miolo visual do card, sem nada de drag: reusado no card normal
 * e na copia flutuante do DragOverlay. */
function ConteudoCartao({ chamado }: { chamado: Chamado }) {
  const fechado = chamado.status === 'fechado';

  return (
    <>
      <h3
        className={
          'text-base font-semibold leading-snug ' +
          (fechado
            ? 'text-tinta-card-suave line-through'
            : 'text-tinta-card')
        }
      >
        {chamado.titulo}
      </h3>

      <p
        className={
          'mt-1.5 line-clamp-2 text-sm leading-relaxed ' +
          (fechado ? 'text-tinta-card-suave/70' : 'text-tinta-card-suave')
        }
      >
        {chamado.descricao}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <EtiquetaPrioridade prioridade={chamado.prioridade} />

        <div className="flex items-center gap-2">
          {!!chamado.total_comentarios && (
            <span className="flex items-center gap-1 text-tinta-card-suave">
              <IconeComentario className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {chamado.total_comentarios}
              </span>
            </span>
          )}
          <Avatar nome={chamado.solicitante_nome} />
        </div>
      </div>
    </>
  );
}

function CartaoChamado({
  chamado,
  arrastavel,
}: {
  chamado: Chamado;
  arrastavel: boolean;
}) {
  // disabled vem da tela: usuario comum nao pode mudar status (a API
  // ja recusa com 403), entao nem oferecemos o arrasto para ele.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chamado.id,
    disabled: !arrastavel,
  });
  const navegar = useNavigate();

  // Guarda se o arraste chegou a mover o card. O duplo clique dispara
  // no pointerup, momento em que isDragging ja voltou a false -- entao
  // checar isDragging direto no evento nao bloqueia a navegacao apos
  // um arraste que termina em area vazia. A ref sobrevive a esse
  // intervalo, garantindo que arrastar nunca abre o chamado.
  const chegouAMover = useRef(false);
  if (isDragging) chegouAMover.current = true;

  function aoClicar() {
    if (chegouAMover.current) {
      chegouAMover.current = false;
      return;
    }
    navegar(`/chamados/${chamado.id}`);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ touchAction: arrastavel ? 'none' : undefined }}
      {...listeners}
      {...attributes}
      // Enquanto arrasta, o original fica invisivel mas continua
      // ocupando o espaco (visibility, nao display): assim o layout da
      // coluna nao pula, e quem se move de verdade e o DragOverlay, que
      // vive fora do fluxo do documento -- por isso ele nao faz a
      // pagina crescer nem a barra de rolagem aparecer durante o
      // arraste, diferente de mover o proprio card com transform.
      className={
        'flex overflow-hidden rounded-lg bg-superficie ' +
        (arrastavel ? 'cursor-grab active:cursor-grabbing ' : '') +
        (isDragging
          ? 'invisible'
          : 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg')
      }
    >
      {/* Barra lateral colorida: indica a prioridade de relance, sem
          precisar ler o texto da etiqueta. */}
      <span className={`w-1.5 shrink-0 ${BARRA_PRIORIDADE[chamado.prioridade]}`} />

      <div
        role="button"
        tabIndex={0}
        // Duplo clique abre o chamado, nao um clique simples: assim um
        // clique isolado no card nao dispara navegacao por acidente.
        onDoubleClick={aoClicar}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            aoClicar();
          }
        }}
        className="block flex-1 p-4"
      >
        <ConteudoCartao chamado={chamado} />
      </div>
    </div>
  );
}

function Coluna({
  status,
  chamados,
  arrastavel,
}: {
  status: StatusChamado;
  chamados: Chamado[];
  arrastavel: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      // flex-1 com min-w: as colunas dividem igualmente o espaco
      // disponivel em telas largas, mas nao encolhem alem do minimo em
      // telas estreitas -- ai o overflow-x-auto do quadro assume.
      className={
        'min-w-[280px] flex-1 rounded-lg p-1 transition-colors ' +
        (isOver ? 'bg-realce' : '')
      }
    >
      <div className="flex items-baseline gap-1.5 px-2 py-2">
        <EtiquetaStatus status={status} />
        <span className="text-sm text-tinta-suave">· {chamados.length}</span>
      </div>

      <div className="space-y-2 px-1 pb-1">
        {chamados.length === 0 && (
          <p className="rounded-lg border border-dashed border-linha px-3 py-6 text-center text-xs text-tinta-suave">
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
  const [toast, setToast] = useState<string | null>(null);

  // Some sozinho apos um tempo: nao exige que o usuario feche a
  // mensagem, so confirma rapidamente que a acao funcionou.
  useEffect(() => {
    if (!toast) return;
    const temporizador = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(temporizador);
  }, [toast]);
  const [busca, setBusca] = useState('');
  // '' representa "todas as categorias": select nao tem estado ausente
  // como um checkbox, entao precisa de um valor proprio para "sem filtro".
  const [categoria, setCategoria] = useState<CategoriaChamado | ''>('');

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
        categoria: categoria || undefined,
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
  }, [meus, semTecnico, categoria, usuario]);

  // Busca no titulo, filtrando o que ja esta carregado -- nao existe
  // endpoint de busca por texto no backend, e criar um so para isso
  // seria desproporcional ao que a tela precisa.
  const chamadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return chamados;
    return chamados.filter((c) => c.titulo.toLowerCase().includes(termo));
  }, [chamados, busca]);

  // Chamado sendo arrastado no momento, para desenhar no DragOverlay.
  const [chamadoArrastado, setChamadoArrastado] = useState<Chamado | null>(
    null
  );

  function aoComecarArraste(evento: DragStartEvent) {
    const id = Number(evento.active.id);
    setChamadoArrastado(chamados.find((c) => c.id === id) ?? null);
  }

  async function aoSoltar(evento: DragEndEvent) {
    setChamadoArrastado(null);

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
      setToast(`"${atual.titulo}" movido para ${ROTULOS_STATUS[novoStatus]}`);
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

  // activationConstraint com distancia minima: sem isso, qualquer
  // clique no card pode ser interpretado como inicio de arraste,
  // competindo com a navegacao para o detalhe do chamado.
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  return (
    <div className="min-h-screen bg-papel">
      <header className="flex items-center justify-between gap-4 border-b border-linha px-8 py-5">
        <div>
          <p className="text-sm font-medium text-tinta-suave">Painel</p>
          <h2 className="text-3xl font-bold tracking-tight text-tinta">
            {TITULOS_VISTA[vista]}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaChamado | '')}
            className="rounded-lg border border-linha bg-realce px-3 py-2 text-sm text-tinta focus:border-linha-forte focus:outline-none"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>

          <label className="relative">
            <IconeBusca className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-suave" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar chamados..."
              className="w-64 rounded-lg border border-linha bg-realce py-2 pl-9 pr-3 text-sm text-tinta placeholder:text-tinta-suave focus:border-linha-forte focus:outline-none"
            />
          </label>
        </div>
      </header>

      <main className="px-8 py-6">
        {carregando && (
          <div className="flex items-center gap-2 text-tinta-suave">
            <Spinner />
            Carregando...
          </div>
        )}

        {erro && (
          <p
            role="alert"
            className="rounded-lg border border-prioridade-urgente/30 bg-prioridade-urgente/5 px-4 py-3 text-sm text-prioridade-urgente"
          >
            {erro}
          </p>
        )}

        {erroArraste && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-prioridade-urgente/30 bg-prioridade-urgente/5 px-4 py-3 text-sm text-prioridade-urgente"
          >
            {erroArraste}
          </p>
        )}

        {/* autoScroll desligado: por padrao o dnd-kit rola a pagina e o
            quadro (overflow-x-auto abaixo) quando o ponteiro chega perto
            da borda durante o arraste. Aqui o card deve so se mover
            visualmente entre as colunas, sem disparar scroll nenhum. */}
        {!carregando && !erro && (
          <DndContext
            sensors={sensores}
            autoScroll={false}
            onDragStart={aoComecarArraste}
            onDragEnd={aoSoltar}
          >
            <div className="flex gap-3 overflow-x-auto pb-4">
              {STATUS_EM_ORDEM.map((status) => (
                <Coluna
                  key={status}
                  status={status}
                  chamados={chamadosFiltrados.filter((c) => c.status === status)}
                  arrastavel={podeArrastar}
                />
              ))}
            </div>

            {/* Copia flutuante do card durante o arraste, fora do fluxo
                do documento (position: fixed internamente ao dnd-kit).
                Sem ela, o card original precisaria se mover com
                transform dentro do proprio layout, o que fazia a
                coluna crescer e a barra de rolagem aparecer. */}
            <DragOverlay>
              {chamadoArrastado && (
                <div className="flex w-[284px] overflow-hidden rounded-lg bg-superficie shadow-lg">
                  <span
                    className={`w-1.5 shrink-0 ${BARRA_PRIORIDADE[chamadoArrastado.prioridade]}`}
                  />
                  <div className="flex-1 p-4">
                    <ConteudoCartao chamado={chamadoArrastado} />
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 animate-[subir_0.2s_ease-out] rounded-lg bg-acento px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
