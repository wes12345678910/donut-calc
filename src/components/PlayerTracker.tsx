import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Search, 
  Sword, 
  Shield, 
  Coins, 
  Clock, 
  Activity, 
  Sparkles, 
  ExternalLink,
  Users,
  Award,
  AlertCircle
} from "lucide-react";
import { PlayerStats } from "../types";

const FAMOUS_LIST = ["DrDonut", "Bionic", "LoverFella", "Preston"];

export default function PlayerTracker() {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [playerData, setPlayerData] = useState<PlayerStats | null>(null);
  const [error, setError] = useState<string>("");

  // Load DrDonut initially as a beautiful default
  useEffect(() => {
    fetchStats("DrDonut");
  }, []);

  const fetchStats = async (nameToFetch: string) => {
    if (!nameToFetch.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/donut/player/${encodeURIComponent(nameToFetch)}`);
      const data = await response.json();
      if (data.success) {
        setPlayerData(data);
        setUsername(data.username);
      } else {
        setError("Player statistics could not be loaded.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(username);
  };

  return (
    <div id="player-tracker-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Search Sidebar */}
      <div id="player-search-panel" className="lg:col-span-4 bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-[#221733] pb-4">
          <User className="w-6 h-6 text-[#0055ff]" />
          <h2 className="text-base font-black text-white uppercase tracking-wide font-pixel">Player Search</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Minecraft Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., DrDonut"
              className="w-full bg-[#07040b]/60 text-white placeholder-zinc-600 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#0055ff] to-[#00d5ff] hover:from-[#3377ff] hover:to-[#33e0ff] disabled:opacity-45 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer font-pixel"
          >
            {loading ? "Searching..." : "Search Player"}
          </button>
        </form>

        {/* Famous presets shortcuts */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block font-pixel">Popular Creators</span>
          <div className="grid grid-cols-2 gap-2">
            {FAMOUS_LIST.map((name) => (
              <button
                key={name}
                onClick={() => fetchStats(name)}
                disabled={loading}
                className="py-2.5 px-3 bg-[#07040b]/60 border-2 border-[#1a1126] hover:border-[#0055ff]/35 hover:bg-[#07040b] text-xs text-zinc-300 hover:text-white font-bold rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <span>{name}</span>
                <span className="w-1.5 h-1.5 bg-[#0055ff] rounded-full animate-ping" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#07040b]/40 p-4 rounded-xl border-2 border-[#1a1126] text-xs text-zinc-500 space-y-2">
          <div className="flex gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="leading-normal font-semibold">
              Queries cached database snapshots and active server ledgers for instant and precise player statistics on the DonutSMP network!
            </span>
          </div>
        </div>
      </div>

      {/* Stats Display Panel */}
      <div id="player-stats-board" className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-16 flex flex-col items-center justify-center space-y-4 shadow-2xl"
            >
              <div className="w-10 h-10 border-4 border-[#0055ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-pixel">Syncing with DonutSMP...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-12 flex flex-col items-center justify-center space-y-3 shadow-2xl"
            >
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-sm text-zinc-200 font-bold">{error}</p>
              <p className="text-xs text-zinc-500 text-center max-w-xs leading-normal font-semibold">
                Make sure the Minecraft name is spelled correctly and they have registered profiles on the DonutSMP network.
              </p>
            </motion.div>
          ) : playerData ? (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Left Column: Skin Body Render */}
              <div className="md:col-span-4 bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0055ff]/10 to-transparent pointer-events-none" />
                
                {/* 3D Skin Render Image */}
                <img
                  src={`https://mc-heads.net/body/${playerData.username}/right`}
                  alt={`${playerData.username} Minecraft Skin`}
                  referrerPolicy="no-referrer"
                  className="h-72 object-contain drop-shadow-[0_12px_24px_rgba(0,102,255,0.25)] group-hover:scale-105 transition-all duration-500"
                />

                <span className="mt-4 text-[10px] font-bold px-3 py-1 bg-[#07040b] border border-[#1a1126] rounded-full text-zinc-400 font-mono tracking-wide">
                  {playerData.status === "Online" ? "🟢 ONLINE" : "⚪ OFFLINE"}
                </span>
              </div>

              {/* Right Column: Key Details */}
              <div className="md:col-span-8 bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-6 space-y-6 shadow-2xl">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-[#221733] pb-4">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 font-pixel">
                      {playerData.username}
                      <span className="text-[10px] font-extrabold font-mono px-2.5 py-0.5 bg-[#0055ff]/15 border border-[#0055ff]/30 rounded text-sky-450 font-pixel">
                        {playerData.rank || "MEMBER"}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-bold">
                      <Users className="w-3.5 h-3.5 text-zinc-600" /> Faction: <span className="text-zinc-300 font-bold">{playerData.faction || "None"}</span>
                    </p>
                  </div>
                  <a
                    href={`https://namemc.com/search?q=${playerData.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-zinc-400 hover:text-white px-3 py-1.5 bg-[#07040b] rounded-xl border-2 border-[#1a1126] flex items-center gap-1 transition-all"
                  >
                    View NameMC <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#07040b]/80 border-2 border-[#1a1126] rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider">Balance</span>
                      <span className="text-sm font-black text-white font-mono leading-tight">{playerData.balance || "$0"}</span>
                    </div>
                  </div>

                  <div className="bg-[#07040b]/80 border-2 border-[#1a1126] rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0055ff]/10 flex items-center justify-center text-sky-400 border border-[#0055ff]/20">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider">Playtime</span>
                      <span className="text-sm font-black text-white font-mono leading-tight">{playerData.playtime || "Unknown"}</span>
                    </div>
                  </div>

                  <div className="bg-[#07040b]/80 border-2 border-[#1a1126] rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-450 border border-red-500/20">
                      <Sword className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider">Kills / Deaths</span>
                      <span className="text-sm font-black text-white font-mono leading-tight">{playerData.kills} / {playerData.deaths}</span>
                    </div>
                  </div>

                  <div className="bg-[#07040b]/80 border-2 border-[#1a1126] rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block font-bold uppercase tracking-wider">KDR Ratio</span>
                      <span className="text-sm font-black text-white font-mono leading-tight">{playerData.kdr || "0.00"}</span>
                    </div>
                  </div>
                </div>

                {/* Server Status & Profile Summary */}
                <div className="bg-[#07040b] p-4.5 border-2 border-[#1a1126] rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-pixel">
                    <Award className="w-4 h-4 text-amber-500" />
                    Profile Biography
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    {playerData.summary}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
