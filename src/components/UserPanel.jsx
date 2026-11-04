import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import SummaryCards from './SummaryCards';
import TransactionModal from './TransactionModal';
import ChartsView from './ChartsView';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Printer,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Layers,
  BarChart3,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export default function UserPanel({ viewAsUserId }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'entrada', 'saida', 'charts'
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('entrada');

  // Carrega transações e resumo
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [txList, summaryData] = await Promise.all([
        api.getTransactions({
          type: activeTab === 'entrada' ? 'entrada' : activeTab === 'saida' ? 'saida' : 'all',
          month: monthFilter,
          status: statusFilter,
          search: searchTerm,
          viewAsUserId
        }),
        api.getSummary({
          month: monthFilter,
          viewAsUserId
        })
      ]);

      setTransactions(txList || []);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, monthFilter, statusFilter, viewAsUserId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenNewModal = (type = 'entrada') => {
    setEditingTransaction(null);
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (txData) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, txData, viewAsUserId);
    } else {
      await api.createTransaction(txData, viewAsUserId);
    }
    loadData();
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleTransactionStatus(id, viewAsUserId);
      loadData();
    } catch (err) {
      alert(err.message || 'Erro ao alternar status.');
    }
  };

  const handleDelete = async (id, description) => {
    if (window.confirm(`Tem certeza que deseja excluir o lançamento "${description}"?`)) {
      try {
        await api.deleteTransaction(id, viewAsUserId);
        loadData();
      } catch (err) {
        alert(err.message || 'Erro ao excluir lançamento.');
      }
    }
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    if (!transactions.length) {
      alert('Não há movimentações para exportar.');
      return;
    }

    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Forma de Pagamento', 'Valor (R$)', 'Status', 'Observações'];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'entrada' ? 'Entrada (Recebimento)' : 'Saída (Pagamento)',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.paymentMethod || 'Outro',
      t.amount.toFixed(2),
      t.status === 'completed' ? 'Realizado' : 'Pendente',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_financeiro_${monthFilter || 'geral'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const monthOptions = useMemo(() => {
    const list = [{ label: 'Todos os Períodos', value: 'all' }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      list.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: val
      });
    }
    return list;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Topo com Título e Ações Rápidas */}
      <div className="flex flex-col gap-4 mb-5 sm:mb-6 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Controle de Entradas &amp; Saídas
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Recebimentos, despesas e saldo em tempo real
            </p>
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={handleExportCSV}
              title="Exportar CSV"
              className="p-2 bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={handlePrint}
              title="Imprimir"
              className="p-2 bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Botões Rápidos de Ação: Totalmente Otimizados para Celular */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
          <button
            onClick={() => handleOpenNewModal('entrada')}
            className="flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Entrada</span>
          </button>

          <button
            onClick={() => handleOpenNewModal('saida')}
            className="flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-rose-600/20 transition"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Saída</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Exportar dados para Excel / CSV"
            className="hidden md:flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            title="Imprimir relatório"
            className="hidden md:flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro (Soma e Subtração) */}
      <SummaryCards summary={summary} />

      {/* Barra de Filtros e Busca Responsiva */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm mb-5 sm:mb-6 no-print space-y-3">
        {/* Busca por texto */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descrição, categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
          />
        </div>

        {/* Filtros em Grid no Mobile */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full"
            >
              <option value="all">Todos Status</option>
              <option value="completed">Concluídos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title="Atualizar dados"
            className="col-span-2 sm:col-span-1 py-2 sm:p-2.5 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 sm:bg-transparent rounded-xl transition flex items-center justify-center gap-1 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="sm:hidden">Atualizar</span>
          </button>
        </div>
      </div>

      {/* ABAS (TODAS, SOMENTE ENTRADAS, SOMENTE SAÍDAS, GRÁFICOS) */}
      <div className="mb-5 sm:mb-6 border-b border-slate-200 no-print overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max pb-px">
          {/* Aba 1: Entradas e Saídas ao mesmo tempo */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-sky-600 text-sky-600 bg-sky-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Todas</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {summary?.countTotal || 0}
            </span>
          </button>

          {/* Aba 2: Somente Entradas */}
          <button
            onClick={() => setActiveTab('entrada')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'entrada'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>Entradas</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {summary?.countEntradas || 0}
            </span>
          </button>

          {/* Aba 3: Somente Saídas */}
          <button
            onClick={() => setActiveTab('saida')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'saida'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
            <span>Saídas</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {summary?.countSaidas || 0}
            </span>
          </button>

          {/* Aba 4: Gráficos */}
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'charts'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            <span>Gráficos</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {activeTab === 'charts' ? (
        <ChartsView summary={summary} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Subheader com Totalizador */}
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {activeTab === 'all' && 'Extrato Unificado (Soma e Subtração)'}
              {activeTab === 'entrada' && 'Extrato Exclusivo de Entradas'}
              {activeTab === 'saida' && 'Extrato Exclusivo de Saídas'}
            </span>

            <div className="text-xs">
              {activeTab === 'entrada' && (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Total Entradas: {formatCurrency(summary?.totalEntradas || 0)}
                </span>
              )}
              {activeTab === 'saida' && (
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Total Saídas: {formatCurrency(summary?.totalSaidas || 0)}
                </span>
              )}
              {activeTab === 'all' && (
                <span className={`font-bold px-2 py-0.5 rounded-full border ${
                  (summary?.saldo || 0) >= 0
                    ? 'text-sky-700 bg-sky-50 border-sky-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200'
                }`}>
                  Saldo: {formatCurrency(summary?.saldo || 0)}
                </span>
              )}
            </div>
          </div>

          {/* Carregando */}
          {loading && (
            <div className="py-14 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-medium">Carregando movimentações...</p>
            </div>
          )}

          {/* Vazio */}
          {!loading && transactions.length === 0 && (
            <div className="py-12 sm:py-16 text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Layers className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">Nenhum lançamento no momento</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-5">
                Não há registros com os filtros atuais. Adicione sua primeira entrada ou saída.
              </p>
              <div className="flex justify-center gap-2.5">
                <button
                  onClick={() => handleOpenNewModal('entrada')}
                  className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow"
                >
                  + Nova Entrada
                </button>
                <button
                  onClick={() => handleOpenNewModal('saida')}
                  className="px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow"
                >
                  + Nova Saída
                </button>
              </div>
            </div>
          )}

          {/* LISTA EM CARDS NO CELULAR (< md) */}
          {!loading && transactions.length > 0 && (
            <div className="block md:hidden divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isEntrada = tx.type === 'entrada';
                const isCompleted = tx.status === 'completed';

                return (
                  <div key={tx.id} className="p-3.5 hover:bg-slate-50/70 transition">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isEntrada ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isEntrada ? (
                            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {tx.description}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatDate(tx.date)} &bull; {tx.category || '-'}
                          </div>
                        </div>
                      </div>

                      <div className={`font-black text-xs sm:text-sm text-right shrink-0 ${
                        isEntrada ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isEntrada ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      <button
                        onClick={() => handleToggleStatus(tx.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{isEntrada ? 'Recebido' : 'Pago'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{isEntrada ? 'A Receber' : 'A Pagar'}</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="text-[10px] text-slate-400 mr-1.5">
                          {tx.paymentMethod || 'Pix'}
                        </span>
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1 hover:text-sky-600 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          className="p-1 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABELA TRADICIONAL EM DESKTOP (>= md) */}
          {!loading && transactions.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Pagamento</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.map((tx) => {
                    const isEntrada = tx.type === 'entrada';
                    const isCompleted = tx.status === 'completed';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isEntrada ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                              Saída
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 text-sm">{tx.description}</div>
                          {tx.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</div>}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                            {tx.category || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {tx.paymentMethod || 'Pix'}
                        </td>
                        <td className={`py-3 px-4 text-right whitespace-nowrap font-bold text-sm ${
                          isEntrada ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isEntrada ? '+ ' : '- '}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(tx.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>{isEntrada ? 'Recebido' : 'Pago'}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{isEntrada ? 'A Receber' : 'A Pagar'}</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap no-print">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id, tx.description)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        defaultType={modalDefaultType}
      />
    </div>
  );
}
