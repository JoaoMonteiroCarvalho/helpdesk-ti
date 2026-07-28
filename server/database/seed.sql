-- =====================================================================
-- helpdesk-ti | Dados de exemplo para desenvolvimento
-- =====================================================================
-- Execute DEPOIS do schema.sql:
--   mysql -u root -p < database/seed.sql
--
-- ATENCAO: todos os usuarios abaixo usam a senha "senha123".
-- Sao dados de teste. Nunca use este arquivo em producao.
--
-- O valor em senha_hash e um hash bcrypt real (custo 10), entao o
-- login funciona de verdade com bcrypt.compare().
-- =====================================================================

USE helpdesk_ti;

-- Limpa os dados anteriores mantendo a estrutura.
-- A ordem importa por causa das chaves estrangeiras: comentarios
-- dependem de chamados, que dependem de usuarios.
DELETE FROM comentarios;
DELETE FROM chamados;
DELETE FROM usuarios;

ALTER TABLE comentarios AUTO_INCREMENT = 1;
ALTER TABLE chamados    AUTO_INCREMENT = 1;
ALTER TABLE usuarios    AUTO_INCREMENT = 1;

-- ---------------------------------------------------------------------
-- usuarios | senha de todos: senha123
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES
  ('Ana Souza',      'ana.tecnica@helpdesk.local',
   '$2b$10$9kEyDDV7Z/EGb2YbPAR1XeNeQ37THwV/P6DHiOKMl.QP6xyXzdEpG', 'tecnico'),
  ('Bruno Lima',     'bruno.tecnico@helpdesk.local',
   '$2b$10$9kEyDDV7Z/EGb2YbPAR1XeNeQ37THwV/P6DHiOKMl.QP6xyXzdEpG', 'tecnico'),
  ('Carla Mendes',   'carla@helpdesk.local',
   '$2b$10$9kEyDDV7Z/EGb2YbPAR1XeNeQ37THwV/P6DHiOKMl.QP6xyXzdEpG', 'usuario'),
  ('Diego Ferreira', 'diego@helpdesk.local',
   '$2b$10$9kEyDDV7Z/EGb2YbPAR1XeNeQ37THwV/P6DHiOKMl.QP6xyXzdEpG', 'usuario');

-- ids resultantes: 1 = Ana (tec), 2 = Bruno (tec), 3 = Carla, 4 = Diego

-- ---------------------------------------------------------------------
-- chamados | cobrem os tres status e todas as prioridades,
--            para exercitar os filtros da listagem
-- ---------------------------------------------------------------------
INSERT INTO chamados
  (titulo, descricao, categoria, prioridade, status, solicitante_id, tecnico_id, fechado_em)
VALUES
  -- Aberto e sem tecnico: aparece na fila de "disponiveis para assumir"
  ('Impressora nao imprime',
   'A impressora do segundo andar aceita o trabalho mas nada sai. Ja reiniciei o equipamento.',
   'hardware', 'media', 'aberto', 3, NULL, NULL),

  ('Sem acesso ao sistema financeiro',
   'Ao entrar com meu usuario aparece "permissao negada". Funcionava ate sexta-feira.',
   'acesso', 'alta', 'aberto', 4, NULL, NULL),

  ('Internet cai a cada 10 minutos',
   'A conexao do setor comercial cai de forma intermitente durante todo o dia.',
   'rede', 'urgente', 'aberto', 3, NULL, NULL),

  -- Em andamento: ja tem tecnico designado
  ('Excel trava ao abrir planilha grande',
   'Planilha de 40 MB congela o Excel. Preciso dela para fechar o mes.',
   'software', 'alta', 'em_andamento', 4, 1, NULL),

  ('Trocar teclado com teclas falhando',
   'As teclas A, S e D so funcionam se pressionadas com forca.',
   'hardware', 'baixa', 'em_andamento', 3, 2, NULL),

  -- Fechados: fechado_em preenchido
  ('Instalar antivirus na maquina nova',
   'Notebook recem-recebido chegou sem antivirus corporativo.',
   'software', 'media', 'fechado', 4, 1, '2026-07-20 16:30:00'),

  ('Redefinir senha do e-mail',
   'Esqueci a senha e a conta foi bloqueada apos varias tentativas.',
   'acesso', 'baixa', 'fechado', 3, 2, '2026-07-22 09:15:00');

-- ---------------------------------------------------------------------
-- comentarios | historico de atendimento dentro dos chamados
-- ---------------------------------------------------------------------
INSERT INTO comentarios (chamado_id, autor_id, texto) VALUES
  (4, 1, 'Bom dia! Vou verificar o tamanho do arquivo e a memoria da maquina.'),
  (4, 4, 'Obrigado. A planilha esta na pasta compartilhada do financeiro.'),
  (4, 1, 'Identifiquei formulas volateis em excesso. Testando otimizacao.'),

  (5, 2, 'Teclado reserva separado no almoxarifado. Levo ate voce hoje a tarde.'),

  (6, 1, 'Antivirus instalado e primeira varredura concluida sem ameacas.'),
  (6, 4, 'Confirmado, esta funcionando. Pode fechar.'),

  (7, 2, 'Senha redefinida e conta desbloqueada. Troque no primeiro acesso.');
