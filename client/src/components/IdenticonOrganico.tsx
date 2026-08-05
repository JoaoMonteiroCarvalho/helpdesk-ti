// Miniatura organica gerada a partir do nome: alguns "petalas" em
// posicoes e tamanhos derivados do hash do texto, entao a mesma
// pessoa sempre ve a mesma forma. Usado so no preview do Cadastro --
// o resto do sistema continua usando o Avatar (iniciais).
function hashNome(nome: string): number {
  let soma = 0;
  for (const caractere of nome) soma = (soma * 31 + caractere.charCodeAt(0)) % 997;
  return soma;
}

const CORES = ['#f2ede4', '#e8dcc8', '#ffffff'];

export function IdenticonOrganico({
  nome,
  className,
}: {
  nome: string;
  className?: string;
}) {
  // SMIL (animateTransform) nao respeita prefers-reduced-motion
  // sozinho, entao checamos na mao e nem renderizamos a tag se a
  // pessoa pediu menos movimento.
  const movimentoReduzido =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const semente = hashNome(nome || '?');
  const petalas = Array.from({ length: 5 }, (_, indice) => {
    const angulo = (indice / 5) * 2 * Math.PI + semente;
    const raio = 14 + ((semente + indice * 37) % 10);
    const cx = 32 + Math.cos(angulo) * 13;
    const cy = 32 + Math.sin(angulo) * 13;
    return { cx, cy, raio: raio / 2.4, cor: CORES[(semente + indice) % CORES.length] };
  });

  return (
    <svg viewBox="0 0 64 64" className={className}>
      {petalas.map((petala, indice) => {
        // Cada petala flutua num raio e duracao levemente diferentes,
        // pra nao ficarem todas sincronizadas -- reforca a sensacao de
        // organismo vivo em vez de enfeite mecanico.
        const deslocamento = 2 + (indice % 3);
        const duracao = 3 + (indice % 4) * 0.6;
        return (
          <circle key={indice} cx={petala.cx} cy={petala.cy} r={petala.raio} fill={petala.cor} opacity={0.9}>
            {!movimentoReduzido && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0; ${deslocamento} -${deslocamento}; -${deslocamento} ${deslocamento}; 0 0`}
                dur={`${duracao}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        );
      })}
    </svg>
  );
}
