import dotenv from 'dotenv';

// Carrega o .env assim que este modulo e importado pela primeira vez.
// Qualquer arquivo que precise de variaveis de ambiente deve importar
// daqui, e nao ler process.env diretamente.
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,

  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER ?? '',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: process.env.DB_NAME ?? '',

  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',

  // URL do frontend em producao, para liberar no CORS. Sem essa
  // variavel, CORS_ORIGIN fica undefined e o app.ts libera qualquer
  // origem -- o que e aceitavel em desenvolvimento, mas deve ser
  // configurado ao publicar.
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
