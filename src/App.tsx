import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  Paintbrush, 
  Sprout, 
  User, 
  Sparkles, 
  Activity, 
  BookOpen, 
  ArrowRight,
  Server,
  Heart,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Coins,
  LogOut
} from "lucide-react";
import MapArtCalculator from "./components/MapArtCalculator";
import FarmCalculator from "./components/FarmCalculator";
import PlayerTracker from "./components/PlayerTracker";
import LoginSignup from "./components/LoginSignup";
import LiveChat from "./components/LiveChat";

// Blue Pixel Donut matching the theme
const DonutLogoSVG = () => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 16 16" 
    className="w-12 h-12 animate-donut-float drop-shadow-[0_0_15px_rgba(0,102,255,0.85)]" 
    style={{ imageRendering: 'pixelated' }}
  >
    {/* Dark brown dough base outline */}
    <rect x="5" y="1" width="6" height="1" fill="#1b110a" />
    <rect x="3" y="2" width="10" height="1" fill="#1b110a" />
    <rect x="2" y="3" width="12" height="1" fill="#1b110a" />
    <rect x="1" y="5" width="14" height="6" fill="#1b110a" />
    <rect x="2" y="11" width="12" height="1" fill="#1b110a" />
    <rect x="3" y="12" width="10" height="1" fill="#1b110a" />
    <rect x="5" y="13" width="6" height="1" fill="#1b110a" />
    
    {/* Golden dough core */}
    <rect x="5" y="2" width="6" height="1" fill="#c48a55" />
    <rect x="3" y="3" width="10" height="1" fill="#c48a55" />
    <rect x="2" y="4" width="12" height="1" fill="#c48a55" />
    <rect x="2" y="5" width="12" height="6" fill="#c48a55" />
    <rect x="3" y="11" width="10" height="1" fill="#c48a55" />
    <rect x="5" y="12" width="6" height="1" fill="#c48a55" />

    {/* Bright blue icing */}
    <rect x="5" y="2" width="5" height="1" fill="#0055ff" />
    <rect x="3" y="3" width="9" height="1" fill="#0055ff" />
    <rect x="2" y="4" width="11" height="1" fill="#0055ff" />
    <rect x="2" y="5" width="11" height="5" fill="#0055ff" />
    <rect x="3" y="10" width="8" height="1" fill="#0055ff" />
    <rect x="5" y="11" width="5" height="1" fill="#0055ff" />

    {/* Fluffy sky blue icing highlight */}
    <rect x="5" y="3" width="3" height="1" fill="#00d5ff" />
    <rect x="3" y="4" width="4" height="1" fill="#00d5ff" />
    <rect x="3" y="5" width="2" height="1" fill="#00d5ff" />

    {/* Hole in center */}
    <rect x="7" y="7" width="2" height="2" fill="#020206" />
    {/* Dark inside edge of the hole */}
    <rect x="7" y="6" width="2" height="1" fill="#1b110a" />
    <rect x="7" y="9" width="2" height="1" fill="#1b110a" />
    <rect x="6" y="7" width="1" height="2" fill="#1b110a" />
    <rect x="9" y="7" width="1" height="2" fill="#1b110a" />

    {/* Sprinkles (white, yellow, sky blue) */}
    <rect x="4" y="4" width="1" height="1" fill="#ffffff" />
    <rect x="10" y="4" width="1" height="1" fill="#ffd000" />
    <rect x="3" y="7" width="1" height="1" fill="#ffffff" />
    <rect x="11" y="7" width="1" height="1" fill="#ffd000" />
    <rect x="5" y="8" width="1" height="1" fill="#ffffff" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("donutsmp_logged_in_user");
  });
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedMapArt, setSelectedMapArt] = useState<{
    name: string;
    imageSrc: string;
    gridSize: string;
  } | null>(null);

  const handleLoginSuccess = (username: string) => {
    setUser(username);
    localStorage.setItem("donutsmp_logged_in_user", username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("donutsmp_logged_in_user");
  };

  // Guard access if not logged in
  if (!user) {
    return <LoginSignup onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#020206] text-zinc-100 font-sans selection:bg-[#0055ff]/30 selection:text-sky-200 pb-12 relative overflow-x-hidden">
      
      {/* Background Neon Glowing Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] aspect-square bg-[#0055ff]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-[#00d5ff]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed top-[30%] left-[50%] w-[40%] aspect-square bg-[#0055ff]/3 blur-[130px] rounded-full pointer-events-none animate-pulse" />

      {/* Decorative Store Top Bar */}
      <div className="bg-[#0055ff] h-1.5 w-full shadow-[0_2px_10px_#0055ff]" />

      {/* Main Header navigation */}
      <header className="sticky top-0 z-50 bg-[#020206]/95 border-b-4 border-[#141126] px-4 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Logo / Title with blue theme */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <DonutLogoSVG />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-pixel uppercase neon-text-blue flex items-center gap-2">
                  Donut<span className="text-[#0055ff]">calc</span>
                </h1>
              </div>
              <span className="text-xs text-zinc-400 font-bold font-mono tracking-wider block mt-0.5 uppercase">
                Economy Hub & Crafting Companion
              </span>
            </div>
          </div>

          {/* Retro Pixel Tab Selection Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <nav className="flex flex-wrap items-center bg-[#0d0914] p-1.5 rounded-xl border-4 border-[#221733] shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar justify-center">
              {[
                { id: "dashboard", label: "Dashboard", icon: Compass },
                { id: "mapart", label: "Map Art Calculator", icon: Paintbrush },
                { id: "farms", label: "Farm Calculator", icon: Sprout },
                { id: "players", label: "Player Tracker", icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative flex-shrink-0 cursor-pointer min-h-[44px] ${
                      isActive
                        ? "text-white font-pixel bg-[#0055ff]/20 border-2 border-[#0055ff] shadow-lg shadow-[#0055ff]/10"
                        : "text-zinc-400 hover:text-zinc-200 border-2 border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#0055ff]" : "text-zinc-400"}`} />
                    <span className={isActive ? "font-pixel uppercase text-[10px]" : "uppercase text-[10px]"}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Logged in User Tag & Logout */}
            <div className="flex items-center gap-2 bg-[#0d0914] px-3.5 py-2 rounded-xl border-4 border-[#221733] text-xs font-bold font-mono text-zinc-400 self-stretch sm:self-auto justify-between">
              <span className="text-[#00d5ff] font-bold">👤 {user}</span>
              <button 
                onClick={handleLogout}
                title="Sign Out"
                className="ml-3 hover:text-red-400 transition-all cursor-pointer p-0.5"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        
        {/* Live Minecraft Server Chat (Left Side) */}
        <LiveChat user={user} />

        {/* Actionable Content Tabs (Right Side) */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Hero Banner */}
                <div className="bg-gradient-to-br from-[#120b18] to-[#040106] border-4 border-[#0055ff] rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl neon-glow-blue">
                  <div className="absolute top-[-50px] right-[-50px] opacity-[0.04] pointer-events-none hidden lg:block">
                    <Server className="w-96 h-96 text-[#0055ff]" />
                  </div>
                  
                  <div className="space-y-5 relative z-10 max-w-3xl">
                    <span className="text-xs font-pixel bg-gradient-to-r from-[#0055ff] to-[#00d5ff] text-white border-2 border-[#00d5ff]/40 rounded-lg px-3 py-1.5 uppercase shadow-md tracking-wider inline-block">
                      ⚡ SURVIVAL TOOLKIT
                    </span>
                    
                    <h2 className="text-3xl md:text-5xl font-black text-white font-pixel tracking-wide uppercase leading-tight">
                      Donut<span className="text-[#0055ff] neon-text-blue">calc</span>
                    </h2>
                    
                    <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl font-medium">
                      A helper tool designed to calculate Map Art materials, compute farm crop & spawner profits, and analyze player statistics.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button
                        onClick={() => setActiveTab("mapart")}
                        className="px-6 py-3.5 bg-gradient-to-r from-[#0055ff] to-[#00d5ff] hover:scale-105 hover:from-[#3377ff] hover:to-[#33e0ff] text-zinc-950 font-pixel text-xs font-bold rounded-xl border-b-4 border-r-4 border-zinc-950 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all cursor-pointer shadow-lg flex items-center gap-2"
                      >
                        <span>MAP ART CALCULATOR</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => setActiveTab("farms")}
                        className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-pixel text-xs font-bold rounded-xl border-b-4 border-r-4 border-zinc-950 active:border-b-0 active:border-r-0 active:translate-y-1 transition-all border-2 border-[#221733] cursor-pointer flex items-center gap-2"
                      >
                        <span>FARM CALCULATOR</span>
                      </button>
                    </div>
                  </div>

                  {/* Live server info panel */}
                  <div className="mt-8 pt-8 border-t border-[#221733] grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#09060f]/80 p-4 rounded-2xl border-2 border-[#221733] flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#0055ff]/10 flex items-center justify-center text-sky-400 border border-[#0055ff]/20">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">SERVER IP ADDRESS</span>
                        <span className="text-sm font-black text-white font-mono tracking-wider">play.donutsmp.net</span>
                      </div>
                    </div>

                    <div className="bg-[#09060f]/80 p-4 rounded-2xl border-2 border-[#221733] flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">STORE ADDRESS</span>
                        <a href="https://store.donutsmp.net/" target="_blank" rel="noopener noreferrer" className="text-sm font-black text-sky-400 hover:text-sky-300 font-mono tracking-wider flex items-center gap-1 hover:underline">
                          store.donutsmp.net <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-[#09060f]/80 p-4 rounded-2xl border-2 border-[#221733] flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">MARKET COMMISSION</span>
                        <span className="text-sm font-black text-emerald-400 font-mono tracking-wider">0.0% TAX (FREE TRADE)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Grid Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Spawner Profits Guide */}
                  <div className="bg-[#0d0914] border-4 border-[#221733] rounded-3xl p-6 space-y-4 hover:border-[#0055ff] transition-all duration-300 relative group shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border-2 border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-white font-pixel uppercase tracking-wide">Farm Calculator</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                      Farming spawners is the fastest path to server wealth. Use the profits calculator to find materials checklists and see exactly how fast you generate profit.
                    </p>
                    <button
                      onClick={() => setActiveTab("farms")}
                      className="text-xs font-pixel uppercase text-[#0055ff] hover:text-sky-300 flex items-center gap-1 group cursor-pointer pt-2"
                    >
                      Open Farm Calculator <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Map Art Masterclass */}
                  <div className="bg-[#0d0914] border-4 border-[#221733] rounded-3xl p-6 space-y-4 hover:border-[#0055ff] transition-all duration-300 relative group shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border-2 border-sky-500/20 group-hover:bg-sky-500/20 transition-all">
                      <Paintbrush className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-white font-pixel uppercase tracking-wide">Map Art Calculator</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                      Create custom 1x1 to 4x4 map artwork. Load actual DonutSMP artwork templates, match pixels to actual blocks, and export accurate material checklists.
                    </p>
                    <button
                      onClick={() => setActiveTab("mapart")}
                      className="text-xs font-pixel uppercase text-[#0055ff] hover:text-sky-300 flex items-center gap-1 group cursor-pointer pt-2"
                    >
                      Load Map Art Calculator <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Player Standings */}
                  <div className="bg-[#0d0914] border-4 border-[#221733] rounded-3xl p-6 space-y-4 hover:border-[#0055ff] transition-all duration-300 relative group shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border-2 border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-white font-pixel uppercase tracking-wide">Player Tracker</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                      Analyze player statistics, search custom ranks, and display high-definition 3D skin previews.
                    </p>
                    <button
                      onClick={() => setActiveTab("players")}
                      className="text-xs font-pixel uppercase text-[#0055ff] hover:text-sky-300 flex items-center gap-1 group cursor-pointer pt-2"
                    >
                      Open Player Tracker <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>


              </motion.div>
            )}

            {/* MAP ART CALCULATOR */}
            {activeTab === "mapart" && (
              <motion.div
                key="mapart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <MapArtCalculator 
                  initialMapArt={selectedMapArt}
                  onClearInitial={() => setSelectedMapArt(null)}
                />
              </motion.div>
            )}

            {/* FARM ROI CALCULATOR */}
            {activeTab === "farms" && (
              <motion.div
                key="farms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <FarmCalculator />
              </motion.div>
            )}

            {/* PLAYERS TRACKER */}
            {activeTab === "players" && (
              <motion.div
                key="players"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <PlayerTracker />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Footer styled to look like store.donutsmp.net footer */}
      <footer className="border-t-4 border-[#221733] bg-[#0d0914] py-10 px-4 mt-20 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[#0055ff]/10 border border-[#0055ff]/30 flex items-center justify-center font-bold text-xs text-[#0055ff]">
              🍩
            </div>
            <div className="text-left">
              <span className="font-pixel uppercase text-xs tracking-wider text-white block">Donut<span className="text-[#0055ff]">calc</span> Economy Hub</span>
              <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">Not affiliated with Mojang Studios or Microsoft.</span>
            </div>
          </div>
          <div className="flex flex-col md:items-end text-xs text-zinc-400 font-bold font-mono">
            <span>Powering Survival Companion Tools Since 2026</span>
            <span className="text-[10px] text-zinc-500 mt-1">Design inspired by play.donutsmp.net theme</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
