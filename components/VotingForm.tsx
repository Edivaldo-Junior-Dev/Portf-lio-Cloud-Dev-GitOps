import React from 'react';
import { CRITERIA, Member, Proposal, Score, VotesState } from '../types';
import { FileText, ExternalLink, Eye, Lock } from 'lucide-react';

interface VotingFormProps {
  member: Member;
  votes: VotesState;
  proposals: Proposal[];
  onVote: (proposalId: string, criteriaIdx: number, score: Score) => void;
  readOnly?: boolean;
}

const VotingForm: React.FC<VotingFormProps> = ({ member, votes, proposals, onVote, readOnly = false }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Header based on Mode */}
      <div className={`border-l-4 p-4 mb-6 transition-colors duration-200 ${readOnly ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'}`}>
        <p className={`${readOnly ? 'text-orange-800 dark:text-orange-100' : 'text-blue-800 dark:text-blue-100'} font-medium flex items-center gap-2`}>
          {readOnly ? <Eye size={20} /> : null}
          {readOnly ? 'Modo de Visualização:' : 'Votando como:'} 
          <span className="font-bold">{member.name}</span>
        </p>
        <p className={`text-sm mt-1 ${readOnly ? 'text-orange-600 dark:text-orange-300' : 'text-blue-600 dark:text-blue-300'}`}>
          {readOnly 
            ? 'Você está visualizando os votos deste membro. Para editar seus próprios votos, selecione seu nome acima.'
            : 'Atribua uma nota de 1 a 5 para cada critério. As notas são salvas automaticamente.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => {
           // Calculate current total for this user/proposal
           const userScores = votes[member.id]?.[proposal.id] || {};
           const currentTotal = Object.values(userScores).reduce((a: number, b) => a + (b as number || 0), 0);

           return (
            <div key={proposal.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border flex flex-col h-full transition-colors duration-200 hover:shadow-xl ${readOnly ? 'border-orange-200 dark:border-orange-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'}`}>
              <div className={`p-4 text-white relative ${readOnly ? 'bg-slate-600 dark:bg-slate-800' : 'bg-slate-800 dark:bg-slate-900'}`}>
                <h3 className="font-bold text-lg leading-tight pr-2">{proposal.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                        Soma: <span className="text-white text-base ml-1">{currentTotal}/20</span>
                    </div>
                    {proposal.link && (
                        <a 
                            href={proposal.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-3 rounded-full transition-colors border border-white/10"
                            title="Abrir arquivo do projeto"
                        >
                            <FileText size={12} />
                            <span>Ver Arquivo</span>
                            <ExternalLink size={10} className="opacity-50" />
                        </a>
                    )}
                </div>
              </div>
              
              <div className="p-4 space-y-6 flex-1 relative">
                {readOnly && (
                    <div className="absolute top-2 right-2 opacity-50 pointer-events-none">
                        <Lock size={16} className="text-slate-400" />
                    </div>
                )}

                {CRITERIA.map((criterion, idx) => {
                  const currentScore = votes[member.id]?.[proposal.id]?.[idx] || 0;
                  
                  return (
                    <div key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0 transition-colors duration-200">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                        {idx + 1}. {criterion}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic bg-slate-50 dark:bg-slate-700/50 p-2 rounded transition-colors duration-200 min-h-[60px]">
                        "{proposal.descriptions[idx] || 'Sem descrição.'}"
                      </p>
                      
                      <div className="flex items-center gap-1 justify-between">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => !readOnly && onVote(proposal.id, idx, val as Score)}
                            disabled={readOnly}
                            className={`
                              w-10 h-10 rounded-full font-bold transition-all duration-200
                              ${currentScore === val 
                                ? `${readOnly ? 'bg-slate-400 dark:bg-slate-600 ring-slate-300 dark:ring-slate-500' : 'bg-accent ring-accent'} text-white scale-110 shadow-md ring-2 ring-offset-2 dark:ring-offset-slate-800` 
                                : `bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 ${readOnly ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            `}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VotingForm;