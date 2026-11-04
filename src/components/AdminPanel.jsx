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
  TrendingUp,
  TrendingDown,
  Activity,
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
      setUsers(usersList || []);
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

    if (window.confirm(`Tem certeza que deseja remover o usuário "${u.name}" (@${u.username})?`)) {
      try {
        await api.deleteAdminUser(u.id);
        loadData();
      } catch (err) {
        alert(err.message || 'Erro ao excluir usuário.');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.notes && u.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Painel de Administração
            </h2>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Cadastre novos usuários com login e senha para gerenciarem suas despesas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateUser}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-sky-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Usuário</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* METRICAS GERAIS: 2 COLUNAS NO MOBILE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Usuários
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {stats?.totalUsers || 0}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
            {stats?.activeUsers || 0} ativos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 truncate">
              Entradas Totais
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {formatCurrency(stats?.totalEntradas || 0)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
            Volume geral
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 truncate">
              Saídas Totais
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {formatCurrency(stats?.totalSaidas || 0)}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
            Despesas gerais
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-600 truncate">
              Lançamentos
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {stats?.totalTransactions || 0}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
            No banco de dados
          </p>
        </div>
      </div>

      {/* GESTAO DE USUARIOS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de Busca */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Usuários Cadastrados
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Cada usuário gerencia suas próprias despesas e recebimentos
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

        {/* LISTA EM CARDS NO CELULAR (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredUsers.map((u) => {
            const isAdminUser = u.role === 'admin';
            const isActive = u.status === 'active';

            return (
              <div key={u.id} className="p-3.5 hover:bg-slate-50/60 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAdminUser ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span className="truncate max-w-[140px]">{u.name}</span>
                        {isAdminUser && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        @{u.username}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-[11px] mb-2.5">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Movimentações:</span>
                    <span className="text-emerald-600 font-semibold">+{formatCurrency(u.totalEntradas)}</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-rose-600 font-semibold">-{formatCurrency(u.totalSaidas)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Saldo:</span>
                    <span className={`font-black ${u.saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      {formatCurrency(u.saldo)}
                    </span>
                  </div>
                </div>

                {/* Ações no celular */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    onClick={() => onSelectUserToView(u)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Painel</span>
                  </button>

                  <button
                    onClick={() => handleOpenPasswordModal(u)}
                    title="Alterar senha"
                    className="p-1.5 text-slate-500 hover:text-amber-600 bg-slate-100 rounded-lg"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditUser(u)}
                    title="Editar usuário"
                    className="p-1.5 text-slate-500 hover:text-sky-600 bg-slate-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {!isAdminUser && (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      title="Excluir usuário"
                      className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* TABELA EM DESKTOP (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Usuário</th>
                <th className="py-3 px-4">Login de Acesso</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Entradas / Saídas</th>
                <th className="py-3 px-4 text-right">Saldo</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((u) => {
                const isAdminUser = u.role === 'admin';
                const isActive = u.status === 'active';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          isAdminUser ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'
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
                          {u.notes && <div className="text-xs text-slate-400">{u.notes}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                      @{u.username}
                    </td>

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

                    <td className="py-3.5 px-4 text-right text-xs">
                      <div className="text-emerald-600 font-semibold">+ {formatCurrency(u.totalEntradas)}</div>
                      <div className="text-rose-600 font-semibold">- {formatCurrency(u.totalSaidas)}</div>
                      <div className="text-[10px] text-slate-400">{u.transactionCount} lançamentos</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className={`font-black text-sm ${u.saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                        {formatCurrency(u.saldo)}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectUserToView(u)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Painel</span>
                        </button>

                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {!isAdminUser && (
                          <button
                            onClick={() => handleDeleteUser(u)}
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
