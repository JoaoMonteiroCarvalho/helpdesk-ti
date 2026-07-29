import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Sidebar } from '../components/Sidebar';

/**
 * Barreira de autenticacao para um grupo de rotas. Tambem monta a
 * sidebar, que assim aparece em toda tela protegida sem repetir isso
 * em cada pagina.
 *
 * Usado como rota de layout, sem path proprio:
 *
 *   <Route element={<RotaProtegida />}>
 *     <Route path="/" element={<Inicio />} />
 *     <Route path="/chamados" element={<Chamados />} />
 *   </Route>
 *
 * O <Outlet /> e o ponto onde o router encaixa a rota filha.
 */
export function RotaProtegida() {
  const { usuario, carregando } = useAuth();

  // Terceiro estado: nem logado, nem deslogado. Redirecionar aqui
  // mandaria para o login quem esta autenticado, a cada F5.
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-tinta-suave">Carregando...</p>
      </main>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-w-0 flex-1 border-l border-linha">
        <Outlet />
      </div>
    </div>
  );
}
