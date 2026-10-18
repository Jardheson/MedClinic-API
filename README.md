# MedClinic API

API REST em Node.js, TypeScript, Express, TypeORM e PostgreSQL para a Etapa 2 da MedClinic, com autenticação JWT, RBAC, pacientes, médicos, escala, calendário, consultas e prontuário.

## Stack

- Node.js 20+
- TypeScript
- Express
- TypeORM
- PostgreSQL
- Zod
- Vitest + Supertest

## Módulos implementados

- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `POST /api/v1/users`
- `GET /api/v1/admin/ping`
- CRUD principal de `patients`
- `doctors` com criação administrativa e busca
- `work-schedule` por médico
- `calendar` por médico e data
- `appointments` com validação de escala e conflitos
- `medical-records` aninhado em paciente

## Requisitos

- Node.js 20+
- PostgreSQL 13+
- npm

## Variáveis de ambiente

Copie `.env.example` para `.env`.

```dotenv
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=medclinic
DB_SSL_ENABLED=false
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medclinic

TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=medclinic_test

JWT_SECRET=sua-chave-secreta-super-forte-aqui-altere-em-producao
JWT_EXPIRES_IN=1d

RUN_ADMIN_SEED=false
ADMIN_SEED_NAME=Administrador MedClinic
ADMIN_SEED_EMAIL=admin@medclinic.local
ADMIN_SEED_PASSWORD=SenhaForte123!
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
npm test
npm run test:coverage
npm run test:integration
npm run db:prepare
npm run migration:run
npm run migration:revert
npm run seed:admin
```

## Banco e migrations

Banco principal e banco de integração:

```sql
CREATE DATABASE medclinic;
CREATE DATABASE medclinic_test;
```

Prepare o schema com as migrations:

```bash
npm run db:prepare
```

Ou, se preferir controlar manualmente:

```bash
npm run migration:run
```

Migrations atuais:

- `1720000000001-MedClinicInit.ts`
- `1720000000002-MedClinicClinicalModule.ts`
- `1720000000003-MedClinicDoctorsModule.ts`
- `1720000000004-MedClinicSchedulingModule.ts`

## Seed do primeiro admin

O seed é manual e idempotente para o primeiro administrador.

```bash
npm run seed:admin
```

Regras:

- exige `ADMIN_SEED_NAME`, `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD`
- falha se a senha tiver menos de 8 caracteres
- não cria novo admin se já existir um `admin`

## Execução local

```bash
npm install
cp .env.example .env
npm run migration:run
npm run seed:admin
npm run dev
```

## Docker

O ambiente Docker agora sobe:

- PostgreSQL principal
- banco `medclinic_test` criado automaticamente no bootstrap do container do Postgres
- API com espera pelo banco, execução de migrations e seed opcional do primeiro admin

Build da imagem:

```bash
docker build -t medclinic-api .
```

Subida local com PostgreSQL:

```bash
docker compose up --build
```

Após subir, a API responde em `http://localhost:3000/api/v1/health` e o PostgreSQL do container fica em `localhost:5433`.

Arquivos incluídos:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `docker/entrypoint.sh`
- `docker/postgres/init/01-create-test-db.sql`

## Workflows

- `ci.yml`: roda em `push` e `pull_request`; sobe um PostgreSQL como service, cria o banco
  `medclinic_test`, executa `npm run test:coverage` (suíte unificada, unit + integração) com
  gate de 80% e roda `npm run build`. O relatório de cobertura é publicado como artefato.
- `deploy.yml`: publica imagem Docker no GHCR em `push` para `main` e `workflow_dispatch`

## Endpoints principais

### Health

```http
GET /api/v1/health
```

