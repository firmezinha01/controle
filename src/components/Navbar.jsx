import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Shield, User, LogOut, ArrowLeft, Users, LayoutDashboard } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, viewingUser, onBackToAdminUsers }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo: Logo e Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 text-white shrink-0">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl text-slate-800 tracking-tight">
                  Fluxo<span className="text-sky-600">Control</span>
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <User className="w-3 h-3" />
                    Usuário
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                Controle de Entradas &amp; Saídas
              </p>
            </div>
          </div>

          {/* Centro: Alternador Desktop para Admin */}
          {isAdmin && (
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  if (onBackToAdminUsers) onBackToAdminUsers();
                  setCurrentView('admin_users');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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

          {/* Lado Direito: Perfil e Sair */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[120px]">
                {user?.name || user?.username}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                @{user?.username}
              </div>
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs sm:text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              onClick={logout}
              title="Sair do sistema"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação Mobile para Admin (Visível apenas em telas pequenas) */}
        {isAdmin && (
          <div className="flex md:hidden items-center justify-center gap-1 py-2 border-t border-slate-100">
            <button
              onClick={() => {
                if (onBackToAdminUsers) onBackToAdminUsers();
                setCurrentView('admin_users');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                currentView === 'admin_users'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                  : 'text-slate-600 bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuários</span>
            </button>
            <button
              onClick={() => setCurrentView('user_panel')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                currentView === 'user_panel' && !viewingUser
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                  : 'text-slate-600 bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>
          </div>
        )}
      </div>

      {/* Banner de Auditoria Admin */}
      {isAdmin && viewingUser && (
        <div className="bg-amber-500 text-white px-3 sm:px-4 py-2 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className="bg-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0">
                Admin
              </span>
              <span className="truncate">
                Vendo: <strong>{viewingUser.name}</strong>
              </span>
            </div>
            <button
              onClick={onBackToAdminUsers}
              className="flex items-center gap-1 bg-white text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-amber-50 transition shrink-0"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
