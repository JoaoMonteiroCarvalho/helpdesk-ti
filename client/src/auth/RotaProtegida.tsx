import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Barreira de autenticacao para um grupo de rotas.
 *
 * Usado como rota de layout, sem path proprio:
 *
 *   <Route element={<RotaProtegida />}>
 *     <Route path="/" element={<Inicio />} />
 *     <Route path="/chamados" element={<Chamados />} />
 *   </Route>
 *
 * Assim a protecao e declarada uma vez e toda rota aninhada herda,
 * em vez de repetir a checagem em cada pagina -- onde bastaria
 * esquecer uma para expo-la por inteiro.
 *
 * O <Outlet /> e o ponto onde o router encaixa a rota filha.
 */
export function RotaProtegida() {
  const { usuario, carregando } = useAuth();

  // Terceiro estado: nem logado, nem deslogado. Redirecionar aqui
  // mandaria para o login quem esta autenticado, a cada F5.
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Carregando...</p>
      </main>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
