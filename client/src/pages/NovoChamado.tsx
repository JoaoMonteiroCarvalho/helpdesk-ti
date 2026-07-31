import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as chamadosApi from '../api/chamados';
import { ErroApi } from '../api/client';
import { Spinner } from '../components/Spinner';
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
    <div className="min-h-screen bg-papel">
      <header className="border-b border-linha px-8 py-5">
        <Link
          to="/chamados"
          className="text-sm text-tinta-suave transition-colors hover:text-tinta"
        >
          &larr; Voltar para os chamados
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-tinta">
          Novo chamado
        </h1>

        <form
          onSubmit={aoEnviar}
          className="mt-6 animate-[entrada_0.2s_ease-out] space-y-4 rounded-xl bg-superficie p-6 shadow-xl ring-1 ring-black/10"
        >
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-tinta-card">
              Titulo
            </label>
            <input
              id="titulo"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Resuma o problema em uma linha"
              className="mt-1 w-full rounded-lg border border-linha-forte/40 px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-tinta-card">
              Descricao
            </label>
            <textarea
              id="descricao"
              required
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="O que acontece, desde quando, e o que voce ja tentou"
              className="mt-1 w-full rounded-lg border border-linha-forte/40 px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-tinta-card">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaChamado)}
                className="mt-1 w-full rounded-lg border border-linha-forte/40 bg-superficie px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prioridade" className="block text-sm font-medium text-tinta-card">
                Prioridade
              </label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeChamado)}
                className="mt-1 w-full rounded-lg border border-linha-forte/40 bg-superficie px-3 py-2 text-tinta-card outline-none transition-colors focus:border-acento"
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
            <p
              role="alert"
              className="animate-[entrada_0.15s_ease-out] rounded-lg bg-prioridade-urgente/10 px-3 py-2 text-sm text-prioridade-urgente"
            >
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center gap-2 rounded-lg bg-acento px-4 py-2 font-medium text-white transition-all hover:bg-acento/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              {enviando ? 'Abrindo...' : 'Abrir chamado'}
            </button>
            <Link
              to="/chamados"
              className="rounded-lg border border-linha-forte/40 px-4 py-2 font-medium text-tinta-card transition-colors hover:bg-realce/40"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
