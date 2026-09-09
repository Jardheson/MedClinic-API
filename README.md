# MedClinic API

**Sistema:** MedClinic API
**Etapa:** Etapa 1 — Autenticação e Autorização
**Versão:** 1.0.0

---

## Descrição

O **MedClinic API** é o back-end de um sistema de gestão para clínicas médicas, desenvolvido como **Mini-Projeto Final Avaliativo — Módulo 02 / Semana 07**.

Esta primeira etapa implementa exclusivamente a **base de autenticação e autorização** da aplicação, fornecendo o fundamento arquitetural sobre o qual serão construídos os módulos de domínio (especialidades, médicos, pacientes, consultas, relatórios etc.) nas próximas etapas.

O que é entregue nesta etapa:

- Configuração completa de **Node.js + TypeScript + Express**;
- Integração com **PostgreSQL** via **TypeORM** (DataSource + migrations);
- Entidade `User` com perfis **Administrador** e **Atendente**;
- Cadastro de usuários com **hash bcrypt** e validações;
- Login com emissão de **JWT** (JSON Web Token);
- Middleware de **autenticação JWT** (validação de token);
- Middleware de **autorização RBAC** (controle por perfil);
- Endpoints de verificação (`/users/me`, `/admin/ping`);
- Tratamento **centralizado de erros** (400 / 401 / 403 / 409 / 500);
- **Arquitetura MVC em camadas** (Routes, Middlewares, Controllers, Services, Repositories, Entities, Database, Utils, DTOs);
- Documentação completa neste README;
- Versionamento Git/GitHub com fluxo por feature branches.

---

## Tecnologias

| Categoria            | Tecnologia                     | Versão  |
|----------------------|--------------------------------|---------|
| Runtime              | Node.js                        | 18+     |
| Linguagem            | TypeScript                     | 5.5.x   |
| Framework Web        | Express.js                     | 4.19.x  |
| ORM                  | TypeORM                        | 0.3.x   |
| Banco de Dados       | PostgreSQL                     | 13+     |
| Driver PostgreSQL    | pg                             | 8.x     |
| JWT                  | jsonwebtoken                   | 9.x     |
| Hash de Senha        | bcryptjs                       | 2.4.x   |
| Validação            | Zod                            | 3.x     |
| Variáveis de Ambiente| dotenv                         | 16.x    |
| CORS                 | cors                           | 2.8.x   |
| Async Errors         | express-async-errors           | 3.1.x   |
| Build / Dev          | tsx / TypeScript Compiler (tsc)| -       |
| CI (opcional)        | Git / GitHub                   | -       |

---

## Requisitos para Execução

Antes de começar, certifique-se de ter instalado em sua máquina:

1. **Git** (versão recente);
2. **Node.js** LTS 18+ (recomendado 20.x);
3. **npm** (vem com Node.js) ou **yarn**/pnpm;
4. **PostgreSQL** 13+ rodando localmente (ou container Docker);
5. (Opcional) **Postman**, **Insomnia** ou **Thunder Client** para testar os endpoints.

---

## Banco de Dados — PostgreSQL

### 1. Criação do banco manual (antes de rodar a API)

Conecte-se no PostgreSQL usando `psql`, pgAdmin ou outro cliente e crie o banco:

```sql
CREATE DATABASE medclinic;
```

Se quiser criar um usuário dedicado (opcional):

```sql
CREATE USER medclinic_user WITH PASSWORD 'sua-senha-forte';
GRANT ALL PRIVILEGES ON DATABASE medclinic TO medclinic_user;
```

### 2. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com seus dados:

```bash
cp .env.example .env
```

Conteúdo do `.env`:

```dotenv
# Aplicação
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=medclinic

# JWT
JWT_SECRET=sua-chave-secreta-super-forte-aqui-altere-em-producao
JWT_EXPIRES_IN=1d
```

Descrição de cada variável:

