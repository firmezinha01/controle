import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { CATEGORIES_ENTRADAS, CATEGORIES_SAIDAS, PAYMENT_METHODS } from '../utils/formatters';

export default function TransactionModal({ isOpen, onClose, onSave, initialData, defaultType = 'entrada' }) {
  const [type, setType] = useState(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [status, setStatus] = useState('completed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || defaultType);
      setDescription(initialData.description || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDate(initialData.date || new Date().toISOString().slice(0, 10));
      setCategory(initialData.category || '');
      setPaymentMethod(initialData.paymentMethod || 'Pix');
      setStatus(initialData.status || 'completed');
      setNotes(initialData.notes || '');
    } else {
      setType(defaultType);
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategory(defaultType === 'entrada' ? CATEGORIES_ENTRADAS[0] : CATEGORIES_SAIDAS[0]);
      setPaymentMethod('Pix');
      setStatus('completed');
      setNotes('');
    }
    setError('');
  }, [initialData, defaultType, isOpen]);

  // Se trocar o tipo e a categoria não pertencer à nova lista, ajusta
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'entrada') {
      if (!CATEGORIES_ENTRADAS.includes(category)) {
        setCategory(CATEGORIES_ENTRADAS[0]);
      }
    } else {
      if (!CATEGORIES_SAIDAS.includes(category)) {
        setCategory(CATEGORIES_SAIDAS[0]);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor, informe a descrição da movimentação.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!date) {
      setError('Informe a data da movimentação.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        type,
        description: description.trim(),
        amount: numAmount,
        date,
        category: category || (type === 'entrada' ? 'Receita Geral' : 'Despesa Geral'),
        paymentMethod,
        status,
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar movimentação.');
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'entrada' ? CATEGORIES_ENTRADAS : CATEGORIES_SAIDAS;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {initialData ? 'Editar Movimentação' : 'Nova Movimentação'}
            </h3>
            <p className="text-xs text-slate-500">
              Registre uma entrada (recebimento) ou saída (pagamento)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Seleção do Tipo de Movimentação (Entrada vs Saída) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Tipo de Movimentação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('entrada')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition ${
                  type === 'entrada'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className={`w-4 h-4 ${type === 'entrada' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Entrada (Receber)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('saida')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition ${
                  type === 'saida'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className={`w-4 h-4 ${type === 'saida' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Saída (Pagar)</span>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              required
              placeholder={type === 'entrada' ? 'Ex: Venda de Produto, Salário, Consultoria...' : 'Ex: Aluguel, Conta de Energia, Fornecedor...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Valor (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  R$
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Data
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status do Lançamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status da Operação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 font-medium">
                  {type === 'entrada' ? 'Recebido (Quitado)' : 'Pago (Liquidado)'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 font-medium">
                  {type === 'entrada' ? 'A Receber (Pendente)' : 'A Pagar (Pendente)'}
                </span>
              </label>
            </div>
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observações (Opcional)
            </label>
            <textarea
              rows="2"
              placeholder="Anotações adicionais, número de nota, cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition resize-none"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center gap-2 disabled:opacity-60 ${
                type === 'entrada'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{initialData ? 'Salvar Alterações' : type === 'entrada' ? 'Adicionar Entrada' : 'Adicionar Saída'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
