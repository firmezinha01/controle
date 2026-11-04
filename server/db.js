import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

function ensureDirExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Inicializa dados padrão sem nenhum mock
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('123456', salt);

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
      }
    ],
    transactions: []
  };
}

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
    
    // Garante que o admin sempre existe e tem a senha 123456
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

export function writeDB(data) {
  ensureDirExists();
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}
