import { env } from './config/env';
import app from './app';
import { testarConexao } from './config/database';

async function iniciar(): Promise<void> {
  try {
    await testarConexao();
    console.log('Conexao com o MySQL estabelecida');
  } catch (erro) {
    // Nao derruba o servidor: durante o desenvolvimento e util subir a API
    // mesmo sem o banco pronto. Em producao, prefira encerrar o processo.
    console.warn('Sem conexao com o MySQL:', (erro as Error).message);
    console.warn('Confira as variaveis DB_* no arquivo .env');
  }

  app.listen(env.PORT, () => {
    console.log(`Servidor rodando em http://localhost:${env.PORT}`);
  });
}

iniciar();
