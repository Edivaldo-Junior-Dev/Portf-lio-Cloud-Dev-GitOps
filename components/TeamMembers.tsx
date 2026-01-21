
import React, { useState, useEffect } from 'react';
import { Team, Member, User } from '../types';
import { Linkedin, Github, User as UserIcon, ArrowLeft, Quote, Briefcase, Mail, Edit2, Camera, X, Check, Save, Cloud, Loader2 } from 'lucide-react';
import { MEMBERS } from '../constants';

interface TeamMembersProps {
  team: Team;
  onBack: () => void;
  currentUser: User;
  savedProfiles?: Member[];
  onSaveProfile?: (member: Member) => Promise<void>;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ team, onBack, currentUser, savedProfiles = [], onSaveProfile }) => {
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializa/Atualiza os dados combinando: Nomes da Equipe + Perfis Salvos na Nuvem + Defaults
  useEffect(() => {
    const enrichedMembers = team.members.map(memberName => {
      // 1. Tenta achar no Saved Profiles (Nuvem)
      const saved = savedProfiles.find(p => p.name.toLowerCase() === memberName.toLowerCase());
      if (saved) return { ...saved, name: memberName }; // Garante que o nome bate com o da equipe

      // 2. Tenta achar nos Constants (Hardcoded)
      const constant = MEMBERS.find(m => m.name.toLowerCase() === memberName.toLowerCase());
      if (constant) return constant;

      // 3. Fallback (Novo Membro)
      return { 
        id: memberName.toLowerCase().replace(/\s+/g, '_'), 
        name: memberName, 
        role: 'Membro da Equipe', 
        bio: 'Perfil ainda não configurado.',
        photoUrl: '',
        linkedin: '',
        github: ''
      } as Member;
    });
    setMembersData(enrichedMembers);
  }, [team, savedProfiles]);

  const canEdit = currentUser.role === 'admin' || currentUser.teamNumber === team.teamNumber;

  const handleSaveMember = async () => {
    if (!editingMember || !onSaveProfile) return;
    
    setIsSaving(true);
    try {
        await onSaveProfile(editingMember);
        // O useEffect acima atualizará o membersData quando savedProfiles mudar no pai
        setEditingMember(null);
    } catch (error) {
        console.error(error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
         <div>
             <button 
               onClick={onBack}
               className="text-slate-500 hover:text-orange-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2 transition-colors"
             >
               <ArrowLeft size={16} /> Voltar para Dashboard
             </button>
             <h2 className="text-3xl font-black dark:text-white leading-tight">
               Integrantes da <span className="text-orange-500">{team.name}</span>
             </h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
               Conheça os talentos por trás do projeto <strong>{team.project.name}</strong>
             </p>
         </div>
         {canEdit && (
             <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                 <Edit2 size={12} /> MODO DE EDIÇÃO ATIVO
             </div>
         )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {membersData.map((member, idx) => (
          <div 
            key={idx}
            className="group relative bg-white dark:bg-slate-900 cloud-shape-discreet border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
          >
             {/* Edit Button (Only visible if permitted) */}
             {canEdit && (
                 <button 
                    onClick={() => setEditingMember(member)}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-orange-500 rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    title="Editar Perfil"
                 >
                    <Edit2 size={16} />
                 </button>
             )}

             {/* Cloud Indicator (Visual Aid) */}
             {savedProfiles.some(p => p.name === member.name) && (
                 <div className="absolute top-4 left-4 z-20 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Salvo na Nuvem">
                     <Cloud size={16} />
                 </div>
             )}

             {/* Cover / Background decoration */}
             <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                {idx % 2 === 0 ? (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                ) : (
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform -translate-x-10 -translate-y-10"></div>
                )}
             </div>

             {/* Profile Image - Centered and overlapping */}
             <div className="flex justify-center -mt-12 relative z-10 px-6">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-lg">
                   {member.photoUrl ? (
                     <img 
                       src={member.photoUrl} 
                       alt={member.name} 
                       className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                     />
                   ) : (
                     <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 text-slate-400">
                        <UserIcon size={40} />
                     </div>
                   )}
                </div>
             </div>

             {/* Content */}
             <div className="p-6 pt-4 text-center flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{member.name}</h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                   <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                      <Briefcase size={10} />
                      {member.role || 'Membro da Equipe'}
                   </span>
                </div>

                <div className="relative mb-6 flex-1">
                   <Quote size={20} className="absolute -top-2 left-0 text-slate-200 dark:text-slate-700 opacity-50" />
                   <p className="text-sm text-slate-600 dark:text-slate-400 italic px-4 leading-relaxed">
                      "{member.bio || 'Membro dedicado da equipe.'}"
                   </p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-6">
                   {member.linkedin && member.linkedin !== '#' && (
                     <a href={member.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition-transform shadow-sm" title="LinkedIn">
                        <Linkedin size={20} />
                     </a>
                   )}
                   {member.github && member.github !== '#' && (
                     <a href={member.github} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-lg hover:scale-110 transition-transform shadow-sm" title="GitHub">
                        <Github size={20} />
                     </a>
                   )}
                   <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:scale-110 transition-transform shadow-sm cursor-not-allowed opacity-50" title="Email (Em breve)">
                      <Mail size={20} />
                   </button>
                </div>
             </div>
          </div>
        ))}
        
        {membersData.length === 0 && (
           <div className="col-span-full py-12 text-center text-slate-400">
              <UserIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum membro cadastrado nesta equipe ainda.</p>
           </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg cloud-shape-discreet shadow-2xl overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-700">
              <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
                 <h3 className="text-lg font-black flex items-center gap-2"><Edit2 size={18}/> Editar Perfil</h3>
                 <button onClick={() => setEditingMember(null)} className="text-white/80 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  
                  {/* Foto Preview */}
                  <div className="flex justify-center mb-6">
                      <div className="relative">
                          {editingMember.photoUrl ? (
                              <img src={editingMember.photoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-lg" />
                          ) : (
                              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-100 dark:border-slate-700">
                                  <UserIcon size={40} className="text-slate-400"/>
                              </div>
                          )}
                          <div className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full shadow-md">
                              <Camera size={14} />
                          </div>
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Nome Completo</label>
                      <input 
                        value={editingMember.name} 
                        onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                        disabled={true} // Nome é gerenciado pela Equipe
                        title="O nome só pode ser alterado na configuração da equipe"
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm dark:text-white focus:ring-0 outline-none opacity-70 cursor-not-allowed"
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Cargo / Função</label>
                      <input 
                        value={editingMember.role || ''} 
                        onChange={e => setEditingMember({...editingMember, role: e.target.value})}
                        placeholder="Ex: Fullstack Developer"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">URL da Foto</label>
                      <input 
                        value={editingMember.photoUrl || ''} 
                        onChange={e => setEditingMember({...editingMember, photoUrl: e.target.value})}
                        placeholder="https://github.com/seunome.png"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <p className="text-[10px] text-slate-400">Dica: Use "https://github.com/SEU_USUARIO.png" para foto do GitHub.</p>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400">Mini Bio</label>
                      <textarea 
                        value={editingMember.bio || ''} 
                        onChange={e => setEditingMember({...editingMember, bio: e.target.value})}
                        rows={3}
                        placeholder="Conte um pouco sobre sua função no projeto..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1"><Linkedin size={10}/> LinkedIn URL</label>
                          <input 
                            value={editingMember.linkedin || ''} 
                            onChange={e => setEditingMember({...editingMember, linkedin: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1"><Github size={10}/> GitHub URL</label>
                          <input 
                            value={editingMember.github || ''} 
                            onChange={e => setEditingMember({...editingMember, github: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                      </div>
                  </div>

              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                 <button 
                    onClick={() => setEditingMember(null)}
                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-colors"
                 >
                    Cancelar
                 </button>
                 <button 
                    onClick={handleSaveMember}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
