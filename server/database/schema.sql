-- =====================================================================
-- helpdesk-ti | Estrutura do banco de dados
-- =====================================================================
-- Como executar:
--   mysql -u root -p < database/schema.sql
--
-- Ou, ja conectado ao MySQL:
--   SOURCE C:/helpdesk-ti/server/database/schema.sql;
-- =====================================================================

CREATE DATABASE IF NOT EXISTS helpdesk_ti
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE helpdesk_ti;

-- ---------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  -- bcrypt gera 60 caracteres; 255 deixa margem para trocar de algoritmo.
  -- O nome da coluna deixa explicito que aqui NUNCA entra senha em texto puro.
  senha_hash  VARCHAR(255) NOT NULL,
  papel       ENUM('tecnico','usuario') NOT NULL DEFAULT 'usuario',
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  -- Garante no banco que nao existem dois cadastros com o mesmo e-mail,
  -- mesmo que duas requisicoes cheguem no mesmo instante.
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- chamados
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chamados (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo         VARCHAR(150) NOT NULL,
  descricao      TEXT NOT NULL,
  categoria      ENUM('hardware','software','rede','acesso','outro')
                 NOT NULL DEFAULT 'outro',
  prioridade     ENUM('baixa','media','alta','urgente')
                 NOT NULL DEFAULT 'media',
  status         ENUM('aberto','em_andamento','fechado')
                 NOT NULL DEFAULT 'aberto',

  -- Quem abriu o chamado. Obrigatorio.
  solicitante_id INT UNSIGNED NOT NULL,
  -- Quem atende. NULL = ainda nao foi assumido por nenhum tecnico.
  tecnico_id     INT UNSIGNED NULL DEFAULT NULL,

  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Atualizado sozinho pelo MySQL a cada UPDATE na linha.
  atualizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  fechado_em     TIMESTAMP NULL DEFAULT NULL,

  PRIMARY KEY (id),

  -- RESTRICT: impede apagar um usuario que possui chamados.
  -- Preserva o historico de quem solicitou o que.
  CONSTRAINT fk_chamados_solicitante
    FOREIGN KEY (solicitante_id) REFERENCES usuarios (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- SET NULL: se o tecnico for removido, o chamado volta a ficar
  -- sem responsavel em vez de ser apagado junto.
  CONSTRAINT fk_chamados_tecnico
    FOREIGN KEY (tecnico_id) REFERENCES usuarios (id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  -- Indices para os filtros e listagens mais usados da aplicacao.
  INDEX idx_chamados_status (status),
  INDEX idx_chamados_solicitante (solicitante_id),
  INDEX idx_chamados_tecnico (tecnico_id),
  -- Indice composto: lista "meus chamados abertos" em uma unica busca.
  INDEX idx_chamados_status_criado (status, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- comentarios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comentarios (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  chamado_id INT UNSIGNED NOT NULL,
  autor_id   INT UNSIGNED NOT NULL,
  texto      TEXT NOT NULL,
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- CASCADE: comentario nao existe sem o chamado ao qual pertence.
  CONSTRAINT fk_comentarios_chamado
    FOREIGN KEY (chamado_id) REFERENCES chamados (id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  -- RESTRICT: preserva a autoria. Um comentario sem autor identificavel
  -- perde valor como historico do atendimento.
  CONSTRAINT fk_comentarios_autor
    FOREIGN KEY (autor_id) REFERENCES usuarios (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Carregar o historico de um chamado e a consulta mais frequente aqui.
  INDEX idx_comentarios_chamado (chamado_id, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
