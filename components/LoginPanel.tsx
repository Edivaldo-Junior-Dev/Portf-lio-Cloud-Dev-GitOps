
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { 
  ArrowRight, User as UserIcon, Lock, Globe, Cloud, Database, 
  Loader2, AlertCircle, Linkedin, CheckCircle2, Cpu, Brain, ShieldCheck, 
  Smartphone, Users, BarChart3, Edit3, Sparkles
} from 'lucide-react';

// --- COMPONENTES VISUAIS AUXILIARES ---

const TypewriterText: React.FC<{ text: string, speed?: number, delay?: number, active?: boolean, className?: string }> = ({ text, speed = 30, delay = 0, active = true, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    if(!active) {
        setDisplayedText('');
        setIndex(0);
        setStarted(false);
        return;
    }
    const t = setTimeout(() => {
        setDisplayedText(''); 
        setIndex(0); 
        setStarted(true);
    }, delay);
    return () => clearTimeout(t);
  }, [text, active, delay]);

  useEffect(() => {
    if (!active || !started) return;
    if (index < text.length) {
      const t = setTimeout(() => { 
          setDisplayedText(prev => prev + text.charAt(index)); 
          setIndex(prev => prev + 1); 
      }, speed);
      return () => clearTimeout(t);
    }
  }, [index, text, speed, active, started]);

  return <span className={className}>{displayedText}</span>;
};

