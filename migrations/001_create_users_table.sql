-- =============================================================================
-- MedClinic API — Etapa 1
-- Migration 001: Criação da estrutura inicial
--
-- Descrição: Cria a tabela `users` com todos os campos e constraints
--            especificados na Etapa 1 (Autenticação e Autorização).
--
-- Uso: Execute este script em um banco PostgreSQL já criado (ex.: "medclinic")
--      via psql, pgAdmin ou outro cliente SQL.
--
-- Alternativa: Você também pode usar as migrations do TypeORM via CLI
--              (veja: npm run migration:run) que geram/executam o equivalente.
-- =============================================================================

-- 1. Garante que a extensão UUID está disponível (usada pelo PK uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Cria o ENUM de perfil de usuário
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('administrador', 'atendente');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Cria a tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'atendente',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Garante UNIQUE no e-mail (impede duplicidade no cadastro)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);

-- 5. Índice adicional para busca frequente por role em queries de RBAC (opcional, útil em produção)
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- =============================================================================
-- Fim da migration 001
-- =============================================================================
