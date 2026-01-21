
import { createClient } from '@supabase/supabase-js';

// URL do seu projeto no Supabase (Equipe 3)
const supabaseUrl = 'https://efgxmdjuwykapxokwkdm.supabase.co'; 

// Chave Anon Public fornecida
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZ3htZGp1d3lrYXB4b2t3a2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMTk2MDYsImV4cCI6MjA4MTU5NTYwNn0.re2xs7JW15K-qP_UgSykJzdZFw2SxuUQwgXDxo1V0O0'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
