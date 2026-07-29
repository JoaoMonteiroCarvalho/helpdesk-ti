# Helpdesk TI

Sistema de gestão de chamados de suporte técnico, com autenticação, atribuição de tickets por técnico e controle de status.

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-555555?style=flat-square" />
</p>

## Sobre

Aplicação que reproduz o fluxo de um helpdesk real: abertura de chamados, categorização por prioridade, atribuição a técnicos e acompanhamento até a resolução.

## Funcionalidades

- Autenticação de usuários (técnico e solicitante)
- Abertura e listagem de chamados
- Atribuição de chamado a um técnico
- Atualização de status (aberto, em andamento, fechado)
- Histórico de comentários por chamado

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, MySQL, JWT |

## Estrutura

```
helpdesk-ti/
├── client/    # Frontend
├── server/    # Backend
└── README.md
```

## Como rodar

Pré-requisitos: Node.js e um servidor MySQL rodando localmente.

**1. Backend**

```bash
cd server
npm install
```

Copie o `.env.example` para `.env` e preencha as variáveis (credenciais do MySQL e um `JWT_SECRET`):

```bash
cp .env.example .env        # Linux/Mac
Copy-Item .env.example .env # Windows (PowerShell)
```

Crie o banco e as tabelas, depois popule com dados de exemplo:

```bash
mysql -u seu_usuario -p < database/schema.sql
mysql -u seu_usuario -p < database/seed.sql
```

> No Windows, se `mysql` não for reconhecido, use o caminho completo do executável (algo como `"C:\Program Files\MySQL\MySQL Server X.Y\bin\mysql.exe"`) ou adicione a pasta `bin` do MySQL ao PATH.

Suba o servidor:

```bash
npm run dev
```

A API sobe em `http://localhost:3000`.

**2. Frontend**

```bash
cd client
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` (o Vite já usa proxy para a API em desenvolvimento).

**3. Login de teste**

O `seed.sql` cria usuários prontos, todos com senha `senha123`:

| E-mail | Papel |
|---|---|
| `ana.tecnica@helpdesk.local` | técnico |
| `carla@helpdesk.local` | usuário |

## Status

Funcionalidades principais implementadas: autenticação, abertura e listagem de chamados com filtro por status, atribuição a técnico, atualização de status e comentários.

## Autor

João Victor Monteiro de Carvalho — [GitHub](https://github.com/JoaoMonteiroCarvalho)
