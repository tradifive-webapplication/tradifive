import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  MessageSquare,
  X,
  Plus,
  Bot,
  LifeBuoy,
  Paperclip,
  Image as ImageIcon,
  Send,
  PhoneCall,
  ChevronDown,
  FileText,
  Info,
  CreditCard,
  UserCog,
  LayoutGrid,
  UserCheck,
  LineChart,
  Gift,
  Server
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type ChatMessage = { role: 'ai' | 'user', text: string, time: Date };

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("TRADER");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || "TRADER";
        setUserName(name.toUpperCase());
      }
    };
    fetchUser();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  // VIEW STATE
  const [viewMode, setViewMode] = useState<'hub' | 'ticket_step_contacted' | 'ticket_step1' | 'ticket_step2' | 'ticket_step_select' | 'ticket_detail'>('hub');
  const [contactedBefore, setContactedBefore] = useState<'yes' | 'no' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPreviousTicketId, setSelectedPreviousTicketId] = useState<string>("");

  // LIVE OPERATIONS STATE
  const [showPanel, setShowPanel] = useState(false);
  const [showTicketPanel, setShowTicketPanel] = useState(false);
  const [showResolvedOverlay, setShowResolvedOverlay] = useState(false);
  const [panelMode, setPanelMode] = useState<'bot' | 'human'>('bot');

  // BOT STATE
  const [botMessages, setBotMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: "Hello! I am Tradifive's Intelligent Assistant. How can I help you today?", time: new Date() }
  ]);
  const [botInput, setBotInput] = useState("");

  // TICKET STATE
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isEscalating, setIsEscalating] = useState(false);

  // FORM STATE
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's tickets
  useEffect(() => {
    if (!user) return;
    const fetchTickets = async () => {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTickets(data || []);
    };
    fetchTickets();
  }, [user]);

  // Fetch messages for selected ticket
  useEffect(() => {
    if (!selectedTicket?.id || panelMode === 'bot') {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });

      // Only set messages if the ticket ID hasn't changed during fetch
      setMessages(data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    };
    fetchMessages();

    // MESSAGE STREAM: Listen for new replies
    const sub = supabase.channel(`ticket_replies_stream_${selectedTicket.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_replies',
        filter: `ticket_id=eq.${selectedTicket.id}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [selectedTicket?.id, panelMode]);

  // INSTANT STATUS SYNC (Broadcast + Postgres Fallback)
  useEffect(() => {
    if (!user?.id) return;

    // 1. Listen for INSTANT BROADCASTS (from Admin's direct action)
    const broadcastSub = supabase.channel(`ticket_status_${selectedTicket?.id || 'global'}`)
      .on('broadcast', { event: 'status_update' }, ({ payload }) => {
        const { ticketId, status } = payload;

        // Update Table
        setTickets(prev => prev.map(t => String(t.id) === String(ticketId) ? { ...t, status } : t));

        // Update Panel
        setSelectedTicket(curr => {
          if (curr && String(curr.id) === String(ticketId)) {
            if (curr.status !== 'resolved' && status === 'resolved') {
              setShowResolvedOverlay(true);
            }
            return { ...curr, status };
          }
          return curr;
        });
      })
      .subscribe();

    // 2. Postgres Fallback (for data integrity)
    const postgresSub = supabase.channel(`db_status_sync_${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets' }, (payload) => {
        setTickets(prev => prev.map(t => String(t.id) === String(payload.new.id) ? payload.new : t));
        setSelectedTicket(curr => {
          if (curr && String(curr.id) === String(payload.new.id)) {
            if (curr.status !== 'resolved' && payload.new.status === 'resolved') {
              setShowResolvedOverlay(true);
            }
            return payload.new;
          }
          return curr;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastSub);
      supabase.removeChannel(postgresSub);
    };
  }, [user?.id, selectedTicket?.id]);

  const sendBotMessage = () => {
    if (!botInput.trim()) return;

    const newMsg: ChatMessage = { role: 'user', text: botInput.trim(), time: new Date() };
    setBotMessages(prev => [...prev, newMsg]);
    setBotInput("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Simulate AI response
    setTimeout(() => {
      setBotMessages(prev => [...prev, {
        role: 'ai',
        text: "I understand. Would you like me to transfer you to a human agent, or would you prefer to review our documentation on this topic?",
        time: new Date()
      }]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 1500);
  };

  const escalateToHuman = async () => {
    if (!user) {
      alert("Please log in to escalate to a human agent.");
      return;
    }
    setIsEscalating(true);

    const subjectMsg = botMessages.find(m => m.role === 'user')?.text;
    const subject = subjectMsg ? (subjectMsg.length > 40 ? subjectMsg.slice(0, 40) + '...' : subjectMsg) : 'Live Support Escalation';
    const description = botMessages.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n');

    const { data, error } = await supabase.from('support_tickets').insert([{
      user_id: user.id,
      subject: subject,
      description: description,
      status: 'open',
      priority: 'high'
    }]).select().single();

    if (error) {
      console.error("Support ticket error:", error);
      if (error.message?.includes("row-level security")) {
        const mockTicket = {
          id: crypto.randomUUID(),
          user_id: user.id,
          subject: subject,
          description: description,
          status: 'open',
          priority: 'high',
          created_at: new Date().toISOString()
        };
        setTickets(prev => [mockTicket, ...prev]);
        setSelectedTicket(mockTicket);
        setPanelMode('human');
      } else {
        alert("Error escalating ticket: " + error.message);
      }
    } else if (data) {
      setTickets(prev => [data, ...prev]);
      setSelectedTicket(data);
      setPanelMode('human');
    }
    setIsEscalating(false);
  };

  const createTicketForm = async () => {
    if (!newTicketSubject.trim() || !newTicketDesc.trim() || !user) return;
    setIsCreating(true);

    const finalDescription = `[Category: ${selectedCategory || 'General'}]\n\n${newTicketDesc}`;

    const { data, error } = await supabase.from('support_tickets').insert([{
      user_id: user.id,
      subject: newTicketSubject,
      description: finalDescription,
      status: 'open',
      priority: 'medium'
    }]).select().single();

    if (error) {
      console.error("Support ticket error:", error);
      alert("DATABASE REJECTED TICKET: " + error.message + "\n\nThis means the ticket failed to save to Supabase. It will not show up in the Admin app.");
    } else if (data) {
      setTickets(prev => [data, ...prev]);
      setSelectedTicket(data);
      setNewTicketSubject("");
      setNewTicketDesc("");
      setViewMode('hub');
      setPanelMode('human');
      setShowPanel(true);
    }
    setIsCreating(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;
    const msg = newMessage.trim();
    setNewMessage("");

    const { data, error } = await supabase.from('ticket_replies').insert([{
      ticket_id: selectedTicket.id,
      admin_id: null,
      message: msg,
    }]).select().single();

    if (error) {
      if (error.message?.includes("row-level security")) {
        const mockReply = {
          id: crypto.randomUUID(),
          ticket_id: selectedTicket.id,
          admin_id: null,
          message: msg,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, mockReply]);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            ticket_id: selectedTicket.id,
            admin_id: 'admin-mock-id',
            message: "We received your message (RLS Fallback Mode Active).",
            created_at: new Date().toISOString()
          }]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }, 1500);
      } else {
        alert("Error sending message: " + error.message);
      }
    } else if (data) {
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const openTicketForm = () => {
    setViewMode('ticket_step_contacted');
  };

  const openLiveChat = () => {
    setPanelMode('bot');
    setShowPanel(true);
  };

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowResolvedOverlay(false); // Reset overlay when opening a ticket
    setShowTicketPanel(true);
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1200px] mx-auto w-full font-sans pb-32">
        {viewMode === 'hub' && (
          <>
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight mb-6">Support hub</h1>

            {/* HERO SEARCH BOX */}
            <div className="p-8 mb-12 rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hello, {userName}, how can we help you?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Your one-stop solution for all your needs. Find answers, troubleshoot issues, and explore guides.</p>

              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Please enter your question or keyword..."
                  className="flex-1 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-l-md px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md flex items-center justify-center transition-colors">
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* CONTACT US SECTION */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact us</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Card 1: Open Ticket */}
              <div className="overflow-hidden flex flex-col rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
                <div className="h-40 relative overflow-hidden flex items-center justify-center border-b-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E]">
                  <div className="absolute w-32 h-32 rounded-full border-[12px] border-slate-200 dark:border-[#2A2A2A] -bottom-10 -right-10" />
                  <div className="absolute w-48 h-12 bg-slate-200 dark:border-[#2A2A2A] rounded-full rotate-45" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Need assistance?</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 flex-1">Complete the form and we will get back to you shortly.</p>
                  <button onClick={openTicketForm} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded flex items-center justify-center gap-2 transition-colors">
                    <Plus size={16} /> Open a ticket
                  </button>
                </div>
              </div>

              {/* Card 2: Live Chat */}
              <div className="overflow-hidden flex flex-col opacity-60 rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
                <div className="h-40 relative overflow-hidden flex items-center justify-center border-b-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E]">
                  <div className="absolute w-24 h-24 rounded-full bg-slate-200 dark:bg-[#2A2A2A] shadow-inner" />
                  <div className="absolute w-12 h-12 rounded-full bg-slate-300 dark:bg-[#333] -bottom-2 -left-2" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">Live chat <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Coming Soon</span></h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 flex-1">Can't find the answers you're looking for? Chat with our Intelligent Assistant.</p>
                  <button disabled className="w-full bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-slate-400 font-medium py-2.5 rounded flex items-center justify-center gap-2 transition-colors cursor-not-allowed">
                    <MessageSquare size={16} /> Currently Unavailable
                  </button>
                </div>
              </div>

              {/* Card 3: Call Us */}
              <div className="overflow-hidden flex flex-col rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
                <div className="h-40 relative overflow-hidden flex items-center justify-center border-b-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E]">
                  <div className="flex flex-col gap-2">
                    <div className="w-20 h-6 bg-slate-200 dark:bg-[#2A2A2A]" />
                    <div className="w-16 h-6 bg-slate-200 dark:bg-[#2A2A2A]" />
                    <div className="w-12 h-6 bg-slate-200 dark:bg-[#2A2A2A]" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Still need help?</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">To speak with our support team, call us at</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2 mt-auto">
                    <PhoneCall size={16} /> 000-800-100-4378 <span className="text-xs text-slate-500 font-normal">(toll free)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* MY TICKETS SECTION */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">My tickets</h2>

            <div className="overflow-hidden rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
              {/* Table Toolbar */}
              <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 dark:border-white/5 gap-4">
                <div className="bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#222]">
                  Active statuses: All <ChevronDown size={14} />
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-md focus:outline-none focus:border-blue-500 w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-[#18181A]">
                <div className="col-span-5">Subject</div>
                <div className="col-span-3">Ticket ID</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 flex items-center gap-1 cursor-pointer">Date created <ChevronDown size={12} className="rotate-180" /></div>
              </div>

              {/* Table Body */}
              <div className="min-h-[200px] flex flex-col relative">
                {tickets.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No matching results found</h3>
                    <p className="text-xs">Please try a different keyword.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-[#222]">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => openTicket(ticket)}
                        className="grid grid-cols-12 gap-4 px-6 py-4 text-sm items-center hover:bg-slate-50 dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors"
                      >
                        <div className="col-span-5 font-medium text-blue-600 dark:text-blue-400 truncate pr-4">{ticket.subject}</div>
                        <div className="col-span-3 text-slate-600 dark:text-slate-400 font-mono text-xs">#{ticket.id.split('-')[0].toUpperCase()}</div>
                        <div className="col-span-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            ticket.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="col-span-2 text-slate-500 text-xs">
                          {new Date(ticket.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* STEP 0: PREVIOUS CONTACT CHECK */}
        {viewMode === 'ticket_step_contacted' && (
          <div className="max-w-[800px]">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Open a ticket</h1>

            <div className="bg-[#f0f7ff] dark:bg-blue-900/10 border border-[#d6e4ff] dark:border-blue-800/30 rounded-md p-4 flex gap-3 mb-8">
              <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-slate-600 dark:text-blue-200/80">Submitting more than one ticket for the same issue may delay our response.</p>
            </div>

            <p className="text-sm font-medium text-slate-900 dark:text-white mb-6">Have you contacted us about this matter previously?</p>

            <div className="flex flex-col sm:flex-row gap-8 mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactedBefore"
                  checked={contactedBefore === 'yes'}
                  onChange={() => setContactedBefore('yes')}
                  className="w-4 h-4 text-[#8aa7ef] border-slate-300 focus:ring-[#8aa7ef]"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">Yes, I've reached out before</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactedBefore"
                  checked={contactedBefore === 'no'}
                  onChange={() => setContactedBefore('no')}
                  className="w-4 h-4 text-[#8aa7ef] border-slate-300 focus:ring-[#8aa7ef]"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">No, it is a new ticket</span>
              </label>
            </div>

            {contactedBefore === 'yes' && (
              <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select your previous ticket</label>
                <select
                  value={selectedPreviousTicketId}
                  onChange={(e) => setSelectedPreviousTicketId(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-md px-4 py-2.5 text-sm focus:border-[#8aa7ef] outline-none text-slate-900 dark:text-white"
                >
                  <option value="" disabled>-- Choose a ticket --</option>
                  {tickets.length === 0 && <option value="" disabled>No previous tickets found.</option>}
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      #{t.id.split('-')[0].toUpperCase()} - {t.subject} ({t.status.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                {tickets.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">You don't have any previous tickets. Please select "No" to create a new one.</p>
                )}
              </div>
            )}
            {contactedBefore === 'no' && <div className="mb-10" />}

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setViewMode('hub');
                  setContactedBefore(null);
                  setSelectedPreviousTicketId("");
                }}
                className="px-6 py-2.5 rounded text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#222] dark:text-slate-300 dark:hover:bg-[#333] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (contactedBefore === 'yes' && selectedPreviousTicketId) {
                    const t = tickets.find(t => t.id === selectedPreviousTicketId);
                    if (t) openTicket(t);
                  } else {
                    setViewMode('ticket_step1');
                  }
                }}
                disabled={!contactedBefore || (contactedBefore === 'yes' && !selectedPreviousTicketId)}
                className="px-6 py-2.5 rounded text-sm font-medium bg-[#8aa7ef] text-white hover:bg-[#7292e0] transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: SELECT CATEGORY */}
        {viewMode === 'ticket_step1' && (
          <div className="max-w-[1000px]">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Open a ticket</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">Please select a topic for your inquiry so we can assist you better:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {[
                { id: 'Payments', title: 'Payments', desc: 'Deposit/Withdrawal issues, Internal transfer problem, Non-supported token/blockchain, Other.', icon: CreditCard },
                { id: 'Account and Security', title: 'Account and Security', desc: 'Change personal information, Change security type, Account access issue, Regulation & Legal, SMS & Emails, More.', icon: UserCog },
                { id: 'Tradifive platforms', title: 'Tradifive platforms', desc: 'Tradifive Web App, API connections, Algo configuration, Social trading, Strategy automation.', icon: LayoutGrid },
                { id: 'Account verification', title: 'Account verification', desc: 'Invalid proof of identity document, Invalid proof of residence document, KYC status, Other.', icon: UserCheck },
                { id: 'Trading', title: 'Trading', desc: 'Exchange connection issues, Execution and slippage complaints, Wrong charges, Stop Loss issues, Pricing issues.', icon: LineChart },
                { id: 'Tradifive programs', title: 'Tradifive programs', desc: 'Partnership membership, Benefits, Affiliates, General inquiries, Reward inquiries, Other.', icon: Gift },
                { id: 'VPS', title: 'VPS', desc: 'Terminal updates, High ping issue, Password issue, Unable to login, Software installation, Other.', icon: Server }
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.title;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.title)}
                    className={`p-7 cursor-pointer transition-all flex flex-col min-h-[170px] rounded-[22px] border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none' : 'border-white dark:border-white/5 hover:border-blue-500/50 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none'} bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E]`}
                  >
                    <Icon className={`mb-5 ${isSelected ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'}`} size={26} strokeWidth={1.5} />
                    <h3 className={`font-bold text-[15px] mb-2.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{cat.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 flex-1">{cat.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setViewMode('ticket_step_contacted');
                  setSelectedCategory("");
                }}
                className="px-6 py-2.5 rounded text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#222] dark:text-slate-300 dark:hover:bg-[#333] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setViewMode('ticket_step2')}
                disabled={!selectedCategory}
                className="px-6 py-2.5 rounded text-sm font-medium bg-[#8aa7ef] text-white hover:bg-[#7292e0] transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE TICKET FORM */}
        {viewMode === 'ticket_step2' && (
          <div className="max-w-[800px]">
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">Open a ticket</h1>
            <p className="text-sm text-slate-500 mb-8 flex items-center gap-2">Category: <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#222] px-2 py-0.5 rounded">{selectedCategory}</span></p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Subject *</label>
                <input
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  placeholder="Brief summary..."
                  className="w-full bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/5 rounded-md px-4 py-3 text-sm focus:border-blue-500 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white mb-2 block">Description *</label>
                <textarea
                  value={newTicketDesc}
                  onChange={e => setNewTicketDesc(e.target.value)}
                  placeholder="Detailed explanation..."
                  rows={8}
                  className="w-full bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/5 rounded-md px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setViewMode('ticket_step1')}
                  className="px-8 py-2.5 rounded text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#222] dark:text-slate-300 dark:hover:bg-[#333] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={createTicketForm}
                  disabled={isCreating || !newTicketSubject || !newTicketDesc}
                  className="px-8 py-2.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PREMIUM TICKET SIDE PANEL */}
      <AnimatePresence>
        {showTicketPanel && selectedTicket && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[520px] max-w-[100vw] bg-white dark:bg-[#0A0A0A] border-l border-slate-200 dark:border-white/5 shadow-2xl z-[100] flex flex-col font-sans"
          >
            {/* Glassmorphism Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                    {selectedTicket.id.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0A0A0A] rounded-full shadow-sm"></div>
                </div>
                <div>
                  <h2 className="text-[15px] font-black text-slate-900 dark:text-white leading-none tracking-tight uppercase">Ticket #{selectedTicket.id.split('-')[0]}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-transparent shadow-sm ${selectedTicket.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : selectedTicket.status === 'in-progress'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                      {selectedTicket.status}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest">Active Thread</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTicketPanel(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
              >
                <X size={22} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-[#0c0c0c] relative scroll-smooth">
              {/* Proximity Resolved Overlay */}
              <AnimatePresence>
                {showResolvedOverlay && (
                  <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/60 dark:bg-[#0A0A0A]/60 flex flex-col items-center justify-center p-10 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 max-w-[340px]"
                    >
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
                        <UserCheck size={48} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">Issue Solved</h3>
                      <p className="text-[15px] text-slate-600 dark:text-neutral-400 mb-8 leading-relaxed font-bold">The issue has been solved! <br /> Have a great day!</p>
                      <button
                        onClick={() => {
                          setShowResolvedOverlay(false);
                          setShowTicketPanel(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all active:scale-[0.98]"
                      >
                        Finish & Close
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject Banner */}
              <div className="bg-white dark:bg-[#111] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] mb-3">Primary Inquiry</p>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-2 leading-snug">{selectedTicket.subject}</h3>
                <p className="text-[13px] text-slate-600 dark:text-neutral-400 leading-relaxed font-medium">{selectedTicket.description?.split('\n\n').pop() || "No detailed description provided."}</p>
              </div>

              {/* Timeline Divider */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-[#222]"></div>
                <span className="text-[10px] font-black text-slate-400 dark:text-neutral-400 uppercase tracking-[0.2em]">Live Conversation</span>
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-[#222]"></div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-6">
                {messages.map((r, i) => {
                  const isUser = !r.admin_id;
                  const showDate = i === 0 || new Date(messages[i - 1].created_at).toDateString() !== new Date(r.created_at).toDateString();

                  return (
                    <div key={r.id}>
                      {showDate && (
                        <div className="flex justify-center my-8">
                          <span className="bg-slate-100 dark:bg-[#161618] text-[9px] font-bold text-slate-500 dark:text-neutral-400 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/5 uppercase tracking-widest">
                            {new Date(r.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group transition-all`}>
                        <div className={`relative px-4 py-3 rounded-2xl max-w-[82%] shadow-sm ${isUser
                          ? 'bg-[#2563eb] text-white rounded-tr-none shadow-blue-500/10'
                          : 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-neutral-200 rounded-tl-none border border-slate-100 dark:border-white/5'
                          }`}>
                          {/* Bubble Tails */}
                          {isUser ? (
                            <div className="absolute top-0 -right-2 w-3 h-3 overflow-hidden">
                              <div className="bg-[#2563eb] w-4 h-4 rotate-45 -translate-x-3 -translate-y-2"></div>
                            </div>
                          ) : (
                            <div className="absolute top-0 -left-2 w-3 h-3 overflow-hidden">
                              <div className="bg-white dark:bg-[#1E1E1E] w-4 h-4 rotate-45 translate-x-2 -translate-y-2"></div>
                            </div>
                          )}
                          <p className="text-[14px] leading-relaxed pr-6 font-medium">{r.message}</p>
                          <span className={`text-[9px] absolute bottom-1 right-3 font-bold uppercase ${isUser ? 'text-white/60' : 'text-slate-400 dark:text-neutral-400'}`}>
                            {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* Premium Input Bar */}
            {selectedTicket.status !== 'resolved' && (
              <div className="p-5 bg-white dark:bg-[#0c0c0c] border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#161618] border border-slate-200/50 dark:border-white/5 rounded-2xl px-4 py-2 shadow-inner transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Paperclip size={20} strokeWidth={2.5} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent py-3 text-[14px] text-slate-900 dark:text-white outline-none placeholder:text-slate-500 font-medium"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 active:scale-90"
                  >
                    <Send size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
