import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';

export default function App() {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('admin_users'); // 'admin_users' ou 'user_panel'
  const [viewingUser, setViewingUser] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-sm">Carregando FluxoControl...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Ação quando o Admin clica em "Ver Painel" de um usuário específico
  const handleSelectUserToView = (targetUser) => {
    setViewingUser(targetUser);
    setCurrentView('user_panel');
  };

  // Voltar para a lista de usuários do Admin
  const handleBackToAdminUsers = () => {
    setViewingUser(null);
    setCurrentView('admin_users');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setViewingUser(null);
          setCurrentView(view);
        }}
        viewingUser={viewingUser}
        onBackToAdminUsers={handleBackToAdminUsers}
      />

      <main className="flex-1">
        {isAdmin ? (
          currentView === 'admin_users' ? (
            <AdminPanel onSelectUserToView={handleSelectUserToView} />
          ) : (
            <UserPanel viewAsUserId={viewingUser ? viewingUser.id : user.id} />
          )
        ) : (
          <UserPanel />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 no-print">
        FluxoControl &bull; Sistema de Gestão Financeira com Controle de Entradas e Saídas
      </footer>
    </div>
  );
}
