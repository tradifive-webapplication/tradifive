import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { AGENT_TOOLS, executeTool } from "../lib/agentTools";
import {
  Send, Bot, User, Cpu, AlertTriangle, RefreshCcw, Sparkles,
  ChevronDown, CheckCircle2, Loader2, Users, CreditCard,
  Headphones, ShieldAlert, Wrench, BarChart3, LayoutDashboard,
  Copy, ThumbsUp, Zap
} from "lucide-react";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const KIMI_API_KEY = import.meta.env.VITE_KIMI_API_KEY || "";
const API_KEY = GEMINI_API_KEY || KIMI_API_KEY;
const API_URL = GEMINI_API_KEY 
  ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" 
  : "https://api.moonshot.ai/v1/chat/completions";
const MODEL_NAME = GEMINI_API_KEY ? "gemini-3.1-flash-lite" : "moonshot-v1-8k";

const AGENTS = [
  {
    id: "ceo",
    name: "Apex Command",
    role: "CEO Assistant",
    icon: LayoutDashboard,
    accent: "text-zinc-300",
    badge: "ALL ACCESS",
    description: "Full platform control. Ask me anything about users, finance, operations, or tech.",
    systemPrompt: `You are Apex Command, an elite AI assistant for the CEO of TradiFive — an algorithmic trading platform. You have FULL access to all platform data and can execute ANY admin action.

Platform Overview:
- TradiFive is an algo trading platform where users connect MT5 accounts and run automated trading bots
- Subscription plans: Standard (₹1,299/mo), Pro (₹2,499/mo + 7 days free trial), Elite (₹4,999/mo)
- Departments: The Traders (CRM), The Institutional Data (Risk/Analytics), The Tech (Infrastructure), The Money (Finance), The Backing (Support)
- Users get XP, streaks, discipline levels, and AI coaching via Kimi AI
- Admin roles: CEO (full access), Technical Lead, Risk Analyst, Operations Executive, Support Executive

When asked to perform actions (freeze user, send notification, etc.), use the available tools to execute them immediately. Always confirm what you've done and provide a summary of results.`
  },
  {
    id: "finance",
    name: "Ledger Prime",
    role: "Finance Agent",
    icon: CreditCard,
    accent: "text-emerald-500",
    badge: "FINANCE",
    description: "Revenue, payouts, transactions, subscriptions, and billing operations.",
    systemPrompt: `You are Ledger Prime, the Finance AI for TradiFive. You specialize in financial operations.

Your expertise:
- Revenue analysis and MRR tracking (Elite: ₹4,999/mo, Pro: ₹2,499/mo, Standard: ₹1,299/mo)
- Payout request approval/rejection
- Transaction ledger management
- Subscription overrides and billing issues
- Financial reconciliation

Use financial tools to get data, approve/reject payouts, change subscriptions. Always provide clear financial summaries and flag anything unusual.`
  },
  {
    id: "support",
    name: "Shield Agent",
    role: "Support Agent",
    icon: Headphones,
    accent: "text-amber-500",
    badge: "SUPPORT",
    description: "Handle tickets, reply to users, resolve complaints, send notifications.",
    systemPrompt: `You are Shield Agent, the Customer Support AI for TradiFive. You resolve user issues with precision and empathy.

Your expertise:
- Managing support tickets (open, in_progress, resolved)
- Sending personalized messages/notifications to users
- Resolving complaints quickly
- Escalating critical issues
- User communication and announcements

When a user has an issue, check their profile and tickets first. Reply professionally and resolve tickets efficiently. Always notify users of any actions taken.`
  },
  {
    id: "risk",
    name: "Risk Oracle",
    role: "Risk Agent",
    icon: ShieldAlert,
    accent: "text-rose-500",
    badge: "RISK",
    description: "Monitor trading risk, freeze accounts, halt algos, detect anomalies.",
    systemPrompt: `You are Risk Oracle, the Risk Management AI for TradiFive. You protect the platform from financial and operational risk.

Your expertise:
- Monitoring trading activity and anomalies
- Freezing user accounts for compliance violations
- Halting MT5 algorithmic trading
- Risk assessment and reporting
- Account governance and compliance enforcement

Take swift action on suspicious activity. Freeze accounts, halt trading, and send warnings when needed. Always document your reasoning.`
  },
  {
    id: "tech",
    name: "SysCore",
    role: "Tech Agent",
    icon: Wrench,
    accent: "text-cyan-500",
    badge: "TECH",
    description: "System health, infrastructure, MT5 connections, maintenance mode.",
    systemPrompt: `You are SysCore, the Technical Infrastructure AI for TradiFive.

Your expertise:
- System health monitoring and diagnostics
- MT5 broker connection status
- Maintenance mode management
- Tech incident tracking and resolution
- Database performance and API health

Monitor system health proactively. Enable/disable maintenance when needed and keep the platform running smoothly.`
  },
  {
    id: "operations",
    name: "OpsCentral",
    role: "Operations Agent",
    icon: BarChart3,
    accent: "text-violet-500",
    badge: "OPS",
    description: "User management, analytics, subscriptions, broadcasts, and platform operations.",
    systemPrompt: `You are OpsCentral, the Operations AI for TradiFive.

Your expertise:
- User registry and profile management
- Subscription and plan management
- Platform-wide broadcasts and announcements
- Analytics and operational metrics
- Gamification (XP, streaks, discipline levels)

Handle day-to-day operational tasks efficiently. Manage users, update subscriptions, send broadcasts, and keep operations running smoothly.`
  }
];

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant" | "tool_call" | "tool_result";
  content: string;
  toolName?: string;
  toolArgs?: any;
  isStreaming?: boolean;
  timestamp: Date;
}

