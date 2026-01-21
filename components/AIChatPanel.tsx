
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Member, Proposal, VotesState, CRITERIA } from '../types';
import { CORE_TEAM_IDS } from '../constants';
import { Send, Bot, Sparkles, Loader2, RefreshCw, FileText, BarChart3, Download, Share2, Printer, Table, Brain, Calculator, CheckCircle2 } from 'lucide-react';

interface AIChatPanelProps {
  proposals: Proposal[];
  members: Member[];
  votes: VotesState;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Interface para a pontuação gerada pela IA
interface AIScoreData {
  proposalId: string;
  proposalName: string;
  scores: number[]; // [criterion0, criterion1, criterion2, criterion3]
  reasoning: string[]; // Explicação para cada nota
  totalScore: number;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ proposals, members, votes }) => {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Protocolo Gênese v3.5 (Clean Text) Ativo. Plano de Batalha Trello v2.0 carregado. Aguardando diretrizes do Arquiteto Edivaldo.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [aiScores, setAiScores] = useState<AIScoreData[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // New State for Sub-panels
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'ai-scoring' | 'text' | 'export'>('visual');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---
  const buildContext = () => {
    let context = `DADOS DO AMBIENTE (PROTOCOLO GÊNESE v3.5 - CLEAN TEXT):\n`;
    context += `ARQUITETO DO SISTEMA: Edivaldo Junior (Líder Frontend / Squad Bravo).\n`;
    context += `PLANO DE BATALHA TRELLO V2.0 (ATIVO):\n`;
    context += `  - Squad Alpha (Backend/Infra): Gabriel Araújo (Foco: Lambda, DynamoDB, API Gateway).\n`;
    context += `  - Squad Bravo (Frontend/UI): Edivaldo Junior (Foco: React, Integração, Prototipagem).\n`;
    context += `  - Comando: Emanuel Heráclio (Scrum Master).\n`;
    context += `META DO SPRINT 1: API Funcional (Upload+Deploy) e Protótipos de UI.\n`;
    
    context += `CRITÉRIOS DE AVALIAÇÃO:\n${CRITERIA.map((c, i) => `${i+1}. ${c}`).join('\n')}\n\n`;

    const coreStats = calculateStats();
    const winner = coreStats[0];

    context += `STATUS ATUAL DA VOTAÇÃO:\n`;
    context += `Vencedor Atual: ${winner.name} (Média: ${winner.average}/20).\n`;
    
    context += `DETALHAMENTO DAS PROPOSTAS:\n`;
    proposals.forEach(p => {
        context += `>>> PROJETO ID: ${p.id} | NOME: ${p.name}\n`;
        p.descriptions.forEach((d, i) => context += `      - Critério ${i+1}: ${d || "NÃO PREENCHIDO"}\n`);
    });

    return context;
  };

  const calculateStats = () => {
    // Only use CORE members for official stats
    const coreMembers = members.filter(m => CORE_TEAM_IDS.includes(m.id));

    return proposals.map(p => {
        let totalPoints = 0;
        let voteCount = 0;
        
        coreMembers.forEach(m => {
            const userVotes = votes[m.id]?.[p.id];
            if(userVotes) {
                Object.values(userVotes).forEach(v => {
                    const val = v as number;
                    if(val > 0) {
                        totalPoints += val;
                        voteCount++;
                    }
                });
            }
        });

        const rawAverage = voteCount > 0 ? (totalPoints / voteCount) : 0; 
        
        return {
            id: p.id,
            name: p.name,
            totalPoints,
            average: rawAverage.toFixed(1),
            percent: Math.min(100, (rawAverage / 20) * 100) 
        };
    }).sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
  };

  const stats = calculateStats();
  const winner = stats[0];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- ACTIONS ---

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoadingChat(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = buildContext();
        
        // PROTOCOLO GÊNESE V3.5 - CLEAN TEXT STANDARD
        const systemInstruction = `
        IDENTIDADE: Você é o 'Arquiteto Virtual MatrizCognis', assistente estratégico do Edivaldo Junior.
        
        DIRETRIZ DE BATALHA (v3.5 - LEI DE TEXTO LIMPO):
        1. Você conhece o Plano Trello v2.0.
        2. IMPORTANTE: NÃO use emojis ou figurinhas em suas respostas. O texto deve ser limpo, humano e profissional.
        3. Use formatação Markdown (negrito, listas) para organizar a informação.
        4. Seja técnico sobre React, Tailwind e AWS Serverless.
        5. Se Edivaldo perguntar "O que devo fazer?", responda com base nos cartões do Squad Bravo (Frontend).
        
        ESTILO DE RESPOSTA:
        - Direto.
        - Sem adornos visuais.
        - Focado na engenharia.
        `;

        const prompt = `${context}\n\nPERGUNTA DO ARQUITETO (Edivaldo): ${userMsg}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction }
        });

        setMessages(prev => [...prev, { role: 'model', text: response.text || 'Desculpe, falha no protocolo de comunicação.' }]);

    } catch (error) {
        console.error("Erro IA:", error);
        setMessages(prev => [...prev, { role: 'model', text: 'ERRO CRÍTICO: Falha na conexão com a Neural API. Verifique a chave de acesso.' }]);
    } finally {
        setIsLoadingChat(false);
    }
  };

  // --- NEW FEATURE: AI SCORING (Pontuação Automática) ---
  const handleAIScoring = async () => {
    setIsAnalyzing(true);
    setActiveSubTab('ai-scoring');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Construct a purely data-driven prompt
        let dataPrompt = `Analise as seguintes propostas baseando-se estritamente nas descrições fornecidas para cada critério.\n`;
        dataPrompt += `CRITÉRIOS DE 1 a 5 (1=Péssimo/Alto Risco, 5=Excelente/Baixo Risco):\n`;
        CRITERIA.forEach((c, i) => dataPrompt += `${i+1}. ${c}\n`);
        
        dataPrompt += `\nPROPOSTAS:\n`;
        proposals.forEach(p => {
             dataPrompt += `ID: ${p.id} | Nome: ${p.name}\n`;
             p.descriptions.forEach((d, i) => dataPrompt += `  Critério ${i+1}: ${d || "Vazio/Indefinido"}\n`);
        });

        const prompt = `
        ${dataPrompt}
        
        TAREFA: Como um Juiz Técnico Imparcial (Protocolo Gênese v3.5), atribua notas de 1 a 5.
        Se a descrição estiver vazia ou vaga, puna a nota severamente (1 ou 2).
        Se a descrição for técnica e robusta, premie (4 ou 5).
        
        Retorne APENAS um JSON seguindo estritamente este schema:
        [
          {
            "proposalId": "string",
            "proposalName": "string",
            "scores": [number, number, number, number], 
            "reasoning": ["string", "string", "string", "string"] 
          }
        ]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json" 
            }
        });

        const jsonText = response.text;
        if (jsonText) {
            const parsedData = JSON.parse(jsonText);
            const enrichedData: AIScoreData[] = parsedData.map((item: any) => ({
                ...item,
                totalScore: item.scores.reduce((a: number, b: number) => a + b, 0)
            })).sort((a: AIScoreData, b: AIScoreData) => b.totalScore - a.totalScore);
            
            setAiScores(enrichedData);
            setMessages(prev => [...prev, { role: 'model', text: 'Auditoria v3.5 concluída. Notas técnicas calculadas. Aguardando revisão humana.' }]);
        }

    } catch (error) {
        console.error("Erro AI Scoring:", error);
        setMessages(prev => [...prev, { role: 'model', text: 'Erro ao gerar pontuação automática. Tente novamente.' }]);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = buildContext();
        
        const prompt = `
        ${context}
        
        Atue como o braço direito do Arquiteto Edivaldo Junior. Gere um RELATÓRIO TÉCNICO EXECUTIVO (Protocolo Gênese v3.5).
        
        Estruture a resposta assim:
        1. **Veredito do CTO Virtual**: Qual projeto deve ser escolhido e por quê? (Baseie-se em ROI e Viabilidade Técnica).
        2. **Análise de Arquitetura**: O projeto vencedor se encaixa bem no modelo Serverless da AWS (Lambda/S3)? Por quê?
        3. **Mitigação de Riscos**: Liste 3 riscos técnicos imediatos e como resolvê-los na primeira Sprint.
        
        Seja rigoroso e limpo. Não use emojis.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        setAnalysisResult(response.text || "Sem análise gerada.");
        setActiveSubTab('text'); 
    } catch (error) {
        console.error("Erro IA:", error);
        setAnalysisResult("Erro ao gerar análise. Verifique a configuração da API Key.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // --- EXPORT FUNCTIONS ---

  const handleExportWord = () => {
    if (!reportRef.current) return;
    const content = reportRef.current.innerHTML;
    const styles = `
        <style>
            body { font-family: 'Calibri', 'Arial', sans-serif; color: #333; line-height: 1.5; }
            h1 { color: #2E1065; font-size: 24pt; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #4C1D95; font-size: 16pt; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            th { background-color: #F3F4F6; color: #111; font-weight: bold; border: 1px solid #000; padding: 10px; text-align: left; }
            td { border: 1px solid #000; padding: 10px; vertical-align: top; }
            .bar-bg { background-color: #E5E7EB; height: 15px; width: 100%; border: 1px solid #9CA3AF; }
            .bar-fill { height: 100%; background-color: #10B981; }
            .winner-row { background-color: #ECFDF5; }
            p { margin-bottom: 10px; }
            strong { color: #000; }
        </style>
    `;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Relatório de Análise</title>${styles}</head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `relatorio_decisao_projeto_${new Date().toISOString().slice(0,10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;
    
    const win = window.open('', '', 'height=700,width=900');
    if(win) {
        win.document.write('<html><head><title>Relatório de Análise</title>');
        win.document.write('<script src="https://cdn.tailwindcss.com"></script>'); 
        win.document.write('</head><body class="p-8">');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        setTimeout(() => {
            win.print();
        }, 1000);
    }
  };

  const handleCopyText = () => {
    if(!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    alert('Texto da análise copiado!');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- RENDER HELPERS ---

  const formatAIResponse = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={idx} className={`min-h-[1.5em] ${line.trim().startsWith('-') || line.trim().startsWith('*') ? 'pl-4 mb-1' : 'mb-3'}`}>
                {parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx} className="font-bold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={pIdx}>{part}</span>;
                })}
            </div>
        );
    });
  };

  // --- SUB-PANEL: AI SCORING RENDERER ---
  const renderAIScoringPanel = () => {
    if (!aiScores) {
         return (
            <div className="flex flex-col items-center justify-center h-80 text-center p-8 space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full">
                    <Brain size={48} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Auditoria IA (Protocolo Gênese v3.5)</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        O Arquiteto Virtual vai ler as descrições técnicas e atribuir notas (1-5) baseadas na robustez da arquitetura proposta.
                    </p>
                </div>
                <button 
                    onClick={handleAIScoring}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
                >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : <Calculator size={20} />}
                    {isAnalyzing ? 'Executar Auditoria Técnica' : 'Iniciar Auditoria IA'}
                </button>
            </div>
         );
    }

    const aiWinner = aiScores[0];

    return (
        <div className="space-y-6 animate-fade-in p-2">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-start gap-3">
                <Bot className="text-purple-600 mt-1 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-100">Veredito do Arquiteto Virtual</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                        Sob os critérios do Arquiteto Edivaldo Junior, o projeto <strong>{aiWinner.proposalName}</strong> lidera com ({aiWinner.totalScore}/20).
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {aiScores.map((scoreData, idx) => (
                    <div key={scoreData.proposalId} className={`bg-white dark:bg-slate-800 rounded-xl border-2 shadow-sm overflow-hidden ${idx === 0 ? 'border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {idx === 0 && <span className="text-xl">🏆</span>}
                                {scoreData.proposalName}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase text-slate-500">Nota IA</span>
                                <span className={`text-xl font-black ${idx === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {scoreData.totalScore}/20
                                </span>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {CRITERIA.map((crit, cIdx) => (
                                <div key={cIdx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b border-slate-100 dark:border-slate-700 last:border-0 pb-3 last:pb-0">
                                    <div className="md:col-span-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Critério {cIdx + 1}</span>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{crit}</p>
                                    </div>
                                    <div className="md:col-span-8 flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                {[1,2,3,4,5].map(star => (
                                                    <div key={star} className={`w-6 h-1 rounded-full ${star <= scoreData.scores[cIdx] ? (scoreData.scores[cIdx] >= 4 ? 'bg-emerald-500' : scoreData.scores[cIdx] >= 3 ? 'bg-amber-400' : 'bg-red-400') : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                                ))}
                                            </div>
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{scoreData.scores[cIdx]}/5</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                                            "{scoreData.reasoning[cIdx]}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center pt-4">
                <button 
                    onClick={handleAIScoring} 
                    className="text-sm text-slate-500 hover:text-purple-600 flex items-center gap-2 transition-colors"
                >
                    <RefreshCw size={14} /> Reauditar
                </button>
            </div>
        </div>
    );
  };

  const renderVisualReport = () => (
    <div ref={reportRef} className="space-y-8 p-6 bg-white dark:bg-slate-100 dark:text-slate-900 rounded-lg shadow-sm">
        {/* Header Report */}
        <div className="border-b-2 border-slate-300 pb-4 mb-4">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dossiê de Decisão Técnica</h1>
            <p className="text-slate-600 text-lg">Matriz de Análise Comparativa (Protocolo Gênese v3.5)</p>
            <p className="text-sm text-slate-500 mt-2 font-mono">Arquiteto Responsável: Edivaldo Junior</p>
            <p className="text-sm text-slate-500 font-mono">Data da Auditoria: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-200 pb-2">
                <BarChart3 size={24} className="text-indigo-600" /> Votação da Equipe Humana
            </h2>
            <div className="space-y-4 pt-2">
                {stats.map((stat) => (
                    <div key={stat.id}>
                        <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700">
                            <span>{stat.name}</span>
                            <span>{stat.average} / 20</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-5 overflow-hidden border border-slate-300 bar-bg">
                            <div 
                                className={`h-full bar-fill ${stat.id === winner.id ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                                style={{ width: `${stat.percent}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Table Section */}
        <div className="space-y-4 pt-6 page-break-inside-avoid">
             <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-200 pb-2">
                <Table size={24} className="text-indigo-600" /> Métricas Detalhadas
            </h2>
            <table className="w-full text-sm border-collapse border border-slate-400 mt-4">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-slate-400 p-3 text-left text-slate-800 font-bold">Projeto</th>
                        <th className="border border-slate-400 p-3 text-center text-slate-800 font-bold">Pontuação Bruta</th>
                        <th className="border border-slate-400 p-3 text-center text-slate-800 font-bold">Média Ponderada</th>
                        <th className="border border-slate-400 p-3 text-center text-slate-800 font-bold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((stat, idx) => (
                         <tr key={stat.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${stat.id === winner.id ? 'bg-emerald-50 winner-row' : ''}`}>
                            <td className="border border-slate-400 p-3 font-medium text-slate-700">
                                {stat.name} {stat.id === winner.id && '🏆'}
                            </td>
                            <td className="border border-slate-400 p-3 text-center text-slate-700">{stat.totalPoints}</td>
                            <td className="border border-slate-400 p-3 text-center font-bold text-slate-900">{stat.average}</td>
                            <td className="border border-slate-400 p-3 text-center font-semibold text-slate-700">
                                {idx === 0 ? 'Recomendado' : `Alternativa ${idx}`}
                            </td>
                         </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Text Analysis Section */}
        {analysisResult && (
            <div className="space-y-4 pt-6 border-t-2 border-slate-300 mt-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <Sparkles size={24} className="text-indigo-600" /> Parecer do CTO Virtual
                </h2>
                <div className="prose max-w-none text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-lg border border-slate-200">
                    {formatAIResponse(analysisResult)}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-fade-in">
      
      {/* LEFT COLUMN: REPORT CENTRAL */}
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h2 className="font-bold text-lg">Central de Auditoria</h2>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleAIScoring}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm border border-white/10"
                    title="IA Avalia e Pontua os projetos"
                >
                    <Calculator size={14} /> IA: Pontuar
                </button>
                <button 
                    onClick={handleDeepAnalysis}
                    disabled={isAnalyzing}
                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm border border-white/10"
                    title="Gera relatório de texto"
                >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    {isAnalyzing ? '...' : 'IA: Resumo CTO'}
                </button>
            </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-x-auto">
            <button 
                onClick={() => setActiveSubTab('visual')}
                className={`flex-1 min-w-[100px] py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'visual' ? 'bg-white dark:bg-slate-800 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
            >
                <BarChart3 size={14} /> Equipe
            </button>
            <button 
                onClick={() => setActiveSubTab('ai-scoring')}
                className={`flex-1 min-w-[100px] py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'ai-scoring' ? 'bg-white dark:bg-slate-800 border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-purple-500'}`}
            >
                <Brain size={14} /> Pontuação IA
            </button>
            <button 
                onClick={() => setActiveSubTab('text')}
                className={`flex-1 min-w-[100px] py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'text' ? 'bg-white dark:bg-slate-800 border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
            >
                <FileText size={14} /> Parecer CTO
            </button>
            <button 
                onClick={() => setActiveSubTab('export')}
                className={`flex-1 min-w-[100px] py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${activeSubTab === 'export' ? 'bg-white dark:bg-slate-800 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-emerald-500'}`}
            >
                <Download size={14} /> Exportar
            </button>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            
            {activeSubTab === 'visual' && (
                <div className="p-4">
                     {renderVisualReport()}
                </div>
            )}

            {activeSubTab === 'ai-scoring' && (
                <div className="p-4">
                     {renderAIScoringPanel()}
                </div>
            )}

            {activeSubTab === 'text' && (
                 <div className="p-6">
                    {analysisResult ? (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Bot size={20} className="text-purple-500"/> Parecer Técnico Completo
                            </h3>
                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {formatAIResponse(analysisResult)}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-60 text-slate-400 text-center p-8">
                            <Sparkles size={48} className="mb-4 opacity-20" />
                            <p className="font-medium mb-2">Nenhuma análise gerada ainda.</p>
                            <p className="text-xs max-w-xs">Clique no botão "IA: Resumo CTO" no topo.</p>
                        </div>
                    )}
                 </div>
            )}

            {activeSubTab === 'export' && (
                <div className="p-8 flex flex-col gap-6 items-center justify-center h-full">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Gerar Dossiê Oficial</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            Gere um arquivo Word (.doc) formatado profissionalmente contendo os gráficos, tabelas e a análise da IA.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 w-full max-w-xs gap-4">
                        <button 
                            onClick={handleExportWord}
                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-1"
                        >
                            <FileText size={20} /> Baixar Relatório (.doc)
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1 text-xs"
                            >
                                <Printer size={16} /> Imprimir / PDF
                            </button>

                            <button 
                                onClick={handleCopyText}
                                className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-3 px-4 rounded-xl font-bold shadow transition-transform hover:-translate-y-1 text-xs"
                            >
                                <Share2 size={16} /> Copiar Texto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT */}
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
         <div className="bg-slate-100 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className="bg-accent text-white p-2 rounded-lg shadow-sm">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Arquiteto Virtual</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Protocolo Gênese v3.5 Ativo</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[85%] rounded-2xl p-3 text-sm shadow-sm
                        ${msg.role === 'user' 
                            ? 'bg-accent text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'}
                    `}>
                        {formatAIResponse(msg.text)}
                    </div>
                </div>
            ))}
            {isLoadingChat && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                        <Loader2 className="animate-spin text-accent" size={16} />
                        <span className="text-xs text-slate-500">Aguardando diretriz do Arquiteto...</span>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
         </div>

         <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Quais os riscos de latência na Proposta 3?"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-accent outline-none resize-none dark:text-white max-h-32 shadow-inner"
                    rows={1}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoadingChat}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-accent text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-accent transition-colors shadow-sm"
                >
                    <Send size={16} />
                </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
                Auditoria supervisionada pelo Engenheiro Edivaldo Junior.
            </p>
         </div>
      </div>

    </div>
  );
};

export default AIChatPanel;
