
// src/lib/api.ts
// Módulo de Comunicação com Backend (API REST)
// ADERE AO ARTIGO 0 DA DOUTRINA SÊNIOR: DADOS REAIS APENAS.

import { User } from '../types';

const API_URL = '/api'; // Usando proxy do Vite (que apontará para Lambda ou Localhost)

// Auxiliar para pegar o token
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
          throw new Error(err.error || `Falha no login: ${res.status}`);
      }
      
      return res.json();
    } catch (e: any) {
      console.error("API Error (Login):", e);
      // Sem fallback para mock. Se a API falhar, o usuário deve saber.
      throw new Error(e.message || "Erro de conexão com o servidor. Verifique sua conexão ou se a API está online.");
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!res.ok) {
         const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
         throw new Error(err.error || 'Falha no registro');
      }
      return res.json();
    } catch (e: any) {
      console.error("API Error (Register):", e);
      throw new Error(e.message || "Erro de conexão com o servidor. Verifique sua conexão ou se a API está online.");
    }
  },

  // --- DATA SYNC (Teams, Votes, etc) ---
  
  fetchData: async (key: string) => {
    try {
        const res = await fetch(`${API_URL}/data/${key}`, {
            headers: getAuthHeaders()
        });
        
        if (res.status === 401 || res.status === 403) {
            // Token expirado ou inválido
            localStorage.removeItem('auth_token');
            throw new Error("Sessão expirada");
        }
        
        if (!res.ok) return null;
        
        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error(`Erro ao buscar ${key}:`, e);
        // Retornar erro ou null força o frontend a lidar com a falha real
        throw e;
    }
  },

  saveData: async (key: string, data: any) => {
    try {
      const res = await fetch(`${API_URL}/data/${key}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ data })
      });
      if (!res.ok) throw new Error("Erro ao salvar dados");
      return res.json();
    } catch (e) {
      console.error(`Erro ao salvar ${key}:`, e);
      throw e;
    }
  },
  
  // --- ADMIN ---
  createAdmin: async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_URL}/admin/register`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ name, email, password })
      });
      if(!res.ok) throw new Error("Falha ao criar admin. Verifique suas permissões.");
      return res.json();
  }
};
