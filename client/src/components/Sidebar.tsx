import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ItemMenu {
  rotulo: string;
  href: string;
  // Compara so a query string: os tres itens de listagem apontam para
  // /chamados, diferenciados por parametro (ver Chamados.tsx).
  ativoEm: (busca: string) => boolean;
  soTecnico?: boolean;
}

const ITENS: ItemMenu[] = [
  {
    rotulo: 'Todos os chamados',
    href: '/chamados',
    ativoEm: (busca) => busca === '',
  },
  {
    rotulo: 'Meus chamados',
    href: '/chamados?meus=1',
    ativoEm: (busca) => new URLSearchParams(busca).get('meus') === '1',
  },
  {
    rotulo: 'Sem tecnico',
    href: '/chamados?semTecnico=1',
    ativoEm: (busca) => new URLSearchParams(busca).get('semTecnico') === '1',
    soTecnico: true,
  },
];

export function Sidebar() {
  const { usuario, sair } = useAuth();
  const local = useLocation();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <h1 className="text-lg font-bold text-slate-900">helpdesk-ti</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ITENS.filter((item) => !item.soTecnico || usuario?.papel === 'tecnico').map(
          (item) => {
            const ativo =
              local.pathname === '/chamados' && item.ativoEm(local.search);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={
                  'block rounded-lg px-3 py-2 text-sm font-medium ' +
                  (ativo
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100')
                }
              >
                {item.rotulo}
              </Link>
            );
          }
        )}

        <Link
          to="/chamados/novo"
          className="mt-4 block rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo chamado
        </Link>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-900">{usuario?.nome}</p>
        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {usuario?.papel}
        </span>
        <button
          type="button"
          onClick={sair}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
