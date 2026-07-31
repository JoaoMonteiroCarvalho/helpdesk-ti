/** Indicador de carregamento simples: um circulo girando via CSS puro,
 * sem biblioteca de animacao. */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-[girar_0.6s_linear_infinite] rounded-full border-2 border-tinta-suave border-t-acento ${className}`}
    />
  );
}
