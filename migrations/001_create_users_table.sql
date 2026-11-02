-- =============================================================================
-- MedClinic API — Etapa 1 (referência)
-- Migration 001: Criação da estrutura inicial
--
-- IMPORTANTE: o caminho oficial de criação do banco é a migration do TypeORM
--             (src/database/migrations/1720000000001-MedClinicInit.ts), aplicada
--             via `npm run migration:run` ou pelo entrypoint do container.
--             Este arquivo é mantido apenas como referência SQL da Etapa 1 e
--             reflete o contrato vigente: roles `admin` e `secretary`
--             (o valor `doctor` é adicionado na migration da Etapa 2).
-- =============================================================================

-- 1. Garante que a extensão UUID está disponível (usada pelo PK uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Cria o ENUM de perfil de usuário (contrato vigente da Etapa 2)
DO $ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'secretary');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $;

-- 3. Cria a tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'secretary',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Garante UNIQUE no e-mail (impede duplicidade no cadastro)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);

-- 5. Índice adicional para busca frequente por role em queries de RBAC (opcional, útil em produção)
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- =============================================================================
-- Fim da migration 001
-- =============================================================================
