-- ========================================================
-- SCHEMA DO SISTEMA DE CONTROLE DE ENTRADAS E SAÍDAS
-- PROJETO SUPABASE: hkbvlwkivntxohvbrcnw
-- ========================================================

-- 1. Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Usuários do Sistema (Admin e Usuários Gerados)
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Movimentações Financeiras (Entradas e Saídas)
CREATE TABLE IF NOT EXISTS public.app_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Pix',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Índices para alta performance
CREATE INDEX IF NOT EXISTS idx_app_transactions_user_id ON public.app_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_transactions_date ON public.app_transactions(date);
CREATE INDEX IF NOT EXISTS idx_app_transactions_type ON public.app_transactions(type);
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users(username);

-- 5. Habilitar RLS com permissões públicas para a aplicação
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir anon em app_users" ON public.app_users;
CREATE POLICY "Permitir anon em app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir anon em app_transactions" ON public.app_transactions;
CREATE POLICY "Permitir anon em app_transactions" ON public.app_transactions FOR ALL USING (true) WITH CHECK (true);

-- 6. Inserir Usuário ADMIN Padrão (login: admin | senha: 123456)
INSERT INTO public.app_users (id, username, password_hash, name, role, status, notes)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    '$2a$10$7q5f5mR55dJkC0Q4k5Zq0O51Q3ZkG9Oq8X1qK6G0z0l09V/wJ2.wR',
    'Administrador Geral',
    'admin',
    'active',
    'Acesso total ao painel administrativo'
) ON CONFLICT (username) DO NOTHING;
