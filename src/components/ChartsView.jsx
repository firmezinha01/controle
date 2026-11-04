import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { PieChart, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function ChartsView({ summary }) {
  const {
    totalEntradas = 0,
    totalSaidas = 0,
    saldo = 0,
    categoriesEntradas = {},
    categoriesSaidas = {}
  } = summary || {};

  const totalMovimentado = totalEntradas + totalSaidas;
  const percEntradas = totalMovimentado > 0 ? ((totalEntradas / totalMovimentado) * 100).toFixed(1) : 0;
  const percSaidas = totalMovimentado > 0 ? ((totalSaidas / totalMovimentado) * 100).toFixed(1) : 0;

  const sortedEntradas = Object.entries(categoriesEntradas)
    .sort((a, b) => b[1] - a[1]);

  const sortedSaidas = Object.entries(categoriesSaidas)
    .sort((a, b) => b[1] - a[1]);

  const bgColors = [
    'bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500', 'bg-pink-500'
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. VISÃO COMPARATIVA GERAL: ENTRADAS VS SAÍDAS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
          Proporção Geral: Entradas vs Saídas
        </h4>
        <p className="text-[11px] sm:text-xs text-slate-500 mb-4">
          Comparativo percentual de todo o fluxo do período
        </p>

        {/* Barra comparativa horizontal */}
        <div className="w-full h-7 sm:h-8 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner mb-4">
          <div
            style={{ width: `${percEntradas}%` }}
            className="h-full bg-emerald-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold transition-all duration-500"
          >
            {percEntradas > 15 ? `${percEntradas}% Entradas` : ''}
          </div>
          <div
            style={{ width: `${percSaidas}%` }}
            className="h-full bg-rose-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold transition-all duration-500"
          >
            {percSaidas > 15 ? `${percSaidas}% Saídas` : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Receitas / Entradas
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
              {formatCurrency(totalEntradas)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">{percEntradas}% do volume</span>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
            <span className="text-[11px] sm:text-xs font-semibold text-rose-800 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Despesas / Saídas
            </span>
            <div className="text-base sm:text-lg font-black text-rose-700 mt-0.5">
              {formatCurrency(totalSaidas)}
            </div>
            <span className="text-[10px] text-rose-600 font-medium">{percSaidas}% do volume</span>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
            <span className="text-[11px] sm:text-xs font-semibold text-sky-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saldo Líquido (Sobra)
            </span>
            <div className={`text-base sm:text-lg font-black mt-0.5 ${saldo >= 0 ? 'text-sky-700' : 'text-rose-600'}`}>
              {formatCurrency(saldo)}
            </div>
            <span className="text-[10px] text-sky-600 font-medium">
              {totalEntradas > 0 ? `${((saldo / totalEntradas) * 100).toFixed(1)}% margem líquida` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORIAS DE ENTRADAS & CATEGORIAS DE SAÍDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Entradas por Categoria */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Entradas por Categoria
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Origem dos recebimentos</p>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {formatCurrency(totalEntradas)}
            </span>
          </div>

          {sortedEntradas.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Nenhuma entrada registrada no período.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEntradas.map(([categoryName, amount], index) => {
                const perc = totalEntradas > 0 ? ((amount / totalEntradas) * 100).toFixed(1) : 0;
                return (
                  <div key={categoryName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate max-w-[150px]">
                        <span className={`w-2 h-2 rounded-full ${bgColors[index % bgColors.length]} shrink-0`}></span>
                        <span className="truncate">{categoryName}</span>
                      </span>
                      <span className="font-bold text-slate-800 text-right shrink-0">
                        {formatCurrency(amount)} <span className="text-slate-400 font-normal">({perc}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${perc}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Saídas por Categoria */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Saídas por Categoria
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500">Destino dos pagamentos</p>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              {formatCurrency(totalSaidas)}
            </span>
          </div>

          {sortedSaidas.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Nenhuma saída registrada no período.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSaidas.map(([categoryName, amount], index) => {
                const perc = totalSaidas > 0 ? ((amount / totalSaidas) * 100).toFixed(1) : 0;
                return (
                  <div key={categoryName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate max-w-[150px]">
                        <span className={`w-2 h-2 rounded-full ${bgColors[index % bgColors.length]} shrink-0`}></span>
                        <span className="truncate">{categoryName}</span>
                      </span>
                      <span className="font-bold text-slate-800 text-right shrink-0">
                        {formatCurrency(amount)} <span className="text-slate-400 font-normal">({perc}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${perc}%` }}
                        className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
