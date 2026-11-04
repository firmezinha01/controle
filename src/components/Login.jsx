import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, ShieldCheck, DollarSign, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Por favor, preencha o login e a senha.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center px-4 py-8">
      {/* Container Principal */}
      <div className="max-w-md w-full">
        {/* Cabeçalho do App */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30 mb-4">
            <DollarSign className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Fluxo<span className="text-sky-400">Control</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sistema Inteligente de Entradas, Saídas e Gestão Financeira
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Acesse sua conta</h2>
            <p className="text-slate-500 text-sm mt-1">
              Informe seu login e senha gerados pelo sistema
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
              <span className="font-semibold text-red-500 text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Login / Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin ou seu login"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Dicas de Credenciais Rápidas para Teste */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Acesso Rápido de Teste:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('admin', '123456')}
                className="p-2.5 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 rounded-xl text-left transition text-sky-900 group"
              >
                <div className="flex items-center justify-between font-bold text-sky-800">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    Admin
                  </span>
                  <span className="text-[10px] bg-sky-200/60 px-1.5 py-0.5 rounded text-sky-900 font-semibold">Usar</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  login: <b className="text-slate-800">admin</b><br />
                  senha: <b className="text-slate-800">123456</b>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('marcos.silva', '123456')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition text-emerald-900 group"
              >
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Usuário
                  </span>
                  <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-900 font-semibold">Usar</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  login: <b className="text-slate-800">marcos.silva</b><br />
                  senha: <b className="text-slate-800">123456</b>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-slate-400 mt-6">
          FluxoControl &bull; Painel Administrativo e Controle Financeiro Individual
        </p>
      </div>
    </div>
  );
}
