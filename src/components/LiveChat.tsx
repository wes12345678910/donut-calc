import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Users, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { ChatMessage } from "../types";

interface LiveChatProps {
  user: string;
}

export default function LiveChat({ user }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const feedRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Fetch real-time chat messages and online visitor count from the backend server
  const fetchChatData = async (silent = false) => {
    try {
      const response = await fetch(`/api/donut/chat?username=${encodeURIComponent(user)}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setOnlineCount(data.onlineCount);

        // Notify with unread count if sidebar is collapsed and we got new messages
        if (silent && isCollapsed && data.messages.length > lastMessageCountRef.current) {
          setUnreadCount(prev => prev + (data.messages.length - lastMessageCountRef.current));
        }
        lastMessageCountRef.current = data.messages.length;
      }
    } catch (err) {
      console.error("Failed to fetch live chat from server:", err);
    }
  };

  // Poll server for live updates every 2 seconds
  useEffect(() => {
    fetchChatData();
    const interval = setInterval(() => {
      fetchChatData(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [user, isCollapsed]);

  // Scroll to bottom whenever messages list is updated without disrupting global page scrolling
  useEffect(() => {
    if (!isCollapsed && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  // Handle Collapsing/Expanding resetting unread notifications
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      setUnreadCount(0);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");

    try {
      const response = await fetch("/api/donut/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          message: userText
        })
      });

      const data = await response.json();
      if (data.success) {
        // Immediately fetch the latest messages list
        fetchChatData();
      }
    } catch (err) {
      console.error("Failed to send message to live chat api:", err);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: "Server",
        rank: "SYSTEM",
        text: "Chat cleared.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
    lastMessageCountRef.current = 1;
  };

  // Render rank badge utility colors
  const getRankBadgeProps = (rank: string) => {
    const r = rank.toUpperCase();
    if (r === "OWNER") {
      return { bg: "bg-red-500/15 border-red-500/40 text-red-400 font-bold", label: "OWNER" };
    }
    if (r === "MEDIA") {
      return { bg: "bg-purple-500/15 border-purple-500/40 text-purple-400 font-bold animate-pulse", label: "MEDIA" };
    }
    if (r.startsWith("MVP")) {
      return { bg: "bg-cyan-500/15 border-cyan-500/40 text-cyan-400", label: rank };
    }
    if (r.startsWith("VIP")) {
      return { bg: "bg-amber-500/15 border-amber-500/40 text-amber-400", label: rank };
    }
    if (r === "SYSTEM") {
      return { bg: "bg-zinc-800 border-zinc-700 text-zinc-300", label: "SYS" };
    }
    return { bg: "bg-zinc-900 border-zinc-800 text-zinc-400", label: "PLAYER" };
  };

  if (isCollapsed) {
    return (
      <div 
        id="live-chat-collapsed"
        className="fixed bottom-6 left-6 lg:sticky lg:bottom-auto lg:left-auto lg:top-24 z-40 flex flex-col items-center gap-2"
      >
        <button
          onClick={toggleCollapse}
          className="w-14 h-14 bg-[#0d0914] hover:bg-[#1a1126] text-[#0055ff] border-4 border-[#221733] hover:border-[#0055ff] rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl relative transition-all duration-300 hover:scale-105"
          title="Open Donutcalc Server Chat"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#0055ff] text-white font-pixel text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#020206] animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
        <span className="hidden lg:block font-pixel text-[8px] text-zinc-500 tracking-wider uppercase font-black writing-mode-vertical">
          OPEN CHAT
        </span>
      </div>
    );
  }

  return (
    <div 
      id="live-chat-container"
      className="fixed inset-y-0 left-0 w-80 max-w-[90vw] lg:max-w-none lg:w-80 xl:w-96 bg-[#0c0812]/95 lg:bg-[#0d0914]/85 border-r-4 lg:border-4 border-[#221733] lg:rounded-3xl z-40 lg:z-10 shadow-2xl flex flex-col h-full lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 overflow-hidden backdrop-blur-md"
    >
      {/* Header bar */}
      <div className="bg-[#120b1a] border-b-4 border-[#221733] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0055ff]/10 flex items-center justify-center text-[#0055ff] border border-[#0055ff]/20">
            <MessageSquare className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-pixel text-[11px] text-white uppercase tracking-wider">Donutcalc Chat</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-zinc-500" />
              <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-wide">
                {onlineCount} {onlineCount === 1 ? "VISITOR" : "VISITORS"} ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={clearChat}
            title="Clear Chat Log"
            className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={toggleCollapse}
            title="Collapse Sidebar"
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Feed logs */}
      <div 
        ref={feedRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        {messages.map((msg) => {
          const badge = getRankBadgeProps(msg.rank);
          const isCurrentUser = msg.sender === user;
          return (
            <div 
              key={msg.id} 
              className={`text-xs space-y-1.5 transition-all duration-300 ${
                isCurrentUser ? "pl-2 border-l-2 border-[#0055ff]/40 bg-[#0055ff]/3 py-1 rounded-r-lg" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-mono font-bold text-zinc-600 block">
                  [{msg.timestamp}]
                </span>
                {badge.label && (
                  <span className={`text-[8px] font-pixel px-1.5 py-0.5 rounded border ${badge.bg}`}>
                    {badge.label}
                  </span>
                )}
                <span className={`font-black tracking-wide ${
                  isCurrentUser ? "text-sky-300" : msg.rank === "OWNER" ? "text-red-400" : msg.rank === "MEDIA" ? "text-purple-400" : "text-zinc-200"
                }`}>
                  {msg.sender}:
                </span>
              </div>
              <p className="text-zinc-300 break-words font-medium leading-relaxed">
                {msg.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input Form text field */}
      <div className="bg-[#120b1a] border-t-4 border-[#221733] p-4">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <span className="absolute left-3 text-zinc-500 text-xs font-mono font-black select-none pointer-events-none">
            &gt;
          </span>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type in global chat..."
            maxLength={100}
            className="w-full bg-[#07040b] text-xs font-medium text-white placeholder-zinc-600 border-2 border-[#221733] focus:border-[#0055ff] rounded-xl py-3 pl-7 pr-10 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`absolute right-2 p-1.5 rounded-lg transition-all ${
              inputText.trim() 
                ? "bg-[#0055ff] hover:bg-sky-500 text-zinc-950 cursor-pointer hover:scale-105" 
                : "text-zinc-700 pointer-events-none"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-center mt-2.5 px-1">
          <span className="text-[9px] text-zinc-500 font-bold font-mono uppercase tracking-wider">
            PRESS ENTER TO TRANSMIT
          </span>
        </div>
      </div>
    </div>
  );
}