// ─── HELPER FOR TOOL RESULTS ──────────────────────────────────────────────────
const findToolResult = (toolCallMsg: Message, allMsgs: Message[]) => {
  const callIndex = allMsgs.findIndex(m => m.id === toolCallMsg.id);
  if (callIndex === -1) return null;
  for (let i = callIndex + 1; i < allMsgs.length; i++) {
    if (allMsgs[i].role === "tool_result" && allMsgs[i].toolName === toolCallMsg.toolName) {
      return allMsgs[i];
    }
  }
  return null;
};

// ─── TOOL EXECUTION BLOCK COMPONENT ───────────────────────────────────────────
function ToolExecutionBlock({ msg, allMsgs }: { msg: Message; allMsgs: Message[] }) {
  const result = findToolResult(msg, allMsgs);
  const isRunning = !result;

  return (
    <div className="my-2 inline-flex items-center gap-3 bg-black/40 border border-white/5 rounded-full px-3 py-1.5 shadow-sm">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isRunning ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
        <Cpu size={10} className={isRunning ? 'text-amber-500 animate-pulse' : 'text-emerald-500'} />
      </div>
      <span className="text-[10px] font-mono font-medium text-neutral-400">
        Executing: {msg.toolName}
      </span>
      {isRunning ? (
        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 animate-pulse">Running</span>
      ) : (
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Done</span>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminAgentPage() {
  const { adminUser, viewRole } = useAdminAuth();
  
  const activeRole = viewRole || adminUser?.role || "ceo";
  
  const visibleAgents = React.useMemo(() => AGENTS.filter(agent => {
    if (activeRole === "ceo") return true;
    if (activeRole === "hr_manager") return agent.id !== "ceo";
    if (activeRole === "technical_lead" && agent.id === "tech") return true;
    if (((activeRole as string) === "risk_analyst" || activeRole === "risk_executive") && agent.id === "risk") return true;
    if (activeRole === "support_executive" && agent.id === "support") return true;
    if (activeRole === "operations_executive" && (agent.id === "finance" || agent.id === "operations")) return true;
    return false;
  }), [activeRole]);

  const [selectedAgent, setSelectedAgent] = useState(visibleAgents[0] || AGENTS[0]);

  useEffect(() => {
    if (!visibleAgents.find(a => a.id === selectedAgent.id)) {
      setSelectedAgent(visibleAgents[0] || AGENTS[0]);
    }
  }, [activeRole, visibleAgents, selectedAgent.id]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [effectiveApiKey] = useState(API_KEY);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Add welcome message when agent changes with typing stream
  useEffect(() => {
    let active = true;
    const welcomeText = `**${selectedAgent.name}** online. ${selectedAgent.description}\n\nI can execute real platform actions — freeze accounts, send notifications, approve payouts, and much more. What do you need?`;
    
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date()
    }]);

    const words = welcomeText.split(" ");
    let currentText = "";
    
    const runStream = async () => {
      for (let i = 0; i < words.length; i++) {
        if (!active) return;
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages(prev => prev.map(m => m.id === "welcome" ? { ...m, content: currentText } : m));
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      if (!active) return;
      setMessages(prev => prev.map(m => m.id === "welcome" ? { ...m, isStreaming: false, content: welcomeText } : m));
    };

    runStream();

    return () => {
      active = false;
    };
  }, [selectedAgent]);

  const addMsg = (msg: Omit<Message, "id" | "timestamp">) => {
    const m: Message = { ...msg, id: Date.now().toString() + Math.random(), timestamp: new Date() };
    setMessages(prev => [...prev, m]);
    return m.id;
  };

  const updateMsg = (id: string, update: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...update } : m));
  };

  const streamMessage = async (content: string) => {
    const streamId = Date.now().toString() + Math.random();
    
    const newMsg: Message = {
      id: streamId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMsg]);

    const words = content.split(" ");
    let currentText = "";
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: currentText } : m));
      
      const baseDelay = Math.max(10, Math.min(25, 300 / words.length));
      await new Promise(resolve => setTimeout(resolve, baseDelay));
    }

    setMessages(prev => prev.map(m => m.id === streamId ? { ...m, isStreaming: false, content } : m));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setLoading(true);

    addMsg({ role: "user", content: userText });

    // Build conversation history
    const history = messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      const key = effectiveApiKey;
      if (!key) {
        addMsg({ role: "assistant", content: "❌ No AI API key configured. Please configure an API key." });
        setLoading(false);
        return;
      }

      // First API call
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: "system", content: selectedAgent.systemPrompt },
            ...history,
            { role: "user", content: userText }
          ],
          tools: AGENT_TOOLS,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        const err = await response.text();
        addMsg({ role: "assistant", content: `❌ API Error ${response.status}: ${err.substring(0, 200)}` });
        setLoading(false);
        return;
      }

      const data = await response.json();
      const msg = data.choices?.[0]?.message;

      if (!msg) {
        addMsg({ role: "assistant", content: "❌ No response from AI API." });
        setLoading(false);
        return;
      }

      // ─── HANDLE TOOL CALLS ───────────────────────────────────────────────
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        const toolResults: { tool_call_id: string; content: string }[] = [];

        if (msg.content) {
          await streamMessage(msg.content);
        }

        for (const tc of msg.tool_calls) {
          const fnName = tc.function.name;
          const fnArgs = JSON.parse(tc.function.arguments || "{}");

          // Show tool call in UI
          addMsg({
            role: "tool_call",
            content: `Executing: **${fnName}**`,
            toolName: fnName,
            toolArgs: fnArgs
          });

          // Execute the tool
          const result = await executeTool(fnName, fnArgs);

          // Show result in UI
          addMsg({ role: "tool_result", content: result, toolName: fnName });
          toolResults.push({ tool_call_id: tc.id, content: result });
        }

        // Second call with tool results
        const response2 = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: [
              { role: "system", content: selectedAgent.systemPrompt },
              ...history,
              { role: "user", content: userText },
              { role: "assistant", content: msg.content || null, tool_calls: msg.tool_calls },
              ...toolResults.map(tr => ({ role: "tool" as const, tool_call_id: tr.tool_call_id, content: tr.content }))
            ],
            temperature: 0.3,
            max_tokens: 1024
          })
        });

        if (response2.ok) {
          const data2 = await response2.json();
          const finalMsg = data2.choices?.[0]?.message?.content;
          if (finalMsg) {
            await streamMessage(finalMsg);
          }
        } else {
          const errText = await response2.text();
          addMsg({ role: "assistant", content: `❌ API Error in second call: ${response2.status} - ${errText.substring(0, 200)}` });
        }
      } else {
        // Plain text response
        if (msg.content) {
          await streamMessage(msg.content);
        } else {
          addMsg({ role: "assistant", content: "No response." });
        }
      }
    } catch (err: any) {
      addMsg({ role: "assistant", content: `❌ Connection error: ${err.message}` });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    const welcomeText = `**${selectedAgent.name}** online. ${selectedAgent.description}\n\nI can execute real platform actions — freeze accounts, send notifications, approve payouts, and much more. What do you need?`;
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date()
    }]);

    const words = welcomeText.split(" ");
    let currentText = "";
    
    const runStream = async () => {
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages(prev => prev.map(m => m.id === "welcome" ? { ...m, content: currentText } : m));
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      setMessages(prev => prev.map(m => m.id === "welcome" ? { ...m, isStreaming: false, content: welcomeText } : m));
    };

    runStream();
  };

  const SUGGESTED_PROMPTS: Record<string, string[]> = {
    ceo: ["Show me all users", "What's our financial summary?", "System health check", "List all open support tickets"],
    finance: ["Show pending payouts", "Financial summary", "List users by subscription", "How much MRR do we have?"],
    support: ["Show all open tickets", "List recent user feedback", "Send maintenance announcement to all users"],
    risk: ["Show active MT5 connections", "Get trading summary", "Check system health"],
    tech: ["System health check", "Enable maintenance mode", "Show recent tech issues"],
    operations: ["Show all users", "Show platform analytics", "Send a broadcast announcement"]
  };

  const suggestions = SUGGESTED_PROMPTS[selectedAgent.id] || [];

  return (
    <div className="flex flex-col bg-[#09090B] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-[#09090B] to-[#09090B] h-[calc(100dvh-120px)] md:h-[calc(100vh-56px)] rounded-xl overflow-hidden border border-zinc-800/60">
      
      {/* ─── MOBILE AGENT HORIZONTAL SELECTOR ─── */}
      <div className="flex md:hidden overflow-x-auto gap-1.5 p-2 bg-[#121212] border-b border-zinc-800/60 shrink-0 custom-scrollbar">
        {visibleAgents.map(agent => {
          const Icon = agent.icon;
          const isSelected = selectedAgent.id === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0 text-left border transition-all ${
                isSelected
                  ? "bg-zinc-800 border-zinc-700 text-white shadow-sm"
                  : "bg-zinc-900/40 border-zinc-800/40 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon size={13} className={isSelected ? agent.accent : "text-neutral-500"} />
              <span className="text-[11px] font-bold whitespace-nowrap">{agent.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── DESKTOP SIDEBAR: Agent Selector ─── */}
        <div className="hidden md:flex w-72 border-r border-zinc-800/60 bg-[#121212]/95 backdrop-blur-md flex-col shrink-0 overflow-y-auto">
          <div className="p-4">
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mb-4 pl-1">Command Nodes</p>
            <div className="space-y-1.5">
              {visibleAgents.map(agent => {
                const Icon = agent.icon;
                const isSelected = selectedAgent.id === agent.id;
                return (
                  <button 
                    key={agent.id} 
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden group ${
                      isSelected 
                        ? "bg-zinc-900 border border-zinc-800/80 shadow-lg shadow-black/30" 
                        : "bg-transparent border border-transparent hover:bg-zinc-900/40 hover:border-zinc-800/30"
                    }`}
                  >
                    {/* Left active border highlight */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-500 rounded-r animate-pulse" />
                    )}
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected 
                        ? "bg-zinc-800 border-zinc-700/50" 
                        : "bg-zinc-900/40 border-zinc-800/50 group-hover:bg-zinc-900 group-hover:border-zinc-800"
                    }`}>
                      <Icon size={14} className={isSelected ? agent.accent : "text-neutral-400 group-hover:text-neutral-200 transition-colors"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-[12px] font-bold truncate ${isSelected ? "text-white" : "text-neutral-300 group-hover:text-white transition-colors"}`}>{agent.name}</p>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{agent.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── MAIN CHAT AREA ─── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
          {/* Agent Header */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-zinc-900/60 bg-[#121212]/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shrink-0">
                <selectedAgent.icon size={15} className={selectedAgent.accent} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[13px] sm:text-[14px] font-bold text-white tracking-wide truncate">{selectedAgent.name}</h2>
                  <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-350 uppercase tracking-wider shrink-0">{selectedAgent.badge}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">{selectedAgent.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button onClick={clearChat} className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[9px] sm:text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-zinc-800/80 uppercase tracking-wider transition-all flex items-center gap-1.5">
                <RefreshCcw size={11} /> Reset Node
              </button>
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 md:px-12 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-white/5">
            <AnimatePresence>
              {messages.filter(m => m.role !== "tool_result").map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex w-full max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Tool Call Terminal Log */}
                  {msg.role === "tool_call" ? (
                    <div className="pl-11 w-full">
                      <ToolExecutionBlock msg={msg} allMsgs={messages} />
                    </div>
                  ) : (
                    <>
                      {/* User message speech bubble */}
                      {msg.role === "user" ? (
                        <div className="max-w-[75%] space-y-1">
                          <div className="flex items-center justify-end gap-2 px-1 mb-1">
                            <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <span className="text-[11px] font-bold text-neutral-300">You</span>
                          </div>
                          <div className="bg-indigo-600 border border-indigo-500/50 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-lg">
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        /* Assistant response glass bubble */
                        <div className="flex gap-4 max-w-[85%] w-full">
                          <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center shrink-0 bg-[#1E1E1E] shadow-md">
                            <selectedAgent.icon size={16} className={selectedAgent.accent} />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-3 px-1 mb-1">
                              <span className="text-[12px] font-bold text-white tracking-wide">{selectedAgent.name}</span>
                              <span className="text-[9px] font-bold bg-white/5 border border-white/5 text-neutral-400 px-1.5 py-0.5 rounded tracking-widest font-mono uppercase">{selectedAgent.badge}</span>
                              <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg">
                              <div className="text-neutral-300">
                                <MessageContent content={msg.content} />
                                {msg.isStreaming && (
                                  <span className="inline-block w-1.5 h-4 ml-1 bg-zinc-400 animate-pulse rounded-sm align-middle shadow-[0_0_8px_rgba(250,250,250,0.3)]" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading / Typing indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-4xl mx-auto w-full justify-start">
                <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center shrink-0 bg-[#1E1E1E] shadow-md">
                  <selectedAgent.icon size={16} className={selectedAgent.accent} />
                </div>
                <div className="flex items-center h-10 bg-[#1E1E1E] border border-white/5 px-5 py-2 rounded-2xl rounded-tl-sm shadow-md">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Prompts Grid */}
          {messages.length <= 1 && (
            <div className="px-3 sm:px-6 md:px-12 pb-3 max-w-4xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="group text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/85 hover:border-zinc-700/60 transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-300 group-hover:text-white transition-colors truncate">{s}</span>
                      <span className="text-[9px] text-neutral-500 mt-0.5">Click to fill command</span>
                    </div>
                    <Zap size={12} className="text-neutral-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-3 sm:px-6 md:px-12 pb-3 sm:pb-6 pt-2 shrink-0 max-w-4xl mx-auto w-full">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/20 to-zinc-800/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur-md"></div>
              <div className="relative flex items-end gap-3 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 group-focus-within:border-zinc-700 rounded-2xl p-3 pr-2.5 shadow-2xl transition-all duration-300">
                <textarea
                  ref={inputRef as any}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Send command to ${selectedAgent.name}...`}
                  disabled={loading}
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                  className="flex-1 bg-transparent text-[14px] leading-relaxed text-white placeholder:text-neutral-500 outline-none resize-none disabled:opacity-50 px-2 py-1"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={loading || !input.trim()}
                  className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-all ${
                    loading || !input.trim() 
                      ? "bg-white/5 text-neutral-600 cursor-not-allowed" 
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:scale-[1.02] active:scale-[0.98] border border-zinc-700/50 shadow-lg shadow-black/25"
                  }`}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
            <p className="text-[9px] tracking-wider uppercase font-semibold text-neutral-600 mt-3.5 text-center">
              Agent operations are logged, encrypted, and audit-logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-3 font-sans">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-bold text-white text-[13px]">{line.replace(/\*\*/g, "")}</p>;
        }
        if (line.trim().match(/^[0-9]+\.\s/)) {
          const text = line.replace(/^[0-9]+\.\s/, "");
          return (
             <div key={i} className="flex gap-3 text-neutral-300 text-[13px] mt-2 mb-1">
               <span className="text-indigo-400 font-mono font-bold shrink-0">{line.match(/^[0-9]+\./)?.[0]}</span>
               <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">₹1</strong>') }} />
             </div>
          );
        }
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("• ")) {
          const text = line.replace(/^[-*•]\s/, "");
          const isData = text.toLowerCase().includes("id:") || text.toLowerCase().includes("email:") || text.toLowerCase().includes("plan:");
          return (
            <div key={i} className={`flex gap-3 pl-2 mt-1.5 ${isData ? "font-mono text-[11px] text-neutral-400" : "font-sans text-[13px] text-neutral-300"}`}>
               <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
               <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">₹1</strong>').replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-emerald-400">₹1</code>') }} />
            </div>
          );
        }
        if (line.startsWith("#")) {
          return <p key={i} className="font-bold text-white text-[12px] uppercase tracking-widest mt-5 mb-2 border-b border-white/5 pb-2">{line.replace(/^#+\s/, "")}</p>;
        }
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={i} className={`text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap ${line === "" ? "h-1" : ""}`}>
            {parts.map((part, j) => {
              if (part.startsWith("**")) {
                return <strong key={j} className="font-bold text-white">{part.replace(/\*\*/g, "")}</strong>;
              }
              if (part.startsWith("`") && part.endsWith("`")) {
                return <code key={j} className="px-1.5 py-0.5 mx-0.5 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-emerald-400">{part.replace(/`/g, "")}</code>;
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}
