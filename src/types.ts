
export interface TeamProject {
  name: string;
  description: string;
  link: string;
}

export interface Team {
  id: string;
  teamNumber: number;
  name: string;
  members: string[];
  project: TeamProject;
}

export interface Proposal {
  id: string;
  name: string;
  link?: string;
  descriptions: string[];
}

export interface Member {
  id: string;
  name: string;
  role?: string;     // Cargo na equipe (ex: Tech Lead)
  responsibilities?: string[]; // Novo: Lista de responsabilidades
  photoUrl?: string; // URL da foto
  linkedin?: string; // Link do LinkedIn
  github?: string;   // Link do Github
  bio?: string;      // Pequena descrição
}

export type Score = 1 | 2 | 3 | 4 | 5 | 0;

export type VotesState = Record<string, Record<string, Record<number, Score>>>;

export const CRITERIA = [
  "Força do Problema e Justificativa",
  "Clareza e Viabilidade do MVP",
  "Compatibilidade com Sprints (Ágil)",
  "Potencial da Apresentação Final"
];

// --- AUTH TYPES ---
export type UserRole = 'admin' | 'member' | 'visitor';

export interface Turma {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  turmaId?: string;
  turmaName?: string;
  teamNumber?: number;
}
