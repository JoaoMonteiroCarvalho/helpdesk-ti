import { useEffect, useState } from 'react'

type EstadoApi =
  | { situacao: 'carregando' }
  | { situacao: 'ok'; mensagem: string }
  | { situacao: 'erro'; mensagem: string }

function App() {
  const [api, setApi] = useState<EstadoApi>({ situacao: 'carregando' })

  useEffect(() => {
    // /api e redirecionado para http://localhost:3000 pelo proxy do Vite
    // (veja vite.config.ts).
    fetch('/api/health')
      .then((r) => r.json())
      .then((dados) => setApi({ situacao: 'ok', mensagem: dados.message }))
      .catch(() => setApi({ situacao: 'erro', mensagem: 'Backend offline' }))
  }, [])

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">helpdesk-ti</h1>
        <p className="mt-1 text-slate-600">Sistema de gestao de chamados</p>

        <div className="mt-6 rounded-lg border border-slate-200 p-4">
          <span className="text-sm font-medium text-slate-500">
            Status do backend
          </span>

          <p className="mt-2 flex items-center gap-2">
            <span
              className={
                'inline-block h-2.5 w-2.5 rounded-full ' +
                (api.situacao === 'ok'
                  ? 'bg-green-500'
                  : api.situacao === 'erro'
                    ? 'bg-red-500'
                    : 'bg-amber-400')
              }
            />
            <span className="text-slate-800">
              {api.situacao === 'carregando' ? 'Verificando...' : api.mensagem}
            </span>
          </p>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Se este cartao esta estilizado, o Tailwind CSS esta funcionando.
        </p>
      </div>
    </main>
  )
}

export default App