| Variável         | Obrigatoria | Descrição                                                              | Exemplo                       |
|------------------|-------------|------------------------------------------------------------------------|-------------------------------|
| `PORT`           | Não         | Porta HTTP da API. Padrão `3000`.                                      | `3000`                        |
| `NODE_ENV`       | Não         | `development`, `test` ou `production`.                                 | `development`                 |
| `DB_HOST`        | Sim         | Host do PostgreSQL.                                                    | `localhost`                   |
| `DB_PORT`        | Sim         | Porta do PostgreSQL. Padrão `5432`.                                    | `5432`                        |
| `DB_USER`        | Sim         | Usuário do PostgreSQL.                                                 | `postgres`                    |
| `DB_PASSWORD`    | Sim         | Senha do PostgreSQL.                                                   | `postgres`                    |
| `DB_NAME`        | Sim         | Nome do banco criado acima.                                            | `medclinic`                   |
| `JWT_SECRET`     | Sim         | Chave secreta usada para assinar JWT (mínimo 16 caracteres).           | frase-longa-e-segura-aqui     |
| `JWT_EXPIRES_IN` | Não         | Tempo de expiração do token. Padrão `1d` (1 dia).                      | `1d`, `2h`, `7d`, `60m`       |

### 3. Migrations / Criação da Tabela

Esta entrega disponibiliza **DUAS formas independentes** de criar a estrutura do banco (escolha uma, ou use as duas para validar):

#### Opção A) Script SQL manual (mais simples, recomendado para avaliadores que não querem rodar CLI)

Um arquivo **pronto para executar** está disponível em:

```
migrations/001_create_users_table.sql
```

Para rodar via terminal `psql`:

```bash
psql -U postgres -d medclinic -f migrations/001_create_users_table.sql
```

Ou execute o conteúdo do arquivo diretamente no pgAdmin/DBeaver. Ele cria: extensão `uuid-ossp`, tipo `user_role`, tabela `users` (PK UUID, UNIQUE email), índices.

#### Opção B) Migrations TypeORM (via CLI)

As migrations do TypeORM estão em:

```
src/database/migrations/1720000000001-MedClinicInit.ts
```

Comandos:

```bash
# Executar migrations pendentes (cria a estrutura)
npm run migration:run

# Reverter a última migration (se errar algo)
npm run migration:revert

# Gerar migration NOVA automaticamente a partir das entities (só se alterar entity)
npm run migration:generate
```

#### Opção C) Dev rápido (apenas ambiente dev)

Em `NODE_ENV=development` o `synchronize: true` do TypeORM **cria a tabela automaticamente** ao iniciar a API (não usar em produção).



---

## Instalação Passo a Passo

Siga exatamente os passos abaixo para rodar o projeto:

```bash
# 1. Clone o repositório (substitua pela URL do seu GitHub)
git clone https://github.com/seu-usuario/MedClinic-API.git
cd MedClinic-API

# 2. Instale as dependências
npm install

# 3. Copie e configure o arquivo .env (edite com suas credenciais)
cp .env.example .env

# 4. Crie o banco de dados PostgreSQL "medclinic" (seção anterior)

# 5. Execute as migrations (ou deixe o synchronize criar em dev)
npm run migration:run

# 6. Execute em modo desenvolvimento
npm run dev
```

Se aparecerem as mensagens abaixo, tudo deu certo:

```
[MedClinic-API] Conexão com PostgreSQL estabelecida com sucesso via TypeORM.
[MedClinic-API] Servidor rodando na porta 3000 (development).
```

---

## Execução / Scripts Disponíveis

| Comando            | Descrição                                                                 |
|--------------------|---------------------------------------------------------------------------|
| `npm run dev`      | Executa em **modo desenvolvimento** com hot-reload (via `tsx watch`).     |
| `npm run build`    | Limpa `dist/` e compila TypeScript → JavaScript (produção).              |
| `npm start`        | Executa a versão compilada em `dist/server.js` (**produção**).            |
| `npm run typeorm`  | Atalho para o CLI do TypeORM.                                            |
| `npm run migration:generate` | Gera nova migration a partir das entidades.               |
| `npm run migration:run`      | Aplica todas as migrations pendentes no banco.               |
| `npm run migration:revert`   | Reverte a última migration aplicada.                          |

