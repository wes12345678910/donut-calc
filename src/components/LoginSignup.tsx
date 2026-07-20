import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, User, Key, Sparkles, Check, AlertCircle } from "lucide-react";

// Blue Pixel Donut matching the theme
const BlueDonutLogo = () => (
  <svg 
    width="96" 
    height="96" 
    viewBox="0 0 16 16" 
    className="w-24 h-24 animate-donut-float drop-shadow-[0_0_20px_rgba(0,102,255,0.8)] mx-auto"
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
    <rect x="7" y="6" width="2" height="1" fill="#1b110a" />
    <rect x="7" y="9" width="2" height="1" fill="#1b110a" />
    <rect x="6" y="7" width="1" height="2" fill="#1b110a" />
    <rect x="9" y="7" width="1" height="2" fill="#1b110a" />

    {/* Sprinkles */}
    <rect x="4" y="4" width="1" height="1" fill="#ffffff" />
    <rect x="10" y="4" width="1" height="1" fill="#ffd000" />
    <rect x="3" y="7" width="1" height="1" fill="#ffffff" />
    <rect x="11" y="7" width="1" height="1" fill="#ffd000" />
    <rect x="5" y="8" width="1" height="1" fill="#ffffff" />
  </svg>
);

interface LoginSignupProps {
  onSuccess: (username: string) => void;
}

export default function LoginSignup({ onSuccess }: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all credential fields.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    const rawUsers = localStorage.getItem("donutsmp_companion_users");
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    if (isLogin) {
      // Find user
      const found = users.find(
        (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );
      if (found) {
        setSuccessMsg("Welcome back!");
        setTimeout(() => {
          onSuccess(found.username);
        }, 1000);
      } else {
        setError("Invalid username or password credentials.");
      }
    } else {
      // Register logic
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 5) {
        setError("Password must be at least 5 characters.");
        return;
      }

      const exists = users.some((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setError("This Minecraft username is already registered.");
        return;
      }

      // Add user
      const newUser = { username, password };
      users.push(newUser);
      localStorage.setItem("donutsmp_companion_users", JSON.stringify(users));

      setSuccessMsg("Registration successful! Logging in...");
      setTimeout(() => {
        onSuccess(username);
      }, 1000);
    }
  };

  const handleGuestAccess = () => {
    onSuccess("GuestPlayer");
  };

  return (
    <div className="min-h-screen bg-[#020206] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Glowing Orbs */}
      <div className="fixed top-[-20%] left-[-20%] w-[80%] aspect-square bg-[#0055ff]/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[80%] aspect-square bg-[#00d5ff]/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#0e0a16] border-4 border-[#221733] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <BlueDonutLogo />
          <h1 className="text-2xl font-black text-white font-pixel uppercase tracking-wide mt-4 neon-text-blue">
            DONUT<span className="text-[#0055ff]">SMP</span>
          </h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
            Companion Hub Portal
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-[#07040b] p-1.5 rounded-xl border-2 border-[#221733]">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              isLogin 
                ? "bg-[#0055ff] text-white font-pixel shadow-md shadow-[#0055ff]/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              !isLogin 
                ? "bg-[#0055ff] text-white font-pixel shadow-md shadow-[#0055ff]/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0055ff]" />
              Minecraft Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., DrDonutt"
              className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-3 px-4 text-xs font-bold outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#0055ff]" />
              Access Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-3 px-4 text-xs font-bold outline-none transition-all"
            />
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0055ff]" />
                Confirm Key / Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#07040b]/60 text-white placeholder-zinc-700 border-2 border-[#1a1126] focus:border-[#0055ff] rounded-xl py-3 px-4 text-xs font-bold outline-none transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0055ff] to-[#00d5ff] hover:from-[#3377ff] hover:to-[#33e0ff] text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer font-pixel"
          >
            {isLogin ? "Authenticate" : "Create Account"}
          </button>
        </form>

        {/* Guest bypass divider */}
        <div className="flex items-center justify-between text-xs text-zinc-600 font-bold uppercase">
          <div className="h-[2px] bg-[#1a1126] flex-1"></div>
          <span className="px-3">or</span>
          <div className="h-[2px] bg-[#1a1126] flex-1"></div>
        </div>

        <button
          onClick={handleGuestAccess}
          className="w-full py-3 bg-[#1a1126] hover:bg-[#221733] text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-2 border-transparent hover:border-[#0055ff]/20 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
