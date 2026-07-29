// Paleta fixa: a cor de cada pessoa e escolhida a partir do nome, entao
// a mesma pessoa sempre aparece com a mesma cor em qualquer tela.
const CORES = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
];

function corPorNome(nome: string): string {
  let soma = 0;
  for (const caractere of nome) soma += caractere.charCodeAt(0);
  return CORES[soma % CORES.length];
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '?';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function Avatar({
  nome,
  tamanho = 'sm',
}: {
  nome: string;
  tamanho?: 'sm' | 'md';
}) {
  const classesTamanho =
    tamanho === 'md' ? 'h-9 w-9 text-sm' : 'h-6 w-6 text-[10px]';

  return (
    <span
      title={nome}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${corPorNome(nome)} ${classesTamanho}`}
    >
      {iniciais(nome)}
    </span>
  );
}
