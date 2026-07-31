import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from './Avatar';
import {
  IconeChamados,
  IconeMais,
  IconeSair,
  IconeSemTecnico,
  IconeUsuario,
} from './Icones';

interface ItemMenu {
  rotulo: string;
  href: string;
  // Compara so a query string: os tres itens de listagem apontam para
  // /chamados, diferenciados por parametro (ver Chamados.tsx).
  ativoEm: (busca: string) => boolean;
  Icone: (props: { className?: string }) => React.ReactElement;
  soTecnico?: boolean;
}

const ITENS: ItemMenu[] = [
  {
    rotulo: 'Todos',
    href: '/chamados',
    ativoEm: (busca) => busca === '',
    Icone: IconeChamados,
  },
  {
    rotulo: 'Meus chamados',
    href: '/chamados?meus=1',
    ativoEm: (busca) => new URLSearchParams(busca).get('meus') === '1',
    Icone: IconeUsuario,
  },
  {
    rotulo: 'Sem técnico',
    href: '/chamados?semTecnico=1',
    ativoEm: (busca) => new URLSearchParams(busca).get('semTecnico') === '1',
    Icone: IconeSemTecnico,
    soTecnico: true,
  },
];

const ROTULOS_PAPEL: Record<string, string> = {
  tecnico: 'Tecnico',
  usuario: 'Usuario',
};

export function Sidebar() {
  const { usuario, sair } = useAuth();
  const local = useLocation();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-papel">
      <div className="px-5 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-tinta">
          Chamados TI
        </h1>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {ITENS.filter((item) => !item.soTecnico || usuario?.papel === 'tecnico').map(
          (item) => {
            const ativo =
              local.pathname === '/chamados' && item.ativoEm(local.search);
            return (
              <Link
                key={item.href}
                to={item.href}
                // Barra lateral colorida no item ativo, no mesmo estilo
                // da barra de prioridade nos cards do kanban -- reusa o
                // mesmo vocabulario visual em vez de inventar um novo.
                className={
                  'flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ' +
                  (ativo
                    ? 'border-acento bg-realce text-tinta'
                    : 'border-transparent text-tinta-suave hover:bg-realce/60 hover:text-tinta')
                }
              >
                <item.Icone className="h-[18px] w-[18px] shrink-0" />
                {item.rotulo}
              </Link>
            );
          }
        )}
      </nav>

      <div className="px-3 pb-6">
        <div className="mx-3 mb-4 border-t border-linha" />
        <Link
          to="/chamados/novo"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-acento px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-acento/90 active:scale-[0.98]"
        >
          <IconeMais className="h-4 w-4" />
          Novo chamado
        </Link>
      </div>

      <div className="border-t border-linha p-4">
        <div className="flex items-center gap-2.5">
          <Avatar nome={usuario?.nome ?? '?'} tamanho="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-tinta">
              {usuario?.nome}
            </p>
            <span className="text-xs text-tinta-suave">
              {ROTULOS_PAPEL[usuario?.papel ?? ''] ?? usuario?.papel}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={sair}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-sm font-medium text-tinta-suave transition-all hover:text-tinta active:scale-[0.98]"
        >
          <IconeSair className="h-[18px] w-[18px]" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
