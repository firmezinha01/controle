import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCards({ summary }) {
  const {
    totalEntradas = 0,
    totalSaidas = 0,
    saldo = 0,
    entradasCompletadas = 0,
    saidasCompletadas = 0,
    saldoRealizado = 0,
    entradasPendentes = 0,
    saidasPendentes = 0,
    countEntradas = 0,
    countSaidas = 0
  } = summary || {};

  const isSaldoPositivo = saldo >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
      {/* CARD 1: ENTRADAS / RECEBIMENTOS */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-emerald-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 sm:gap-1.5 truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0"></span>
            Entradas
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-base sm:text-2xl font-black text-slate-800 tracking-tight truncate">
          {formatCurrency(totalEntradas)}
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
          <span>{countEntradas} recebimento{countEntradas !== 1 ? 's' : ''}</span>
          {entradasPendentes > 0 ? (
            <span className="text-amber-600 font-medium hidden sm:inline">
              {formatCurrency(entradasPendentes)} a receber
            </span>
          ) : (
            <span className="text-emerald-600 font-medium hidden sm:inline">100% quitado</span>
          )}
        </div>
      </div>

      {/* CARD 2: SAÍDAS / PAGAMENTOS */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-rose-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1 sm:gap-1.5 truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shrink-0"></span>
            Saídas
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-base sm:text-2xl font-black text-slate-800 tracking-tight truncate">
          {formatCurrency(totalSaidas)}
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
          <span>{countSaidas} pagamento{countSaidas !== 1 ? 's' : ''}</span>
          {saidasPendentes > 0 ? (
            <span className="text-amber-600 font-medium hidden sm:inline">
              {formatCurrency(saidasPendentes)} a pagar
            </span>
          ) : (
            <span className="text-slate-500 font-medium hidden sm:inline">Sem atrasos</span>
          )}
        </div>
      </div>

      {/* CARD 3: SALDO LÍQUIDO (ENTRADAS - SAÍDAS) */}
      <div className={`col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-5 border shadow-sm relative overflow-hidden group ${
        isSaldoPositivo ? 'border-sky-100' : 'border-rose-200 bg-rose-50/20'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isSaldoPositivo ? 'bg-sky-500' : 'bg-rose-500'
        }`}></div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate ${
            isSaldoPositivo ? 'text-sky-700' : 'text-rose-700'
          }`}>
            Saldo Líquido (Entradas - Saídas)
          </span>
          <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isSaldoPositivo ? 'bg-sky-50 text-sky-600' : 'bg-rose-100 text-rose-600'
          }`}>
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className={`text-xl sm:text-2xl font-black tracking-tight truncate ${
          isSaldoPositivo ? 'text-slate-800' : 'text-rose-600'
        }`}>
          {formatCurrency(saldo)}
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs">
          <span className="text-slate-500">
            {isSaldoPositivo ? 'Superávit financeiro' : 'Atenção: Saldo devedor'}
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded text-[10px] sm:text-xs ${
            isSaldoPositivo ? 'bg-sky-50 text-sky-700' : 'bg-rose-100 text-rose-800'
          }`}>
            {isSaldoPositivo ? '+ Positivo' : '- Negativo'}
          </span>
        </div>
      </div>

      {/* CARD 4: SALDO EFETIVADO */}
      <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-5 border border-indigo-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-700 truncate">
            Saldo Efetivado (Quitado)
          </span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">
          {formatCurrency(saldoRealizado)}
        </div>

        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
          <span>Recebido: {formatCurrency(entradasCompletadas)}</span>
          <span className="hidden sm:inline">Pago: {formatCurrency(saidasCompletadas)}</span>
        </div>
      </div>
    </div>
  );
}