### Auth

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "admin@medclinic.local",
  "password": "SenhaForte123!"
}
```

### Users

```http
GET /api/v1/users/me
POST /api/v1/users
```

`POST /users` é administrativo e usa:

```json
{
  "name": "Maria Secretária",
  "email": "maria@medclinic.com",
  "password": "SenhaForte123!",
  "roles": ["secretary"]
}
```

### Doctors

```http
POST /api/v1/doctors
GET /api/v1/doctors
GET /api/v1/doctors/:id
PUT /api/v1/doctors/:doctorId/work-schedule
GET /api/v1/doctors/:doctorId/work-schedule
GET /api/v1/doctors/:doctorId/calendar?date=2026-10-19
```

Criação de médico:

```json
{
  "name": "Dra. Alice",
  "email": "alice@medclinic.com",
  "password": "SenhaForte123!",
  "crm": "CRM1234"
}
```

Escala:

```json
{
  "items": [
    {
      "weekday": "monday",
      "startTime": "08:00",
      "endTime": "12:00",
      "slotDurationMinutes": 60
    }
  ]
}
```

### Patients

```http
POST /api/v1/patients
GET /api/v1/patients
GET /api/v1/patients/:id
PATCH /api/v1/patients/:id
DELETE /api/v1/patients/:id
```

Body:

```json
{
  "name": "Maria Souza",
  "cpf": "12345678901"
}
```

### Appointments

```http
POST /api/v1/appointments
PATCH /api/v1/appointments/:id/status
```

Body:

```json
{
  "doctorId": "uuid-do-medico",
  "patientId": "uuid-do-paciente",
  "startsAt": "2026-10-19T09:00:00.000Z"
}
```

O backend:

- calcula `endsAt` com base na escala
- valida horário dentro da escala
- impede conflito do médico
- impede conflito do paciente

### Medical Records

```http
GET /api/v1/patients/:patientId/medical-records
POST /api/v1/patients/:patientId/medical-records
```

Body:

```json
{
  "descricao": "Paciente com boa evolução clínica.",
  "prescricao": "Retorno em 7 dias."
}
```

## Regras de negócio já aplicadas

- RBAC revalidado no banco
- `roles` persistidos como `admin`, `secretary`, `doctor`
- pacientes por `cpf`
- médicos por `crm`
- prontuário com vínculo por consulta `in_progress` ou `done`
- leitura de prontuário por `admin` para auditoria
- criação de consulta dependente da escala
- transições válidas de status em consulta

## Testes

A suíte de cobertura é unificada: ela roda testes unitários/HTTP e os testes de integração
com PostgreSQL real, e aplica o gate de cobertura sobre todo o `src`.

```bash
npm test              # suíte unificada (unit + integração)
npm run test:coverage # suíte unificada + cobertura com gate de 80%
npm run test:integration # apenas os testes de integração
```

Estado verificado no workspace (com PostgreSQL do `docker compose` ativo):

- `82` testes passando (23 arquivos)
- `npm run test:coverage` passando com gate de 80%
- cobertura atual: `90.01%` lines, `90.09%` branches, `87.14%` functions, `90.01%` statements
- `npx tsc --noEmit` passando

Limiares de cobertura configurados em `vitest.config.ts`:

```ts
thresholds: {
  lines: 80,
  functions: 80,
  branches: 80,
  statements: 80,
}
```

Escopo de cobertura: todo o `src`, exceto `src/server.ts`, `src/database/**`, `src/@types/**`
e `src/scripts/**` (pontos de entrada de bootstrap/CLI, exercitados pelo entrypoint do container).

## Integração

A suíte de integração usa PostgreSQL real e é executada contra o banco de teste. Configure no `.env`:

```dotenv
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=medclinic_test
```

Depois rode:

```bash
npm run test:integration
```

Se estiver usando o `docker compose`, o banco `medclinic_test` já é criado automaticamente no mesmo
Postgres. Quando as variáveis `TEST_DB_*` não estão configuradas, os testes de integração são
ignorados e o gate de cobertura falha de forma explícita.

## Estrutura resumida

```text
src/
  controllers/
  database/
  dtos/
  entities/
  middlewares/
  repositories/
  routes/
  scripts/
  services/
  utils/
tests/
```

## Autor

Jardheson Oliveira
