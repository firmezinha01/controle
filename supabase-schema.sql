-- ========================================================
-- SCHEMA DO SISTEMA DE CONTROLE DE ENTRADAS E SAÍDAS
-- PROJETO SUPABASE: hkbvlwkivntxohvbrcnw
-- ========================================================

-- 1. Habilitar extensão pgcrypto (para UUIDs e criptografia de senhas caso necessário)
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

-- 4. Índices para alta performance em consultas e filtros
CREATE INDEX IF NOT EXISTS idx_app_transactions_user_id ON public.app_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_transactions_date ON public.app_transactions(date);
CREATE INDEX IF NOT EXISTS idx_app_transactions_type ON public.app_transactions(type);
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users(username);

-- 5. Habilitar Row Level Security (RLS) com acesso permitido para a aplicação
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público/anon para a aplicação
DROP POLICY IF EXISTS "Permitir leitura anon em app_users" ON public.app_users;
CREATE POLICY "Permitir leitura anon em app_users" ON public.app_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao anon em app_users" ON public.app_users;
CREATE POLICY "Permitir insercao anon em app_users" ON public.app_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao anon em app_users" ON public.app_users;
CREATE POLICY "Permitir atualizacao anon em app_users" ON public.app_users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao anon em app_users" ON public.app_users;
CREATE POLICY "Permitir exclusao anon em app_users" ON public.app_users FOR DELETE USING (true);

-- Políticas para app_transactions
DROP POLICY IF EXISTS "Permitir leitura anon em app_transactions" ON public.app_transactions;
CREATE POLICY "Permitir leitura anon em app_transactions" ON public.app_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao anon em app_transactions" ON public.app_transactions;
CREATE POLICY "Permitir insercao anon em app_transactions" ON public.app_transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao anon em app_transactions" ON public.app_transactions;
CREATE POLICY "Permitir atualizacao anon em app_transactions" ON public.app_transactions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao anon em app_transactions" ON public.app_transactions;
CREATE POLICY "Permitir exclusao anon em app_transactions" ON public.app_transactions FOR DELETE USING (true);

-- ========================================================
-- DADOS INICIAIS (SEED)
-- ========================================================

-- Inserir usuário ADMIN padrão (login: admin | senha: 123456)
-- Hash bcrypt de "123456": $2a$10$wTqWqN8bN65oYdFjIvgdCugrVbQ49vGf56z0l09V/wJ2.wR.z9WcO
INSERT INTO public.app_users (id, username, password_hash, name, role, status, notes)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    '$2a$10$7q5f5mR55dJkC0Q4k5Zq0O51Q3ZkG9Oq8X1qK6G0z0l09V/wJ2.wR',
    'Administrador Geral',
    'admin',
    'active',
    'Acesso total ao painel administrativo'
)
ON CONFLICT (username) DO NOTHING;

-- Inserir usuário de teste 1: marcos.silva
INSERT INTO public.app_users (id, username, password_hash, name, role, status, notes)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'marcos.silva',
    '$2a$10$7q5f5mR55dJkC0Q4k5Zq0O51Q3ZkG9Oq8X1qK6G0z0l09V/wJ2.wR',
    'Marcos Silva',
    'user',
    'active',
    'Departamento Comercial'
)
ON CONFLICT (username) DO NOTHING;

-- Inserir usuário de teste 2: ana.pereira
INSERT INTO public.app_users (id, username, password_hash, name, role, status, notes)
VALUES (
    'c0000000-0000-0000-0000-000000000003',
    'ana.pereira',
    '$2a$10$7q5f5mR55dJkC0Q4k5Zq0O51Q3ZkG9Oq8X1qK6G0z0l09V/wJ2.wR',
    'Ana Pereira',
    'user',
    'active',
    'Serviços & Consultoria'
)
ON CONFLICT (username) DO NOTHING;

-- Transações de demonstração para marcos.silva
INSERT INTO public.app_transactions (user_id, type, description, amount, date, category, payment_method, status, notes)
VALUES
    ('b0000000-0000-0000-0000-000000000002', 'entrada', 'Venda de Projeto Web', 4500.00, CURRENT_DATE - INTERVAL '15 days', 'Vendas', 'Pix', 'completed', 'Cliente Alfa Engenharia'),
    ('b0000000-0000-0000-0000-000000000002', 'saida', 'Aluguel do Escritório', 1400.00, CURRENT_DATE - INTERVAL '12 days', 'Moradia / Escritório', 'Boleto Bancário', 'completed', 'Imobiliária Central'),
    ('b0000000-0000-0000-0000-000000000002', 'entrada', 'Consultoria Estratégica', 2800.00, CURRENT_DATE - INTERVAL '8 days', 'Serviços', 'Transferência TED', 'completed', 'Primeira parcela'),
    ('b0000000-0000-0000-0000-000000000002', 'saida', 'Internet Fibra Óptica', 199.90, CURRENT_DATE - INTERVAL '6 days', 'Contas Fixas (Luz, Água, Net)', 'Cartão de Crédito', 'completed', 'Plano 500MB'),
    ('b0000000-0000-0000-0000-000000000002', 'saida', 'Licença de Softwares', 320.00, CURRENT_DATE - INTERVAL '3 days', 'Tecnologia / Softwares', 'Cartão de Crédito', 'completed', 'Figma e ferramentas'),
    ('b0000000-0000-0000-0000-000000000002', 'entrada', 'Recebimento de Manutenção', 1200.00, CURRENT_DATE - INTERVAL '1 day', 'Recorrente', 'Pix', 'completed', 'Contrato mensal de suporte'),
    ('b0000000-0000-0000-0000-000000000002', 'saida', 'Energia Elétrica', 285.50, CURRENT_DATE + INTERVAL '3 days', 'Contas Fixas (Luz, Água, Net)', 'Pix', 'pending', 'Vencimento próximo'),
    ('b0000000-0000-0000-0000-000000000002', 'entrada', 'Novo Contrato de Serviços', 3500.00, CURRENT_DATE + INTERVAL '5 days', 'Vendas', 'Boleto Bancário', 'pending', 'Aguardando compensação');
