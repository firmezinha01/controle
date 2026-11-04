export function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  // Evita problemas de fuso horário separando ano-mês-dia
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateString);
  return d.toLocaleDateString('pt-BR');
}

export function getMonthName(monthString) {
  if (!monthString) return '';
  const [year, month] = monthString.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] || ''} de ${year}`;
}

export const CATEGORIES_ENTRADAS = [
  'Vendas',
  'Serviços',
  'Salário',
  'Rendimento / Investimentos',
  'Comissões',
  'Recorrente',
  'Consultoria',
  'Reembolso',
  'Outras Entradas'
];

export const CATEGORIES_SAIDAS = [
  'Moradia / Escritório',
  'Alimentação',
  'Transporte / Combustível',
  'Contas Fixas (Luz, Água, Net)',
  'Tecnologia / Softwares',
  'Fornecedores / Estoque',
  'Impostos / Taxas',
  'Salários & Equipe',
  'Marketing / Publicidade',
  'Saúde / Cuidados',
  'Lazer / Educação',
  'Outras Saídas'
];

export const PAYMENT_METHODS = [
  'Pix',
  'Boleto Bancário',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Transferência TED',
  'Cheque',
  'Outro'
];
