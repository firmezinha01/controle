import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

// Garante que o diretório data existe
function ensureDirExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Inicializa dados padrão
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('123456', salt);
  const userPasswordHash = bcrypt.hashSync('123456', salt);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const day = (d) => `${currentMonth}-${String(d).padStart(2, '0')}`;

  return {
    users: [
      {
        id: 'user_admin',
        username: 'admin',
        passwordHash: adminPasswordHash,
        name: 'Administrador Geral',
        role: 'admin',
        status: 'active',
        notes: 'Acesso total ao painel administrativo',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_financeiro1',
        username: 'marcos.silva',
        passwordHash: userPasswordHash,
        name: 'Marcos Silva',
        role: 'user',
        status: 'active',
        notes: 'Departamento Comercial',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user_financeiro2',
        username: 'ana.pereira',
        passwordHash: userPasswordHash,
        name: 'Ana Pereira',
        role: 'user',
        status: 'active',
        notes: 'Serviços & Consultoria',
        createdAt: new Date().toISOString()
      }
    ],
    transactions: [
      // Transações do Marcos Silva para demonstração inicial
      {
        id: 'tx_1',
        userId: 'user_financeiro1',
        type: 'entrada',
        description: 'Venda de Projeto Web',
        amount: 4500.00,
        date: day(3),
        category: 'Vendas',
        paymentMethod: 'Pix',
        status: 'completed',
        notes: 'Cliente Alfa Engenharia',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_2',
        userId: 'user_financeiro1',
        type: 'saida',
        description: 'Aluguel do Escritório',
        amount: 1400.00,
        date: day(5),
        category: 'Moradia / Escritório',
        paymentMethod: 'Boleto',
        status: 'completed',
        notes: 'Imobiliária Central',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_3',
        userId: 'user_financeiro1',
        type: 'entrada',
        description: 'Consultoria Estratégica',
        amount: 2800.00,
        date: day(10),
        category: 'Serviços',
        paymentMethod: 'Transferência TED',
        status: 'completed',
        notes: 'Primeira parcela',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_4',
        userId: 'user_financeiro1',
        type: 'saida',
        description: 'Internet Fibra Óptica e Telefonia',
        amount: 199.90,
        date: day(12),
        category: 'Contas Fixas',
        paymentMethod: 'Cartão de Crédito',
        status: 'completed',
        notes: 'Plano empresarial 500MB',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_5',
        userId: 'user_financeiro1',
        type: 'saida',
        description: 'Licença de Softwares (Design & Dev)',
        amount: 320.00,
        date: day(15),
        category: 'Tecnologia',
        paymentMethod: 'Cartão de Crédito',
        status: 'completed',
        notes: 'Figma e ferramentas',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_6',
        userId: 'user_financeiro1',
        type: 'entrada',
        description: 'Recebimento de Manutenção Mensal',
        amount: 1200.00,
        date: day(20),
        category: 'Recorrente',
        paymentMethod: 'Pix',
        status: 'completed',
        notes: 'Contrato de suporte',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_7',
        userId: 'user_financeiro1',
        type: 'saida',
        description: 'Energia Elétrica',
        amount: 285.50,
        date: day(22),
        category: 'Contas Fixas',
        paymentMethod: 'Pix',
        status: 'pending',
        notes: 'Vence dia 25',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_8',
        userId: 'user_financeiro1',
        type: 'entrada',
        description: 'Fechamento de Novo Contrato',
        amount: 3500.00,
        date: day(28),
        category: 'Vendas',
        paymentMethod: 'Boleto',
        status: 'pending',
        notes: 'Aguardando compensação',
        createdAt: new Date().toISOString()
      }
    ]
  };
}

// Leitura do banco
export function readDB() {
  ensureDirExists();
  if (!fs.existsSync(DB_PATH)) {
    const initial = getInitialData();
    writeDB(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    
    // Garante que o admin sempre existe e tem a senha 123456 garantida
    const hasAdmin = data.users && data.users.some(u => u.username === 'admin');
    if (!hasAdmin) {
      if (!data.users) data.users = [];
      const adminPasswordHash = bcrypt.hashSync('123456', 10);
      data.users.unshift({
        id: 'user_admin',
        username: 'admin',
        passwordHash: adminPasswordHash,
        name: 'Administrador Geral',
        role: 'admin',
        status: 'active',
        notes: 'Acesso total ao painel administrativo',
        createdAt: new Date().toISOString()
      });
      writeDB(data);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao ler DB, restaurando inicial:', error);
    const initial = getInitialData();
    writeDB(initial);
    return initial;
  }
}

// Escrita atômica do banco
export function writeDB(data) {
  ensureDirExists();
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}
