// Icones lineares desenhados a mao, sem biblioteca externa: o projeto
// usa poucos icones e nao justifica uma dependencia so para isso.

type PropsIcone = { className?: string };

export function IconeChamados({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeUsuario({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeSemTecnico({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="2.5 2.5"
      />
      <path d="M10 7v3M10 12.5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconeMais({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconeSair({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M13 13l4-3-4-3M17 10H8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconeBusca({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeComentario({ className }: PropsIcone) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6A1.5 1.5 0 0 1 12.5 11H6.8L4 13.5V11H3.5A1.5 1.5 0 0 1 2 9.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