---

## Arquitetura

A aplicação segue **Arquitetura MVC organizada em camadas** com estrita separação de responsabilidades.

### Fluxo Recomendado

```
HTTP Request
     ↓
Route (definição do endpoint + middlewares)
     ↓
Middleware (autenticação, autorização, validação, error-handler)
     ↓
Controller (recebe req/res, chama Service, retorna HTTP)
     ↓
Service (regras de negócio, validações, orquestração)
     ↓
Repository (apenas acesso ao banco via TypeORM)
     ↓
TypeORM
     ↓
PostgreSQL
```

O retorno percorre as mesmas camadas de forma coerente até chegar ao cliente.

### Responsabilidade de Cada Camada

| Camada         | Pasta                  | Responsabilidade Principal                                                                 |
|----------------|------------------------|--------------------------------------------------------------------------------------------|
| **Server**     | `src/server.ts`, `app.ts` | Bootstrap: conecta banco, inicia Express, registra rotas/middlewares.                       |
| **Routes**     | `src/routes/`          | Define endpoints HTTP + associa a controllers + aplica middlewares.                        |
| **Middlewares**| `src/middlewares/`     | Autenticação JWT, autorização RBAC, validação Zod, tratamento centralizado de erros.       |
| **Controllers**| `src/controllers/`     | Recebe req, delega ao Service, monta respostas HTTP (status + JSON).                       |
| **Services**   | `src/services/`        | Regras de negócio, orquestração, coordenação de Repositories, validações de domínio.       |
| **Repositories**| `src/repositories/`   | Comunicação exclusiva com PostgreSQL via TypeORM (CRUD + queries).                         |
| **Entities**   | `src/entities/`        | Entidades de domínio anotadas com decorators TypeORM (User, UserRole).                     |
| **Database**   | `src/database/`        | DataSource TypeORM, função `connectDatabase()`, migrations.                                |
| **Utils**      | `src/utils/`           | Funções auxiliares: bcrypt, JWT, validação de env, hierarquia AppError.                    |
| **DTOs**       | `src/dtos/`            | Data Transfer Objects (entrada/saída) + schemas Zod (garantem tipagem e segurança).        |
| **@types**     | `src/@types/`          | Declarações globais TypeScript (ex.: `req.user` no Express).                                |

---

## Estrutura de Pastas

