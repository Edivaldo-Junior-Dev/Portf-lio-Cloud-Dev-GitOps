
import React, { useState } from 'react';
import { CRITERIA, Member, Proposal } from '../types';
import { BookOpen, UserCheck, BarChart3, Sparkles, Settings, Code2, Database, Layers, CheckCircle2, ChevronDown, ChevronUp, Cpu, ShieldCheck, Cloud, Server, Globe, ArrowRight, LayoutList, Target, User, Flag } from 'lucide-react';

interface GuidePanelProps {
  members: Member[];
  proposals: Proposal[];
}

const GuidePanel: React.FC<GuidePanelProps> = ({ members, proposals }) => {
  const [openSection, setOpenSection] = useState<string | null>('trello'); // Default para Trello agora

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const SectionHeader = ({ id, title, icon: Icon, colorClass }: any) => (
    <button 
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${openSection === id ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-current`}>
          <Icon size={24} />
        </div>
        <span className="font-bold text-lg text-slate-800 dark:text-white">{title}</span>
      </div>
      {openSection === id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mb-4">
          <Cloud size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Dossiê de Arquitetura AWS</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Estratégia de Migração para Cloud Native Serverless ("Portfólio na Nuvem")
        </p>
      </div>

      <div className="space-y-4">

        {/* SECTION 1: PLANO DE BATALHA TRELLO (NOVO) */}
        <SectionHeader id="trello" title="Plano de Batalha: Execução Trello v2.0" icon={LayoutList} colorClass="text-blue-600 bg-blue-600" />
        {openSection === 'trello' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-8 animate-fade-in-down">
            
            {/* SQUADS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <UserCheck size={16} className="text-purple-500"/> Comando Central
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Emanuel Heráclio</strong></p>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full mt-1 inline-block">Scrum Master</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <Server size={16} className="text-blue-500"/> Squad Alpha (Backend)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Gabriel Araújo</strong></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">DynamoDB</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Lambda</span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-l-4 border-emerald-500">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <Globe size={16} className="text-emerald-500"/> Squad Bravo (Frontend)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Edivaldo Junior</strong></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">React</span>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">Integração</span>
                    </div>
                </div>
            </div>

            {/* SPRINTS */}
            <div className="space-y-6">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-orange-500 text-white p-3 font-bold flex items-center gap-2">
                        <Target size={20} /> Sprint 1: A Fundação (API & Protótipos)
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 grid gap-3">
                        
                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border-l-4 border-blue-500 flex justify-between items-start">
                             <div>
                                <h5 className="font-bold text-slate-800 dark:text-white text-sm">[Infra] Setup AWS SAM/Terraform</h5>
                                <p className="text-xs text-slate-500 mt-1">Provisionar S3, DynamoDB, Cognito e IAM Roles.</p>
                             </div>
                             <span className="text-[10px] font-bold uppercase text-blue-500">Squad Alpha</span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border-l-4 border-blue-500 flex justify-between items-start">
                             <div>
                                <h5 className="font-bold text-slate-800 dark:text-white text-sm">[Backend] Lambda de Orquestração & API Gateway</h5>
                                <p className="text-xs text-slate-500 mt-1">Handlers para upload e processamento. Endpoints REST.</p>
                             </div>
                             <span className="text-[10px] font-bold uppercase text-blue-500">Gabriel Araújo</span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border-l-4 border-emerald-500 flex justify-between items-start">
                             <div>
                                <h5 className="font-bold text-slate-800 dark:text-white text-sm">[Frontend] Prototipagem & Telas UI</h5>
                                <p className="text-xs text-slate-500 mt-1">Wireframes Figma + Código React (Login, Dashboard, Upload) sem lógica.</p>
                             </div>
                             <span className="text-[10px] font-bold uppercase text-emerald-500">Edivaldo Junior</span>
                        </div>

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden opacity-75">
                         <div className="bg-slate-700 text-white p-2 font-bold text-sm flex items-center gap-2">
                            <Flag size={14} /> Sprint 2: Integração
                        </div>
                        <ul className="p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <li>• [Frontend] Integração Auth Cognito (Edivaldo)</li>
                            <li>• [Frontend] Conexão Dashboard com API (Edivaldo)</li>
                            <li>• [Testes] Validação End-to-End</li>
                        </ul>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden opacity-75">
                         <div className="bg-slate-700 text-white p-2 font-bold text-sm flex items-center gap-2">
                            <Flag size={14} /> Sprint 3: Polimento
                        </div>
                        <ul className="p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <li>• [Frontend] Responsividade Mobile</li>
                            <li>• [Doc] Dossiê Final (Emanuel)</li>
                            <li>• [Apresentação] Slides e Roteiro</li>
                        </ul>
                    </div>
                </div>
            </div>

          </div>
        )}

        {/* SECTION 2: ARQUITETURA AWS */}
        <SectionHeader id="aws" title="Mapeamento de Serviços: De Vercel/Supabase para AWS" icon={Cloud} colorClass="text-orange-500 bg-orange-500" />
        {openSection === 'aws' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6 animate-fade-in-down">
            <p className="text-slate-600 dark:text-slate-300 border-l-4 border-orange-500 pl-4 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-r-lg">
               Este projeto foi rearquitetado conceitualmente para operar como uma solução <strong>100% AWS Serverless</strong>. Abaixo apresentamos o mapeamento técnico ("De/Para") exigido no Dossiê de Projeto.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* 1. Hosting */}
               <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:border-orange-300 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                     <Globe size={18} className="text-blue-500"/> Frontend & Hosting
                  </h4>
                  <div className="text-sm space-y-2">
                     <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 line-through">Vercel</span>
                        <ArrowRight size={14} className="text-slate-400"/>
                        <span className="font-bold text-orange-600 dark:text-orange-400">Amazon S3 + CloudFront</span>
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                        O bucket S3 armazena os arquivos estáticos (HTML/JS) do React. O CloudFront atua como CDN (Content Delivery Network) para garantir baixa latência global (RNF04).
                     </p>
                  </div>
               </div>

               {/* 2. Auth */}
               <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:border-orange-300 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                     <ShieldCheck size={18} className="text-emerald-500"/> Identidade & Autenticação
                  </h4>
                  <div className="text-sm space-y-2">
                     <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 line-through">Supabase Auth</span>
                         <ArrowRight size={14} className="text-slate-400"/>
                        <span className="font-bold text-orange-600 dark:text-orange-400">Amazon Cognito</span>
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                        Utilizamos <strong>User Pools</strong> para gerenciar o cadastro e login. Isso garante o isolamento dos projetos de cada estudante (RNF02) e segurança nativa.
                     </p>
                  </div>
               </div>

               {/* 3. Backend */}
               <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:border-orange-300 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                     <Server size={18} className="text-purple-500"/> Backend & Orquestração
                  </h4>
                  <div className="text-sm space-y-2">
                     <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 line-through">Edge Functions</span>
                         <ArrowRight size={14} className="text-slate-400"/>
                        <span className="font-bold text-orange-600 dark:text-orange-400">AWS Lambda + API Gateway</span>
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                        A função Lambda executa a lógica de negócio: recebe o ZIP, descompacta, cria o bucket de destino e configura o site estático automaticamente.
                     </p>
                  </div>
               </div>

               {/* 4. Database */}
               <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:border-orange-300 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                     <Database size={18} className="text-indigo-500"/> Banco de Dados
                  </h4>
                  <div className="text-sm space-y-2">
                     <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 line-through">PostgreSQL</span>
                         <ArrowRight size={14} className="text-slate-400"/>
                        <span className="font-bold text-orange-600 dark:text-orange-400">Amazon DynamoDB</span>
                     </div>
                     <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                        Armazenamento NoSQL de alta performance para os metadados dos projetos (URL gerada, ID do dono, Data de Deploy). Escalabilidade automática.
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="mt-6 p-5 bg-slate-900 text-slate-300 rounded-lg border border-slate-700 font-mono text-xs shadow-inner">
               <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold uppercase tracking-widest border-b border-slate-700 pb-2">
                  <Cpu size={14}/> Fluxo de Dados do MVP (Deploy)
               </div>
               <ol className="space-y-3 list-decimal list-inside text-slate-400">
                  <li>
                    <strong className="text-white">Upload:</strong> Usuário envia <code>.zip</code> via React App <span className="text-slate-600">&rarr;</span> API Gateway.
                  </li>
                  <li>
                    <strong className="text-white">Trigger:</strong> API Gateway aciona a função <code>Lambda Orquestradora</code>.
                  </li>
                  <li>
                    <strong className="text-white">Processamento:</strong> Lambda descompacta o arquivo em memória (ou <code>/tmp</code>).
                  </li>
                  <li>
                    <strong className="text-white">Deploy:</strong> Lambda envia arquivos para um bucket S3 público configurado como Website.
                  </li>
                  <li>
                    <strong className="text-white">Registro:</strong> Lambda salva a nova URL gerada na tabela <code>Projects</code> do DynamoDB.
                  </li>
                  <li>
                    <strong className="text-white">Retorno:</strong> Frontend recebe a URL pública e exibe ao usuário.
                  </li>
               </ol>
            </div>
          </div>
        )}

        {/* SECTION 3: IMPLEMENTAÇÃO DIDÁTICA */}
        <SectionHeader id="tech" title="Nota sobre a Implementação Atual (Sala de Aula)" icon={Code2} colorClass="text-emerald-600 bg-emerald-600" />
        {openSection === 'tech' && (
          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-700 font-mono text-sm space-y-6 animate-fade-in-down">
            <p className="italic text-slate-400">Devido às restrições de ambiente de laboratório, utilizamos uma stack de emulação:</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-3 rounded border border-slate-700 flex items-center justify-between">
                  <span className="text-white">Emulador Lambda</span>
                  <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-1 rounded">Node.js Express</span>
                </div>
                <div className="bg-slate-800 p-3 rounded border border-slate-700 flex items-center justify-between">
                  <span className="text-white">Emulador DynamoDB</span>
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">SQLite Local</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidePanel;
