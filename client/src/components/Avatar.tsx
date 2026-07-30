// Paleta de cores vivas mas nao saturadas demais, coerente com o tom
// terroso do resto da interface. A cor de cada pessoa vem do nome,
// entao ela e sempre a mesma em qualquer tela.
const CORES = [
  'bg-emerald-700',
  'bg-violet-700',
  'bg-amber-700',
  'bg-rose-700',
  'bg-sky-700',
  'bg-lime-700',
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
    tamanho === 'md' ? 'h-9 w-9 text-xs' : 'h-7 w-7 text-[11px]';

  return (
    <span
      title={nome}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${corPorNome(nome)} ${classesTamanho}`}
    >
      {iniciais(nome)}
    </span>
  );
}
