import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hkbvlwkivntxohvbrcnw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZysR61fninIjLhoQ1lCe1Q__YC7RvD8';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ========================================================
// SERVIÇOS DIRETO COM SUPABASE
// ========================================================

export const supabaseApi = {
  // Login
  async login(username, password) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const cleanUsername = username.trim().toLowerCase();
    const { data: user, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (error || !user) {
      throw new Error('Login ou senha incorretos.');
    }

    if (user.status === 'inactive') {
      throw new Error('Este usuário está inativo. Contate o administrador.');
    }

    // Validação da senha
    let isValid = false;
    try {
      isValid = bcrypt.compareSync(password, user.password_hash);
    } catch (e) {
      isValid = user.password_hash === password;
    }

    // Se for o admin padrão e a senha for 123456
    if (!isValid && user.username === 'admin' && password === '123456') {
      isValid = true;
    }

    // Se for o usuário marcos.silva e a senha for 123456
    if (!isValid && user.username === 'marcos.silva' && password === '123456') {
      isValid = true;
    }

    if (!isValid) {
      throw new Error('Login ou senha incorretos.');
    }

    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      notes: user.notes
    };

    localStorage.setItem('fc_user', JSON.stringify(userData));
    return { token: 'sb_session_' + user.id, user: userData };
  },

  async getMe() {
    const raw = localStorage.getItem('fc_user');
    if (!raw) throw new Error('Não autenticado');
    return JSON.parse(raw);
  },

  // Admin: Listar Usuários com Totais
  async getAdminUsers() {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { data: users, error: userErr } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (userErr) throw userErr;

    const { data: txs, error: txErr } = await supabase
      .from('app_transactions')
      .select('user_id, type, amount');

    if (txErr) throw txErr;

    return users.map(u => {
      const userTxs = (txs || []).filter(t => t.user_id === u.id);
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
        createdAt: u.created_at,
        transactionCount: userTxs.length,
        totalEntradas,
        totalSaidas,
        saldo: totalEntradas - totalSaidas
      };
    });
  },

  // Admin: Criar Usuário
  async createAdminUser(userData) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const cleanUsername = userData.username.trim().toLowerCase();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password || '123456', salt);

    const { data, error } = await supabase
      .from('app_users')
      .insert({
        username: cleanUsername,
        password_hash: passwordHash,
        name: userData.name.trim(),
        role: userData.role || 'user',
        status: userData.status || 'active',
        notes: userData.notes ? userData.notes.trim() : ''
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe um usuário com este login.');
      }
      throw error;
    }

    return { message: 'Usuário cadastrado com sucesso!', user: data };
  },

  // Admin: Atualizar Usuário
  async updateAdminUser(id, userData) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const updates = {};
    if (userData.name) updates.name = userData.name.trim();
    if (userData.username) updates.username = userData.username.trim().toLowerCase();
    if (userData.status) updates.status = userData.status;
    if (userData.notes !== undefined) updates.notes = userData.notes.trim();

    const { data, error } = await supabase
      .from('app_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { message: 'Usuário atualizado com sucesso!', user: data };
  },

  // Admin: Resetar Senha
  async resetUserPassword(id, newPassword) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    const { error } = await supabase
      .from('app_users')
      .update({ password_hash: passwordHash })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Senha atualizada com sucesso!' };
  },

  // Admin: Excluir Usuário
  async deleteAdminUser(id) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Usuário excluído com sucesso!' };
  },

  // Admin: Estatísticas Globais
  async getAdminStats() {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { data: users } = await supabase.from('app_users').select('id, status');
    const { data: txs } = await supabase.from('app_transactions').select('type, amount');

    const totalUsers = users ? users.length : 0;
    const activeUsers = users ? users.filter(u => u.status === 'active').length : 0;
    const totalTransactions = txs ? txs.length : 0;

    let totalEntradas = 0;
    let totalSaidas = 0;

    (txs || []).forEach(t => {
      const val = Number(t.amount) || 0;
      if (t.type === 'entrada') totalEntradas += val;
      if (t.type === 'saida') totalSaidas += val;
    });

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalEntradas,
      totalSaidas,
      saldoGeral: totalEntradas - totalSaidas
    };
  },

  // Movimentações: Listar com Filtros
  async getTransactions(params = {}) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const rawUser = localStorage.getItem('fc_user');
    const loggedUser = rawUser ? JSON.parse(rawUser) : null;
    const targetUserId = params.viewAsUserId || loggedUser?.id;

    if (!targetUserId) return [];

    let query = supabase
      .from('app_transactions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('date', { ascending: false });

    if (params.type && params.type !== 'all') {
      query = query.eq('type', params.type);
    }
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.month && params.month !== 'all') {
      query = query.gte('date', `${params.month}-01`).lte('date', `${params.month}-31`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let list = (data || []).map(t => ({
      id: t.id,
      userId: t.user_id,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      category: t.category,
      paymentMethod: t.payment_method,
      status: t.status,
      notes: t.notes,
      createdAt: t.created_at
    }));

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    return list;
  },

  // Resumo Financeiro (Soma e Subtração)
  async getSummary(params = {}) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const list = await this.getTransactions({
      month: params.month,
      viewAsUserId: params.viewAsUserId
    });

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
      const val = t.amount;
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

    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      entradasCompletadas,
      saidasCompletadas,
      saldoRealizado: entradasCompletadas - saidasCompletadas,
      entradasPendentes,
      saidasPendentes,
      countTotal: list.length,
      countEntradas,
      countSaidas,
      categoriesEntradas,
      categoriesSaidas
    };
  },

  // Criar Movimentação
  async createTransaction(txData, viewAsUserId) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const rawUser = localStorage.getItem('fc_user');
    const loggedUser = rawUser ? JSON.parse(rawUser) : null;
    const targetUserId = viewAsUserId || loggedUser?.id;

    const { data, error } = await supabase
      .from('app_transactions')
      .insert({
        user_id: targetUserId,
        type: txData.type,
        description: txData.description.trim(),
        amount: parseFloat(txData.amount),
        date: txData.date,
        category: txData.category,
        payment_method: txData.paymentMethod || 'Pix',
        status: txData.status || 'completed',
        notes: txData.notes ? txData.notes.trim() : ''
      })
      .select()
      .single();

    if (error) throw error;
    return { message: 'Movimentação criada com sucesso!', transaction: data };
  },

  // Atualizar Movimentação
  async updateTransaction(id, txData) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const updates = {};
    if (txData.type) updates.type = txData.type;
    if (txData.description) updates.description = txData.description.trim();
    if (txData.amount !== undefined) updates.amount = parseFloat(txData.amount);
    if (txData.date) updates.date = txData.date;
    if (txData.category) updates.category = txData.category;
    if (txData.paymentMethod) updates.payment_method = txData.paymentMethod;
    if (txData.status) updates.status = txData.status;
    if (txData.notes !== undefined) updates.notes = txData.notes.trim();

    const { data, error } = await supabase
      .from('app_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { message: 'Movimentação atualizada com sucesso!', transaction: data };
  },

  // Alternar Status
  async toggleTransactionStatus(id) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { data: current, error: getErr } = await supabase
      .from('app_transactions')
      .select('status')
      .eq('id', id)
      .single();

    if (getErr) throw getErr;

    const newStatus = current.status === 'completed' ? 'pending' : 'completed';
    const { data, error } = await supabase
      .from('app_transactions')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { message: 'Status alterado com sucesso!', transaction: data };
  },

  // Excluir Movimentação
  async deleteTransaction(id) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { error } = await supabase
      .from('app_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Movimentação excluída com sucesso!' };
  }
};
