import mysql from 'mysql2/promise';
import { env } from './env';

// Um pool reaproveita conexoes em vez de abrir uma nova a cada query.
// Importante numa API: abrir conexao e caro e o MySQL tem limite.
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Usado na subida do servidor para avisar cedo se o banco esta inacessivel.
export async function testarConexao(): Promise<void> {
  const conexao = await pool.getConnection();
  try {
    await conexao.ping();
  } finally {
    conexao.release();
  }
}
