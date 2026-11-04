import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {initialData ? 'Editar Movimentação' : 'Nova Movimentação'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {type === 'entrada' ? 'Adicionar recebimento' : 'Adicionar pagamento'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll suave se tela pequena */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de Movimentação */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('entrada')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition ${
                  type === 'entrada'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <ArrowDownLeft className={`w-4 h-4 ${type === 'entrada' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('saida')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition ${
                  type === 'saida'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <ArrowUpRight className={`w-4 h-4 ${type === 'saida' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Saída</span>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              placeholder={type === 'entrada' ? 'Ex: Venda, Salário, Consultoria...' : 'Ex: Aluguel, Conta de Luz, Fornecedor...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Valor (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
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
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm">
                <input
                  type="radio"
                  name="txStatus"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 font-medium">
                  {type === 'entrada' ? 'Recebido' : 'Pago'}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm">
                <input
                  type="radio"
                  name="txStatus"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 font-medium">
                  {type === 'entrada' ? 'A Receber' : 'A Pagar'}
                </span>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observações (Opcional)
            </label>
            <textarea
              rows="2"
              placeholder="Notas adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white resize-none"
            />
          </div>

          {/* Rodapé do Modal */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition flex items-center justify-center gap-2 ${
                type === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{initialData ? 'Salvar' : type === 'entrada' ? 'Adicionar Entrada' : 'Adicionar Saída'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
