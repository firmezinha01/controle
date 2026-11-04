import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDB, writeDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fluxocontrol_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Sessão expirada ou token inválido.' });
    }
    req.user = user;
    next();
  });
}

// Middleware de autorização Admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito ao Administrador.' });
  }
  next();
}

/* ========================================================
   ROTAS DE AUTENTICAÇÃO
   ======================================================== */

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Informe o login e a senha.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Login ou senha incorretos.' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Este usuário está desativado pelo administrador.' });
  }

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Login ou senha incorretos.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      notes: user.notes
    }
  });
});

// Checar sessão atual
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  return res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
    notes: user.notes
  });
});

/* ========================================================
   ROTAS DE ADMINISTRAÇÃO (GERENCIAMENTO DE USUÁRIOS)
   ======================================================== */

// Listar todos os usuários
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const usersWithMeta = db.users.map(u => {
    const userTxs = db.transactions.filter(t => t.userId === u.id);
    const totalEntradas = userTxs
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalSaidas = userTxs
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      status: u.status,
      notes: u.notes,
      createdAt: u.createdAt,
      transactionCount: userTxs.length,
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas
    };
  });

  return res.json(usersWithMeta);
});

// Cadastrar novo usuário pelo Admin
app.post('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const { username, password, name, notes, role = 'user', status = 'active' } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ message: 'Nome, login e senha são obrigatórios.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ message: 'O login deve ter pelo menos 3 caracteres.' });
  }

  if (password.length < 4) {
    return res.status(400).json({ message: 'A senha deve ter pelo menos 4 caracteres.' });
  }

  const db = readDB();
  const exists = db.users.some(u => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    return res.status(400).json({ message: 'Já existe um usuário cadastrado com este login.' });
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    username: cleanUsername,
    passwordHash: bcrypt.hashSync(password, 10),
    name: name.trim(),
    role: role === 'admin' ? 'admin' : 'user',
    status: status === 'inactive' ? 'inactive' : 'active',
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  return res.status(201).json({
    message: 'Usuário cadastrado com sucesso!',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      notes: newUser.notes,
      createdAt: newUser.createdAt
    }
  });
});

// Atualizar usuário pelo Admin
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { username, name, notes, status, role } = req.body;

  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  const targetUser = db.users[userIndex];

  // Não permitir desativar ou rebaixar o admin padrão
  if (targetUser.username === 'admin' && status === 'inactive') {
    return res.status(400).json({ message: 'O administrador principal não pode ser desativado.' });
  }

  if (username && username.trim().toLowerCase() !== targetUser.username.toLowerCase()) {
    const cleanUsername = username.trim().toLowerCase();
    const alreadyExists = db.users.some(u => u.id !== id && u.username.toLowerCase() === cleanUsername);
    if (alreadyExists) {
      return res.status(400).json({ message: 'Este login já está em uso por outro usuário.' });
    }
    targetUser.username = cleanUsername;
  }

  if (name) targetUser.name = name.trim();
  if (notes !== undefined) targetUser.notes = notes.trim();
  if (status) targetUser.status = status;
  if (role && targetUser.username !== 'admin') targetUser.role = role;

  writeDB(db);

  return res.json({
    message: 'Usuário atualizado com sucesso!',
    user: {
      id: targetUser.id,
      username: targetUser.username,
      name: targetUser.name,
      role: targetUser.role,
      status: targetUser.status,
      notes: targetUser.notes
    }
  });
});

// Alterar / resetar senha do usuário pelo Admin
app.put('/api/admin/users/:id/password', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ message: 'A nova senha deve ter no mínimo 4 caracteres.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeDB(db);

  return res.json({ message: `Senha do usuário ${user.name} atualizada com sucesso!` });
});

// Excluir usuário pelo Admin
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  if (user.username === 'admin') {
    return res.status(400).json({ message: 'O administrador principal não pode ser excluído.' });
  }

  // Remove o usuário e todas as suas transações
  db.users = db.users.filter(u => u.id !== id);
  db.transactions = db.transactions.filter(t => t.userId !== id);
  writeDB(db);

  return res.json({ message: 'Usuário e suas movimentações foram excluídos com sucesso.' });
});

