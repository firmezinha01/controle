# FluxoControl - Sistema de Controle de Entradas e Saídas

Sistema completo e moderno para controle financeiro, gestão de pagamentos (saídas), recebimentos (entradas) e administração de usuários independentes.

- **Repositório GitHub:** [https://github.com/firmezinha01/controle](https://github.com/firmezinha01/controle)
- **Vercel Deploy:** [https://vercel.com/flavios-projects-9d343525/controle](https://vercel.com/flavios-projects-9d343525/controle)
- **Painel Supabase:** [https://supabase.com/dashboard/project/hkbvlwkivntxohvbrcnw](https://supabase.com/dashboard/project/hkbvlwkivntxohvbrcnw)

---

## ⚡ Configuração do Supabase & Vercel

### Passo 1: Executar o Script SQL no Supabase
1. Acesse o **SQL Editor** do projeto:
   👉 [https://supabase.com/dashboard/project/hkbvlwkivntxohvbrcnw/sql/new](https://supabase.com/dashboard/project/hkbvlwkivntxohvbrcnw/sql/new)
2. Abra o arquivo `supabase-schema.sql` deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**.
   *(Isso criará as tabelas `app_users`, `app_transactions`, índices, políticas de acesso e os dados iniciais do admin `admin`/`123456`)*.

### Passo 2: Pegar a Chave Anon no Supabase
1. Acesse **Project Settings > API**:
   👉 [https://supabase.com/dashboard/project/hkbvlwkivntxohvbrcnw/settings/api](https://supabase.com/dashboard/project/hkbvlwkivntxohvbrcnw/settings/api)
2. Copie a chave em **Project API keys > `anon` `public`**.

### Passo 3: Adicionar as Variáveis na Vercel
1. Acesse as configurações do projeto na Vercel:
   👉 [https://vercel.com/flavios-projects-9d343525/controle/settings/environment-variables](https://vercel.com/flavios-projects-9d343525/controle/settings/environment-variables)
2. Adicione as seguintes variáveis:
   - **`VITE_SUPABASE_URL`**: `https://hkbvlwkivntxohvbrcnw.supabase.co`
   - **`VITE_SUPABASE_ANON_KEY`**: *(cole sua chave anon copiada do Supabase)*
3. Clique em **Save** e em seguida vá na aba **Deployments** e faça um **Redeploy**.

---

## 🔑 Credenciais de Acesso

- **Painel Admin:**
  - Login: `admin`
  - Senha: `123456`
- **Usuário de Teste:**
  - Login: `marcos.silva`
  - Senha: `123456`

---

## 💻 Execução Local (Opcional)

Execute no terminal:
```bash
npm start
```
Ou dê um duplo clique no arquivo `iniciar.bat`.
Acesse em: **`http://localhost:3001`**
