import React from 'react';
import { CRITERIA, Member, Proposal, VotesState } from '../types';
import { CORE_TEAM_IDS } from '../constants';

interface ResultsMatrixProps {
  votes: VotesState;
  members: Member[];
  proposals: Proposal[];
}

const ResultsMatrix: React.FC<ResultsMatrixProps> = ({ votes, members, proposals }) => {
  
  // Split members into Core Team and Others (Visitors)
  const coreMembers = members.filter(m => CORE_TEAM_IDS.includes(m.id));
  const otherMembers = members.filter(m => !CORE_TEAM_IDS.includes(m.id));

  // Helper to get total score for a proposal based on a specific list of members
  const getProposalAverage = (proposalId: string, memberList: Member[]) => {
    let totalScore = 0;
    let count = 0;
    
    memberList.forEach(m => {
      const userPropVotes = votes[m.id]?.[proposalId];
      if (userPropVotes) {
         const userTotal = (Object.values(userPropVotes) as number[]).reduce((a, b) => a + b, 0);
         if (userTotal > 0) {
            totalScore += userTotal;
            count++;
         }
      }
    });

    return count > 0 ? (totalScore / count).toFixed(1) : "0.0";
  };

  const averages = proposals.map(p => ({ id: p.id, avg: parseFloat(getProposalAverage(p.id, coreMembers)) }));
  
  // Safe reduce in case proposals is empty
  const winner = averages.length > 0 
    ? averages.reduce((prev, current) => (prev.avg > current.avg) ? prev : current)
    : { id: '', avg: 0 };

  const MatrixTable = ({ title, memberList, isOfficial }: { title: string, memberList: Member[], isOfficial: boolean }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 transition-colors duration-200">
        <div className={`p-4 font-bold text-lg flex justify-between items-center ${isOfficial ? 'bg-slate-800 text-white' : 'bg-orange-100 text-orange-800'}`}>
            <span>{title}</span>
            <span className="text-xs font-normal opacity-70">{memberList.length} Membros</span>
        </div>
        <table className="min-w-full w-max text-sm text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="p-4 w-[250px] min-w-[200px] sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-[1px_0_0_0_rgba(255,255,255,0.1)]">Critério de Avaliação</th>
              {proposals.map(p => (
                <th key={p.id} className={`p-4 w-[300px] min-w-[300px] border-l border-slate-200 dark:border-slate-700 ${isOfficial && p.id === winner.id ? 'bg-emerald-900/10 dark:bg-emerald-900/30 ring-2 ring-inset ring-emerald-500' : ''}`}>
                  {p.name}
                  {isOfficial && p.id === winner.id && <span className="ml-2 text-emerald-500">★</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {CRITERIA.map((criterion, cIdx) => (
              <tr key={cIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-200 align-top sticky left-0 bg-white dark:bg-slate-800 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(51,65,85,1)]">
                  <div>
                    <span className="text-slate-400 mr-2">{cIdx + 1}.</span>
                    {criterion}
                  </div>
                </td>
                {proposals.map(p => (
                  <td key={p.id} className={`p-4 border-l border-slate-100 dark:border-slate-700 align-top ${isOfficial && p.id === winner.id ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                    {isOfficial && (
                        <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-600 pl-2 min-h-[40px] whitespace-pre-wrap">
                        {p.descriptions[cIdx] || 'Sem descrição.'}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {memberList.map(m => {
                        const val = votes[m.id]?.[p.id]?.[cIdx];
                        return (
                          <div key={m.id} className="flex justify-between bg-slate-100 dark:bg-slate-700 p-1 rounded px-2">
                             <span className="truncate max-w-[80px] text-slate-600 dark:text-slate-300" title={m.name}>{m.name.split(' ')[0]}</span>
                             <span className={`font-bold ${val ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-500'}`}>
                               {val ? val : '-'}
                             </span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Totals Row */}
            <tr className="bg-slate-50 dark:bg-slate-900 font-bold border-t-2 border-slate-200 dark:border-slate-700 transition-colors duration-200">
              <td className="p-4 text-slate-800 dark:text-slate-100 sticky left-0 bg-slate-50 dark:bg-slate-900 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(51,65,85,1)]">PONTUAÇÃO TOTAL</td>
              {proposals.map(p => {
                 let grandTotal = 0;
                 let memberCount = 0;
                 return (
                  <td key={p.id} className={`p-4 border-l border-slate-200 dark:border-slate-700 ${isOfficial && p.id === winner.id ? 'bg-emerald-100/50 dark:bg-emerald-900/20' : ''}`}>
                    <div className="space-y-1 mb-4">
                      {memberList.map(m => {
                        const userVotes = votes[m.id]?.[p.id];
                        const userScores = userVotes ? (Object.values(userVotes) as number[]) : [];
                        const sum = userScores.reduce((a, b) => a + b, 0);
                        if(sum > 0) {
                            grandTotal += sum;
                            memberCount++;
                        }
                        
                        return (
                          <div key={m.id} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{m.name.split(' ')[0]}</span>
                            <span>{sum > 0 ? `${sum}/20` : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className={`border-t pt-2 flex justify-between items-center p-2 rounded border ${isOfficial && p.id === winner.id ? 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900 dark:border-emerald-700' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                      <span className="text-xs uppercase text-slate-500 dark:text-slate-400">Média {isOfficial ? 'Equipe' : 'Visitantes'}</span>
                      <span className={`text-lg ${isOfficial && p.id === winner.id ? 'text-emerald-700 dark:text-emerald-300 font-black' : 'text-accent'}`}>{memberCount > 0 ? (grandTotal / memberCount).toFixed(1) : '0.0'}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
  );

  return (
    <div className="space-y-12 animate-fade-in">
       {/* Winner Banner */}
       {proposals.length > 0 && (
         <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white shadow-lg flex items-center justify-between border-l-4 border-emerald-500">
            <div>
              <h2 className="text-2xl font-bold mb-1">Decisão Oficial da Equipe</h2>
              <p className="text-slate-300">Vencedor baseado na média dos 6 membros oficiais.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-emerald-400">{proposals.find(p => p.id === winner.id)?.name}</div>
              <div className="text-slate-400 font-mono text-lg">Média: {winner.avg}/20</div>
            </div>
         </div>
       )}

      {/* Tabela Oficial */}
      <MatrixTable title="Matriz Oficial (Equipe Técnica)" memberList={coreMembers} isOfficial={true} />

      {/* Tabela Visitantes (Só aparece se houver visitantes) */}
      {otherMembers.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Contribuições de Visitantes (Externo)</h3>
             <MatrixTable title="Painel de Visitantes" memberList={otherMembers} isOfficial={false} />
          </div>
      )}
    </div>
  );
};

export default ResultsMatrix;