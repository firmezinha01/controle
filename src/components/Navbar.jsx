import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Shield, User, LogOut, ArrowLeft, Users, LayoutDashboard } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, viewingUser, onBackToAdminUsers }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo: Logo e Modo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 text-white">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-800 tracking-tight">
                  Fluxo<span className="text-sky-600">Control</span>
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <User className="w-3 h-3" />
                    Usuário
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Controle de Entradas &amp; Saídas
              </p>
            </div>
          </div>

          {/* Centro: Alternador de visualização para o Admin */}
          {isAdmin && (
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  if (onBackToAdminUsers) onBackToAdminUsers();
                  setCurrentView('admin_users');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentView === 'admin_users'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Gestão de Usuários
              </button>
              <button
                onClick={() => setCurrentView('user_panel')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentView === 'user_panel' && !viewingUser
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Meu Painel Financeiro
              </button>
            </div>
          )}

          {/* Lado Direito: Informações do Usuário e Sair */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800">
                {user?.name || user?.username}
              </div>
              <div className="text-xs text-slate-400">
                @{user?.username}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              onClick={logout}
              title="Sair do sistema"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner especial quando o Admin está inspecionando/visualizando a conta de outro usuário */}
      {isAdmin && viewingUser && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-amber-600 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                Visão do Admin
              </span>
              <span>
                Visualizando e gerenciando movimentações de: <strong>{viewingUser.name}</strong> (@{viewingUser.username})
              </span>
            </div>
            <button
              onClick={onBackToAdminUsers}
              className="flex items-center gap-1 bg-white text-amber-900 px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-50 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para Usuários
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
