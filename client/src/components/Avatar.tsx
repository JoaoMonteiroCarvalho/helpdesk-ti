// Paleta neutra e discreta, coerente com o layout monocromatico: nao
// sao cores vivas, sao tons de cinza-azulado que variam pouco entre
// si. A cor de cada pessoa vem do nome, entao ela e sempre a mesma em
// qualquer tela.
const CORES = [
  'bg-slate-700',
  'bg-zinc-700',
  'bg-stone-700',
  'bg-neutral-700',
  'bg-gray-600',
  'bg-slate-500',
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
  comAnel = false,
}: {
  nome: string;
  tamanho?: 'sm' | 'md';
  /** Anel branco ao redor: usado quando avatares ficam sobrepostos. */
  comAnel?: boolean;
}) {
  const classesTamanho =
    tamanho === 'md' ? 'h-9 w-9 text-xs' : 'h-6 w-6 text-[10px]';

  return (
    <span
      title={nome}
      className={
        `inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${corPorNome(nome)} ${classesTamanho} ` +
        (comAnel ? 'ring-2 ring-white' : '')
      }
    >
      {iniciais(nome)}
    </span>
  );
}
