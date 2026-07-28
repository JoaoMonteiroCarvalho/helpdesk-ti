import { Request, Response } from 'express';
import * as comentarioModel from '../models/comentarioModel';
import { carregarChamadoVisivel } from '../utils/permissoes';

const TAMANHO_MINIMO_TEXTO = 2;
const TAMANHO_MAXIMO_TEXTO = 5000;

/**
 * GET /api/chamados/:id/comentarios
 *
 * A permissao e a mesma do chamado: quem nao pode ve-lo recebe 404 e
 * nao descobre sequer que ele existe.
 */
export async function listar(req: Request, res: Response): Promise<void> {
  const chamado = await carregarChamadoVisivel(req, res);
  if (!chamado) return;

  const comentarios = await comentarioModel.listarPorChamado(chamado.id);

  res.json({ comentarios, total: comentarios.length });
}

/**
 * POST /api/chamados/:id/comentarios
 *
 * O autor sai do token, nunca do corpo: aceita-lo permitiria comentar
 * assinando como outra pessoa.
 *
 * Comentar em chamado fechado e permitido de proposito. Bloquear
 * obrigaria a reabrir o chamado so para registrar uma observacao final.
 */
export async function criar(req: Request, res: Response): Promise<void> {
  const chamado = await carregarChamadoVisivel(req, res);
  if (!chamado) return;

  const { texto } = req.body ?? {};

  if (typeof texto !== 'string' || texto.trim().length < TAMANHO_MINIMO_TEXTO) {
    res.status(400).json({
      erro: `Comentario deve ter ao menos ${TAMANHO_MINIMO_TEXTO} caracteres`,
    });
    return;
  }

  if (texto.trim().length > TAMANHO_MAXIMO_TEXTO) {
    res.status(400).json({
      erro: `Comentario nao pode passar de ${TAMANHO_MAXIMO_TEXTO} caracteres`,
    });
    return;
  }

  const comentario = await comentarioModel.criar({
    chamado_id: chamado.id,
    autor_id: req.usuario!.id, // do token, nunca do corpo
    texto: texto.trim(),
  });

  res.status(201).json({ comentario });
}
