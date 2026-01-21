
import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// --- CONFIGURAÇÃO INICIAL ---
// Explicação: Define o caminho do arquivo atual para compatibilidade com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const SECRET_KEY = 'minha_chave_secreta_super_segura_auditada'; // Em produção, usar .env

// Middleware
app.use(cors()); // Permite requisições do Frontend (porta 5173) para o Backend (3001)
app.use(express.json()); // Permite ler JSON no corpo das requisições

// --- BANCO DE DADOS (SQLite) ---
// Explicação: Cria um arquivo de banco de dados local.
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Erro ao conectar no SQLite:', err.message);
  else console.log('Conectado ao banco de dados SQLite.');
});

// Inicialização das Tabelas
db.serialize(() => {
  // Tabela de Usuários (Auth & RBAC)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'member'
  )`);

  // Tabelas de Dados (Persistência da Aplicação)
  // Explicação: Armazenamos estruturas complexas como JSON Strings para simplificar a migração do frontend atual
  db.run(`CREATE TABLE IF NOT EXISTS key_value_store (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Cria um admin padrão se não existir (Bootstrapping)
  const adminEmail = 'admin@cloud.com';
  db.get("SELECT * FROM users WHERE email = ?", [adminEmail], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", 
        ['Administrador Chefe', adminEmail, hash, 'admin']);
      console.log('Admin padrão criado: admin@cloud.com / admin123');
    }
  });
});

// --- MIDDLEWARES DE SEGURANÇA ---

// Verifica se o Token JWT é válido
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
};

// Verifica se o usuário tem permissão de Admin (RBAC)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso proibido. Requer privilégios de Administrador.' });
  }
  next();
};

// --- ROTAS DE AUTENTICAÇÃO ---

// POST /auth/register
// Explicação: Cria novo usuário com senha hash. Por padrão, cria 'member'.
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Dados incompletos.' });

  const hash = bcrypt.hashSync(password, 10);
  
  db.run("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", 
    [name, email, hash], 
    function(err) {
      if (err) return res.status(400).json({ error: 'Email já cadastrado.' });
      res.status(201).json({ message: 'Usuário registrado com sucesso.', userId: this.lastID });
    }
  );
});

// POST /auth/login
// Explicação: Verifica credenciais e retorna JWT.
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    if (bcrypt.compareSync(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '8h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  });
});

// --- ROTAS ADMIN (RBAC) ---

// POST /api/admin/register
// Explicação: Permite que um admin crie outro admin.
app.post('/api/admin/register', authenticateToken, requireAdmin, (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  
  db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", 
    [name, email, hash, 'admin'], 
    function(err) {
      if (err) return res.status(400).json({ error: 'Erro ao criar admin.' });
      res.status(201).json({ message: 'Administrador criado com sucesso.', userId: this.lastID });
    }
  );
});

// --- ROTAS DE DADOS (CRUD Genérico para KV Store) ---

// GET /api/data/:key
app.get('/api/data/:key', authenticateToken, (req, res) => {
  db.get("SELECT value FROM key_value_store WHERE key = ?", [req.params.key], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no banco.' });
    if (!row) return res.json({ data: null });
    res.json({ data: JSON.parse(row.value) });
  });
});

// POST /api/data/:key
app.post('/api/data/:key', authenticateToken, (req, res) => {
  const { data } = req.body;
  const value = JSON.stringify(data);
  
  db.run("INSERT INTO key_value_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [req.params.key, value],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar dados.' });
      res.json({ message: 'Dados salvos com sucesso.' });
    }
  );
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`SERVIDOR BACKEND RODANDO NA PORTA ${PORT}`);
  console.log(`API Disponível em: http://localhost:${PORT}`);
});
