import React, { useRef, useState } from 'react';
import { CRITERIA, Member, Proposal } from '../types';
import { Upload, Download, RefreshCw, Trash2, Plus, PlusCircle, Check, Link, FileText, Clipboard, ArrowRight, AlertCircle } from 'lucide-react';

interface ConfigPanelProps {
  members: Member[];
  proposals: Proposal[];
  onUpdateMember: (id: string, name: string) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onUpdateProposal: (id: string, field: 'name' | 'desc' | 'link', value: string, descIndex?: number) => void;
  onAddProposal: () => void;
  onRemoveProposal: (id: string) => void;
  onImportData: (data: any) => void;
  onReset: () => void;
  onSaveAndExit: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  members, 
  proposals, 
  onUpdateMember, 
  onAddMember,
  onRemoveMember,
  onUpdateProposal,
  onAddProposal,
  onRemoveProposal,
  onImportData,
  onReset,
  onSaveAndExit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Default doc link provided by user
  const [docLink, setDocLink] = useState('https://docs.google.com/document/d/1VQYLiw1m-_nmDEFul15xhnmvQqsuzKKCnm3Cq-5iniU/edit?usp=sharing');
  const [pastedContent, setPastedContent] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    const data = { members, proposals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matriz-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.members && json.proposals) {
            if(window.confirm('Isso substituirá todos os nomes de projetos e membros atuais. Continuar?')) {
                onImportData(json);
                alert('Configuração importada com sucesso!');
            }
        } else {
            alert('Arquivo inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProposalFileUpload = (proposalId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo é muito grande (Máx: 2MB). Por favor, use um link externo (Drive/Dropbox) ou comprima o arquivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        if(ev.target?.result) {
            onUpdateProposal(proposalId, 'link', ev.target.result as string);
        }
    };
    reader.readAsDataURL(file);
  };

  // --- SMART PARSER LOGIC ---
  const handleSmartSync = () => {
    if (!pastedContent.trim()) {
        alert("Por favor, cole o conteúdo do documento primeiro.");
        return;
    }

    try {
        const lines = pastedContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newProposals: Proposal[] = [];
        let currentProposal: Partial<Proposal> | null = null;
        let descriptions: string[] = [];

        // Simple Heuristic Parser
        // Looks for "Proposta X" or "X." or "Projeto:" to start a new block
        // Looks for "Análise:" or long text blocks for descriptions

        lines.forEach((line) => {
            const isHeader = /^(Proposta|Projeto|Opção)\s*\d+|^\d+\.\s*[A-Z]/.test(line);
            
            if (isHeader) {
                // Save previous if exists
                if (currentProposal) {
                    currentProposal.descriptions = descriptions.slice(0, 4);
                    // Fill remaining slots if < 4
                    while(currentProposal.descriptions.length < 4) currentProposal.descriptions.push("Sem descrição extraída.");
                    newProposals.push(currentProposal as Proposal);
                }

                // Start new
                currentProposal = {
                    id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    name: line.replace(/[:]/g, '').trim(),
                    link: '',
                    descriptions: []
                };
                descriptions = [];
            } else if (currentProposal) {
                // It's a description line
                // If line starts with "Análise:" or similar, clean it
                const cleanLine = line.replace(/^(Análise|Critério \d+|Obs):/i, '').trim();
                
                if (cleanLine.length > 10) { // Ignore tiny trash lines
                    if (descriptions.length < 4) {
                        descriptions.push(cleanLine);
                    } else {
                        // Append to last description if we already have 4 (merging paragraphs)
                        descriptions[3] += ` ${cleanLine}`;
                    }
                }
            }
        });

        // Push the last one
        if (currentProposal) {
            currentProposal.descriptions = descriptions.slice(0, 4);
            while(currentProposal.descriptions.length < 4) currentProposal.descriptions.push("Sem descrição extraída.");
            newProposals.push(currentProposal as Proposal);
        }

        if (newProposals.length > 0) {
            if (window.confirm(`Encontramos ${newProposals.length} propostas no texto. Deseja substituir as atuais?`)) {
                onImportData({ proposals: newProposals }); // Only updates proposals, keeps members
                setSyncStatus('success');
                setPastedContent('');
                setTimeout(() => setSyncStatus('idle'), 3000);
            }
        } else {
            setSyncStatus('error');
            alert("Não conseguimos identificar propostas no texto. Certifique-se de que cada projeto comece com 'Proposta X' ou 'Projeto X'.");
        }

    } catch (e) {
        console.error(e);
        setSyncStatus('error');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto pb-32">
      
      {/* Smart Sync Section (New) */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                    <RefreshCw className="animate-pulse" size={20} />
                    <h3 className="font-bold text-lg">Sincronização com Google Docs</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Para atualizar os projetos automaticamente:
                </p>
                <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-2 ml-2">
                    <li>Clique em <b>Abrir Doc</b> abaixo.</li>
                    <li>No Google Docs, pressione <b>Ctrl+A</b> (Selecionar Tudo) e <b>Ctrl+C</b> (Copiar).</li>
                    <li>Volte aqui e cole o texto (Ctrl+V) na caixa ao lado.</li>
                    <li>Clique em <b>Processar e Atualizar</b>.</li>
                </ol>
                
                <div className="flex gap-2 mt-4">
                    <input 
                        type="text" 
                        value={docLink}
                        onChange={(e) => setDocLink(e.target.value)}
                        className="flex-1 text-xs bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded px-3 py-2 truncate text-slate-500"
                    />
                    <a 
                        href={docLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                    >
                        <FileText size={16} /> Abrir Doc
                    </a>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                <div className="relative flex-1">
                    <textarea 
                        value={pastedContent}
                        onChange={(e) => setPastedContent(e.target.value)}
                        placeholder="Cole o conteúdo do Doc aqui..."
                        className="w-full h-40 bg-white dark:bg-slate-900 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 text-xs font-mono focus:border-blue-500 focus:ring-0 resize-none transition-colors"
                    />
                    {!pastedContent && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-blue-300 dark:text-blue-700">
                            <Clipboard size={48} className="opacity-20" />
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleSmartSync}
                    disabled={!pastedContent}
                    className={`
                        w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                        ${!pastedContent 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                            : syncStatus === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/20'}
                    `}
                >
                    {syncStatus === 'success' ? (
                        <><Check size={18} /> Atualizado com Sucesso!</>
                    ) : (
                        <><RefreshCw size={18} /> Processar e Atualizar Projetos</>
                    )}
                </button>
                {syncStatus === 'error' && (
                    <p className="text-xs text-red-500 flex items-center gap-1 justify-center animate-bounce">
                        <AlertCircle size={12} /> Erro ao processar. Verifique se o texto tem "Proposta X".
                    </p>
                )}
            </div>
         </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 my-8"></div>

      {/* Action Bar (Legacy) */}
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
         <div>
            <h3 className="font-bold text-lg dark:text-white">Backup Manual (Arquivo)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Opções avançadas de backup JSON.</p>
         </div>
         <div className="flex flex-wrap gap-3 justify-center">
             <button 
               onClick={handleExport}
               className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
                <Download size={16} /> Exportar JSON
             </button>
             <button 
               onClick={handleImportClick}
               className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
                <Upload size={16} /> Importar JSON
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
             
             <div className="hidden md:block w-px h-10 bg-slate-300 dark:bg-slate-600 mx-1"></div>

             <button 
               onClick={onReset}
               className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
             >
                <RefreshCw size={16} /> Resetar Tudo
             </button>
         </div>
      </div>

      {/* Members Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-1 rounded w-8 h-8 flex items-center justify-center text-sm">1</span>
            Membros da Equipe
            </h3>
            <button 
                onClick={onAddMember}
                className="flex items-center gap-1 text-sm bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-full font-semibold transition-colors"
            >
                <Plus size={16} /> Adicionar Membro
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {members.map(member => (
              <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex gap-2 items-center">
                 <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">ID: {member.id}</label>
                    <input 
                        type="text" 
                        value={member.name} 
                        onChange={(e) => onUpdateMember(member.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm dark:text-white focus:ring-2 focus:ring-accent outline-none"
                    />
                 </div>
                 <button 
                    onClick={() => onRemoveMember(member.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors mt-4"
                    title="Remover membro"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
           ))}
        </div>
      </section>

      {/* Proposals Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-1 rounded w-8 h-8 flex items-center justify-center text-sm">2</span>
                Propostas e Descrições (Editável Manualmente)
            </h3>
        </div>

        <div className="grid grid-cols-1 gap-8">
           {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                 
                 {/* Remove Proposal Button */}
                 <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <button 
                        onClick={() => onRemoveProposal(proposal.id)}
                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-bold shadow-sm"
                     >
                        <Trash2 size={14} /> Excluir Proposta
                     </button>
                 </div>

                 <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 pr-32">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Nome do Projeto</label>
                            <input 
                                type="text" 
                                value={proposal.name} 
                                onChange={(e) => onUpdateProposal(proposal.id, 'name', e.target.value)}
                                className="w-full md:w-2/3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 font-bold text-lg dark:text-white focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                                <Link size={12} /> Link ou Arquivo (PDF/Word)
                            </label>
                            <div className="flex gap-2 w-full md:w-2/3">
                                <input 
                                    type="text" 
                                    value={proposal.link || ''} 
                                    onChange={(e) => onUpdateProposal(proposal.id, 'link', e.target.value)}
                                    placeholder="https://... ou faça upload"
                                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm dark:text-slate-300 focus:ring-2 focus:ring-accent outline-none"
                                />
                                <label className="flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 p-2 rounded cursor-pointer transition-colors min-w-[44px]" title="Fazer Upload de Arquivo (PDF/Word)">
                                    <Upload size={18} />
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        className="hidden"
                                        onChange={(e) => handleProposalFileUpload(proposal.id, e)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CRITERIA.map((crit, idx) => (
                        <div key={idx} className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                              {idx + 1}. {crit}
                           </label>
                           <textarea 
                              value={proposal.descriptions[idx] || ''}
                              onChange={(e) => onUpdateProposal(proposal.id, 'desc', e.target.value, idx)}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded p-3 text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-accent outline-none resize-none"
                              placeholder={`Análise para ${crit}...`}
                           />
                        </div>
                    ))}
                 </div>
              </div>
           ))}
           
           {/* Add Proposal Button */}
           <button 
              onClick={onAddProposal}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
           >
              <PlusCircle size={48} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg">+ Adicionar Nova Proposta</span>
           </button>
        </div>
      </section>

      {/* FIXED FOOTER SAVE BUTTON */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <div className="hidden md:block">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total de Propostas: <span className="font-bold text-slate-900 dark:text-white">{proposals.length}</span>
                </p>
            </div>
            <button 
                onClick={onSaveAndExit}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
            >
                <Check size={24} />
                SALVAR ALTERAÇÕES E VOLTAR
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;