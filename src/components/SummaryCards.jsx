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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* CARD 1: ENTRADAS / RECEBIMENTOS */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Total de Entradas
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-2xl font-black text-slate-800 tracking-tight">
          {formatCurrency(totalEntradas)}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{countEntradas} recebimento{countEntradas !== 1 ? 's' : ''}</span>
          {entradasPendentes > 0 ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatCurrency(entradasPendentes)} pendente
            </span>
          ) : (
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% recebido
            </span>
          )}
        </div>
      </div>

      {/* CARD 2: SAÍDAS / PAGAMENTOS */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Total de Saídas
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-2xl font-black text-slate-800 tracking-tight">
          {formatCurrency(totalSaidas)}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{countSaidas} pagamento{countSaidas !== 1 ? 's' : ''}</span>
          {saidasPendentes > 0 ? (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatCurrency(saidasPendentes)} a pagar
            </span>
          ) : (
            <span className="text-slate-500 font-medium">Todos quitados</span>
          )}
        </div>
      </div>

      {/* CARD 3: SALDO ATUAL (ENTRADAS - SAÍDAS COM SOMA E SUBTRAÇÃO) */}
      <div className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
        isSaldoPositivo ? 'border-sky-100' : 'border-rose-200 bg-rose-50/20'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isSaldoPositivo ? 'bg-sky-500' : 'bg-rose-500'
        }`}></div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isSaldoPositivo ? 'text-sky-700' : 'text-rose-700'
          }`}>
            Saldo Líquido (Entradas - Saídas)
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
            isSaldoPositivo ? 'bg-sky-50 text-sky-600' : 'bg-rose-100 text-rose-600'
          }`}>
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className={`text-2xl font-black tracking-tight ${
          isSaldoPositivo ? 'text-slate-800' : 'text-rose-600'
        }`}>
          {formatCurrency(saldo)}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {isSaldoPositivo ? 'Superávit financeiro' : 'Atenção: Saldo devedor'}
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded ${
            isSaldoPositivo ? 'bg-sky-50 text-sky-700' : 'bg-rose-100 text-rose-800'
          }`}>
            {isSaldoPositivo ? '+ Positivo' : '- Negativo'}
          </span>
        </div>
      </div>

      {/* CARD 4: SALDO EFETIVADO (REALIZADO) */}
      <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Saldo Efetivado (Recebido - Pago)
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-2xl font-black text-slate-800 tracking-tight">
          {formatCurrency(saldoRealizado)}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Recebido: {formatCurrency(entradasCompletadas)}</span>
          <span>Pago: {formatCurrency(saidasCompletadas)}</span>
        </div>
      </div>
    </div>
  );
}
