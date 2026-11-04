const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('fc_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Autenticação
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao realizar login.');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Não autenticado');
    return res.json();
  },

  // Admin: Gestão de Usuários
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao listar usuários.');
    return data;
  },

  async createAdminUser(userData) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao cadastrar usuário.');
    return data;
  },

  async updateAdminUser(id, userData) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao atualizar usuário.');
    return data;
  },

  async resetUserPassword(id, newPassword) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao atualizar senha.');
    return data;
  },

  async deleteAdminUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao excluir usuário.');
    return data;
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao buscar estatísticas.');
    return data;
  },

  // Movimentações Financeiras (Entradas e Saídas)
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.month && params.month !== 'all') query.append('month', params.month);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.viewAsUserId) query.append('viewAsUserId', params.viewAsUserId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/transactions${queryString}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao carregar movimentações.');
    return data;
  },

  async getSummary(params = {}) {
    const query = new URLSearchParams();
    if (params.month && params.month !== 'all') query.append('month', params.month);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.viewAsUserId) query.append('viewAsUserId', params.viewAsUserId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/transactions/summary${queryString}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao carregar resumo financeiro.');
    return data;
  },

  async createTransaction(txData, viewAsUserId) {
    const query = viewAsUserId ? `?viewAsUserId=${encodeURIComponent(viewAsUserId)}` : '';
    const res = await fetch(`${API_BASE}/transactions${query}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(txData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao criar movimentação.');
    return data;
  },

  async updateTransaction(id, txData, viewAsUserId) {
    const query = viewAsUserId ? `?viewAsUserId=${encodeURIComponent(viewAsUserId)}` : '';
    const res = await fetch(`${API_BASE}/transactions/${id}${query}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(txData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao atualizar movimentação.');
    return data;
  },

  async toggleTransactionStatus(id, viewAsUserId) {
    const query = viewAsUserId ? `?viewAsUserId=${encodeURIComponent(viewAsUserId)}` : '';
    const res = await fetch(`${API_BASE}/transactions/${id}/toggle-status${query}`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao alterar status.');
    return data;
  },

  async deleteTransaction(id, viewAsUserId) {
    const query = viewAsUserId ? `?viewAsUserId=${encodeURIComponent(viewAsUserId)}` : '';
    const res = await fetch(`${API_BASE}/transactions/${id}${query}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao excluir movimentação.');
    return data;
  }
};
