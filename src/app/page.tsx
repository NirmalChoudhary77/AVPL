"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
// Inject Inter Font for Academic Authority
const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
  :root { font-family: 'Inter', sans-serif; }
`;
import { 
  Play, 
  FileText, 
  Video, 
  Download,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Info,
  ExternalLink,
  BookMarked,
  Shield,
  ArrowRight,
  Moon,
  Sun,
  Calculator,
  Lock,
  User,
  LogOut,
  BarChart3,
  Clock,
  Beaker,
  GraduationCap,
  X,
  Plus,
  Trash2,
  Settings,
  Save,
  PlusCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard
} from "lucide-react";

// Scroll reveal hook using IntersectionObserver
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}



const MOCK_DATA = {
  announcements: [
    { id: 1, title: "Spring 2026 Fault Simulations Released", date: "Mar 15, 2026" },
    { id: 2, title: "Notice: Server Maintenance Schedule", date: "Mar 10, 2026" },
    { id: 3, title: "New Relay Manuals Available", date: "Feb 28, 2026" },
  ],
  modules: [
    { 
      id: "EE-401", 
      title: "Overcurrent Protection & Coordination", 
      instructor: "Prof. R. Sharma",
      description: "A comprehensive investigation into IDMT characteristics, plug setting multipliers, and time/current grading for radial feeder protection.",
      videos: [
        { id: "v1", title: "Theory: Inverse Definite Minimum Time", duration: "45:00", thumbnail: "https://picsum.photos/640/360?random=1" },
        { id: "v2", title: "Simulation: Radial Feeder Faults", duration: "32:15", thumbnail: "https://picsum.photos/640/360?random=2" }
      ],
      manuals: [
        { id: "m1", title: "Experiment Manual: IDMT Relay Testing", size: "1.2 MB", type: "PDF" },
        { id: "m2", title: "PSM and TMS Calculation Sheet", size: "850 KB", type: "PDF" },
      ]
    },
    { 
      id: "EE-402", 
      title: "Distance & Impedance Relaying", 
      instructor: "Dr. A. Deshmukh",
      description: "Detailed study of mho, reactance, and impedance relay characteristics under various fault conditions in transmission lines.",
      videos: [
        { id: "v3", title: "Lecture: R-X Diagram Analysis", duration: "50:20", thumbnail: "https://picsum.photos/640/360?random=3" },
        { id: "v4", title: "Simulation: Zone 1 & 2 Reach Settings", duration: "28:40", thumbnail: "https://picsum.photos/640/360?random=4" }
      ],
      manuals: [
        { id: "m4", title: "Lab Reference: Distance Protection Zones", size: "2.1 MB", type: "PDF" },
        { id: "m5", title: "Impedance Trajectory Worksheets", size: "450 KB", type: "DOCX" }
      ]
    },
    { 
      id: "EE-403", 
      title: "Transformer Differential Protection", 
      instructor: "Prof. S. Patil",
      description: "Principles of percentage differential relaying, harmonic restraint for inrush currents, and biased characteristics for power transformers.",
      videos: [
        { id: "v5", title: "Theory: Biased Differential Schemes", duration: "41:10", thumbnail: "https://picsum.photos/640/360?random=5" },
        { id: "v6", title: "Practical: Magnetizing Inrush Restraint", duration: "38:55", thumbnail: "https://picsum.photos/640/360?random=6" }
      ],
      manuals: [
        { id: "m6", title: "Experiment: Transformer Fault Analysis", size: "1.8 MB", type: "PDF" },
        { id: "m7", title: "Harmonic Restraint Setting Guide", size: "500 KB", type: "PDF" }
      ]
    }
  ]
};

export default function AVMCPage() {
  const [labModules, setLabModules] = useState(MOCK_DATA.modules);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', id: '', instructor: '', description: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedModules = localStorage.getItem('avpl_lab_modules');
      if (savedModules) {
        try { setLabModules(JSON.parse(savedModules)); } catch (e) { console.error(e); }
      }
      const savedAdmin = localStorage.getItem('avpl_is_admin');
      if (savedAdmin) setIsAdmin(savedAdmin === 'true');
    }
  }, []);

  const currentUser = { 
    name: isAdmin ? 'Lab Administrator' : 'Gaurav Kumar', 
    id: isAdmin ? 'ADMIN-VJTI' : 'GK-2024-EE', 
    progress: { completed: 2, total: labModules.length } 
  };

  // Experiment workspace state
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('theory');
  const [psmValue, setPsmValue] = useState(2.0);
  const [tmsValue, setTmsValue] = useState(0.1);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const filterOptions = ["All", "Overcurrent", "Distance", "Differential"];
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredModules = labModules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const filterTerm = activeFilter === "All" ? "" : activeFilter;
    const matchesFilter = m.title.includes(filterTerm) || m.description.includes(filterTerm);
    return matchesSearch && matchesFilter;
  });

  // IDMT operating time calculation
  const calculateIDMT = (psm: number, tms: number) => {
    if (psm <= 1) return Infinity;
    return parseFloat((tms * 0.14 / (Math.pow(psm, 0.02) - 1)).toFixed(3));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@vjti.ac.in') {
      setIsAdmin(true);
    }
    setIsLoggedIn(true);
    setShowLogin(false);
    setLoginPass('');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('avpl_is_admin');
    }
  };

  // CRUD Handlers
  const deleteModule = (id: string) => {
    if (confirm('Are you sure you want to delete this module and all its resources?')) {
      setLabModules((prev: any[]) => prev.filter(m => m.id !== id));
      if (activeExperiment === id) setActiveExperiment(null);
    }
  };

  const addModule = () => {
    if (!newModule.title || !newModule.id) return;
    const moduleToAdd = {
      ...newModule,
      videos: [],
      manuals: []
    };
    setLabModules(prev => [...prev, moduleToAdd]);
    setShowAddModule(false);
    setNewModule({ title: '', id: '', instructor: '', description: '' });
  };

  const addVideo = (moduleId: string) => {
    const title = prompt("Video Title:");
    if (!title) return;
    const duration = prompt("Duration (e.g. 15:00):", "15:00") || "15:00";
    setLabModules((prev: any[]) => prev.map((m: any) => 
      m.id === moduleId ? { ...m, videos: [...m.videos, { id: 'v' + Date.now(), title, duration, thumbnail: 'https://picsum.photos/640/360?random=' + Date.now() }] } : m
    ));
  };

  const addManual = (moduleId: string) => {
    const title = prompt("Manual Title:");
    if (!title) return;
    setLabModules((prev: any[]) => prev.map((m: any) => 
      m.id === moduleId ? { ...m, manuals: [...m.manuals, { id: 'm' + Date.now(), title, size: '1.5 MB', type: 'PDF' }] } : m
    ));
  };

  const deleteVideo = (moduleId: string, videoId: string) => {
    setLabModules((prev: any[]) => prev.map((m: any) => 
      m.id === moduleId ? { ...m, videos: m.videos.filter((v: any) => v.id !== videoId) } : m
    ));
  };

  const deleteManual = (moduleId: string, manualId: string) => {
    setLabModules((prev: any[]) => prev.map((m: any) => 
      m.id === moduleId ? { ...m, manuals: m.manuals.filter((man: any) => man.id !== manualId) } : m
    ));
  };

  useEffect(() => {
    localStorage.setItem('avpl_lab_modules', JSON.stringify(labModules));
  }, [labModules]);

  // Scroll reveal refs
  const modulesReveal = useScrollReveal();
  const sidebarReveal = useScrollReveal();
  const footerReveal = useScrollReveal();

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
        setShowAddModule(false);
        setShowLogin(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'bg-[#0a0e1a] text-slate-200 selection:bg-blue-900' : 'bg-[#f4f6f8] text-slate-800 selection:bg-blue-200'}`}>
      <style dangerouslySetInnerHTML={{__html: `
        ${fontImport}
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
      `}} />
      

      {/* Two-Tier Navigation - MIT Authoritative Style */}
      <nav className={`sticky top-0 z-50 shadow-md transition-colors duration-500 ${darkMode ? 'bg-[#0f1629]' : 'bg-white'}`}>
        {/* Top Utility Tier */}
        <div className={`${darkMode ? 'bg-[#1a2236] text-slate-400' : 'bg-[#f8fafc] text-slate-500'} border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200'} py-2.5 px-6 lg:px-12`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.15em]">
            <div className="flex gap-6 items-center">
              <a href="#" className="hover:text-blue-500 transition-colors">Library</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Staff</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Support</a>
              <span className={`h-3 w-px ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
              <a href="https://vjti.ac.in" target="_blank" className="hover:text-blue-500 transition-colors group flex items-center gap-1.5">
                VJTI Home <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="flex items-center gap-6">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 transition-colors ${darkMode ? 'hover:text-white' : 'hover:text-[#01257d]'}`}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
              </button>

              {/* Auth Logic In Utility Tier */}
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${darkMode ? 'text-blue-300' : 'text-[#01257d]'}`}>
                    <User className="w-3.5 h-3.5" />
                    <span>{currentUser.name}</span>
                    {isAdmin && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[8px] font-black border border-red-500/20">
                        <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span> ADMIN
                      </span>
                    )}
                  </div>
                  <button onClick={handleLogout} className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className={`flex items-center gap-1.5 ${darkMode ? 'hover:text-white text-blue-400' : 'hover:text-[#1d0a42] text-[#01257d]'}`}
                >
                  <Lock className="w-3.5 h-3.5" /> Student Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Brand/Nav Tier */}
        <div className={`relative px-6 lg:px-12 py-5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#1d0a42] via-[#01257d] to-blue-400"></div>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-5 group cursor-pointer">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-[#1d0a42] text-white flex items-center justify-center font-sans font-black tracking-tighter uppercase underline-offset-4 decoration-2 text-xl shadow-lg group-hover:bg-[#01257d] transition-colors">
                V
              </div>
              <div className="flex flex-col">
                <span className={`font-sans font-extrabold tracking-tighter underline-offset-4 decoration-2 text-lg md:text-xl leading-tight ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>Actual Virtual Protection Lab</span>
                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 ${darkMode ? 'text-blue-400/80' : 'text-[#01257d]/80'}`}>Veermata Jijabai Technological Institute</span>
              </div>
            </div>
            
            {/* Main Links */}
            <div className="hidden lg:flex items-center gap-12">
              {['Research', 'Modules', 'Facilities', 'People'].map(link => (
                <a 
                  key={link} 
                  href={link === 'Modules' ? '#modules-section' : '#'} 
                  className={`font-sans font-bold text-[11px] uppercase tracking-[0.2em] transition-all relative group/navlink ${darkMode ? 'text-slate-300 hover:text-white' : 'text-[#1d0a42] hover:text-[#01257d]'}`}
                >
                  {link}
                  <span className={`absolute -bottom-1.5 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover/navlink:w-full`}></span>
                </a>
              ))}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#01257d] hover:bg-slate-100'} transition-all`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin: Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModule(false)}></div>
          <div className={`relative w-full max-w-lg mx-6 rounded-3xl shadow-2xl overflow-hidden animate-[popIn_0.3s_ease-out] ${darkMode ? 'bg-[#131a2e]' : 'bg-white'}`}>
            <div className="bg-[#1d0a42] p-6 text-white text-center">
              <h2 className="font-sans font-extrabold tracking-tighter underline-offset-4 decoration-2 text-xl">Create New Laboratory Module</h2>
              <p className="text-blue-200 text-xs mt-1">Expanding the AVPL Academic Infrastructure</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Course ID</label>
                  <input
                    type="text" value={newModule.id} onChange={e => setNewModule({...newModule, id: e.target.value})}
                    placeholder="e.g. EE-404"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white' : 'bg-slate-50 border border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Instructor</label>
                  <input
                    type="text" value={newModule.instructor} onChange={e => setNewModule({...newModule, instructor: e.target.value})}
                    placeholder="Prof. Name"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white' : 'bg-slate-50 border border-slate-200'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Module Title</label>
                <input
                  type="text" value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})}
                  placeholder="Experiment Name"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white' : 'bg-slate-50 border border-slate-200'}`}
                />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
                <textarea
                  value={newModule.description} onChange={e => setNewModule({...newModule, description: e.target.value})}
                  placeholder="Primary objective..." rows={3}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white' : 'bg-slate-50 border border-slate-200'}`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModule(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Cancel
                </button>
                <button onClick={addModule} className="flex-1 py-3 bg-[#01257d] text-white rounded-xl font-bold text-xs hover:bg-[#1d0a42] transition-all shadow-lg flex items-center justify-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Finalize Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Experiment Workspace Overlay */}
      {activeExperiment && (
        <div className="fixed inset-0 z-[90] animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setActiveExperiment(null); setActiveTab('theory'); }}></div>
          <div className={`relative w-full max-w-5xl mx-auto mt-8 mb-8 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-[popIn_0.3s_ease-out] ${darkMode ? 'bg-[#0f1629]' : 'bg-white'}`}>
            {/* Workspace Header */}
            <div className="bg-[#1d0a42] p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => { setActiveExperiment(null); setActiveTab('theory'); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">{activeExperiment} · Experiment Workspace</p>
                  <h2 className="font-sans font-extrabold tracking-tighter underline-offset-4 decoration-2 text-xl">
                    {labModules.find(m => m.id === activeExperiment)?.title || 'Module'}
                  </h2>
                </div>
              </div>
              <button onClick={() => { setActiveExperiment(null); setActiveTab('theory'); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className={`flex border-b shrink-0 ${darkMode ? 'border-slate-700 bg-[#131a2e]' : 'border-slate-200 bg-slate-50'}`}>
              {[{id: 'theory', label: 'Theory', icon: BookOpen}, {id: 'calculator', label: 'Calculator', icon: Calculator}, {id: 'videos', label: 'Videos', icon: Video}, {id: 'manuals', label: 'Manuals', icon: FileText}].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-[#01257d] text-[#01257d]' : `border-transparent ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto p-8 flex-1">
              {activeTab === 'theory' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-[#1a2236] border border-slate-700' : 'bg-blue-50 border border-blue-100'}`}>
                    <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>Experiment Objective</h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {labModules.find(m => m.id === activeExperiment)?.description}
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-[#1a2236] border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                    <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>Prerequisites</h3>
                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#01257d] rounded-full"></span>Basic knowledge of power system protection</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#01257d] rounded-full"></span>Understanding of relay coordination principles</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#01257d] rounded-full"></span>Familiarity with IDMT relay characteristics</li>
                    </ul>
                  </div>
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-[#1a2236] border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                    <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>Submission Guidelines</h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Submit your completed lab report via the student portal within 7 days of the experiment. Include all observations, calculations, and the signed attendance sheet. Reports must follow the departmental format (PDF, max 10 MB).
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'calculator' && (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                  <div className={`p-8 rounded-2xl ${darkMode ? 'bg-[#1a2236] border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-[#01257d] text-white rounded-xl">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>IDMT Relay Operating Time</h3>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Standard Inverse (IEC 60255)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>PSM (Plug Setting Multiplier)</label>
                        <input
                          type="range" min="1.1" max="10" step="0.1" value={psmValue}
                          onChange={e => setPsmValue(parseFloat(e.target.value))}
                          className="w-full accent-[#01257d]"
                        />
                        <div className={`text-2xl font-black mt-2 ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>{psmValue.toFixed(1)}</div>
                      </div>
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>TMS (Time Multiplier Setting)</label>
                        <input
                          type="range" min="0.05" max="1.0" step="0.05" value={tmsValue}
                          onChange={e => setTmsValue(parseFloat(e.target.value))}
                          className="w-full accent-[#01257d]"
                        />
                        <div className={`text-2xl font-black mt-2 ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>{tmsValue.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className={`p-6 rounded-2xl text-center ${darkMode ? 'bg-[#0f1629] border border-slate-600' : 'bg-white border border-slate-300'}`}>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Calculated Operating Time</p>
                      <p className={`text-5xl font-black ${darkMode ? 'text-blue-400' : 'text-[#01257d]'}`}>
                        {calculateIDMT(psmValue, tmsValue) === Infinity ? '∞' : calculateIDMT(psmValue, tmsValue)}
                        <span className="text-lg font-bold ml-1">sec</span>
                      </p>
                      <p className={`text-xs mt-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Formula: t = TMS × 0.14 / (PSM<sup>0.02</sup> − 1)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  {isAdmin && (
                    <div className="flex justify-end">
                      <button 
                        onClick={() => addVideo(activeExperiment!)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md"
                      >
                        <PlusCircle className="w-4 h-4" /> Add Instructional Video
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {labModules.find(m => m.id === activeExperiment)?.videos.map(v => (
                      <div key={v.id} className={`group/workvideo rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 relative ${darkMode ? 'bg-[#1a2236] border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}
                        onClick={() => setSelectedVideo(v)}
                      >
                        {isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteVideo(activeExperiment!, v.id); }}
                            className="absolute top-3 right-3 z-20 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover/workvideo:opacity-100 transition-opacity hover:bg-red-600 shadow-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="relative aspect-video">
                          <img src={v.thumbnail} className="w-full h-full object-cover" alt={v.title} />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-[#01257d] ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded">{v.duration}</div>
                        </div>
                        <div className="p-4">
                          <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{v.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'manuals' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  {isAdmin && (
                    <div className="flex justify-end">
                      <button 
                        onClick={() => addManual(activeExperiment!)}
                        className="bg-[#01257d] hover:bg-[#1d0a42] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md"
                      >
                        <PlusCircle className="w-4 h-4" /> Register New Manual
                      </button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {labModules.find(m => m.id === activeExperiment)?.manuals.map(m => (
                      <div key={m.id} className={`flex items-center justify-between p-5 rounded-2xl transition-all hover:-translate-y-0.5 group/workman ${darkMode ? 'bg-[#1a2236] border border-slate-700 hover:border-blue-500/30' : 'bg-slate-50 border border-slate-200 hover:border-[#01257d]/30'}`}>
                        <a href="#" className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-[#01257d]/10 text-[#01257d]'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{m.title}</p>
                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{m.size} · {m.type}</p>
                          </div>
                        </a>
                        <div className="flex items-center gap-3">
                          {isLoggedIn && isAdmin && (
                            <button 
                              onClick={() => deleteManual(activeExperiment!, m.id)}
                              className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <Download className={`w-5 h-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Hero Section - Replaced by Command Center when logged in */}
      {isLoggedIn ? (
        <header className="relative pt-8 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-[#1d0a42]">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f4f6f8] to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Active Session: Phase 2 Analysis
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-3xl font-sans font-black leading-tight mb-4 tracking-tighter uppercase">
                  {isAdmin ? 'Administrative Management' : 'Student Command Center'}
                </h1>
                <p className="text-lg md:text-xl text-blue-200/90 font-medium max-w-2xl leading-relaxed">
                  Welcome, <span className="text-white font-bold">{currentUser.name}</span>. Your personalized laboratory dashboard for research and simulations.
                </p>
              </div>
              <div className="flex flex-col items-end text-right">
                <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Institutional ID</div>
                <div className="text-xl font-sans font-black text-white mb-4 tracking-tighter">{currentUser.id}</div>
                <div className="flex gap-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl">
                    <div className="text-xl font-bold">
                      {mounted ? `${currentUser.progress.completed}/${currentUser.progress.total}` : 'Loading...'}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl">
                    <div className="text-[10px] uppercase font-black tracking-tighter opacity-60">Avg. Grade</div>
                    <div className="text-xl font-bold text-green-400">A-</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: isAdmin ? 'Admin Insight' : 'Quick Resume', val: isAdmin ? 'Manage All Modules' : 'IDMT Relay Analysis', sub: isAdmin ? 'Admin Override Active' : 'Last active 2h ago', icon: isAdmin ? Settings : Play, color: 'bg-blue-600' },
                { label: isAdmin ? 'Lab Status' : 'Upcoming Lab', val: isAdmin ? 'Simulations Online' : 'Transformer protection', sub: isAdmin ? '12 Nodes Verified' : 'Monday, 10:30 AM', icon: isAdmin ? Shield : Clock, color: 'bg-indigo-600' },
                { label: isAdmin ? 'User Traffic' : 'Research Goal', val: isAdmin ? '42 Active Students' : 'Wide-Area Protection', sub: isAdmin ? 'Peak Load: 2:00 PM' : 'Phase 3: Coordination', icon: isAdmin ? User : BarChart3, color: 'bg-purple-600' },
                { label: isAdmin ? 'Storage' : 'Lab Status', val: isAdmin ? '1.2 GB Assets' : 'Station 4 Online', sub: isAdmin ? '92% Capacity' : 'Systems operational', icon: isAdmin ? Save : CheckCircle2, color: 'bg-emerald-600' }
              ].map((card, i) => (
                <div key={i} className="group cursor-pointer bg-white/5 backdrop-blur-md border border-white/20 hover:border-white/40 hover:bg-white/10 p-6 rounded-3xl transition-all duration-300">
                  <div className={`w-10 h-10 ${card.color} text-white rounded-xl mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-[#818cf8] mb-1">{card.label}</div>
                  <div className="text-base font-bold text-white mb-1 leading-tight">{card.val}</div>
                  <div className="text-xs text-blue-200/60 font-medium">{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </header>
      ) : (
        <header className="relative pt-16 pb-20 overflow-hidden bg-[#1d0a42]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f4f6f8] to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-white">
              <div>
                <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  VJTI Digital Power Systems Lab
                </div>
                <h1 className="text-5xl lg:text-7xl font-sans font-black leading-[0.9] mb-6 tracking-tighter uppercase">
                  Advancing Power <br />
                  <span className="text-blue-300">Protection</span> Science
                </h1>
                <p className="text-xl text-blue-100/80 font-medium max-w-xl leading-relaxed">
                  A high-fidelity virtual environment for exploring complex relay coordination, fault analysis, and smart grid resilience.
                </p>
              </div>
              <div className="flex flex-wrap gap-5">
                <button 
                  onClick={() => setShowLogin(true)}
                  className="bg-[#01257d] hover:bg-[#003da5] text-white px-8 py-4 rounded-full font-bold text-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  Start Simulation <Play className="w-4 h-4 fill-current" />
                </button>
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1d0a42] overflow-hidden bg-slate-800">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                  <div className="pl-6 text-xs font-bold text-blue-200">
                    Join <span className="text-white">1,200+</span> Students
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative w-full max-w-xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                  alt="Laboratory Equipment"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d0a42]/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Research Impact</span>
                  </div>
                  <p className="text-sm font-bold leading-relaxed">
                    Developing decentralized protection schemes for renewable-heavy distribution networks.
                  </p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#01257d] rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8" id="modules-section">
        {/* Left Column (Main Modules) */}
        <div className="lg:col-span-8 space-y-10">

          <div ref={modulesReveal.ref} className={`scroll-reveal ${modulesReveal.isVisible ? 'visible' : ''} space-y-6`}>
            <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 ${darkMode ? 'border-b-2 border-slate-600' : 'border-b-2 border-slate-300'}`}>
              <div>
                <h2 className={`text-3xl font-bold font-sans tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-[#03045e]'}`}>Course Modules</h2>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${darkMode ? 'text-blue-300 bg-blue-500/10' : 'text-[#01257d] bg-[#1e61ea]/10'}`}>
                  {mounted ? filteredModules.length : MOCK_DATA.modules.length} Modules Available
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search modules..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all shadow-sm ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-white border border-slate-300 focus:border-[#1e61ea] focus:ring-[#1e61ea]/20'}`}
                />
                <svg className={`w-4 h-4 absolute right-3 top-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-300 ${activeFilter === filter ? "bg-[#01257d] text-white shadow-md scale-105" : darkMode ? "bg-[#1a2236] text-slate-400 border border-slate-700 hover:border-blue-500 hover:text-blue-400" : "bg-white text-slate-500 border border-slate-200 hover:border-[#01257d] hover:text-[#01257d]"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-12">
            {isLoggedIn && isAdmin && (
              <div 
                onClick={() => setShowAddModule(true)}
                className={`group cursor-pointer border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/5 ${darkMode ? 'border-slate-700 bg-slate-800/20' : 'border-slate-300 bg-slate-50'}`}
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#1d0a42]'}`}>Add New Module</h3>
                <p className={`text-sm text-center mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Create a new academic experiment topic with videos and manuals.</p>
              </div>
            )}
            
            {filteredModules.length === 0 && !isAdmin ? (
              <div className={`text-center py-16 rounded-3xl shadow-sm animate-[fadeIn_0.3s_ease-out] ${darkMode ? 'bg-[#131a2e] border border-slate-700' : 'bg-white border border-slate-200'}`}>
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                   <svg className={`w-8 h-8 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <p className={`font-bold text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No modules found.</p>
                 <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your search or filters.</p>
              </div>
            ) : filteredModules.map((module, idx) => (
              <div 
                key={module.id} 
                className="group/module bg-[#01257d] rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-[#01257d]/30 overflow-hidden transition-all duration-300 relative hover:scale-[1.01] animate-[fadeInUp_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
              >
                {/* Accent Dot Pattern overlay inside the card (Inspiration from Screenshot 3) */}
                <div 
                  className="absolute top-0 left-0 bottom-0 w-56 border-none opacity-40 pointer-events-none mix-blend-color-dodge" 
                  style={{ backgroundImage: 'radial-gradient(circle at center, #818cf8 4px, transparent 4px)', backgroundSize: '24px 24px' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#01257d]/95 to-[#01257d] pointer-events-none"></div>

                {/* Module Header */}
                <div className="p-8 pb-6 border-b border-white/10 relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[#818cf8] text-[11px] font-black uppercase tracking-widest block">
                      {module.id} &bull; Required Program
                    </span>
                    {isLoggedIn && isAdmin && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteModule(module.id)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => setActiveExperiment(module.id)} className="inline-flex items-start gap-2 mb-4 group/title text-white hover:text-[#e0f2fe] transition-colors text-left">
                    <h3 className="text-[1.7rem] sm:text-3xl font-bold font-sans leading-tight tracking-tight">
                      {module.title}
                    </h3>
                    <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 group-hover/title:translate-x-1.5 transition-transform stroke-[2.5] shrink-0" />
                  </button>

                  <p className="text-[15px] text-blue-100 mb-6 leading-relaxed font-medium">{module.description}</p>
                  
                  <div className="text-sm text-blue-200 font-bold flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 border border-white/20 shadow-inner flex items-center justify-center text-[#e0f2fe] rounded-full">
                      <span className="text-xs uppercase font-black">{module.instructor.charAt(0)}</span>
                    </div>
                    {module.instructor}
                  </div>
                </div>
                
                {/* Module Content */}
                <div className="p-8 pt-6 relative z-10 bg-[#001755]/40 backdrop-blur-sm">
                  {/* Videos Section */}
                  <div className="mb-10">
                    <h4 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#818cf8]"/> 
                        Instructional Media
                      </div>
                      {isLoggedIn && isAdmin && (
                        <button 
                          onClick={() => addVideo(module.id)}
                          className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 text-[9px] transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Video
                        </button>
                      )}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {module.videos.map(v => (
                        <div 
                          key={v.id} 
                          onClick={() => setSelectedVideo(v)}
                          className="relative group/video cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-white/30 hover:bg-white/10 hover:scale-[1.02] shadow-sm transition-all duration-300"
                        >
                          <div className="relative aspect-video bg-slate-900 mb-4 border border-white/10 overflow-hidden rounded-xl">
                            <img src={v.thumbnail} className="object-cover w-full h-full opacity-70 group-hover/video:opacity-100 transition-opacity" alt="Video thumbnail" />
                            <div className="absolute inset-0 bg-black/20 group-hover/video:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                              <div className="w-14 h-14 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-all duration-300 scale-75 group-hover/video:scale-100">
                                <Play className="w-6 h-6 text-[#01257d] ml-1.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/95 text-white text-[10px] font-bold px-2 py-1 shadow-sm uppercase tracking-wider rounded">
                              {v.duration}
                            </div>
                          </div>
                          <p className="text-[14px] font-bold text-white leading-snug group-hover/video:text-white transition-colors line-clamp-1">{v.title}</p>
                          {isLoggedIn && isAdmin && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteVideo(module.id, v.id); }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover/video:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manuals Section */}
                  <div>
                    <h4 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-5 flex items-center justify-between border-t border-white/10 pt-8">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#e0f2fe]"/> 
                        Laboratory Manuals
                      </div>
                      {isLoggedIn && isAdmin && (
                        <button 
                          onClick={() => addManual(module.id)}
                          className="bg-[#e0f2fe] hover:bg-white text-[#01257d] px-3 py-1 rounded-lg flex items-center gap-1.5 text-[9px] transition-all font-black"
                        >
                          <Plus className="w-3 h-3" /> Add Manual
                        </button>
                      )}
                    </h4>
                    <div className="space-y-3">
                      {module.manuals.map((m, idx) => (
                        <a 
                          href="#" 
                          key={m.id}
                          className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group/download shadow-sm hover:border-transparent hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <span className="absolute inset-0 bg-[#000a30] origin-left scale-x-0 group-hover/download:scale-x-100 transition-transform duration-500 ease-in-out pointer-events-none"></span>
                          <div className="flex items-center gap-4 mb-2 sm:mb-0 relative z-10">
                            <div className="p-2.5 bg-white/10 border border-white/10 shadow-inner rounded-xl text-blue-200 group-hover/download:text-[#e0f2fe] group-hover/download:border-[#e0f2fe]/30 group-hover/download:bg-white/20 transition-colors">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-[14px] font-bold text-white group-hover/download:text-[#e0f2fe] transition-colors">{m.title}</span>
                          </div>
                          <div className="flex items-center gap-4 sm:ml-4 relative z-10">
                            <span className="text-[10px] text-blue-200 font-bold tracking-widest bg-white/5 border border-white/10 rounded-full px-3 py-1">{m.size} &bull; {m.type}</span>
                            {isLoggedIn && isAdmin ? (
                              <button 
                                onClick={(e) => { e.preventDefault(); deleteManual(module.id, m.id); }}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <Download className="w-5 h-5 text-blue-200 group-hover/download:text-[#e0f2fe] transition-colors" />
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div ref={sidebarReveal.ref} className={`scroll-reveal ${sidebarReveal.isVisible ? 'visible' : ''} lg:col-span-4 space-y-8`}>

          {/* Need Assistance? Widget */}
          <div className="group/help bg-[#1d0a42] border-2 border-transparent hover:border-[#01257d]/30 transition-colors p-8 text-white shadow-xl shadow-[#1d0a42]/10 relative overflow-hidden rounded-3xl opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]" style={{ animationDelay: '0.3s' }}>
             <div className="absolute top-0 right-0 w-40 h-40 bg-[#01257d] opacity-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <a href="#" className="inline-flex items-start gap-2 mb-6 group/helpTitle text-white hover:text-[#e0f2fe] transition-colors">
               <h3 className="font-sans font-bold text-3xl leading-tight">
                 Need Assistance?
               </h3>
               <ChevronRight className="w-7 h-7 stroke-[2.5] group-hover/helpTitle:translate-x-1.5 transition-transform mt-0.5" />
             </a>
             
             <ul className="text-slate-300 text-[15px] space-y-5 mb-8 leading-relaxed font-medium">
                <li className="flex items-start gap-3">
                   <span className="mt-2 w-1.5 h-1.5 bg-[#818cf8] rounded-full shrink-0"></span>
                   Contact the department IT desk if you encounter simulation errors.
                </li>
                <li className="flex items-start gap-3">
                   <span className="mt-2 w-1.5 h-1.5 bg-[#818cf8] rounded-full shrink-0"></span>
                   Review the prerequisites and ensure your computational skills are aligned with the module required.
                </li>
             </ul>

             <button className="w-full bg-[#01257d] text-white font-bold text-[15px] py-4 rounded-full shadow-lg hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2 group/btn hover:bg-[#e0f2fe] hover:text-[#01257d]">
               <span className="relative z-10 flex items-center justify-center gap-2">
                 Contact Support <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform duration-300 stroke-[2.5]" />
               </span>
             </button>
          </div>

          {/* Announcements Widget */}
          <div className={`${darkMode ? 'bg-[#131a2e] border-t-4 border-blue-500 border-x border-b border-slate-700/50' : 'bg-white border-t-4 border-[#03045e] border-x border-b border-slate-200'} shadow-sm overflow-hidden rounded-2xl transition-colors duration-500`}>
            <div className={`p-6 flex items-center gap-2.5 ${darkMode ? 'bg-[#0f1629] border-b border-slate-700' : 'bg-slate-50 border-b border-slate-200'}`}>
              <Info className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-[#03045e]'}`} />
              <h3 className={`text-[13px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-800'}`}>Notice Board</h3>
            </div>
            <div className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              {MOCK_DATA.announcements.map(announcement => (
                <div key={announcement.id} className={`p-6 transition-colors cursor-pointer group ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-blue-400' : 'text-[#0d6efd]'}`}>{announcement.date}</p>
                  <a href="#" className={`text-[15px] font-bold leading-snug block transition-colors ${darkMode ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-[#0d6efd]'}`}>
                    {announcement.title}
                  </a>
                </div>
              ))}
            </div>
            <div className={`p-5 text-center ${darkMode ? 'bg-[#0f1629] border-t border-slate-700' : 'bg-slate-50 border-t border-slate-100'}`}>
              <a href="#" className={`text-xs font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-1 group/all ${darkMode ? 'text-blue-400' : 'text-[#0d6efd]'}`}>
                View All <ChevronRight className="w-3 h-3 stroke-[3] group-hover/all:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${darkMode ? 'bg-[#131a2e] border-t-4 border-blue-500 border-x border-b border-slate-700/50' : 'bg-white border-t-4 border-[#03045e] border-x border-b border-slate-200'} shadow-sm overflow-hidden rounded-2xl transition-colors duration-500`}>
            <div className={`p-6 flex items-center gap-2.5 ${darkMode ? 'bg-[#0f1629] border-b border-slate-700' : 'bg-slate-50 border-b border-slate-200'}`}>
              <BookMarked className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-[#03045e]'}`} />
              <h3 className={`text-[13px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-800'}`}>Quick Links</h3>
            </div>
            <div className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-50'}`}>
              {[{icon: BookOpen, label: 'Academic Calendar'}, {icon: ExternalLink, label: 'Department Website'}, {icon: Shield, label: 'Standard Safety Procedures'}].map((item, i) => (
                <a key={i} href="#" className={`flex items-center gap-4 p-6 text-[15px] font-bold transition-colors group/link ${darkMode ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-800/50' : 'text-slate-700 hover:text-[#0d6efd] hover:bg-slate-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-800 border border-slate-700 group-hover/link:bg-blue-500/10 group-hover/link:border-blue-500/30' : 'bg-slate-100 border border-slate-200 group-hover/link:bg-white group-hover/link:border-[#0d6efd] group-hover/link:shadow-sm'}`}>
                    <item.icon className={`w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-hover/link:text-blue-400' : 'text-slate-400 group-hover/link:text-[#0d6efd]'}`} /> 
                  </div>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <footer ref={footerReveal.ref} className={`scroll-reveal ${footerReveal.isVisible ? 'visible' : ''} ${darkMode ? 'bg-[#060a14] border-t border-slate-800' : 'bg-slate-900'} text-slate-400 py-16 mt-8 transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-[15px]">
          <div className="md:col-span-1">
            <div className={`w-12 h-12 ${darkMode ? 'bg-blue-600' : 'bg-[#023e8a]'} text-white flex items-center justify-center font-sans font-black tracking-tighter uppercase underline-offset-4 decoration-2 text-2xl mb-6 shadow-sm rounded-md`}>
              V
            </div>
            <p className="font-sans font-extrabold tracking-tighter underline-offset-4 decoration-2 text-white text-xl mb-3">VJTI Mumbai</p>
            <p className="leading-relaxed text-sm">H. R. Mahajani Marg, Matunga<br/>Mumbai, Maharashtra 400019</p>
            <p className="text-xs mt-4 text-slate-500">Autonomous Institute affiliated to the University of Mumbai</p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-6">Lab Resources</h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Simulation Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Protection Lab Manuals</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Research Publications</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-6">Institute</h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Central Library</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Student Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>EE Department</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[11px] mb-6">Legal</h4>
            <ul className="space-y-3 font-semibold text-sm">
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Accessibility</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 relative group w-max"><span className="w-0 group-hover:w-2 transition-all bg-[#818cf8] h-0.5"></span>Terms of Use</a></li>
            </ul>
          </div>
        </div>
        <div className={`max-w-6xl mx-auto px-6 mt-16 pt-8 text-[11px] font-bold tracking-widest uppercase ${darkMode ? 'border-t border-slate-800/50' : 'border-t border-slate-800'}`}>
          <p>&copy; 2026 Veermata Jijabai Technological Institute. All rights reserved. E-MC² Digital Infrastructure.</p>
        </div>
      </footer>

      {/* Video Modal Overlay */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setSelectedVideo(null)}>
          <div className="absolute inset-0 bg-[#020420]/80 backdrop-blur-md"></div>
          <div 
            className="relative z-10 w-full max-w-5xl bg-[#010b2b] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] scale-95 animate-[popIn_0.4s:0.1s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 group/close"
              onClick={() => setSelectedVideo(null)}
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Video Player Area */}
            <div className="flex-1 bg-black aspect-[16/9] md:aspect-auto relative flex items-center justify-center group/player overflow-hidden">
              <img src={selectedVideo.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Video cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40"></div>
              
              <div className="w-20 h-20 bg-white text-[#010b2b] rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition-all relative z-10 duration-300">
                <Play className="w-8 h-8 ml-2 fill-current" />
              </div>

              {/* Fake Player Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 opacity-0 translate-y-4 group-hover/player:opacity-100 group-hover/player:translate-y-0 transition-all duration-300">
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress relative">
                  <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-[#818cf8]"></div>
                  <div className="absolute top-1/2 -mt-2 left-1/3 -ml-2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex items-center justify-between text-white text-xs font-bold font-sans">
                  <div className="flex items-center gap-4">
                    <Play className="w-5 h-5 fill-current cursor-pointer hover:text-[#818cf8] transition-colors" />
                    <span className="tracking-wider">12:04 / {selectedVideo.duration}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-5 h-5 cursor-pointer hover:text-[#818cf8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 001.707-.707V5a1 1 0 00-1.707-.707L10.293 7.707A1 1 0 019.586 8H7a2 2 0 00-2 2z"/></svg>
                    <svg className="w-5 h-5 cursor-pointer hover:text-[#818cf8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar Details & Transcript */}
            <div className="w-full md:w-80 bg-[#01144c] border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-72 md:h-auto">
              <div className="p-6 border-b border-white/10 bg-[#000a29]">
                <h3 className="text-white font-bold text-lg mb-3 leading-snug">{selectedVideo.title}</h3>
                <div className="flex items-center gap-2 text-blue-300 text-[11px] font-black tracking-widest uppercase">
                  <span className="bg-[#818cf8]/20 border border-[#818cf8]/30 text-[#818cf8] px-2 py-1 rounded">Required</span>
                  <span>{selectedVideo.duration} Track</span>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-5 flex items-center gap-2">
                  <span className="w-6 h-px bg-white/20"></span>
                  Transcript Auto-Sync
                </h4>
                <div className="space-y-5 text-[13px] leading-relaxed">
                  <p className="text-[#33ffc2] cursor-pointer group/trans"><span className="opacity-60 mr-3 text-[10px] font-mono group-hover/trans:opacity-100 transition-opacity">11:45</span>And here we observe the back EMF building up across the armature terminals...</p>
                  <p className="text-white/60 hover:text-white cursor-pointer transition-colors group/trans"><span className="opacity-60 mr-3 text-[10px] font-mono group-hover/trans:opacity-100 transition-opacity">12:04</span>Notice the inverse relationship with the field current. As we increase resistance...</p>
                  <p className="text-white/60 hover:text-white cursor-pointer transition-colors group/trans"><span className="opacity-60 mr-3 text-[10px] font-mono group-hover/trans:opacity-100 transition-opacity">12:20</span>By regulating the rheostat resistance, we limit the starting current effectively.</p>
                  <p className="text-white/60 hover:text-white cursor-pointer transition-colors group/trans"><span className="opacity-60 mr-3 text-[10px] font-mono group-hover/trans:opacity-100 transition-opacity">12:45</span>So, if you recall from the theoretical derivations in chapter four...</p>
                  <p className="text-white/60 hover:text-white cursor-pointer transition-colors group/trans"><span className="opacity-60 mr-3 text-[10px] font-mono group-hover/trans:opacity-100 transition-opacity">13:10</span>This directly applies to the Ward-Leonard control scheme we see here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-[#020420]/70 backdrop-blur-md" onClick={() => setShowLogin(false)}></div>
          <div className={`relative z-10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-[popIn_0.3s_ease-out] ${darkMode ? 'bg-[#131a2e]' : 'bg-white'}`}>
            <div className="bg-[#1d0a42] p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Lock className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="font-sans font-extrabold tracking-tighter underline-offset-4 decoration-2 text-2xl">Institutional Access</h2>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mt-2">Veermata Jijabai Technological Institute</p>
            </div>
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Official Email</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="name@vjti.ac.in"
                    className={`w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all shadow-sm ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white focus:border-blue-500' : 'bg-slate-50 border border-slate-200 focus:border-[#01257d]'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Security Credential</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password" required value={loginPass} onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all shadow-sm ${darkMode ? 'bg-[#1a2236] border border-slate-600 text-white focus:border-blue-500' : 'bg-slate-50 border border-slate-200 focus:border-[#01257d]'}`}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-[#01257d] text-white rounded-2xl font-bold text-sm hover:bg-[#1d0a42] transition-all shadow-xl hover:scale-[1.02] active:scale-95"
              >
                Authenticate Session
              </button>
              <p className={`text-center text-[11px] leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Unauthorized access is strictly prohibited and logged.<br/>
                For admin privileges, use your institutional handle.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
