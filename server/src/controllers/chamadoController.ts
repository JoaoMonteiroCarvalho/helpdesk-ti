import { Request, Response } from 'express';
import * as chamadoModel from '../models/chamadoModel';
import * as comentarioModel from '../models/comentarioModel';
import * as usuarioModel from '../models/usuarioModel';
import { ChamadoDetalhado } from '../types';
import {
  CATEGORIAS_VALIDAS,
  CategoriaChamado,
  FiltrosChamado,
  PRIORIDADES_VALIDAS,
  PrioridadeChamado,
  STATUS_VALIDOS,
  StatusChamado,
} from '../types';

const TAMANHO_MINIMO_TITULO = 5;
const TAMANHO_MINIMO_DESCRICAO = 10;

/** Converte o :id da URL em numero, ou null se nao for um id valido. */
function lerId(valor: string | string[] | undefined): number | null {
  if (typeof valor !== 'string') return null;

  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Carrega o chamado de req.params.id e checa se o usuario logado pode
 * ve-lo: tecnico ve qualquer um, usuario comum so os proprios.
 *
 * Responde 404 tanto para inexistente quanto para chamado de outra
 * pessoa, para nao revelar que o id existe.
 */
async function carregarChamadoVisivel(
  req: Request,
  res: Response
): Promise<ChamadoDetalhado | null> {
  const id = lerId(req.params.id);

  if (id === null) {
    res.status(400).json({ erro: 'Id invalido' });
    return null;
  }

  const chamado = await chamadoModel.buscarPorId(id);
  const podeVer =
    chamado &&
    (req.usuario!.papel === 'tecnico' ||
      chamado.solicitante_id === req.usuario!.id);

  if (!podeVer) {
    res.status(404).json({ erro: 'Chamado nao encontrado' });
    return null;
  }

  return chamado;
}

/**
 * GET /api/chamados
 *
 * Filtros aceitos: status, categoria, prioridade nao (fica para
 * depois), semTecnico. Para usuario comum, solicitante_id e SEMPRE o
 * proprio id: um solicitante_id vindo da query e descartado.
 */
export async function listar(req: Request, res: Response): Promise<void> {
  const filtros: FiltrosChamado = {};

  const { status, categoria, semTecnico, tecnico_id, solicitante_id } =
    req.query;

  if (typeof status === 'string') {
    if (!STATUS_VALIDOS.includes(status as StatusChamado)) {
      res.status(400).json({
        erro: `Status invalido. Use: ${STATUS_VALIDOS.join(', ')}`,
      });
      return;
    }
    filtros.status = status as StatusChamado;
  }

  if (typeof categoria === 'string') {
    if (!CATEGORIAS_VALIDAS.includes(categoria as CategoriaChamado)) {
      res.status(400).json({
        erro: `Categoria invalida. Use: ${CATEGORIAS_VALIDAS.join(', ')}`,
      });
      return;
    }
    filtros.categoria = categoria as CategoriaChamado;
  }

  if (semTecnico === 'true') {
    filtros.semTecnico = true;
  }

  if (typeof tecnico_id === 'string') {
    const id = lerId(tecnico_id);
    if (id === null) {
      res.status(400).json({ erro: 'tecnico_id invalido' });
      return;
    }
    filtros.tecnico_id = id;
  }

  const usuario = req.usuario!;

  if (usuario.papel === 'tecnico') {
    // Tecnico pode filtrar por solicitante livremente.
    if (typeof solicitante_id === 'string') {
      const id = lerId(solicitante_id);
      if (id === null) {
        res.status(400).json({ erro: 'solicitante_id invalido' });
        return;
      }
      filtros.solicitante_id = id;
    }
  } else {
    // Usuario comum: o escopo e imposto, nao negociado. Um
    // solicitante_id enviado na query e ignorado de proposito.
    filtros.solicitante_id = usuario.id;
  }

  const chamados = await chamadoModel.listar(filtros);
  res.json({ chamados, total: chamados.length });
}

/**
 * GET /api/chamados/:id
 *
 * Devolve o chamado junto com o historico de comentarios: a tela de
 * detalhe precisa dos dois, e mandar tudo em uma resposta evita o
 * frontend fazer duas requisicoes em sequencia para montar uma tela.
 */
export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const chamado = await carregarChamadoVisivel(req, res);
  if (!chamado) return;

  const comentarios = await comentarioModel.listarPorChamado(chamado.id);

  res.json({ chamado, comentarios });
}

/**
 * POST /api/chamados
 *
 * O solicitante e sempre quem esta autenticado. Aceitar solicitante_id
 * do corpo permitiria abrir chamados em nome de outra pessoa.
 */