// Estatísticas globais para o Admin
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'active').length;
  const totalTransactions = db.transactions.length;

  const totalEntradas = db.transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalSaidas = db.transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return res.json({
    totalUsers,
    activeUsers,
    totalTransactions,
    totalEntradas,
    totalSaidas,
    saldoGeral: totalEntradas - totalSaidas
  });
});

/* ========================================================
   ROTAS DE MOVIMENTAÇÕES (ENTRADAS E SAÍDAS)
   ======================================================== */

// Identifica o ID do usuário da requisição (ou se for admin e passar impersonateUserId)
function getTargetUserId(req) {
  if (req.user.role === 'admin' && req.query.viewAsUserId) {
    return req.query.viewAsUserId;
  }
  return req.user.id;
}

// Listar transações com filtros
app.get('/api/transactions', authenticateToken, (req, res) => {
  const targetUserId = getTargetUserId(req);
  const { type, month, search, status, category, startDate, endDate } = req.query;

  const db = readDB();
  let list = db.transactions.filter(t => t.userId === targetUserId);

  // Filtro por tipo: entrada ou saida
  if (type && type !== 'all') {
    list = list.filter(t => t.type === type);
  }

  // Filtro por status: completed ou pending
  if (status && status !== 'all') {
    list = list.filter(t => t.status === status);
  }

  // Filtro por categoria
  if (category && category !== 'all') {
    list = list.filter(t => t.category?.toLowerCase() === category.toLowerCase());
  }

  // Filtro por mês (YYYY-MM)
  if (month && month !== 'all') {
    list = list.filter(t => t.date && t.date.startsWith(month));
  }

  // Filtro por período específico
  if (startDate) {
    list = list.filter(t => t.date >= startDate);
  }
  if (endDate) {
    list = list.filter(t => t.date <= endDate);
  }

  // Filtro de busca textual
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(t =>
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q))
    );
  }

  // Ordena por data decrescente (mais recente primeiro)
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return res.json(list);
});

// Obter resumo financeiro (Soma e Subtração dinâmica)
app.get('/api/transactions/summary', authenticateToken, (req, res) => {
  const targetUserId = getTargetUserId(req);
  const { month, startDate, endDate } = req.query;

  const db = readDB();
  let list = db.transactions.filter(t => t.userId === targetUserId);

  if (month && month !== 'all') {
    list = list.filter(t => t.date && t.date.startsWith(month));
  }
  if (startDate) {
    list = list.filter(t => t.date >= startDate);
  }
  if (endDate) {
    list = list.filter(t => t.date <= endDate);
  }

  let totalEntradas = 0;
  let totalSaidas = 0;
  let entradasCompletadas = 0;
  let saidasCompletadas = 0;
  let entradasPendentes = 0;
  let saidasPendentes = 0;

  let countEntradas = 0;
  let countSaidas = 0;

  const categoriesEntradas = {};
  const categoriesSaidas = {};

  list.forEach(t => {
    const val = Number(t.amount) || 0;
    const cat = t.category || 'Outros';

    if (t.type === 'entrada') {
      totalEntradas += val;
      countEntradas++;
      categoriesEntradas[cat] = (categoriesEntradas[cat] || 0) + val;
      if (t.status === 'completed') {
        entradasCompletadas += val;
      } else {
        entradasPendentes += val;
      }
    } else if (t.type === 'saida') {
      totalSaidas += val;
      countSaidas++;
      categoriesSaidas[cat] = (categoriesSaidas[cat] || 0) + val;
      if (t.status === 'completed') {
        saidasCompletadas += val;
      } else {
        saidasPendentes += val;
      }
    }
  });

  // Saldo = Total Entradas - Total Saídas
  const saldo = totalEntradas - totalSaidas;
  const saldoRealizado = entradasCompletadas - saidasCompletadas;

  return res.json({
    totalEntradas,
    totalSaidas,
    saldo,
    entradasCompletadas,
    saidasCompletadas,
    saldoRealizado,
    entradasPendentes,
    saidasPendentes,
    countTotal: list.length,
    countEntradas,
    countSaidas,
    categoriesEntradas,
    categoriesSaidas
  });
});

