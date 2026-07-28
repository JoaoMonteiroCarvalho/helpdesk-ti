/**
 * Cliente HTTP da API do helpdesk.
 *
 * Concentra o que toda requisicao precisa: URL base, cabecalho de
 * autenticacao, conversao de JSON e tratamento de erro. As telas
 * chamam api.get / api.post / api.patch e so lidam com o resultado.
 */

// Em desenvolvimento "/api" cai no proxy do Vite (ver vite.config.ts).
// Em producao, defina VITE_API_URL apontando para o backend.
// O prefixo VITE_ e obrigatorio: o Vite so expoe ao navegador as
// variaveis com esse prefixo, evitando vazar segredo do servidor.
const URL_BASE = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Erro de uma resposta fora da faixa 2xx.
 *
 * O fetch so rejeita quando a rede falha: um 401 ou 404 e considerado
 * sucesso por ele. Transformar em excecao permite que a tela use
 * try/catch e diferencie os casos pelo status.
 */
export class ErroApi extends Error {
  // Campo declarado e atribuido separadamente, e nao como parametro do
  // construtor: o tsconfig do Vite usa erasableSyntaxOnly, que so aceita
  // sintaxe removivel sem gerar codigo. Parameter properties geram.
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

// O token vive aqui, nao no localStorage: quem decide onde persistir e
// o contexto de autenticacao. Assim, trocar localStorage por cookie
// no futuro nao altera este arquivo.
let tokenAtual: string | null = null;

export function definirToken(token: string | null): void {
  tokenAtual = token;
}

// Todo 401 significa a mesma coisa: token invalido ou vencido. Em vez
// de cada tela tratar isso, o contexto registra um callback aqui.
let aoExpirarSessao: (() => void) | null = null;

export function definirAoExpirarSessao(callback: (() => void) | null): void {
  aoExpirarSessao = callback;
}

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function requisitar<T>(
  metodo: Metodo,
  caminho: string,
  corpo?: unknown
): Promise<T> {
  const cabecalhos: Record<string, string> = {};

  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
  }

  if (tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  let resposta: Response;

  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    // Aqui sim o fetch rejeitou: servidor fora do ar, DNS, offline.
    throw new ErroApi(0, 'Nao foi possivel conectar ao servidor');
  }

  // 204 e outras respostas sem corpo nao tem JSON para converter.
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    if (resposta.status === 401) {
      aoExpirarSessao?.();
    }

    // A API responde { erro: "mensagem" }; se nao vier, usa um texto padrao.
    throw new ErroApi(
      resposta.status,
      dados?.erro ?? `Erro ${resposta.status} na requisicao`
    );
  }

  return dados as T;
}

export const api = {
  get: <T>(caminho: string) => requisitar<T>('GET', caminho),
  post: <T>(caminho: string, corpo?: unknown) =>
    requisitar<T>('POST', caminho, corpo),
  patch: <T>(caminho: string, corpo?: unknown) =>
    requisitar<T>('PATCH', caminho, corpo),
  delete: <T>(caminho: string) => requisitar<T>('DELETE', caminho),
};
