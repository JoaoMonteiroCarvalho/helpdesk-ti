import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import type { CategoriaChamado, PrioridadeChamado } from '../types/chamado';

const CATEGORIAS: { valor: CategoriaChamado; rotulo: string }[] = [
  { valor: 'hardware', rotulo: 'Hardware' },
  { valor: 'software', rotulo: 'Software' },
  { valor: 'rede', rotulo: 'Rede' },
  { valor: 'acesso', rotulo: 'Acesso' },
  { valor: 'outro', rotulo: 'Outro' },
];

const PRIORIDADES: { valor: PrioridadeChamado; rotulo: string }[] = [
  { valor: 'baixa', rotulo: 'Baixa' },
  { valor: 'media', rotulo: 'Media' },
  { valor: 'alta', rotulo: 'Alta' },
  { valor: 'urgente', rotulo: 'Urgente' },
];

export function NovoChamado() {
  const navegar = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaChamado>('outro');
  const [prioridade, setPrioridade] = useState<PrioridadeChamado>('media');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await chamadosApi.criar({ titulo, descricao, categoria, prioridade });
      navegar('/chamados');
    } catch (falha) {
      // As regras de tamanho ficam no backend; aqui so exibimos a
      // mensagem que ele devolveu.
      setErro(
        falha instanceof ErroApi
          ? falha.message
          : 'Nao foi possivel abrir o chamado'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link to="/chamados" className="text-sm text-slate-500 hover:underline">
            &larr; Voltar para os chamados
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-xl font-semibold text-slate-900">Novo chamado</h1>

        <form
          onSubmit={aoEnviar}
          className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-slate-700">
              Titulo
            </label>
            <input
              id="titulo"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Resuma o problema em uma linha"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">
              Descricao
            </label>
            <textarea
              id="descricao"
              required
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="O que acontece, desde quando, e o que voce ja tentou"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaChamado)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prioridade" className="block text-sm font-medium text-slate-700">
                Prioridade
              </label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeChamado)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.rotulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:bg-slate-400"
            >
              {enviando ? 'Abrindo...' : 'Abrir chamado'}
            </button>
            <Link
              to="/chamados"
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
