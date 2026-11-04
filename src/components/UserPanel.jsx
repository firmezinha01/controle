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
  Download,
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

      setTransactions(txList);
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

  // Busca com debounce leve
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

  // Imprimir
  const handlePrint = () => {
    window.print();
  };

  // Gera lista dos últimos 12 meses para o seletor
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Topo com Título e Botões de Ação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Controle de Entradas &amp; Saídas
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhe pagamentos, recebimentos e saldo em tempo real
          </p>
        </div>

        {/* Botões Rápidos de Cadastro */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenNewModal('entrada')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Entrada</span>
          </button>

          <button
            onClick={() => handleOpenNewModal('saida')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-rose-600/20 transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Saída</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Exportar dados para Excel / CSV"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            title="Imprimir relatório"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro (Soma e Subtração em Tempo Real) */}
      <SummaryCards summary={summary} />

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 no-print space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Busca por texto */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descrição, categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
          />
        </div>

        {/* Filtros de Mês e Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluídos / Quitados</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SISTEMA DE ABAS (REQUISITO FUNDAMENTAL DO USUÁRIO) */}
      <div className="mb-6 border-b border-slate-200 no-print">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          {/* Aba 1: Entradas e Saídas ao mesmo tempo */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-sky-600 text-sky-600 bg-sky-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Todas as Movimentações</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {summary?.countTotal || 0}
            </span>
          </button>

          {/* Aba 2: Somente Entradas */}
          <button
            onClick={() => setActiveTab('entrada')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'entrada'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Somente Entradas</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {summary?.countEntradas || 0}
            </span>
          </button>

          {/* Aba 3: Somente Saídas */}
          <button
            onClick={() => setActiveTab('saida')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'saida'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>Somente Saídas</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {summary?.countSaidas || 0}
            </span>
          </button>

          {/* Aba 4: Gráficos e Relatórios */}
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'charts'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Gráficos &amp; Análise</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'charts' ? (
        <ChartsView summary={summary} />
      ) : (
        /* TABELA DE MOVIMENTAÇÕES */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header informativo da Tabela dependendo da aba */}
          <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {activeTab === 'all' && 'Extrato Unificado (Entradas e Saídas Somadas e Subtraídas)'}
                {activeTab === 'entrada' && 'Extrato Exclusivo de Entradas (Recebimentos)'}
                {activeTab === 'saida' && 'Extrato Exclusivo de Saídas (Pagamentos)'}
              </span>
            </div>

            {/* Subtotalizador contextual da aba */}
            <div className="text-right text-xs">
              {activeTab === 'entrada' && (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Total Entradas: {formatCurrency(summary?.totalEntradas || 0)}
                </span>
              )}
              {activeTab === 'saida' && (
                <span className="font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  Total Saídas: {formatCurrency(summary?.totalSaidas || 0)}
                </span>
              )}
              {activeTab === 'all' && (
                <span className={`font-bold px-2.5 py-1 rounded-full border ${
                  (summary?.saldo || 0) >= 0
                    ? 'text-sky-700 bg-sky-50 border-sky-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200'
                }`}>
                  Saldo Resultante: {formatCurrency(summary?.saldo || 0)}
                </span>
              )}
            </div>
          </div>

          {/* Estado de Carregamento */}
          {loading && (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-medium">Carregando movimentações...</p>
            </div>
          )}

          {/* Estado Vazio */}
          {!loading && transactions.length === 0 && (
            <div className="py-16 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Nenhum lançamento encontrado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Não há registros correspondentes aos filtros selecionados. Comece adicionando uma nova entrada ou saída.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleOpenNewModal('entrada')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  + Nova Entrada
                </button>
                <button
                  onClick={() => handleOpenNewModal('saida')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  + Nova Saída
                </button>
              </div>
            </div>
          )}

          {/* Tabela de Dados */}
          {!loading && transactions.length > 0 && (
            <div className="overflow-x-auto">
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
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Data */}
                        <td className="py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>

                        {/* Tipo */}
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

                        {/* Descrição e Notas */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 text-sm">
                            {tx.description}
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {tx.notes}
                            </div>
                          )}
                        </td>

                        {/* Categoria */}
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-700 border border-slate-200/60">
                            {tx.category || '-'}
                          </span>
                        </td>

                        {/* Forma de Pagamento */}
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {tx.paymentMethod || 'Pix'}
                        </td>

                        {/* Valor Formatado com cor e sinal */}
                        <td className={`py-3 px-4 text-right whitespace-nowrap font-bold text-sm ${
                          isEntrada ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isEntrada ? '+ ' : '- '}
                          {formatCurrency(tx.amount)}
                        </td>

                        {/* Status com botão interativo */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(tx.id)}
                            title="Clique para alternar o status"
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

                        {/* Ações */}
                        <td className="py-3 px-4 text-right whitespace-nowrap no-print">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(tx)}
                              title="Editar movimentação"
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(tx.id, tx.description)}
                              title="Excluir movimentação"
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

      {/* Modal de Cadastro / Edição de Movimentação */}
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