```
MedClinic-API/
├── migrations/                         # SCRIPTS SQL MANUAIS (pasta na raiz, conforme seção 26)
│   └── 001_create_users_table.sql      # Script PostgreSQL 100% pronto: cria enum, tabela, PK, UNIQUE, índices
├── src/
│   ├── @types/
│   │   └── express/
│   │       └── index.d.ts              # Extende Express.Request com "user"
│   ├── controllers/
│   │   ├── Admin.controller.ts
│   │   ├── Auth.controller.ts
│   │   └── User.controller.ts
│   ├── database/
│   │   ├── migrations/                 # MIGRATIONS TYPEORM (CLI)
│   │   │   └── 1720000000001-MedClinicInit.ts  # Equivalente ao script SQL (Opção B)
│   │   ├── data-source.ts              # DataSource do TypeORM
│   │   └── index.ts                    # connectDatabase()
│   ├── dtos/
│   │   ├── CreateUser.dto.ts
│   │   ├── LoginResponse.dto.ts
│   │   ├── LoginUser.dto.ts
│   │   └── UserResponse.dto.ts
│   ├── entities/
│   │   ├── User.entity.ts
│   │   └── UserRole.enum.ts
│   ├── middlewares/
│   │   ├── authenticate.middleware.ts  # JWT
│   │   ├── authorize.middleware.ts     # RBAC
│   │   ├── errorHandler.middleware.ts  # Centralizado
│   │   └── validateRequest.middleware.ts  # Zod
│   ├── repositories/
│   │   └── User.repository.ts
│   ├── routes/
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── index.ts                    # Agrupa todas as rotas
│   │   └── user.routes.ts
│   ├── services/
│   │   ├── mappers/
│   │   │   └── User.mapper.ts          # Conversão Entity → DTO (reutilização, evita duplicação)
│   │   ├── Auth.service.ts
│   │   └── User.service.ts
│   ├── utils/
│   │   ├── errors/
│   │   │   └── AppError.ts             # Hierarquia de erros
│   │   ├── hashPassword.ts             # bcrypt
│   │   ├── jwt.ts                      # sign + verify (trata TokenExpiredError)
│   │   └── validateEnv.ts              # Zod schema de env
│   ├── app.ts                          # Express setup
│   └── server.ts                       # Bootstrap (entrypoint)
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Perfis de Usuário

A API implementa **RBAC (Role-Based Access Control)** com dois perfis nesta etapa:

| Perfil          | Valor Armazenado  | Permissões nesta etapa                                                           |
|-----------------|-------------------|----------------------------------------------------------------------------------|
| **Administrador** | `administrador` | Acesso **total** a todos os endpoints desta etapa (inclui `/admin/*`).           |
| **Atendente**     | `atendente`     | Acesso **operacional restrito**: cadastra e faz login, acessa `/users/me`, mas **não** acessa `/admin/*`. |

Novos perfis podem ser adicionados no futuro apenas estendendo o enum `UserRole.enum.ts` e atualizando o middleware `authorize(...)`.

---

## Documentação de Endpoints

Todos os endpoints são **JSON** (`Content-Type: application/json`).

Prefixo das rotas: **nenhum prefixo adicional** (as rotas são definidas a partir da raiz; altere `src/routes/index.ts` caso prefira `/api/v1/...`).

### 1. Cadastro de Usuário

```
POST /auth/register
```

- **Autenticação:** Não (pública)
- **Perfil necessário:** Nenhum
- **Validações:** Zod + regras de negócio (e-mail único).

**Requisição (JSON Body):**

```json
{
  "nome": "Ana Silva",
  "email": "ana@medclinic.com.br",
  "senha": "SenhaForte123!",
  "role": "administrador"
}
```

Campos:

| Campo  | Tipo     | Obrigatório | Regras                                                  |
|--------|----------|-------------|---------------------------------------------------------|
| `nome` | string   | Sim         | 2 a 150 caracteres.                                     |
| `email`| string   | Sim         | E-mail válido e **único** no banco.                     |
| `senha`| string   | Sim         | Mínimo 8 caracteres (armazenada com bcrypt).            |
| `role` | string   | Não         | `administrador` ou `atendente`. Padrão: `atendente`.    |

**Resposta — 201 Created (sucesso):**

```json
{
  "id": "a1b2c3d4-1234-5678-90ab-cdef01234567",
  "nome": "Ana Silva",
  "email": "ana@medclinic.com.br",
  "role": "administrador",
  "createdAt": "2026-09-09T12:00:00.000Z"
}
```

**Resposta — 400 Bad Request (dados inválidos):**

```json
{
  "statusCode": 400,
  "message": "Dados inválidos: body.email — Formato de e-mail inválido.; body.senha — Senha deve ter pelo menos 8 caracteres.",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

**Resposta — 409 Conflict (e-mail já existe):**

```json
{
  "statusCode": 409,
  "message": "E-mail já cadastrado.",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

---

### 2. Login de Usuário

```
POST /auth/login
```

- **Autenticação:** Não (pública)
- **Perfil necessário:** Nenhum
- **Retorno:** JWT (Bearer Token)

**Requisição (JSON Body):**

```json
{
  "email": "ana@medclinic.com.br",
  "senha": "SenhaForte123!"
}
```

**Resposta — 200 OK (sucesso):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWIyYzNkNC0xMjN0LTU2NzgtOTBhYi1jZGVmMDEyMzQ1NjciLCJyb2xlIjoiYWRtaW5pc3RyYWRvciIsImlhdCI6MTcyNTg4OTQ5NCwiZXhwIjoxNzI1OTc1ODk0fQ.___exemplo___",
  "tokenType": "Bearer",
  "expiresIn": "1d"
}
```

O `accessToken` decodificado contém:

```json
{
  "userId": "a1b2c3d4-...",
  "role": "administrador",
  "iat": 1725889494,
  "exp": 1725975894
}
```

**Resposta — 401 Unauthorized (credenciais inválidas — mensagem genérica):**

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas.",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

> **Segurança:** O sistema **não** informa se o erro está no e-mail ou na senha — retorna sempre a mesma mensagem genérica para evitar enumeração de usuários.

---

### 3. Dados do Usuário Autenticado

```
GET /users/me
```

- **Autenticação:** Sim (Bearer Token obrigatório no header `Authorization`)
- **Perfil necessário:** Qualquer perfil autenticado (Administrador OU Atendente)

**Headers obrigatórios:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.___token___
```

**Resposta — 200 OK:**

```json
{
  "id": "a1b2c3d4-1234-5678-90ab-cdef01234567",
  "nome": "Ana Silva",
  "email": "ana@medclinic.com.br",
  "role": "administrador",
  "createdAt": "2026-09-09T12:00:00.000Z"
}
```

**Resposta — 401 Unauthorized (sem token / token inválido / expirado):**

```json
{
  "statusCode": 401,
  "message": "Token de autenticação ausente ou malformatado.",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

---

### 4. Rota Restrita — Ping do Administrador

```
GET /admin/ping
```

- **Autenticação:** Sim (Bearer Token)
- **Perfil necessário:** Apenas **`administrador`**
- **Finalidade:** Demonstração prática do RBAC.

**Headers obrigatórios:**

```http
Authorization: Bearer ___token-do-admin___
```

**Resposta — 200 OK (sucesso para Administrador):**

```json
{
  "message": "pong admin",
  "authenticatedAs": {
    "userId": "a1b2c3d4-1234-5678-90ab-cdef01234567",
    "role": "administrador"
  }
}
```

**Resposta — 403 Forbidden (Atendente tentando acessar):**

```json
{
  "statusCode": 403,
  "message": "Acesso proibido: perfil \"atendente\" não possui permissão para esta operação.",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

---

### Extra: Health Check

```
GET /health
```

Retorna status da API. Útil para monitoramento.

---

## Tratamento de Erros

Todos os erros são capturados pelo `errorHandler.middleware.ts` e retornam **JSON padronizado**:

```json
{
  "statusCode": 400 | 401 | 403 | 404 | 409 | 500,
  "message": "Descrição clara do erro.",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

Cenários tratados:

| Status | Cenário típico                                                 |
|--------|----------------------------------------------------------------|
| 400    | Validação de body / query / params (Zod) ou requisição ruim.   |
| 401    | Login inválido, token ausente, token inválido ou expirado.     |
| 403    | Usuário autenticado mas sem permissão (RBAC).                  |
| 404    | Recurso não encontrado (ex.: usuário não existe no /me).       |
| 409    | Conflito de dados (ex.: e-mail duplicado no cadastro).         |
| 500    | Erro interno (falha no banco, exceção não tratada).            |

A aplicação **nunca crasha** com exceções não tratadas (graças a `express-async-errors` + middleware central).

---

## Git / GitHub — Fluxo e Branches

### Branches Mínimas

| Branch              | Origem    | Propósito                                                |
|---------------------|-----------|----------------------------------------------------------|
| `main`              | —         | Código de produção / entrega final da etapa.             |
| `develop`           | `main`    | Integração contínua das features antes de ir para main.  |
| `feat/setup-projeto`| `develop` | Configuração inicial (package.json, tsconfig, pastas).   |
| `feat/auth`         | `develop` | Tudo relacionado a autenticação (entity, register/login, JWT).|
| `feat/rbac`         | `develop` | Middleware de autorização + rotas restritas `/admin`.    |
| `docs/readme`       | `develop` | Elaboração do README.md completo.                        |

### Fluxo Recomendado

```text
main
  ↓ (cria develop)
develop
  ↓ (cria feature branch)
feat/setup-projeto → commits semânticos → merge em develop
feat/auth          → commits semânticos → merge em develop
feat/rbac          → commits semânticos → merge em develop
docs/readme        → commits semânticos → merge em develop
  ↓ (tudo pronto)
develop → merge em main
```

### Exemplos de Commits Semânticos (utilizados neste projeto)

O histórico de commits demonstra **evolução contínua** (≥ 12 commits):

```text
feat: cria estrutura inicial do projeto (package/tsconfig/gitignore/env)
feat: configura conexão com PostgreSQL via TypeORM DataSource
feat: cria entidade User + enum UserRole
feat: implementa DTOs e hierarquia AppError
feat: adiciona utils bcrypt e JWT
feat: implementa camadas Repository/Service/Controller de Auth
feat: implementa middleware de validação com Zod
feat: implementa middleware de autenticação JWT
feat: implementa middleware de autorização RBAC
feat: implementa middleware centralizado de tratamento de erros
feat: cria endpoints users/me e admin/ping + rotas consolidadas
fix: ajusta tipagem do SignOptions no utilitário JWT
docs: atualiza README completo com passo a passo e endpoints
```

### Passos para subir ao GitHub (após clonar ou inicializar local)

```bash
# (se ainda não tiver feito)
git init
git add .
git commit -m "feat: cria estrutura inicial do projeto"
git branch -M main

# Crie o repositório vazio no GitHub (ex.: https://github.com/seu-usuario/MedClinic-API)
git remote add origin https://github.com/seu-usuario/MedClinic-API.git
git push -u origin main

# Crie develop e push
git checkout -b develop
git push -u origin develop

# Para cada feature branch e merge depois...
```

---

## Roteiro da Demonstração (Vídeo 5–10 minutos)

Siga este roteiro (seção 37 do MASTER PROMPT) para apresentar o projeto no vídeo:

1. **Apresentação**
   - Diga: *"Projeto MedClinic API, Etapa 1 — Autenticação e Autorização."*
   - Explique brevemente o objetivo da etapa.

2. **Estrutura**
   - Mostre a **árvore de pastas** no VS Code / Explorer.
   - Aponte as camadas: Routes, Middlewares, Controllers, Services, Repositories, Entities, Database, Utils, DTOs.
   - Destaque que a estrutura já está **preparada para módulos futuros** (basta criar subpastas para `specialties`, `doctors`, `patients`, `appointments`, `reports`).

3. **Banco de Dados**
   - Abra pgAdmin / psql e mostre a tabela **`users`** criada.
   - Abra o arquivo `User.entity.ts` e aponte os campos (id, nome, email, senha, role, created_at).
   - Mostre o log "Conexão com PostgreSQL estabelecida" ao iniciar a API.

4. **Execução**
   - Rode no terminal: `npm run dev`
   - Mostre as rotas sendo logadas.

5. **Funcionalidades** (use Postman / Insomnia / Thunder Client):
   - **Cadastro:** `POST /auth/register` crie um **Administrador** e um **Atendente**.
   - **Login:** `POST /auth/login` efetue login com ambos e mostre o JWT. Abra jwt.io e mostre o `userId` + `role` no payload.
   - **Rota protegida:** `GET /users/me` com token válido → mostra dados sem senha.
   - **RBAC:**
     - Admin → `GET /admin/ping` → 200 "pong admin".
     - Atendente → `GET /admin/ping` → 403 Forbidden.

6. **Encerramento**
   - Descreva 2–3 principais **desafios** (ex.: tipagem do TypeORM + DTOs sem senha; fluxo do middleware de erro centralizado; RBAC factory).
   - Cite 2–3 **aprendizados** (Clean Code, SOLID, separação de camadas, segurança JWT/bcrypt).
   - Explique o que vem **na próxima etapa**: especialidades, médicos, pacientes, consultas e relatórios.

---

## Autor

**Jardheson Oliveira**  
MedClinic API — Mini-Projeto Final Avaliativo (Módulo 02 / Semana 07) — Etapa 1: Autenticação e Autorização.

---

**Divirta-se construindo!** 
