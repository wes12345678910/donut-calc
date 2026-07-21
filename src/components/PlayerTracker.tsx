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
  AlertCircle,
  Save,
  X
} from "lucide-react";
import { PlayerStats } from "../types";

const FAMOUS_LIST = ["DrDonutt", "Bionic", "LoverFella", "Preston"];

export default function PlayerTracker() {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [playerData, setPlayerData] = useState<PlayerStats | null>(null);
  const [error, setError] = useState<string>("");

  // Editing states for manual corrections
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editBalance, setEditBalance] = useState<string>("");
  const [editPlaytime, setEditPlaytime] = useState<string>("");
  const [editRank, setEditRank] = useState<string>("");
  const [editFaction, setEditFaction] = useState<string>("");
  const [editKills, setEditKills] = useState<number>(0);
  const [editDeaths, setEditDeaths] = useState<number>(0);
  const [editSummary, setEditSummary] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Load DrDonutt initially as a beautiful default
  useEffect(() => {
    fetchStats("DrDonutt");
  }, []);

  const handleStartEdit = () => {
    if (!playerData) return;
    setEditBalance(playerData.balance);
    setEditPlaytime(playerData.playtime);
    setEditRank(playerData.rank || "PLAYER");
    setEditFaction(playerData.faction || "None");
    setEditKills(playerData.kills || 0);
    setEditDeaths(playerData.deaths || 0);
    setEditSummary(playerData.summary || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerData) return;
    setSavingEdit(true);
    try {
      const response = await fetch("/api/donut/player/override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: playerData.username,
          balance: editBalance,
          playtime: editPlaytime,
          rank: editRank,
          faction: editFaction,
          kills: editKills,
          deaths: editDeaths,
          summary: editSummary,
          status: playerData.status,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.username) {
          setPlayerData(data);
          setIsEditing(false);
        } else {
          alert("Failed to save changes.");
        }
      } else {
        alert("The server returned an invalid response. It may be restarting. Please try again.");
      }
    } catch (err) {
      console.warn("Player override submission error:", err);
      alert("Error saving changes. The server is temporarily offline.");
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchStats = async (nameToFetch: string) => {
    if (!nameToFetch.trim()) return;
    setLoading(true);
    setError("");
    setIsEditing(false); // Reset editing form when loading a new player!
    try {
      const response = await fetch(`/api/donut/player/${encodeURIComponent(nameToFetch)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setPlayerData(data);
          setUsername(data.username);
        } else {
          setError("Player statistics could not be loaded.");
        }
      } else {
        setError("Invalid response format. The server might be restarting.");
      }
    } catch (err) {
      console.warn("Player stats fetch error:", err);
      setError("Server connection failed or server is rebooting. Please try again in a few seconds.");
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
              placeholder="e.g., DrDonutt"
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

              {/* Right Column: Key Details or Edit Form */}
              <div className="md:col-span-8 bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-6 shadow-2xl">
                {isEditing ? (
                  <form onSubmit={handleSaveEdit} className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-[#221733] pb-4">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider font-pixel">
                          Correcting Statistics: <span className="text-sky-400">{playerData.username}</span>
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                          Updates are saved securely on play.donutsmp.net companion registry.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Balance & Playtime */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Actual Money Balance</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={editBalance}
                            onChange={(e) => setEditBalance(e.target.value)}
                            placeholder="e.g. 4.2M, 4200000 or $4,200,000"
                            className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Playtime</label>
                        <input
                          type="text"
                          value={editPlaytime}
                          onChange={(e) => setEditPlaytime(e.target.value)}
                          placeholder="e.g. 120 hours"
                          className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none transition-all"
                          required
                        />
                      </div>

                      {/* Rank & Faction */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Server Rank</label>
                        <select
                          value={editRank}
                          onChange={(e) => setEditRank(e.target.value)}
                          className="w-full bg-[#07040b]/60 text-white border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none transition-all cursor-pointer"
                        >
                          <option value="PLAYER">PLAYER</option>
                          <option value="VIP">VIP</option>
                          <option value="VIP+">VIP+</option>
                          <option value="MVP">MVP</option>
                          <option value="CHAMPION">CHAMPION</option>
                          <option value="SPONSOR">SPONSOR</option>
                          <option value="OVERLORD">OVERLORD</option>
                          <option value="MEDIA">MEDIA</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="OWNER">OWNER</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Faction Name</label>
                        <input
                          type="text"
                          value={editFaction}
                          onChange={(e) => setEditFaction(e.target.value)}
                          placeholder="e.g. None or FactionName"
                          className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none transition-all"
                        />
                      </div>

                      {/* Kills & Deaths */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Kills</label>
                        <input
                          type="number"
                          value={editKills}
                          onChange={(e) => setEditKills(Number(e.target.value))}
                          className="w-full bg-[#07040b]/60 text-white border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none transition-all"
                          min="0"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Deaths</label>
                        <input
                          type="number"
                          value={editDeaths}
                          onChange={(e) => setEditDeaths(Number(e.target.value))}
                          className="w-full bg-[#07040b]/60 text-white border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 text-xs font-bold outline-none transition-all"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Biography / Summary */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Profile Biography</label>
                      <textarea
                        value={editSummary}
                        onChange={(e) => setEditSummary(e.target.value)}
                        placeholder="A brief history or gameplay biography of this player on DonutSMP..."
                        className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-2.5 px-3.5 h-20 text-xs font-semibold outline-none transition-all resize-none"
                        maxLength={250}
                      />
                    </div>

                    {/* Form Controls */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wide flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer font-pixel shadow-lg shadow-emerald-500/10"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {savingEdit ? "Saving..." : "Save Corrections"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wide transition-all cursor-pointer border border-[#221733]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleStartEdit}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 bg-[#0055ff]/15 hover:bg-[#0055ff]/25 rounded-xl border-2 border-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Correct Stats
                        </button>
                        <a
                          href={`https://namemc.com/search?q=${playerData.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-zinc-400 hover:text-white px-3 py-1.5 bg-[#07040b] rounded-xl border-2 border-[#1a1126] flex items-center gap-1 transition-all"
                        >
                          View NameMC <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
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
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
