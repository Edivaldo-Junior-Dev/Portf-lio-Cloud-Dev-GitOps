
// src/lib/api.ts
// MÓDULO STATIC (SERVERLESS READY)
// Este módulo simula um backend usando o LocalStorage do navegador.

import { User, Team, Member, VotesState, Proposal } from '../types';
import { TEAMS as DEFAULT_TEAMS, MEMBERS as DEFAULT_MEMBERS, INITIAL_VOTES, PROPOSALS as DEFAULT_PROPOSALS } from '../constants';

// Chaves de armazenamento local
const STORAGE_KEYS = {
  TEAMS: 'matrix_teams_v2',
  PROFILES: 'matrix_profiles_v2',
  VOTES: 'matrix_votes_v2',
  USERS: 'matrix_users_v2',
  PROPOSALS: 'matrix_proposals_v2',
  VOTING_MEMBERS: 'matrix_voting_members_v2'
};

// Helpers de Delay para simular latência de rede (UX realista)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- AUTH (Simulado) ---
  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    await delay(800); // Simula rede

    // 1. Verifica admin hardcoded
    if (email === 'admin@cloud.com' && password === 'admin123') {
      return {
        user: { id: 'admin', name: 'Administrador Chefe', email, role: 'admin' },
        token: 'mock_token_admin'
      };
    }

    // 2. Verifica usuários cadastrados no LocalStorage
    const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find(u => u.email === email && u.password === password);

    if (found) {
      return {
        user: { id: found.id, name: found.name, email: found.email, role: 'member', teamNumber: 3 }, // Default team 3 para demo
        token: `mock_token_${found.id}`
      };
    }

    throw new Error("Credenciais inválidas. (Tente admin@cloud.com / admin123)");
  },

  register: async (name: string, email: string, password: string) => {
    await delay(800);
    const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find(u => u.email === email)) {
      throw new Error("E-mail já cadastrado.");
    }

    const newUser = { id: `user_${Date.now()}`, name, email, password, role: 'member' };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return { message: "Usuário registrado localmente." };
  },

  // --- DATA SYNC ---
  
  fetchData: async (key: string) => {
    // Retorna dados do LocalStorage ou os Defaults do constants.ts se estiver vazio
    await delay(300);
    
    if (key === 'teams') {
      const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return stored ? JSON.parse(stored) : DEFAULT_TEAMS;
    }
    
    if (key === 'profiles') {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return stored ? JSON.parse(stored) : [];
    }

    if (key === 'votes') {
      const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
      return stored ? JSON.parse(stored) : INITIAL_VOTES;
    }

    if (key === 'proposals') {
      const stored = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      return stored ? JSON.parse(stored) : DEFAULT_PROPOSALS;
    }

    if (key === 'members') { // Voting members
      const stored = localStorage.getItem(STORAGE_KEYS.VOTING_MEMBERS);
      return stored ? JSON.parse(stored) : DEFAULT_MEMBERS;
    }

    return null;
  },

  saveData: async (key: string, data: any) => {
    await delay(400); // Simula salvamento
    
    if (key === 'teams') localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(data));
    if (key === 'profiles') localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data));
    if (key === 'votes') localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(data));
    if (key === 'proposals') localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(data));
    if (key === 'members') localStorage.setItem(STORAGE_KEYS.VOTING_MEMBERS, JSON.stringify(data));
    
    return { success: true };
  },
  
  // --- ADMIN ---
  createAdmin: async (name: string, email: string, password: string) => {
      // No modo local, todo registro vira usuário normal, mas simulamos sucesso
      return api.register(name, email, password);
  }
};
