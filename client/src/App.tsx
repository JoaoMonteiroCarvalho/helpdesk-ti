import { Navigate, Route, Routes } from 'react-router-dom';
import { RotaProtegida } from './auth/RotaProtegida';
import { Chamados } from './pages/Chamados';
import { DetalheChamado } from './pages/DetalheChamado';
import { Login } from './pages/Login';
import { NovoChamado } from './pages/NovoChamado';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rota de layout sem path: tudo aninhado aqui exige sessao. */}
      <Route element={<RotaProtegida />}>
        <Route path="/chamados" element={<Chamados />} />
        <Route path="/chamados/novo" element={<NovoChamado />} />
        <Route path="/chamados/:id" element={<DetalheChamado />} />
      </Route>

      <Route path="/" element={<Navigate to="/chamados" replace />} />
      <Route path="*" element={<Navigate to="/chamados" replace />} />
    </Routes>
  );
}

export default App;