// Criar nova movimentação
app.post('/api/transactions', authenticateToken, (req, res) => {
  const targetUserId = getTargetUserId(req);
  const { type, description, amount, date, category, paymentMethod, status = 'completed', notes } = req.body;

  if (!type || !description || amount === undefined || !date) {
    return res.status(400).json({ message: 'Tipo, descrição, valor e data são obrigatórios.' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'O valor deve ser um número positivo.' });
  }

  if (type !== 'entrada' && type !== 'saida') {
    return res.status(400).json({ message: 'Tipo inválido. Deve ser entrada ou saida.' });
  }

  const db = readDB();
  const newTx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId: targetUserId,
    type,
    description: description.trim(),
    amount: numericAmount,
    date,
    category: category ? category.trim() : (type === 'entrada' ? 'Receita Geral' : 'Despesa Geral'),
    paymentMethod: paymentMethod ? paymentMethod.trim() : 'Pix',
    status: status === 'pending' ? 'pending' : 'completed',
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.transactions.push(newTx);
  writeDB(db);

  return res.status(201).json({
    message: `${type === 'entrada' ? 'Recebimento' : 'Pagamento'} cadastrado com sucesso!`,
    transaction: newTx
  });
});

// Atualizar movimentação
app.put('/api/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const targetUserId = getTargetUserId(req);
  const { type, description, amount, date, category, paymentMethod, status, notes } = req.body;

  const db = readDB();
  const txIndex = db.transactions.findIndex(t => t.id === id && t.userId === targetUserId);

  if (txIndex === -1) {
    return res.status(404).json({ message: 'Movimentação não encontrada.' });
  }

  const tx = db.transactions[txIndex];

  if (type) {
    if (type !== 'entrada' && type !== 'saida') {
      return res.status(400).json({ message: 'Tipo inválido.' });
    }
    tx.type = type;
  }

  if (description) tx.description = description.trim();
  if (amount !== undefined) {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Valor inválido.' });
    }
    tx.amount = numericAmount;
  }
  if (date) tx.date = date;
  if (category) tx.category = category.trim();
  if (paymentMethod) tx.paymentMethod = paymentMethod.trim();
  if (status) tx.status = status === 'pending' ? 'pending' : 'completed';
  if (notes !== undefined) tx.notes = notes.trim();

  writeDB(db);

  return res.json({
    message: 'Movimentação atualizada com sucesso!',
    transaction: tx
  });
});

// Alternar status (Realizado / Pendente)
app.patch('/api/transactions/:id/toggle-status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const targetUserId = getTargetUserId(req);

  const db = readDB();
  const tx = db.transactions.find(t => t.id === id && t.userId === targetUserId);

  if (!tx) {
    return res.status(404).json({ message: 'Movimentação não encontrada.' });
  }

  tx.status = tx.status === 'completed' ? 'pending' : 'completed';
  writeDB(db);

  return res.json({
    message: `Status alterado para ${tx.status === 'completed' ? 'Realizado' : 'Pendente'}.`,
    transaction: tx
  });
});

// Excluir movimentação
app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const targetUserId = getTargetUserId(req);

  const db = readDB();
  const txIndex = db.transactions.findIndex(t => t.id === id && t.userId === targetUserId);

  if (txIndex === -1) {
    return res.status(404).json({ message: 'Movimentação não encontrada.' });
  }

  db.transactions.splice(txIndex, 1);
  writeDB(db);

  return res.json({ message: 'Movimentação excluída com sucesso!' });
});

/* ========================================================
   SERVIÇO ESTÁTICO DO FRONTEND (PRODUÇÃO)
   ======================================================== */
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Endpoint da API não encontrado.' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Servidor FluxoControl ativo. Execute o frontend com "npm run dev" para desenvolvimento.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor FluxoControl rodando em http://localhost:${PORT}`);
});
