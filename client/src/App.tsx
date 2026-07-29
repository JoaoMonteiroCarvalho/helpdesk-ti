import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Login } from './pages/Login';

/**
 * Tela inicial TEMPORARIA.
 *
 * Serve para confirmar visualmente que a sessao funciona enquanto a
 * listagem de chamados nao existe. Sera substituida por ela.
 */
function Inicio() {
  const { usuario, carregando, sair } = useAuth();

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">helpdesk-ti</h1>

        <div className="mt-6 rounded-lg border border-slate-200 p-4">
          <span className="text-sm font-medium text-slate-500">
            Sessao ativa
          </span>
          <p className="mt-2 text-slate-900">{usuario.nome}</p>
          <p className="text-sm text-slate-600">{usuario.email}</p>
          <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {usuario.papel}
          </span>
        </div>

        <button
          type="button"
          onClick={sair}
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Sair
        </button>
      </div>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Inicio />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
