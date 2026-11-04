import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import UserModal from './UserModal';
import PasswordModal from './PasswordModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  KeyRound,
  Edit,
  Trash2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function AdminPanel({ onSelectUserToView }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersList, statsData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminStats()
      ]);
      setUsers(usersList);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setIsUserModalOpen(true);
  };

  const handleOpenPasswordModal = (u) => {
    setSelectedUserForPassword(u);
    setIsPasswordModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    if (editingUser) {
      await api.updateAdminUser(editingUser.id, userData);
    } else {
      await api.createAdminUser(userData);
    }
    loadData();
  };

  const handleResetPassword = async (userId, newPassword) => {
    await api.resetUserPassword(userId, newPassword);
    alert('Senha atualizada com sucesso!');
  };

  const handleDeleteUser = async (u) => {
    if (u.username === 'admin') {
      alert('O administrador geral não pode ser excluído.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja remover o usuário "${u.name}" (@${u.username}) e todas as suas movimentações?`)) {
      try {
        await api.deleteAdminUser(u.id);
        loadData();
      } catch (err) {
        alert(err.message || 'Erro ao excluir usuário.');
      }
    }
  };

  // Filtro de busca
  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.notes && u.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Painel de Administração
            </h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os usuários do sistema e controle os acessos de login e senhas geradas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateUser}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inserir Novo Usuário</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* CARDS DE ESTATÍSTICAS GERAIS DA PLATAFORMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total de Usuários
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalUsers || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats?.activeUsers || 0} ativos no sistema
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Entradas Totais (Rede)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(stats?.totalEntradas || 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Volume de todos os usuários
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Saídas Totais (Rede)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(stats?.totalSaidas || 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Despesas acumuladas
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Movimentações Registradas
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalTransactions || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lançamentos no banco de dados
          </p>
        </div>
      </div>

      {/* TABELA DE GESTÃO DE USUÁRIOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de Filtro e Busca de Usuários */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Usuários Cadastrados
            </h3>
            <p className="text-xs text-slate-500">
              Cada usuário possui acesso individual ao seu próprio fluxo de caixa
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou login..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Usuário</th>
                <th className="py-3 px-4">Login de Acesso</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Entradas / Saídas</th>
                <th className="py-3 px-4 text-right">Saldo do Usuário</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((u) => {
                const isAdminUser = u.role === 'admin';
                const isActive = u.status === 'active';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Nome e Notas */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          isAdminUser
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {u.name}
                            {isAdminUser && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                                Principal
                              </span>
                            )}
                          </div>
                          {u.notes && (
                            <div className="text-xs text-slate-400">
                              {u.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Login (@username) */}
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                      @{u.username}
                    </td>

                    {/* Perfil */}
                    <td className="py-3.5 px-4">
                      {isAdminUser ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          <ShieldCheck className="w-3 h-3" />
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Usuário Padrão
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Entradas / Saídas */}
                    <td className="py-3.5 px-4 text-right text-xs">
                      <div className="text-emerald-600 font-semibold">
                        + {formatCurrency(u.totalEntradas)}
                      </div>
                      <div className="text-rose-600 font-semibold">
                        - {formatCurrency(u.totalSaidas)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.transactionCount} lançamentos
                      </div>
                    </td>

                    {/* Saldo Líquido do Usuário */}
                    <td className="py-3.5 px-4 text-right">
                      <div className={`font-black text-sm ${
                        u.saldo >= 0 ? 'text-slate-900' : 'text-rose-600'
                      }`}>
                        {formatCurrency(u.saldo)}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão para Inspecionar / Acessar painel do usuário */}
                        <button
                          onClick={() => onSelectUserToView(u)}
                          title={`Ver painel financeiro de ${u.name}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Painel</span>
                        </button>

                        {/* Alterar Senha */}
                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          title="Alterar/Resetar senha"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          title="Editar usuário"
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Excluir (apenas se não for admin) */}
                        {!isAdminUser && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Excluir usuário"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onReset={handleResetPassword}
        user={selectedUserForPassword}
      />
    </div>
  );
}
