import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rotas from './routes';
import { env } from './config/env';

// Monta o Express, mas NAO sobe o servidor. Assim o app pode ser
// importado em testes sem ocupar nenhuma porta.
const app = express();

// Sem CORS_ORIGIN definido, libera qualquer origem -- comodo para
// desenvolvimento local. Em producao, defina CORS_ORIGIN com a URL do
// frontend para restringir quem pode chamar a API.
app.use(cors({ origin: env.CORS_ORIGIN ?? true }));
app.use(express.json());

app.use('/api', rotas);

// Rota nao encontrada.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ erro: 'Rota nao encontrada' });
});

// Tratador de erros: precisa ter os 4 parametros, e assim que o
// Express o reconhece como middleware de erro.
app.use((erro: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

export default app;
