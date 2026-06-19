# 🏀 Central NBA 2K26

Aplicação web full stack que permite consultar jogadores reais da NBA, criar avaliações personalizadas inspiradas no sistema de atributos do **NBA 2K26** e montar uma lista de jogadores favoritos.

Projeto Final desenvolvido para a disciplina de XDES03– Programação Web, atendendo aos critérios de aplicação web com frontend e backend separados, comunicação via HTTP, CRUD completo com persistência em banco de dados e versionamento em repositório público.

---

## Sumário

- [Visão geral](#visão-geral)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Modelo de dados](#modelo-de-dados)
- [Como executar o projeto](#como-executar-o-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Limitações conhecidas](#limitações-conhecidas)
- [Possíveis melhorias futuras](#possíveis-melhorias-futuras)

---

## Visão geral

O **Central NBA 2K26** combina dados reais de jogadores da NBA (nome, time e posição, via API pública [balldontlie.io](https://www.balldontlie.io/)) com um sistema de avaliação social: qualquer usuário cadastrado pode dar uma nota de **overall (0 a 99)** e um comentário para qualquer jogador, no mesmo espírito das cartas de atributos do NBA 2K. As notas de todos os usuários são combinadas em uma média exibida no perfil do jogador, e cada usuário pode favoritar os jogadores que mais acompanha.

## Tecnologias utilizadas

**Frontend**
- React 18 (Vite)
- React Router DOM
- Axios
- CSS puro (sem framework de estilização), com um sistema de tokens de design próprio

**Backend**
- Node.js + Express
- SQLite (via `better-sqlite3`) para persistência
- JWT (`jsonwebtoken`) para autenticação
- `bcryptjs` para hash de senhas

**API externa**
- [balldontlie.io](https://docs.balldontlie.io/) — dados públicos de jogadores e times da NBA (camada gratuita: nome, time e posição; estatísticas avançadas exigem plano pago, por isso não são usadas aqui)

## Arquitetura

```
┌──────────────┐        HTTP / JSON        ┌──────────────┐        HTTPS        ┌────────────────┐
│   Frontend    │ ───────────────────────► │   Backend     │ ──────────────────► │  balldontlie.io │
│  React + Vite │ ◄─────────────────────── │ Express + JWT │ ◄────────────────── │   (jogadores)   │
└──────────────┘                           └──────┬───────┘                     └────────────────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │   SQLite     │
                                            │ (usuários,   │
                                            │ avaliações,  │
                                            │ favoritos)   │
                                            └──────────────┘
```

O frontend nunca chama a API da NBA diretamente: o backend atua como **proxy autenticado**, escondendo a chave da API e centralizando o acesso.

## Funcionalidades

### Autenticação
- Cadastro de usuário com validação de e-mail e confirmação de senha
- Login com geração de token JWT
- Rotas protegidas no frontend (`ProtectedRoute`) e no backend (`middleware/auth.js`)

### Jogadores
- Pesquisa de jogadores por nome na base da NBA
- Listagem em cards (estilo "trading card" do 2K), com time, posição e nota média
- Página de detalhes com avaliações da comunidade

### Avaliações (CRUD completo)
| Operação | Onde acontece |
|---|---|
| **C**reate | Página de detalhe do jogador, formulário de avaliação |
| **R**ead | Página de detalhe (avaliações da comunidade) e "Minhas avaliações" |
| **U**pdate | "Minhas avaliações" ou na própria página do jogador |
| **D**elete | "Minhas avaliações" ou na própria página do jogador |

### Favoritos
- Adicionar/remover jogador dos favoritos a partir do card ou da página de detalhe
- Página dedicada para visualizar e remover favoritos

## Modelo de dados

Banco SQLite com três tabelas:

```sql
users      (id, name, email, password_hash, created_at)
reviews    (id, user_id, player_id, player_name, team, position, overall, comment, created_at, updated_at)
favorites  (id, user_id, player_id, player_name, team, position, created_at)
```

`reviews` e `favorites` referenciam `users` por chave estrangeira (`ON DELETE CASCADE`), e `favorites` possui restrição `UNIQUE (user_id, player_id)` para impedir duplicidade.

## Como executar o projeto

### Pré-requisitos
- Node.js 18 ou superior
- Uma chave gratuita da API balldontlie (crie em [app.balldontlie.io](https://app.balldontlie.io))

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edite o .env e cole sua BALLDONTLIE_API_KEY
npm run dev
```

O servidor sobe em `http://localhost:3001`. O banco SQLite (`backend/data/central.db`) é criado automaticamente na primeira execução.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Variáveis de ambiente

**backend/.env**
| Variável | Descrição |
|---|---|
| `PORT` | Porta da API (padrão 3001) |
| `JWT_SECRET` | Chave secreta para assinar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (ex: `7d`) |
| `BALLDONTLIE_API_KEY` | Chave da API da NBA (obrigatória) |

**frontend/.env**
| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base do backend (ex: `http://localhost:3001/api`) |

## Endpoints da API

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Não | Cria um usuário |
| POST | `/api/auth/login` | Não | Autentica e retorna um token JWT |
| GET | `/api/auth/me` | Sim | Retorna o usuário autenticado |
| GET | `/api/players?search=` | Não | Busca jogadores na NBA |
| GET | `/api/players/:id` | Não | Detalhe de um jogador |
| GET | `/api/reviews/mine` | Sim | Avaliações do usuário logado |
| GET | `/api/reviews/player/:playerId` | Não | Avaliações públicas de um jogador + média |
| POST | `/api/reviews` | Sim | Cria uma avaliação |
| PUT | `/api/reviews/:id` | Sim | Atualiza uma avaliação própria |
| DELETE | `/api/reviews/:id` | Sim | Remove uma avaliação própria |
| GET | `/api/favorites` | Sim | Lista favoritos do usuário |
| POST | `/api/favorites` | Sim | Adiciona um favorito |
| DELETE | `/api/favorites/:playerId` | Sim | Remove um favorito |

## Estrutura de pastas

```
central-nba-2k26/
├── backend/
│   ├── server.js
│   ├── data/                  # banco SQLite (gerado em runtime)
│   └── src/
│       ├── db.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.routes.js
│           ├── players.routes.js
│           ├── reviews.routes.js
│           └── favorites.routes.js
└── frontend/
    ├── index.html
    └── src/
        ├── components/
        ├── pages/
        ├── context/
        ├── services/
        └── styles/
```

## Limitações conhecidas

- A camada gratuita da API balldontlie retorna apenas nome, time e posição dos jogadores — estatísticas de jogo e médias de temporada exigem um plano pago, por isso não fazem parte do escopo atual.
- SQLite é adequado para o escopo deste projeto (uso individual/acadêmico); para um cenário com muitos usuários simultâneos, um banco como PostgreSQL seria mais indicado.

## Possíveis melhorias futuras

- Upload de foto de perfil do usuário
- Paginação na listagem de jogadores
- Filtro por time/posição
- Ranking dos jogadores mais bem avaliados pela comunidade
