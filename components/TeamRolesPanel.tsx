
import React, { useState, useEffect } from 'react';
import { Team, User, Member } from '../types';
import { MEMBERS } from '../constants';
import { ArrowLeft, Save, Edit2, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface TeamRolesPanelProps {
  team: Team;
  currentUser: User;
  onBack: () => void;
  savedProfiles: Member[];
  onSaveProfile: (member: Member) => Promise<void>;
}

const TeamRolesPanel: React.FC<TeamRolesPanelProps> = ({ team, currentUser, onBack, savedProfiles, onSaveProfile }) => {
  const [localMembers, setLocalMembers] = useState<Member[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Determina se o usuário atual pode editar esta equipe
  const canEdit = currentUser.role === 'admin' || currentUser.teamNumber === team.teamNumber;

  // Carrega os dados dos membros
  useEffect(() => {
    const enrichedMembers = team.members.map(memberName => {
      // 1. Tenta achar no Saved Profiles (Nuvem)
      const saved = savedProfiles.find(p => p.name.toLowerCase() === memberName.toLowerCase());
      if (saved) return { ...saved, name: memberName };

      // 2. Tenta achar nos Constants (Hardcoded)
      const constant = MEMBERS.find(m => m.name.toLowerCase() === memberName.toLowerCase());
      if (constant) return constant;

      // 3. Fallback
      return { 
        id: memberName.toLowerCase().replace(/\s+/g, '_'), 
        name: memberName, 
        role: 'Membro da Equipe', 
        responsibilities: ['Responsabilidade 1', 'Responsabilidade 2'],
        photoUrl: '',
        bio: 'Membro da equipe.'
      } as Member;
    });
    setLocalMembers(enrichedMembers);
  }, [team, savedProfiles]);

  const handleSave = async (member: Member) => {
    setIsSaving(true);
    try {
      await onSaveProfile(member);
      setEditingId(null);
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalMember = (id: string, updates: Partial<Member>) => {
    setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const addResponsibility = (id: string) => {
    const member = localMembers.find(m => m.id === id);
    if (member) {
      const newResp = [...(member.responsibilities || []), "Nova responsabilidade"];
      updateLocalMember(id, { responsibilities: newResp });
    }
  };

  const updateResponsibility = (id: string, index: number, value: string) => {
    const member = localMembers.find(m => m.id === id);
    if (member && member.responsibilities) {
      const newResp = [...member.responsibilities];
      newResp[index] = value;
      updateLocalMember(id, { responsibilities: newResp });
    }
  };

  const removeResponsibility = (id: string, index: number) => {
    const member = localMembers.find(m => m.id === id);
    if (member && member.responsibilities) {
      const newResp = member.responsibilities.filter((_, i) => i !== index);
      updateLocalMember(id, { responsibilities: newResp });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4 md:p-8 animate-fade-in font-sans">
      
      {/* Botão de Voltar Flutuante */}
      <button 
         onClick={onBack}
         className="fixed top-6 left-6 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-x-1"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 md:p-12 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">Divisão de Funções</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg uppercase tracking-widest font-bold">
            {team.name} - Projeto {team.project.name}
          </p>
          <div className="w-24 h-1.5 bg-[#667eea] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Grid de Membros */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {localMembers.map((member) => {
             const isEditing = editingId === member.id;
             
             return (
              <div 
                key={member.id} 
                className={`relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border-l-8 border-[#667eea] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group ${isEditing ? 'ring-2 ring-orange-400' : ''}`}
              >
                {/* Botão de Edição */}
                {canEdit && !isEditing && (
                  <button 
                    onClick={() => setEditingId(member.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[#667eea] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={18} />
                  </button>
                )}

                <div className="flex items-center mb-6">
                  {/* Avatar / Initials */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-xl font-bold shadow-md mr-4 shrink-0 overflow-hidden border-2 border-white dark:border-slate-700">
                    {member.photoUrl && !isEditing ? (
                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{getInitials(member.name)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate" title={member.name}>{member.name}</h3>
                     {isEditing ? (
                       <input 
                         value={member.role || ''} 
                         onChange={(e) => updateLocalMember(member.id, { role: e.target.value })}
                         className="w-full text-sm font-semibold text-[#667eea] bg-white dark:bg-slate-800 border-b border-[#667eea] outline-none mt-1"
                         placeholder="Cargo"
                       />
                     ) : (
                       <div className="text-[#667eea] font-bold text-sm truncate">{member.role || 'Cargo não definido'}</div>
                     )}
                  </div>
                </div>

                <div className="mt-4">
                   <h4 className="text-slate-600 dark:text-slate-300 font-bold text-sm mb-3 flex items-center gap-2 uppercase tracking-wide">
                     <CheckCircleIcon /> Principais Responsabilidades:
                   </h4>
                   
                   <ul className="space-y-2">
                     {(member.responsibilities || []).map((resp, idx) => (
                       <li key={idx} className="relative pl-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed group/item">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-[#667eea] rounded-full"></span>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input 
                                  value={resp} 
                                  onChange={(e) => updateResponsibility(member.id, idx, e.target.value)}
                                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 outline-none focus:border-[#667eea]"
                                />
                                <button onClick={() => removeResponsibility(member.id, idx)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                          ) : (
                            <span>{resp}</span>
                          )}
                       </li>
                     ))}
                     {isEditing && (
                        <button 
                            onClick={() => addResponsibility(member.id)}
                            className="text-xs text-[#667eea] font-bold flex items-center gap-1 mt-2 hover:underline"
                        >
                            <Plus size={12} /> Adicionar Item
                        </button>
                     )}
                   </ul>
                </div>

                {isEditing && (
                  <div className="mt-6 flex gap-2">
                    <button 
                        onClick={() => handleSave(member)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                        {isSaving ? '...' : <><Save size={16} /> Salvar</>}
                    </button>
                    <button 
                        onClick={() => setEditingId(null)} // Cancelar (sem reverter por enquanto, apenas fecha)
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300"
                    >
                        X
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-6 rounded-r-lg flex items-start gap-4">
           <AlertCircle className="text-amber-600 shrink-0 mt-1" />
           <div>
               <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                  <strong>📌 Observação:</strong> Esta apresentação define o escopo oficial de cada integrante. As responsabilidades podem ser ajustadas conforme a evolução do projeto e as necessidades dos Sprints.
               </p>
           </div>
        </div>
        
        <div className="text-center mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            Equipe completa | {localMembers.length} membros | Metodologia Ágil (Scrum)
        </div>

      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">
    <Check size={12} strokeWidth={4} />
  </div>
);

export default TeamRolesPanel;