const CloudIcon: React.FC<{ icon: any, delay: string, highlight?: boolean }> = ({ icon: Icon, delay, highlight }) => (
  <div 
    className={`p-6 cloud-shape glass-card shadow-2xl animate-float transition-all duration-1000 flex items-center justify-center border border-white/10 ${highlight ? 'bg-orange-500/20 border-orange-500/50' : 'bg-white/5'}`} 
    style={{ animationDelay: delay }}
  >
    <Icon size={40} className={highlight ? 'text-orange-500 scale-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'text-slate-300'} />
  </div>
);

const CarouselSlideIcons: React.FC<{ icons: any[] }> = ({ icons }) => (
  <div className="flex items-center justify-center gap-6 mb-12 h-32">
    <CloudIcon icon={icons[0]} delay="0s" />
    <CloudIcon icon={icons[1]} delay="1s" highlight={true} />
    <CloudIcon icon={icons[2]} delay="2s" />
  </div>
);

// --- CONFIGURAÇÃO DOS SLIDES ---

const CAROUSEL_STEPS = [
  { 
    type: 'standard',
    title: "Sua Jornada na Nuvem", 
    description: "Centralize e organize todo o seu portfólio de desenvolvimento cloud em um único lugar seguro e profissional.", 
    icons: [Globe, Cloud, Database], 
    color: "from-blue-900/40 to-slate-950" 
  },
  { 
    type: 'standard',
    title: "Módulo MatrizCognis", 
    description: "Um ecossistema especializado para auditoria técnica com critérios ágeis e inteligência artificial de ponta.", 
    icons: [Cpu, Brain, ShieldCheck], 
    color: "from-purple-900/40 to-slate-950" 
  },
  { 
    type: 'standard',
    title: "Hub de Colaboração", 
    description: "Publique seu projeto e visualize as entregas de todas as equipes. O conhecimento compartilhado acelera a evolução.", 
    icons: [Smartphone, Users, BarChart3], 
    color: "from-emerald-900/40 to-slate-950" 
  },
  {
    type: 'profile',
    title: "ARQUITETO DO SISTEMA",
    name: "Edivaldo Junior",
    role: "Engenheiro de Software & Cloud Architect",
    bio: "Engenheiro de Software em formação e Desenvolvedor focado em Python. Minha missão é construir a ponte entre o código e o mundo físico. Minha paixão é a criação de soluções completas, filosofia que chamo de 'Vibercode'. Liderei o desenvolvimento da plataforma Matriz de Análise.",
    skills: ["Python", "Django", "SQL", "React", "JavaScript", "AWS", "UX Design", "Figma", "Docker", "IaC"],
    photoUrl: "https://avatars.githubusercontent.com/u/115662943?v=4",
    color: "from-[#020c1b] to-[#0A192F]"
  }
];

// --- COMPONENTE PRINCIPAL ---

const LoginPanel: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userType, setUserType] = useState<'aluno' | 'visitante'>('aluno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentStep = CAROUSEL_STEPS[currentSlide];
    const duration = currentStep.type === 'profile' ? 20000 : 10000;
    const timer = setTimeout(() => { 
        setCurrentSlide(prev => (prev + 1) % CAROUSEL_STEPS.length); 
    }, duration);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleAction = async () => {
    if (!email || !password) {
        setError("Preencha as credenciais.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        if (userType === 'visitante') {
            alert("Acesso de visitante requer credenciais cadastradas ou use admin@cloud.com.");
            setIsLoading(false);
            return;
        }
        if (isRegistering) {
             if (!name) throw new Error("Nome é obrigatório para cadastro.");
             await api.register(name, email, password);
             alert("Cadastro realizado! Agora faça login.");
             setIsRegistering(false);
             setPassword('');
        } else {
             const response = await api.login(email, password);
             localStorage.setItem('auth_token', response.token);
             onLogin({
                ...response.user,
                turmaId: 't1',
                turmaName: 'C10 OUT - Backend',
                teamNumber: response.user.role === 'member' ? 3 : undefined
             } as User);
        }
    } catch (err: any) {
        setError(err.message || "Erro de conexão.");
    } finally {
        setIsLoading(false);
    }
  };

  const slide = CAROUSEL_STEPS[currentSlide];

  // ESTILOS DE VIDRO (MIRRORED EFFECT)
  const glassPanelRight = "bg-slate-900/40 backdrop-blur-xl border-l border-white/10 shadow-[inset_10px_0_20px_rgba(255,255,255,0.02)]";
  const glassInput = "w-full bg-white/5 backdrop-blur-md border border-white/10 focus:border-orange-500/50 focus:bg-white/10 transition-all rounded-2xl py-4 pl-5 pr-12 text-white font-bold placeholder:text-slate-500/60 outline-none shadow-inner";
  const glassButtonSecondary = "w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-2 group shadow-lg";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] font-sans overflow-hidden relative">
      
      <style>{`
        @keyframes shine-move {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shine {
            100% { left: 125%; }
        }
        .animate-shine {
            animation: shine 1s;
        }
        .shine-text-white {
          background: linear-gradient(to right, #ffffff 40%, #94a3b8 50%, #ffffff 60%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine-move 4s linear infinite;
        }
        .shine-text-orange {
          background: linear-gradient(to right, #fb923c 20%, #ea580c 40%, #ffffff 50%, #ea580c 60%, #fb923c 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine-move 4s linear infinite;
        }
      `}</style>

      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Card Container */}
      <div className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 w-full max-w-6xl min-h-[850px] cloud-shape shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* LADO ESQUERDO (Mantido) */}
        <div className={`hidden md:flex flex-col w-1/2 p-12 relative transition-all duration-[2000ms] bg-gradient-to-br ${slide.color} border-r border-white/5`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
           
           {slide.type === 'standard' ? (
             <>
               <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 mt-8">
                  <CarouselSlideIcons icons={slide.icons!} />
                  <div className="h-32 flex flex-col items-center justify-center space-y-6">
                    <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[1.1]">
                        <TypewriterText text={slide.title} speed={50} active={true} />
                    </h2>
                    <p className="text-slate-300/80 text-lg leading-relaxed max-w-sm mx-auto font-medium">
                        <TypewriterText text={slide.description} speed={20} delay={1000} active={true} />
                    </p>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col justify-center relative z-10 animate-fade-in px-2">
                 <div className="mb-6">
                    <span className="text-[#64FFDA] font-mono text-sm tracking-[0.2em] border border-[#64FFDA] px-3 py-1 rounded-full uppercase">{slide.title}</span>
                 </div>
                 <div className="flex flex-row gap-6 items-start">
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-1 bg-[#64FFDA] rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                        <div className="relative rounded-2xl overflow-hidden border-2 border-[#64FFDA] shadow-[0_0_20px_rgba(100,255,218,0.3)] w-[200px] h-[200px] bg-[#020c1b]">
                            <img 
                              src={slide.photoUrl} 
                              alt={slide.name} 
                              onError={(e) => { 
                                console.warn("Falha ao carregar imagem GitHub, usando fallback");
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(slide.name)}&background=0D8ABC&color=fff&size=256`; 
                              }}
                              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                    </div>
                    <div className="flex-1 text-left space-y-4">
                        <div>
                            <h2 className="text-white text-3xl font-bold leading-tight mb-1">{slide.name}</h2>
                            <p className="text-slate-400 text-xs font-mono">{slide.role}</p>
                        </div>
                        <div className="text-slate-300 text-[11px] leading-relaxed font-light border-l-2 border-[#64FFDA]/50 pl-3 min-h-[100px]">
                             <TypewriterText text={slide.bio || ''} speed={15} delay={500} active={true} />
                        </div>
                        
                        {/* CARD REFLEXIVO PARA HABILIDADES */}
                        <div className="mt-4 relative group/glass overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] hover:border-[#64FFDA]/30 transition-colors duration-500">
                            {/* Shine Effect Overlay */}
                            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/glass:animate-shine pointer-events-none" />

                            <p className="text-[#64FFDA] text-[10px] font-bold uppercase tracking-widest mb-4 text-center border-b border-white/5 pb-2">
                                Minhas Habilidades
                            </p>

                            <div className="flex flex-wrap justify-center gap-2.5">
                                {slide.skills?.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="relative px-3 py-1.5 rounded-lg bg-[#0A192F]/80 border border-white/10 text-[10px] font-medium text-slate-300 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:text-[#64FFDA] hover:border-[#64FFDA]/50 hover:shadow-[0_0_15px_rgba(100,255,218,0.2)] cursor-default select-none"
                                        style={{ animationDelay: `${1500 + (i * 100)}ms` }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                 </div>
             </div>
           )}

           <div className="flex justify-center gap-3 pt-4 pb-8 z-10">
              {CAROUSEL_STEPS.map((step, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-700 ${i === currentSlide ? `w-12 ${step.type === 'profile' ? 'bg-[#64FFDA] shadow-[0_0_10px_#64FFDA]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'}` : 'w-2 bg-white/10 hover:bg-white/30'}`} />
              ))}
           </div>

           {slide.type === 'standard' && (
             <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-6 mt-auto w-full">
                <div className="flex flex-col bg-black/40 backdrop-blur-md px-6 py-4 rounded-[30px] rounded-bl-[10px] border border-white/5 shadow-lg min-w-[200px]">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 opacity-80">Com suporte do sistema:</p>
                    <div className="text-xl font-black text-white tracking-tight leading-none">Matriz<span className="text-orange-500">Cognis</span></div>
                </div>
                <a href="https://www.linkedin.com/in/edivaldojuniordev/" target="_blank" rel="noreferrer" className="group relative flex flex-col items-end bg-white/5 backdrop-blur-2xl px-6 py-4 rounded-[30px] rounded-br-[10px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-pulse-soft hover:bg-white/10 transition-all min-w-[220px]">
                   <p className="text-[8px] text-blue-300/70 font-black uppercase tracking-[0.2em] mb-1">Engenharia de Software:</p>
                   <div className="flex items-center gap-2 text-white font-black tracking-wide text-right">EDIVALDO JUNIOR <Linkedin size={16} className="text-blue-500"/></div>
                   <div className="mt-1.5 px-3 py-0.5 bg-black/40 rounded-full text-[9px] font-mono text-slate-400 border border-white/5 shadow-inner">v2.4.12 - STABLE</div>
                </a>
             </div>
           )}
        </div>

        {/* LADO DIREITO - FORMULÁRIO COM EFEITO ESPELHADO */}
        <div className={`w-full md:w-1/2 relative p-12 flex flex-col justify-center ${glassPanelRight}`}>
            
            <div className="max-w-md mx-auto w-full mt-10 relative z-20">
                <div className="mb-12 text-center group">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-2 leading-[0.9] flex flex-col items-center justify-center">
                        <span className="shine-text-white block">Portfólio</span>
                        <span className="shine-text-orange block italic pr-4 -translate-x-4">CloudDev</span>
                    </h1>
                </div>

                {/* Abas Aluno/Visitante - Espelhado */}
                <div className="flex justify-center mb-8">
                    <div className="flex p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 shadow-inner">
                        <button 
                            onClick={() => { setUserType('aluno'); setIsRegistering(false); }}
                            className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${userType === 'aluno' ? 'bg-gradient-to-r from-orange-500/80 to-orange-600/80 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] backdrop-blur-md border border-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            ALUNO
                        </button>
                        <button 
                            onClick={() => { setUserType('visitante'); setIsRegistering(false); }}
                            className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${userType === 'visitante' ? 'bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            VISITANTE - AWS
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Turma Vinculada</label>
                             <span className="text-[10px] font-bold text-orange-500 cursor-pointer hover:text-orange-400 flex items-center gap-1 transition-colors"><Edit3 size={10} /> AJUSTAR</span>
                        </div>
                        <div className="relative group">
                             <input disabled type="text" value="C10 OUT - BRSAO 207 Noite - R2" className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-5 pr-12 text-white font-bold text-sm outline-none cursor-not-allowed opacity-50" />
                             <Database className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                        </div>
                    </div>

                    {isRegistering && (
                        <div className="space-y-2 animate-fade-in-down">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1"><Sparkles size={10} className="text-orange-500" /> Nome Completo</label>
                            <div className="relative group">
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu Nome" className={glassInput} />
                                <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500" size={18} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{isRegistering ? 'Seu Melhor E-mail' : 'Identifique-se (E-mail)'}</label>
                        <div className="relative group">
                             <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@cloud.com" className={glassInput} />
                             <UserIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Senha de Acesso</label>
                        <div className="relative group">
                             <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={glassInput} />
                             <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500" size={18} />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-shake backdrop-blur-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleAction}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-lg py-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 mt-6 group border border-orange-400/30"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'FINALIZAR CADASTRO' : 'ACESSAR PORTFÓLIO')}
                        {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="pt-4">
                        <button 
                            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                            className={glassButtonSecondary}
                        >
                            <span className="text-slate-400 group-hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
                                {isRegistering ? 'Já tem conta? Voltar para Login' : 'Não tem conta? Cadastrar Novo Aluno'}
                            </span>
                            <ArrowRight size={14} className="text-slate-500 group-hover:text-orange-500 transition-colors group-hover:translate-x-1" />
                        </button>
                    </div>

                </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

      </div>

      <div className="absolute bottom-4 left-4 text-[10px] text-slate-800 pointer-events-none select-none opacity-50">Admin: admin@cloud.com | 123</div>
    </div>
  );
};

export default LoginPanel;