export async function criar(req: Request, res: Response): Promise<void> {
  const { titulo, descricao, categoria, prioridade } = req.body ?? {};

  if (typeof titulo !== 'string' || titulo.trim().length < TAMANHO_MINIMO_TITULO) {
    res.status(400).json({
      erro: `Titulo deve ter ao menos ${TAMANHO_MINIMO_TITULO} caracteres`,
    });
    return;
  }

  if (
    typeof descricao !== 'string' ||
    descricao.trim().length < TAMANHO_MINIMO_DESCRICAO
  ) {
    res.status(400).json({
      erro: `Descricao deve ter ao menos ${TAMANHO_MINIMO_DESCRICAO} caracteres`,
    });
    return;
  }

  // Os ENUM precisam ser conferidos aqui: o TypeScript nao existe em
  // tempo de execucao, e o corpo da requisicao e dado desconhecido.
  if (
    categoria !== undefined &&
    !CATEGORIAS_VALIDAS.includes(categoria as CategoriaChamado)
  ) {
    res.status(400).json({
      erro: `Categoria invalida. Use: ${CATEGORIAS_VALIDAS.join(', ')}`,
    });
    return;
  }

  if (
    prioridade !== undefined &&
    !PRIORIDADES_VALIDAS.includes(prioridade as PrioridadeChamado)
  ) {
    res.status(400).json({
      erro: `Prioridade invalida. Use: ${PRIORIDADES_VALIDAS.join(', ')}`,
    });
    return;
  }

  const chamado = await chamadoModel.criar({
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    categoria: categoria as CategoriaChamado | undefined,
    prioridade: prioridade as PrioridadeChamado | undefined,
    solicitante_id: req.usuario!.id, // do token, nunca do corpo
  });

  res.status(201).json({ chamado });
}

/**
 * PATCH /api/chamados/:id/status
 * Restrita a tecnicos (ver chamadoRoutes).
 */
export async function atualizarStatus(
  req: Request,
  res: Response
): Promise<void> {
  const id = lerId(req.params.id);

  if (id === null) {
    res.status(400).json({ erro: 'Id invalido' });
    return;
  }

  const { status } = req.body ?? {};

  if (typeof status !== 'string' || !STATUS_VALIDOS.includes(status as StatusChamado)) {
    res.status(400).json({
      erro: `Status invalido. Use: ${STATUS_VALIDOS.join(', ')}`,
    });
    return;
  }

  // O model cuida do fechado_em atraves de um CASE no proprio UPDATE.
  const atualizou = await chamadoModel.atualizarStatus(id, status as StatusChamado);

  if (!atualizou) {
    res.status(404).json({ erro: 'Chamado nao encontrado' });
    return;
  }

  res.json({ chamado: await chamadoModel.buscarPorId(id) });
}

/**
 * PATCH /api/chamados/:id/assumir
 * O tecnico autenticado assume um chamado sem responsavel.
 */
export async function assumir(req: Request, res: Response): Promise<void> {
  const id = lerId(req.params.id);

  if (id === null) {
    res.status(400).json({ erro: 'Id invalido' });
    return;
  }

  const existe = await chamadoModel.buscarPorId(id);

  if (!existe) {
    res.status(404).json({ erro: 'Chamado nao encontrado' });
    return;
  }

  // assumir() so altera a linha se tecnico_id ainda for NULL.
  const assumiu = await chamadoModel.assumir(id, req.usuario!.id);

  if (!assumiu) {
    // 409: a requisicao e valida, mas conflita com o estado atual.
    res.status(409).json({
      erro: 'Chamado ja foi assumido por outro tecnico',
      tecnico: existe.tecnico_nome,
    });
    return;
  }

  res.json({ chamado: await chamadoModel.buscarPorId(id) });
}

/**
 * PATCH /api/chamados/:id/tecnico
 * Reatribui o responsavel. Enviar tecnico_id: null libera o chamado.
 */
export async function atribuirTecnico(
  req: Request,
  res: Response
): Promise<void> {
  const id = lerId(req.params.id);

  if (id === null) {
    res.status(400).json({ erro: 'Id invalido' });
    return;
  }

  const { tecnico_id: tecnicoId } = req.body ?? {};

  if (tecnicoId !== null && !Number.isInteger(tecnicoId)) {
    res.status(400).json({ erro: 'tecnico_id deve ser um numero ou null' });
    return;
  }

  // Nao basta a chave estrangeira: ela aceita qualquer usuario, mas so
  // quem tem papel "tecnico" deve poder ser designado.
  if (tecnicoId !== null) {
    const destino = await usuarioModel.buscarPorId(tecnicoId);

    if (!destino) {
      res.status(404).json({ erro: 'Usuario informado nao existe' });
      return;
    }

    if (destino.papel !== 'tecnico') {
      res.status(400).json({ erro: 'O usuario informado nao e tecnico' });
      return;
    }
  }

  const atualizou = await chamadoModel.atribuirTecnico(id, tecnicoId);

  if (!atualizou) {
    res.status(404).json({ erro: 'Chamado nao encontrado' });
    return;
  }

  res.json({ chamado: await chamadoModel.buscarPorId(id) });
}

/** GET /api/chamados/resumo — contagem por status. */
export async function resumo(_req: Request, res: Response): Promise<void> {
  res.json({ resumo: await chamadoModel.contarPorStatus() });
}
