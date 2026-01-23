import React, { useState } from 'react';
import { Team, User } from '../types';
import { Edit3, Users, Briefcase, BarChart3, Check, Loader2, ArrowRight, UserCheck, Zap } from 'lucide-react';

interface TeamDashboardProps {
  teams: Team[];
  onSaveTeam: (team: Team) => Promise<void>;
  onEnterMatrix: (team: Team) => void;
  onViewMembers?: (team: Team) => void; 
  onViewRoles?: (team: Team) => void;
  onDeployProject?: (team: Team) => void;
  currentUser: User;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ teams, onSaveTeam, onEnterMatrix, onViewMembers, onViewRoles, onDeployProject, currentUser }) => {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Team | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = (teamNumber: number) => {
    return currentUser.role === 'admin' || currentUser.teamNumber === teamNumber;
  };

  const handleEdit = (team: Team) => {
    if (!canEdit(team.teamNumber)) return;
    setEditingTeamId(team.id);
    setEditForm({ ...team });
  };

  const handleSave = async () => {
    if (editForm) {
      setIsSaving(true);
      try {
        await onSaveTeam(editForm);
        setEditingTeamId(null); 
      } catch (error) {
        // Erro já tratado no nível superior
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Dashboard de <span className="text-orange-500">Equipes Cloud</span></h2>
        <p className="text-slate-500 text-sm">Selecione uma equipe para visualizar ou auditar o portfólio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <div 
            key={team.id}
            className="group relative bg-white dark:bg-slate-900 cloud-shape-discreet border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-orange-500/50 overflow-hidden"
          >
            {/* Header Card */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start">
              <div className="space-y-1">
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Equipe {team.teamNumber}</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-white truncate max-w-[180px]">{team.name}</h3>
              </div>
              {canEdit(team.teamNumber) && (
                <button onClick={() => handleEdit(team)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors">
                  <Edit3 size={18} />
                </button>
              )}
            </div>

            {/* Project Info */}
            <div className="p-6 space-y-4">
               <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-xl mt-1">
                     <Briefcase size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400">Projeto</p>
                     <p className="font-bold text-slate-700 dark:text-slate-300">{team.project.name}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-1">{team.project.description}</p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-2 rounded-xl mt-1">
                     <Users size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-black text-slate-400">Integrantes</p>
                     <div className="flex flex-wrap gap-1 mt-1">
                        {team.members.map((m, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{m}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Card Actions */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col gap-2">
               {/* BOTÃO DE DEPLOY */}
               {onDeployProject && (team.teamNumber === 3 || currentUser.role === 'admin') && (
                  <button 
                     onClick={() => onDeployProject(team)}
                     className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1 mb-2"
                  >
                     <Zap size={16} /> ACESSAR DEPLOYER AWS
                  </button>
               )}

               <div className="flex gap-2">
                  {onViewMembers && (
                    <button 
                        onClick={() => onViewMembers(team)}
                        className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                    <Users size={14} /> PERFIS
                    </button>
                  )}
                  {onViewRoles && (
                    <button 
                        onClick={() => onViewRoles(team)}
                        className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 py-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                    >
                    <UserCheck size={14} /> PAPÉIS
                    </button>
                  )}
               </div>

               <button 
                  onClick={() => onEnterMatrix(team)}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 cloud-shape-button text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg mt-1"
                >
                 <BarChart3 size={16} /> MATRIZ COGNIS
               </button>
            </div>
            
            <div className="absolute inset-0 border-2 border-orange-500 opacity-0 group-hover:opacity-100 transition-opacity cloud-shape-discreet pointer-events-none blur-[2px]"></div>
          </div>
        ))}
      </div>

      {editingTeamId && editForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl cloud-shape-discreet shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black">Configurar Equipe {editForm.teamNumber}</h3>
                 <button onClick={() => setEditingTeamId(null)} className="text-white hover:opacity-70 font-bold">FECHAR</button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-black uppercase text-slate-400">Nome da Equipe</label>
                       <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 cloud-shape-discreet text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-black uppercase text-slate-400">Nome do Projeto</label>
                       <input value={editForm.project.name} onChange={e => setEditForm({...editForm, project: {...editForm.project, name: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 cloud-shape-discreet text-sm" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">Descrição do Projeto</label>
                    <textarea rows={3} value={editForm.project.description} onChange={e => setEditForm({...editForm, project: {...editForm.project, description: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 cloud-shape-discreet text-sm resize-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">Integrantes (separados por vírgula)</label>
                    <input value={editForm.members.join(', ')} onChange={e => setEditForm({...editForm, members: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 cloud-shape-discreet text-sm" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">Link do Portfólio/MVP (Para uso futuro)</label>
                    <input value={editForm.project.link} onChange={e => setEditForm({...editForm, project: {...editForm.project, link: e.target.value}})} placeholder="Opcional: Adicione um link se desejar" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 cloud-shape-discreet text-sm" />
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black py-4 cloud-shape-button shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    {isSaving ? 'SALVANDO NA NUVEM...' : 'SALVAR ALTERAÇÕES'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;