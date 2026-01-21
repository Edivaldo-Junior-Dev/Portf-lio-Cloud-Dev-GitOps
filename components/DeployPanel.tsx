
import React, { useState, useRef, useEffect } from 'react';
import { Cloud, Upload, CheckCircle2, AlertCircle, Loader2, Server, ArrowRight, FileArchive, Zap, Settings, Shield } from 'lucide-react';
import { User } from '../types';

interface DeployPanelProps {
  currentUser: User;
  onBack: () => void;
}

const DeployPanel: React.FC<DeployPanelProps> = ({ currentUser, onBack }) => {
  // Estado para armazenar a URL da API do Gabriel (Persistente no LocalStorage para facilitar)
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('aws_api_endpoint') || '');
  const [showConfig, setShowConfig] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('aws_api_endpoint', apiUrl);
  }, [apiUrl]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.zip')) {
        alert("ERRO DE FORMATO: O sistema AWS Lambda aceita apenas pacotes .zip");
        return;
      }
      setFile(selected);
      setLogs([]);
      setStatus('idle');
      addLog(`Arquivo selecionado: ${selected.name} (${(selected.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const handleDeploy = async () => {
    if (!file) return;
    if (!apiUrl) {
        alert("CONFIGURAÇÃO NECESSÁRIA: Informe a URL do API Gateway (fornecida pelo Gabriel/Squad Alpha) nas configurações.");
        setShowConfig(true);
        return;
    }

    setStatus('uploading');
    setLogs([]);
    addLog("Inicializando protocolo de upload seguro...");
    addLog(`Destino: ${apiUrl}`);

    try {
      // PREPARAÇÃO DO PAYLOAD (REAL)
      const formData = new FormData();
      formData.append('file', file); // O arquivo binário
      formData.append('project_name', file.name.replace('.zip', ''));
      formData.append('user_id', currentUser.id);
      formData.append('user_email', currentUser.email);
      formData.append('timestamp', new Date().toISOString());

      addLog("Enviando requisição POST (multipart/form-data)...");

      // REQUISIÇÃO REAL (SEM SIMULAÇÃO)
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha na API AWS (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      addLog("Resposta recebida da AWS Lambda.");
      addLog(`Status: ${data.message || 'Processado'}`);

      if (data.url || data.website_url) {
        setDeployedUrl(data.url || data.website_url);
        setStatus('success');
        addLog("DEPLOY FINALIZADO COM SUCESSO.");
      } else {
        throw new Error("A API não retornou a URL do site (campo 'url' ou 'website_url' ausente).");
      }

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      addLog(`ERRO CRÍTICO: ${error.message}`);
      addLog("Verifique os logs do CloudWatch ou a conexão com a internet.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 animate-fade-in font-sans flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowRight className="rotate-180" size={20} /> Voltar
        </button>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowConfig(!showConfig)}
             className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${!apiUrl ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
           >
              <Settings size={16} /> Config API
           </button>
           <div className="flex items-center gap-2">
               <Cloud className="text-orange-500" />
               <span className="font-bold tracking-widest text-sm">AWS S3 DEPLOYER</span>
           </div>
        </div>
      </div>

      {/* Painel de Configuração da API (Só aparece se solicitado ou se não tiver URL) */}
      {(showConfig || !apiUrl) && (
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 p-6 rounded-xl mb-8 shadow-2xl animate-fade-in-down">
              <h3 className="font-bold text-orange-500 mb-2 flex items-center gap-2">
                  <Shield size={18} /> Configuração de Endpoint (Squad Alpha)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                  Cole aqui a URL do <strong>API Gateway</strong> criada pelo Gabriel. O Frontend enviará o arquivo ZIP via POST para este endereço.
              </p>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="Ex: https://xyz123.execute-api.us-east-1.amazonaws.com/prod/upload"
                    className="flex-1 bg-black/50 border border-slate-600 rounded-lg p-3 text-sm text-white font-mono focus:border-orange-500 outline-none"
                  />
                  <button 
                    onClick={() => setShowConfig(false)}
                    disabled={!apiUrl}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Salvar
                  </button>
              </div>
          </div>
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Column: Upload Area */}
        <div className="space-y-6">
           <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">Deploy Real <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">AWS Serverless</span></h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interface de upload direto para S3 Buckets. Certifique-se que o pacote <code>.zip</code> contém um <code>index.html</code> na raiz.
              </p>
           </div>

           <div 
             className={`
               border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden
               ${status === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/50'}
               ${status === 'error' ? 'border-red-500/50 bg-red-900/10' : ''}
             `}
           >
              {status === 'uploading' && (
                 <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center">
                    <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
                    <span className="text-orange-500 font-bold animate-pulse">ENVIANDO BYTES...</span>
                 </div>
              )}

              {status === 'success' ? (
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
                      <CheckCircle2 size={40} className="text-white" />
                   </div>
                   <h3 className="text-xl font-bold text-emerald-400">Sucesso!</h3>
                   <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/30 text-xs font-mono break-all text-emerald-200">
                      {deployedUrl}
                   </div>
                   <a 
                     href={deployedUrl || '#'} 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
                   >
                     Abrir Site <ArrowRight size={16} />
                   </a>
                   <button 
                     onClick={() => { setStatus('idle'); setFile(null); setDeployedUrl(null); }}
                     className="block w-full text-xs text-slate-500 hover:text-white mt-4 underline"
                   >
                     Novo Deploy
                   </button>
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    accept=".zip"
                    className="hidden" 
                  />
                  
                  {file ? (
                    <div className="text-center space-y-4 w-full">
                       <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FileArchive size={32} />
                       </div>
                       <div className="text-sm font-bold text-white truncate max-w-[200px] mx-auto">{file.name}</div>
                       <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                       
                       <button 
                         onClick={handleDeploy}
                         disabled={status === 'uploading'}
                         className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <Zap size={18} /> INICIAR UPLOAD AWS
                       </button>
                       <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:underline">Cancelar</button>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                       </div>
                       <h3 className="font-bold text-white mb-1">Selecionar .ZIP</h3>
                       <p className="text-xs text-slate-500">Clique para buscar no computador</p>
                    </div>
                  )}
                </>
              )}
           </div>
        </div>

        {/* Right Column: Terminal Logs */}
        <div className="bg-black/40 border border-slate-800 rounded-2xl p-6 font-mono text-xs flex flex-col h-[500px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="ml-2 text-slate-500">system-log</span>
           </div>
           
           <div className="mt-6 flex-1 overflow-y-auto space-y-2 text-slate-300 p-2 scrollbar-thin scrollbar-thumb-slate-700">
              {logs.length === 0 && <div className="text-slate-600 opacity-50">Aguardando início do processo...</div>}
              {logs.map((log, i) => (
                <div key={i} className="animate-fade-in-left border-l-2 border-slate-700 pl-2">
                   {log}
                </div>
              ))}
              {status === 'uploading' && (
                 <div className="animate-pulse text-orange-400 mt-2">... Transferindo dados para nuvem ...</div>
              )}
           </div>

           {/* Decorativo: Stack AWS */}
           <div className="border-t border-slate-800 pt-4 mt-2 flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1"><Server size={14}/><span className="text-[9px]">Lambda</span></div>
                  <div className="flex flex-col items-center gap-1"><Cloud size={14}/><span className="text-[9px]">S3</span></div>
              </div>
              <div className="text-[9px] text-slate-600">Secure Connection</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DeployPanel;
