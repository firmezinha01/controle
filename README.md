# FluxoControl - Sistema de Controle de Entradas e Saídas

Sistema completo e moderno para controle financeiro, gestão de pagamentos (saídas), recebimentos (entradas) e administração de usuários independentes.

---

## 🚀 Como Executar o Sistema

### Pré-requisito
- Node.js instalado (versão 18 ou superior).

### 1. Iniciar o Sistema (Servidor + Painel Web)
No terminal do projeto (nesta pasta), execute:

```bash
npm start
```
Ou para modo de desenvolvimento com recarga automática:
```bash
npm run dev:all
```

Depois abra o seu navegador em:
👉 **`http://localhost:3001`** (ou `http://localhost:5173` no modo dev)

---

## 🔑 Credenciais Padrão de Acesso

### Painel do Administrador (Geral)
- **Login:** `admin`
- **Senha:** `123456`

### Usuários de Teste Já Pré-Configurados
- **Usuário 1:** `marcos.silva` | **Senha:** `123456`
- **Usuário 2:** `ana.pereira` | **Senha:** `123456`

---

## 🌟 Funcionalidades do Sistema

### 1. Painel do Administrador (`admin` / `123456`)
- **Inserir Novos Usuários:** Defina o nome completo, o login de acesso (ex: `carlos.vendas`) e a senha (manual ou gerada automaticamente pelo sistema com 1 clique).
- **Gestão Completa:** Edição de dados, alteração/reset de senhas, ativação e desativação de contas.
- **Espiar/Auditar Painel:** O administrador pode clicar em **"Ver Painel"** em qualquer usuário para inspecionar ou administrar os lançamentos financeiros daquele usuário específico com total transparência.
- **Estatísticas Gerais da Plataforma:** Visualização do total de usuários, total de transações e volume financeiro movimentado na rede.

### 2. Painel do Usuário (Financeiro Individual)
Cada usuário criado pelo administrador tem sua própria área totalmente isolada:
- **Soma e Subtração Automática em Tempo Real:**
  - Card de **Total de Entradas (Recebimentos)** (Verde)
  - Card de **Total de Saídas (Pagamentos / Despesas)** (Vermelho)
  - Card de **Saldo Líquido (Entradas − Saídas)** com identificação imediata de Superávit (+) ou Déficit (−)
  - Card de **Saldo Efetivado (Quitado)** e valores pendentes.
- **Visualização Flexível por Abas:**
  - 📑 **Todas as Movimentações:** Visualiza entradas e saídas juntas, com saldo consolidado.
  - 🟢 **Somente Entradas:** Aba dedicada exclusivamente aos recebimentos com totalizador em destaque.
  - 🔴 **Somente Saídas:** Aba dedicada exclusivamente às despesas e pagamentos com totalizador em destaque.
  - 📊 **Gráficos & Análise Visual:** Gráfico proporcional de Receitas x Despesas e barras por categoria.
- **Cadastro Completo de Movimentações:**
  - Descrição, Valor em R$, Data, Categoria, Forma de Pagamento (Pix, Boleto, Cartão, Dinheiro, etc.), Status (Quitado ou Pendente) e Observações.
- **Filtros e Exportação:**
  - Filtro por mês/ano e por status de pagamento.
  - Busca instantânea por texto.
  - Exportação de extrato para **Excel / CSV**.
  - Impressão formatada para PDF.
