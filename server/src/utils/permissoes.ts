import { Request, Response } from 'express';
import * as chamadoModel from '../models/chamadoModel';
import { ChamadoDetalhado } from '../types';
import { PayloadToken } from '../middlewares/auth';

/**
 * Converte o :id da URL em numero, ou null se nao for um id valido.
 *
 * O parametro aceita string[] porque no Express 5 um parametro de rota
 * pode chegar como array (rotas com wildcard). Tratar aqui evita um
 * cast forcado em cada uso, que so esconderia o caso em vez de resolver.
 */
export function lerId(valor: string | string[] | undefined): number | null {
  if (typeof valor !== 'string') return null;

  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Regra de visibilidade de um chamado.
 *
 * Um tecnico enxerga qualquer chamado; um usuario comum, apenas os que
 * abriu. Depende do dono do registro, entao nao cabe no middleware
 * autorizar, que so conhece o papel.
 *
 * Funcao pura de proposito: nao toca em req/res, o que permite testa-la
 * sem simular uma requisicao HTTP.
 */
export function podeVerChamado(
  usuario: PayloadToken,
  chamado: ChamadoDetalhado
): boolean {
  return usuario.papel === 'tecnico' || chamado.solicitante_id === usuario.id;
}

/**
 * Carrega o chamado de req.params.id e aplica a regra de visibilidade.
 *
 * Ja responde a requisicao e devolve null quando o acesso nao e
 * permitido; o controller so precisa checar o retorno.
 *
 * Responde 404 tanto para inexistente quanto para chamado de outra
 * pessoa: um 403 confirmaria que o id existe, permitindo mapear quantos
 * chamados o sistema tem apenas variando o numero na URL.
 */
export async function carregarChamadoVisivel(
  req: Request,
  res: Response
): Promise<ChamadoDetalhado | null> {
  const id = lerId(req.params.id);

  if (id === null) {
    res.status(400).json({ erro: 'Id invalido' });
    return null;
  }

  const chamado = await chamadoModel.buscarPorId(id);

  if (!chamado || !podeVerChamado(req.usuario!, chamado)) {
    res.status(404).json({ erro: 'Chamado nao encontrado' });
    return null;
  }

  return chamado;
}
