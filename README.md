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

**Backend**

```bash
cd server
npm install
npm run dev
```

**Frontend**

```bash
cd client
npm install
npm run dev
```

## Status

Em desenvolvimento.

## Autor

João Victor Monteiro de Carvalho — [GitHub](https://github.com/JoaoMonteiroCarvalho)
