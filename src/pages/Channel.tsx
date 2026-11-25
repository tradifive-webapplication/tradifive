import React, { useState, useEffect, useRef } from "react";
import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   Plus as IconlyPlus,
   Send as IconlySend,
   User as IconlyUser,
   VolumeUp as IconlyVolumeUp,
   VolumeOff as IconlyVolumeOff,
   Scan as IconlyScan,
   TicketStar as IconlyTicketStar,
   Image as IconlyImage,
   Video as IconlyVideo,
   Folder as IconlyFolder,
   Paper as IconlyPaper,
   Graph as IconlyGraph,
   Voice as IconlyVoice,
   Bookmark as IconlyBookmark,
   Notification as IconlyNotification,
   Logout as IconlyLogout,
   Danger as IconlyDanger,
   InfoCircle as IconlyInfoCircle,
   Setting as IconlySetting,
   Delete as IconlyDelete,
   ArrowUp as IconlyArrowUp,
   Upload as IconlyUpload
} from "react-iconly";

import { Link, useNavigate, useParams } from "react-router-dom";
import { CommunityPageWrapper } from "@/components/CommunityShell";
import { 
    Activity, ArrowLeft, Heart, MoreHorizontal, MoreVertical, Search, Share2, ShieldCheck, Star, 
    Pin, Gift, Phone, User, Users, Bookmark, Settings as SettingsIcon, 
    Send, Plus, Eye, MessageSquare, Menu, LogOut, AlertTriangle, Info,
    Image as ImageIcon, Film, Folder, Link2, BarChart2, Mic, QrCode, Trash, Paperclip, Smile, Edit2, Copy, Crown, Video, GraduationCap, CreditCard, Cpu, LineChart, BookOpen, MessageCircle,
    Megaphone, CheckCircle2, VolumeX, Volume2, X, CornerUpRight, SendHorizonal, Search as SearchIcon, Globe, Lock, ArrowRight, Bell, ShieldAlert, Settings, CornerUpLeft, EyeOff, ChevronLeft, Download, PenLine, ExternalLink, Trash2, Shield, Check,
    UserPlus, Radio, Camera, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import EmojiPicker from 'emoji-picker-react';
import { supabase } from "@/lib/supabase";
import { useChannelData, MessageType } from "@/hooks/useChannelData";
import { usePlan } from "@/hooks/usePlan";

const getChannelGradient = (name: string) => {
  const gradients = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-violet-600 to-purple-800',
    'from-amber-600 to-orange-700',
    'from-rose-600 to-pink-700',
    'from-sky-600 to-cyan-700',
    'from-slate-700 to-zinc-900',
  ];
  let sum = 0;
  for (let i = 0; i < (name || '').length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

const getChannelInitials = (name: string) => {
  const words = (name || "CH").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0] || "CH").slice(0, 2).toUpperCase();
};

const renderChannelAvatar = (
  channel: { name: string; avatar?: string | null },
  sizeClass: string = "w-11 h-11 text-xs",
  roundedClass: string = "rounded-2xl"
) => {
  if (channel.avatar) {
    return (
      <img
        src={channel.avatar}
        alt={channel.name}
        className={`${sizeClass} ${roundedClass} object-cover bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-white/10 shrink-0 shadow-xs`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  const gradient = getChannelGradient(channel.name);
  const initials = getChannelInitials(channel.name);
  return (
    <div
      className={`${sizeClass} ${roundedClass} bg-gradient-to-br ${gradient} text-white font-extrabold flex items-center justify-center shrink-0 shadow-xs tracking-wider border border-white/20 select-none`}
    >
      {initials}
    </div>
  );
};

const MARKET_CATEGORIES = [
  "Forex / Gold",
  "Crypto",
  "Indices",
  "Stocks",
  "Commodities",
  "Options",
  "Multi-Asset"
];

const STRATEGY_STYLES = [
  "Scalping",
  "Day Trading",
  "Swing Trading",
  "Smart Money (SMC)",
  "Price Action",
  "Algorithmic"
];

export default function Channel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { canAccess, isStarter, isElite, channelLimit, plan } = usePlan();

  const { channelId } = useParams<{ channelId: string }>();
  const [activeChannelId, setActiveChannelId] = useState(channelId || "");
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(() => Boolean(channelId) ? 'chat' : 'list');
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [showDetails, setShowDetails] = useState(false); // Drawer state
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (channelId) {
      setActiveChannelId(channelId);
      setMobileView('chat');
    }
  }, [channelId]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // 1. Auth session check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
      } else {
        setUser(session.user);
        setAuthChecked(true);
      }
    };
    checkUser();
  }, [navigate]);

  // 2. Real-time Database Messaging Hook
  const { channels: dbChannels, messages: dbMessages, loading: dbLoading, sendMessage, updateMessage, deleteMessage, editMessage, clearHistory, markAsSeen, refetchChannels, isMember, joinChannel, leaveChannel } = useChannelData(user?.id ?? "", activeChannelId);

  // Create Channel Modal State
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelType, setNewChannelType] = useState<"public" | "vip" | "private">("public");
  const [newChannelMarket, setNewChannelMarket] = useState("Forex / Gold");
  const [newChannelStyle, setNewChannelStyle] = useState("Scalping");
  const [newAllowMessages, setNewAllowMessages] = useState(false);
  const [newVipPrice, setNewVipPrice] = useState("");
  const [newBrokerLink, setNewBrokerLink] = useState("");
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [selectedInvites, setSelectedInvites] = useState<Record<string, boolean>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const channelAvatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be under 5MB");
      return;
    }
    setNewAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setNewAvatarPreview(previewUrl);
  };
  
  const userAccountType = localStorage.getItem('tradifive_cached_account_type') || 'personal';

  // Manage Channel State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageType, setManageType] = useState("public");
  const [manageMessages, setManageMessages] = useState(true);
  const [manageVipPrice, setManageVipPrice] = useState("");
  const [manageBrokerLink, setManageBrokerLink] = useState("");
  const [manageAvatar, setManageAvatar] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState<string | null>(null);
  
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string;
    isMe: boolean;
    content: string;
  } | null>(null);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showInlineNotifications, setShowInlineNotifications] = useState(false);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const isChannelAdmin = dbChannels.find(c => c.id === activeChannelId)?.created_by === user?.id;
  const isEffectiveMember = isMember || isChannelAdmin;

  useEffect(() => {
    if (isCreateModalOpen && user?.id) {
        const fetchFollows = async () => {
            const { data } = await supabase
                .from('social_follows')
                .select('following_id, profiles!social_follows_following_id_fkey(id, username, display_name, avatar_url)')
                .eq('follower_id', user.id);
            if (data) {
                setFollowedUsers(data.map((d: any) => d.profiles));
            }
        };
        fetchFollows();
    } else {
        setCreateStep(1);
        setSelectedInvites({});
        setNewChannelName("");
        setNewChannelDesc("");
        setNewChannelType("public");
        setNewChannelMarket("Forex / Gold");
        setNewChannelStyle("Scalping");
        setNewAllowMessages(false);
        setNewVipPrice("");
        setNewBrokerLink("");
        setNewAvatarFile(null);
        setNewAvatarPreview(null);
        setShowAdvanced(false);
    }
  }, [isCreateModalOpen, user?.id]);

  const handleCreateChannel = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (createStep === 1) {
        if (!newChannelName.trim()) {
            toast.error('Channel name is required');
            return;
        }
        if (followedUsers.length > 0) {
            setCreateStep(2);
            return;
        }
    }

    setIsCreating(true);
    try {
      const currentUser = user;
      if (!currentUser) {
        toast.error('You must be logged in to create a channel');
        setIsCreating(false);
        return;
      }

      if (newChannelType === 'private' && !canAccess('private_channels')) {
        toast.error('Upgrade to Pro to create Private Channels');
        setIsCreating(false);
        return;
      }
      if (newChannelType === 'vip' && !canAccess('vip_channels')) {
        toast.error('Upgrade to Elite to create paid VIP Channels');
        setIsCreating(false);
        return;
      }
      if (Number.isFinite(channelLimit)) {
        const { count: ownedCount } = await supabase
          .from('channels')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', currentUser.id);
        if ((ownedCount ?? 0) >= channelLimit) {
          toast.error(
            plan === 'starter'
              ? 'Standard allows 1 Public Channel. Upgrade to Pro to create up to 3 channels.'
              : 'Pro allows up to 3 channels. Upgrade to Elite for unlimited VIP channels.'
          );
          setIsCreating(false);
          return;
        }
      }

      let uploadedAvatarUrl: string | null = null;
      if (newAvatarFile) {
        try {
          const fileExt = newAvatarFile.name.split('.').pop() || 'png';
          const filePath = `channel-avatars/${currentUser.id}-${Date.now()}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage.from('attachments').upload(filePath, newAvatarFile, { upsert: true });
          if (!uploadErr) {
            const { data: pubData } = supabase.storage.from('attachments').getPublicUrl(filePath);
            uploadedAvatarUrl = pubData.publicUrl;
          }
        } catch (uploadErr) {
          console.warn("Avatar upload fallback:", uploadErr);
        }
      }

      const slug = newChannelName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
      const rules = {
        is_vip: newChannelType === 'vip',
        vip_price: newVipPrice || null,
        category: newChannelMarket,
        trading_style: newChannelStyle,
        allow_messages: newAllowMessages,
        broker_link: newBrokerLink || null,
        avatar: uploadedAvatarUrl || null
      };

      const { data, error } = await supabase.from('channels').insert({
          name: newChannelName.trim(),
          description: newChannelDesc.trim() || `${newChannelMarket} trading signals and setups`,
          slug: slug,
          created_by: currentUser.id,
          channel_type: newChannelType === 'vip' ? 'private' : newChannelType,
          is_official: false,
          rules: JSON.stringify(rules)
      }).select().single();

      if (error) throw error;

      if (data?.id) {
          await supabase.from('channel_members').insert({
              channel_id: data.id,
              user_id: currentUser.id,
              role: 'admin'
          });
          
          const invitesToInsert = Object.keys(selectedInvites).filter(k => selectedInvites[k]).map(uid => ({
              channel_id: data.id,
              user_id: uid,
              role: 'member'
          }));
          if (invitesToInsert.length > 0) {
              await supabase.from('channel_members').insert(invitesToInsert);
          }
      }

      toast.success("Channel created successfully!");
      setIsCreateModalOpen(false);
      refetchChannels();
      if (data?.id) {
        setActiveChannelId(data.id);
        setMobileView('chat');
      }
    } catch (err: any) {
        toast.error(`Failed to create channel: ${err.message || JSON.stringify(err)}`);
        console.error("Channel creation error details:", err);
    } finally {
        setIsCreating(false);
    }
  };
  
  const toggleInvite = (uid: string) => {
      setSelectedInvites(prev => ({ ...prev, [uid]: !prev[uid] }));
  };
  
  const handleSaveSettings = async () => {
    if (!activeChannelId) return;
    setIsSavingSettings(true);
    try {
        const { error } = await supabase
            .from('channels')
            .update({
                channel_type: manageType === "vip" ? "private" : manageType,
                rules: JSON.stringify({ 
                  allow_messages: manageMessages,
                  is_vip: manageType === "vip",
                  vip_price: manageType === "vip" ? manageVipPrice : null,
                  broker_link: manageType === "vip" ? manageBrokerLink : null,
                  avatar: manageAvatar || null
                })
            })
            .eq('id', activeChannelId);
        
        if (error) throw error;
        toast.success('Channel settings updated');
        setIsManageModalOpen(false);
        refetchChannels();
    } catch(err: any) {
        toast.error('Failed to update settings');
    } finally {
        setIsSavingSettings(false);
    }
  };

  const handleDeleteChannel = async () => {
    toast("Delete Channel", {
      description: "Are you sure you want to delete this channel? This action cannot be undone.",
      action: {
        label: "Yes, Delete",
        onClick: async () => {
          try {
            const { error } = await supabase
              .from('channels')
              .delete()
              .eq('id', activeChannelId)
              .eq('created_by', user?.id);
            
            if (error) throw error;
            
            toast.success("Channel deleted successfully!");
            setActiveChannelId("");
            refetchChannels();
            navigate('/channel', { replace: true });
          } catch (err: any) {
            toast.error("Failed to delete channel");
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  const handleLeaveChannel = async () => {
    toast("Leave Channel", {
      description: "Are you sure you want to leave this channel?",
      action: {
        label: "Yes, Leave",
        onClick: async () => {
          try {
            await leaveChannel();
            toast.success("You have left the channel.");
          } catch (err) {
            toast.error("Failed to leave channel");
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  // Sync default active channel once loaded
  useEffect(() => {
    if (dbChannels.length > 0 && !dbChannels.some(c => c.id === activeChannelId)) {
      if (!channelId) {
        setActiveChannelId(dbChannels[0].id);
      }
    } else if (dbChannels.length === 0 && !channelId) {
      setActiveChannelId("");
    }
  }, [dbChannels, activeChannelId, channelId]);

  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    // Only scroll to bottom if a new message is added (length increased)
    if (dbMessages.length > prevMessageCountRef.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = dbMessages.length;

    // Real-time Views: Mark unseen messages as seen
    const unreadMessages = dbMessages.slice(-20).filter(m => m.user_id !== user?.id);
    unreadMessages.forEach(m => {
        try {
            const parsed = JSON.parse(m.content);
            if (!parsed.seen_by || !parsed.seen_by.includes(user?.id)) {
                markAsSeen(m.id, m.content);
            }
        } catch(e) {}
    });
  }, [dbMessages, user?.id, markAsSeen]);

  useEffect(() => {
    // Force scroll down when switching active channel
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  }, [activeChannelId]);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme") || "light";
      setThemeMode(currentTheme);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

function ChannelSkeleton() {
  return (
    <div className="w-full h-full flex min-h-0 select-none animate-pulse">
      {/* Sidebar column (Channels List) */}
      <div className="w-[360px] shrink-0 border-r border-slate-150 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#121212] p-4 space-y-6">
        <div className="h-9 w-full bg-slate-250 dark:bg-[#1E1E1E] rounded-xl border-2 border-white dark:border-white/5 shadow-xs" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-white/5" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat window skeleton */}
      <div className="flex-1 flex flex-col bg-[#F1F5F9] dark:bg-[#0A0A0A]">
        {/* Chat header */}
        <div className="h-[60px] px-6 border-b border-slate-150 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-white/5" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-white/5 shadow-xs" />
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-white/5 shadow-xs" />
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-white/5 shadow-xs" />
          </div>
        </div>

        {/* Chat body messages list */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Left message (received) */}
          <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-white/5" />
            <div className="p-4 rounded-2xl rounded-bl-none bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-white/5 shadow-xs w-2/3 space-y-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>

          {/* Right message (sent) */}
          <div className="flex items-start gap-3 justify-end max-w-2xl ml-auto flex-row-reverse">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-white/5" />
            <div className="p-4 rounded-2xl rounded-br-none bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-white/5 shadow-xs w-1/2 space-y-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>

          {/* Left message (received) */}
          <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-white/5" />
            <div className="p-4 rounded-2xl rounded-bl-none bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-white/5 shadow-xs w-3/5 space-y-2">
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* Chat input footer */}
        <div className="p-4 px-6 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212]">
          <div className="h-12 w-full bg-slate-100 dark:bg-[#1E1E1E] rounded-[24px] border border-transparent" />
        </div>
      </div>
    </div>
  );
}

  if (!authChecked || (dbLoading && dbChannels.length === 0)) {
    return (
      <CommunityPageWrapper 
        noPadding={true} 
        noScroll={true}
        breadcrumbs={[{ label: 'Channel', path: '/channel' }, { label: 'Loading...' }]}
      >
        <ChannelSkeleton />
      </CommunityPageWrapper>
    );
  }

  // Blended Channels mapping
  const finalChannels = dbChannels.map(ch => {
    let rulesObj: any = {};
    try {
      rulesObj = typeof ch.rules === 'string' ? JSON.parse(ch.rules || '{}') : (ch.rules || {});
    } catch(e){}

    const memberCount = typeof ch.member_count === 'number'
      ? ch.member_count
      : (ch.member_count ? parseInt(ch.member_count, 10) : 1);
    const subText = `${memberCount} ${memberCount === 1 ? 'subscriber' : 'subscribers'}`;

    const rawAvatar = ch.avatar_url || rulesObj.avatar;
    const cleanAvatar = (rawAvatar && typeof rawAvatar === 'string' && !rawAvatar.includes('pravatar.cc')) 
      ? rawAvatar 
      : null;

    return {
      id: ch.id,
      name: ch.name,
      handle: ch.slug,
      unread: 0,
      time: new Date(ch.created_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      content: ch.description || "Welcome to the channel!",
      avatar: cleanAvatar,
      verified: ch.is_official || false,
      subscribers: subText,
      memberCount: memberCount,
      isBroadcast: ch.channel_type === "public",
      created_by: ch.created_by,
      channel_type: ch.channel_type,
      rules: ch.rules
    };
  });

  const activeChannel = finalChannels.find(c => c.id === activeChannelId);

  // Blended Messages mapping
  const finalMessages = activeChannelId
    ? dbMessages.map(m => {
        let textContent = m.content;
        let reactionsObj = {};
        let mediaUrl = null;
        let messageType = 'text';
        let msgViews = 1;

        let pollData = null;

        try {
            const parsed = JSON.parse(m.content);
            if (parsed && typeof parsed === 'object' && parsed.type) {
                textContent = parsed.text || '';
                messageType = parsed.type;
                if (parsed.url) mediaUrl = parsed.url;
                if (parsed.reactions) reactionsObj = parsed.reactions;
                if (parsed.views) msgViews = parsed.views;
                if (parsed.type === 'poll') {
                    pollData = {
                        question: parsed.question,
                        options: parsed.options,
                        totalVotes: parsed.totalVotes
                    };
                }
            }
        } catch(e) {
            // normal text
        }

        return {
          id: m.id,
          sender: m.profiles?.full_name || m.profiles?.username || "Anonymous Member",
          avatar: m.profiles?.avatar_url || "/default-avatar.svg",
          content: textContent,
          views: msgViews.toString(),
          time: new Date(m.created_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          reactions: reactionsObj,
          image: messageType === 'image' ? mediaUrl : null,
          video: messageType === 'video' ? mediaUrl : null,
          type: messageType,
          poll: pollData,
          isMe: m.user_id === user?.id
        };
      })
    : [];

  // Dynamic metrics calculation
  const photosCount = finalMessages.filter(m => m.type === 'image').length;
  const videosCount = finalMessages.filter(m => m.type === 'video').length;
  const pollsCount = finalMessages.filter(m => m.type === 'poll').length;
  const linksCount = finalMessages.filter(m => m.content && (m.content.includes('http://') || m.content.includes('https://'))).length;

  const activeDetails = activeChannel ? {
    handle: activeChannel.handle,
    link: `${window.location.host}/channel/${activeChannel.handle || activeChannel.id}`,
    description: activeChannel.content || "Official Tradifive communication channel.",
    giftsCount: "0 gifts",
    photosCount: `${photosCount} ${photosCount === 1 ? 'photo' : 'photos'}`,
    videosCount: `${videosCount} ${videosCount === 1 ? 'video' : 'videos'}`,
    filesCount: "0 files",
    linksCount: `${linksCount} shared ${linksCount === 1 ? 'link' : 'links'}`,
    pollsCount: `${pollsCount} ${pollsCount === 1 ? 'poll' : 'polls'}`,
    voicesCount: "0 voice messages",
    gifsCount: "0 GIFs",
    similarCount: `${Math.max(0, dbChannels.length - 1)} other ${Math.max(0, dbChannels.length - 1) === 1 ? 'channel' : 'channels'}`,
    subscribers: activeChannel.subscribers
  } : {
    handle: "",
    link: "",
    description: "",
    giftsCount: "0 gifts",
    photosCount: "0 photos",
    videosCount: "0 videos",
    filesCount: "0 files",
    linksCount: "0 shared links",
    pollsCount: "0 polls",
    voicesCount: "0 voice messages",
    gifsCount: "0 GIFs",
    similarCount: "0 channels",
    subscribers: "0 subscribers"
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      toast.info("Channel notifications muted");
    } else {
      toast.success("Channel notifications unmuted");
    }
  };

  const handleReactionClick = async (messageId: string, emoji: string) => {
    const targetMsg = dbMessages.find(m => m.id === messageId);
    if (!targetMsg) return;
    
    let parsedObj: any = {};
    let reactionsObj: Record<string, number> = {};

    try {
      const parsed = JSON.parse(targetMsg.content);
      if (parsed && typeof parsed === 'object' && parsed.type) {
         parsedObj = { ...parsed };
         reactionsObj = parsed.reactions || {};
      } else {
         parsedObj = { type: 'text', text: targetMsg.content };
      }
    } catch(e) {
      parsedObj = { type: 'text', text: targetMsg.content };
    }

    reactionsObj[emoji] = (reactionsObj[emoji] || 0) + 1;
    parsedObj.reactions = reactionsObj;

    const newContent = JSON.stringify(parsedObj);

    // Optimistic Update
    updateMessage(messageId, newContent);

    await supabase.from('channel_messages').update({ content: newContent }).eq('id', messageId);
    setActiveReactionMessageId(null);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    if (editingMessageId) {
      const targetMsg = dbMessages.find(m => m.id === editingMessageId);
      if (targetMsg) {
        let parsedObj: any = {};
        
        try {
          const parsed = JSON.parse(targetMsg.content);
          if (parsed && typeof parsed === 'object' && parsed.type) {
            parsedObj = { ...parsed };
          } else {
            parsedObj = { type: 'text' };
          }
        } catch(e) {
          parsedObj = { type: 'text' };
        }
        
        if (parsedObj.type === 'poll') {
           parsedObj.question = inputText.trim();
        } else {
           parsedObj.text = inputText.trim();
        }
        
        const updatedContent = JSON.stringify(parsedObj);
        
        updateMessage(editingMessageId, updatedContent);
        await editMessage(editingMessageId, updatedContent);
      }
      setEditingMessageId(null);
      setInputText("");
      return;
    }

    setIsUploading(true);
    let uploadedUrl = null;
    let msgType = 'text';

    if (attachment) {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;
      try {
        const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, attachment);
        if (!uploadError) {
           const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
           uploadedUrl = data.publicUrl;
           msgType = attachment.type.startsWith('video/') ? 'video' : 'image';
        } else {
           toast.error("Attachment failed. Make sure you have an 'attachments' bucket in Supabase.");
        }
      } catch (err) {}
    }

    const payload = {
      type: msgType,
      text: inputText.trim(),
      url: uploadedUrl,
      reactions: {}
    };

    await sendMessage(JSON.stringify(payload));

    setInputText("");
    removeAttachment();
    setShowEmojiPicker(false);
    setIsUploading(false);

    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInsertSignalTemplate = () => {
    const template = `⚡ TRADE SETUP\nAsset: XAUUSD\nOrder: BUY LIMIT\nEntry: \nStop Loss: \nTake Profit 1: \nTake Profit 2: \nRisk: 1%\nRationale: `;
    setInputText((prev) => (prev ? `${prev}\n\n${template}` : template));
  };

  const handleCreatePoll = async () => {
    const validOptions = pollOptions.filter(o => o.trim() !== "");
    if (!pollQuestion.trim() || validOptions.length < 2) {
      toast.error("Please enter a question and at least 2 options");
      return;
    }
    
    const pollData = {
      type: 'poll',
      question: pollQuestion,
      options: validOptions.map(o => ({ text: o, votes: 0 })),
      totalVotes: 0
    };
    
    await sendMessage(JSON.stringify(pollData));
    setIsPollModalOpen(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    toast.success("Poll created");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputText("");
  };

  const onEmojiClick = (emojiData: any) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const handleSharePost = (channelId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/channel/${channelId}`);
    toast.success("Channel link copied to clipboard!");
  };

  // Filter channels based on search query
  const filteredChannels = finalChannels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CommunityPageWrapper 
      noPadding={true} 
      noScroll={true} 
      breadcrumbs={[{ label: 'Channel', path: '/channel' }, { label: activeChannel ? activeChannel.name : 'Loading...' }]}
    >
      <div className="font-sans relative flex w-full bg-white dark:bg-[#121212] text-slate-800 dark:text-slate-100 rounded-b-[2.4rem] overflow-hidden flex-1 min-h-0 select-none transition-colors duration-200">
        
        <style dangerouslySetInnerHTML={{__html: `
          .amazing-scrollbar::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          .amazing-scrollbar::-webkit-scrollbar-button {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .amazing-scrollbar::-webkit-scrollbar-track {
            background: transparent !important;
          }
          .amazing-scrollbar::-webkit-scrollbar-thumb {
            background: transparent !important;
            border-radius: 9999px;
            transition: background 0.15s ease-in-out;
          }
          .amazing-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.25) !important;
          }
          .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.45) !important;
          }
          .dark .amazing-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08) !important;
          }
          .dark .amazing-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.18) !important;
          }
        `}} />

        {/* --- 1. CHANNEL LIST COLUMN (Editorial Channels Hub) --- */}
        <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} relative w-full md:w-[400px] shrink-0 border-r border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex-col overflow-hidden h-full`}>
          {(() => {
              const getChannelTag = (name: string) => {
                const words = (name || "CH").trim().split(/\s+/).filter(Boolean);
                if (words.length >= 2) {
                  return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
                }
                return (words[0] || "CH").slice(0, 4).toUpperCase();
              };

              const myChannel = filteredChannels.find((c) => c.created_by === user?.id);

              const openChannelRoom = (channelId: string) => {
                setActiveChannelId(channelId);
                setMobileView('chat');
              };

              return (
                <>
                  <div className="flex-1 overflow-y-auto amazing-scrollbar bg-white dark:bg-[#121212] min-h-0 px-3.5 sm:px-4 pt-4 pb-24 space-y-5">
                    {/* Title & Subtitle + New Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h1 className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                          Channels
                        </h1>
                        <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                          Broadcasting rooms for live setups, signals & trade ideas.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-9 px-3.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[12px] hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                        title="Create a Channel"
                      >
                        <Plus size={14} strokeWidth={2.6} />
                        <span>New</span>
                      </button>
                    </div>

                    {/* Rounded Search Pill */}
                    <div className="relative w-full">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                        size={16}
                        strokeWidth={2.2}
                      />
                      <input
                        type="text"
                        placeholder="Search channels by name or tag"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 bg-slate-100/90 dark:bg-white/[0.07] border border-transparent focus:border-slate-300 dark:focus:border-white/20 rounded-full pl-11 pr-9 text-[14px] font-normal placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-slate-900 dark:text-white outline-none transition-colors"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    {/* Featured Dark Card: YOUR CHANNEL (only if user actually created a channel) */}
                    {myChannel && !searchQuery && (
                      <div className="rounded-[22px] bg-gradient-to-br from-[#18181B] via-[#0B0B0D] to-[#1E1E24] text-white p-4 border border-white/10 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)]">
                        <div className="flex items-start gap-3.5">
                          {renderChannelAvatar(myChannel, "w-14 h-14 text-base", "rounded-2xl")}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 block">
                                YOUR CHANNEL
                              </span>
                              <Crown size={12} className="text-amber-400 fill-amber-400/20" />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <h2 className="text-[17px] font-bold text-white leading-tight truncate">
                                {myChannel.name}
                              </h2>
                              <span className="px-1.5 py-0.5 rounded-md bg-white/12 border border-white/15 text-[10px] font-extrabold text-zinc-200 tracking-wide shrink-0">
                                {getChannelTag(myChannel.name)}
                              </span>
                            </div>
                            <p className="text-[12px] text-zinc-400 mt-1 truncate">
                              {myChannel.subscribers}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 mt-4">
                          <button
                            type="button"
                            onClick={() => openChannelRoom(myChannel.id)}
                            className="px-5 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-[13px] font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const inviteUrl = `${window.location.origin}/channel/${myChannel.id}`;
                              navigator.clipboard.writeText(inviteUrl);
                              toast.success("Channel invite link copied!");
                            }}
                            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          >
                            <Link2 size={14} />
                            <span>Invite</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CHANNELS Feed (Filters out user's pinned channel if already shown above) */}
                    {(() => {
                      const displayChannels = myChannel && !searchQuery
                        ? filteredChannels.filter(c => c.id !== myChannel.id)
                        : filteredChannels;

                      if (displayChannels.length === 0) {
                        return (
                          <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center bg-slate-50/50 dark:bg-white/[0.01]">
                            <p className="text-[12.5px] font-semibold text-slate-600 dark:text-zinc-300">
                              No other public channels found
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                              Explore verified channels and signal providers in Discover.
                            </p>
                            <Link
                              to="/discover"
                              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11.5px] font-bold hover:opacity-90 active:scale-95 transition-all"
                            >
                              <IconlyDiscovery set="curved" primaryColor="currentColor" size={13} />
                              <span>Explore Discover</span>
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between px-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-zinc-400">
                              {myChannel && !searchQuery ? `COMMUNITY CHANNELS (${displayChannels.length})` : `CHANNELS (${displayChannels.length})`}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            {displayChannels.map((ch, idx) => {
                              const isActive = ch.id === activeChannelId;
                              const isCreator = ch.created_by === user?.id;
                              const isJoined = isActive || isCreator;
                              const tag = getChannelTag(ch.name);
                              const rank = idx + 1;

                              return (
                                <div
                                  key={ch.id}
                                  onClick={() => openChannelRoom(ch.id)}
                                  className={`group rounded-2xl p-2.5 flex items-center gap-3 cursor-pointer transition-all border ${
                                    isActive
                                      ? "bg-slate-100/90 dark:bg-white/[0.08] border-slate-300 dark:border-white/20 shadow-xs"
                                      : "bg-white dark:bg-white/[0.02] hover:bg-slate-50/90 dark:hover:bg-white/[0.04] border-slate-200/70 dark:border-white/5"
                                  }`}
                                >
                                  {/* Rank badge */}
                                  <span
                                    className={`w-5 text-center text-[12px] font-extrabold shrink-0 tabular-nums ${
                                      rank === 1
                                        ? "text-amber-500"
                                        : rank === 2
                                        ? "text-slate-400"
                                        : rank === 3
                                        ? "text-amber-700 dark:text-amber-600"
                                        : "text-slate-400/80 dark:text-zinc-600"
                                    }`}
                                  >
                                    #{rank}
                                  </span>

                                  {/* Avatar */}
                                  {renderChannelAvatar(ch, "w-11 h-11 text-xs", "rounded-xl")}

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
                                        {ch.name}
                                      </h3>
                                      {ch.verified && (
                                        <CheckCircle2
                                          size={12}
                                          className="text-blue-500 fill-blue-500/20 shrink-0"
                                        />
                                      )}
                                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[9.5px] font-extrabold text-slate-600 dark:text-zinc-300 shrink-0">
                                        {tag}
                                      </span>
                                      {isCreator && (
                                        <Crown
                                          size={12}
                                          className="text-amber-500 fill-amber-500/20 shrink-0"
                                          title="Your Channel"
                                        />
                                      )}
                                    </div>
                                    <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                      {ch.subscribers}
                                    </p>
                                  </div>

                                  {/* Action pill */}
                                  <div className="shrink-0">
                                    {isJoined ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10">
                                        <Check size={11} strokeWidth={2.6} />
                                        <span>Joined</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openChannelRoom(ch.id);
                                        }}
                                        className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 transition-all cursor-pointer shadow-2xs"
                                      >
                                        Join
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Empty State */}
                    {filteredChannels.length === 0 && (
                      <div className="py-10 text-center">
                        <p className="text-[14px] font-semibold text-slate-500 dark:text-zinc-400">
                          {searchQuery
                            ? `No channels found matching "${searchQuery}".`
                            : "No channels yet. Start the first trading channel below!"}
                        </p>
                      </div>
                    )}

                    {/* Tactile "Start a channel" Action Card */}
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full text-left rounded-[20px] border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/70 hover:bg-slate-100/90 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] p-3.5 flex items-center gap-3 transition-all cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Plus size={18} strokeWidth={2.6} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">
                          Create a channel
                        </h4>
                        <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          Broadcast live setups, charts, and signals to subscribers.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Floating Black Tactile + Button (Create Channel) */}
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="md:hidden fixed right-5 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5.25rem)] z-40 w-[52px] h-[52px] rounded-full tactile-black-pill flex items-center justify-center cursor-pointer select-none"
                    title="Start a channel"
                    aria-label="Start a channel"
                  >
                    <Plus size={24} strokeWidth={2.6} />
                  </button>
                </>
              );
            })()}

        </div>

        {/* --- 2. RIGHT CHAT WINDOW COLUMN --- */}
        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-[#000000] relative overflow-hidden h-full`}>
          {activeChannel ? (
            <>
          
          {/* Chat Header */}
          <div className="p-3 sm:p-4 px-3 sm:px-6 border-b border-slate-150/50 dark:border-white/5 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl flex items-center justify-between z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] h-[64px] sm:h-[68px] shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Mobile Back Button to Channels List */}
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 shrink-0 active:scale-95 cursor-pointer"
                title="Back to Channels"
              >
                <ChevronLeft size={18} />
              </button>
              <div 
                className="cursor-pointer flex-1 flex items-center gap-2.5 sm:gap-3 min-w-0 group" 
                onClick={() => setShowDetails(!showDetails)}
                title="Click to view channel details"
              >
                {renderChannelAvatar(activeChannel, "w-9 h-9 sm:w-10 sm:h-10 text-xs", "rounded-xl shadow-2xs")}
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] sm:text-[15.5px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none mb-1 truncate group-hover:text-blue-500 transition-colors">
                    <span className="truncate">{activeChannel.name}</span>
                    {isChannelAdmin && <Crown size={14} className="text-amber-500 fill-amber-500/20 shrink-0 ml-0.5" title="You created this channel" />}
                    {activeChannel.verified && <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/20 dark:text-blue-400 dark:fill-blue-400/20 shrink-0" />}
                  </h2>
                  <p className="text-[11px] sm:text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 leading-none truncate">
                    {activeChannel.id === "saved" ? "Personal saved notes" : activeChannel.subscribers || "Conversation"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={handleToggleMute}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 active:scale-95 cursor-pointer"
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              >
                {isMuted ? <VolumeX size={18} className="text-slate-400" /> : <Volume2 size={18} />}
              </button>

              <button 
                onClick={() => setShowDetails(!showDetails)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  showDetails 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10'
                }`}
                title="Channel Info"
              >
                <Info size={18} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 outline-none active:scale-95 cursor-pointer">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[230px] mt-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#18181b] shadow-xl p-1.5 z-[100] outline-none">

                  <DropdownMenuItem
                    onClick={() => setShowDetails(true)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <Info size={16} className="text-slate-400 shrink-0" />
                    <span>Channel Details</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      const inviteUrl = `${window.location.origin}/channel/${activeChannel.handle || activeChannel.id}`;
                      navigator.clipboard.writeText(inviteUrl);
                      toast.success("Channel link copied!");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <Share2 size={16} className="text-slate-400 shrink-0" />
                    <span>Copy Invite Link</span>
                  </DropdownMenuItem>

                  {isChannelAdmin && (
                    <DropdownMenuItem
                      onClick={() => {
                        const rules = typeof activeChannel.rules === 'string' ? JSON.parse(activeChannel.rules || '{}') : (activeChannel.rules || {});
                        setManageType(rules.is_vip ? 'vip' : (activeChannel.channel_type || 'public'));
                        setManageMessages(rules.allow_messages !== false);
                        setManageVipPrice(rules.vip_price || "");
                        setManageBrokerLink(rules.broker_link || "");
                        setManageAvatar(rules.avatar || "");
                        setIsManageModalOpen(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer outline-none"
                    >
                      <Settings size={16} className="text-slate-400 shrink-0" />
                      <span>Manage Channel</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => setIsPollModalOpen(true)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <BarChart2 size={16} className="text-slate-400 shrink-0" />
                    <span>Create Poll</span>
                  </DropdownMenuItem>

                  {isChannelAdmin ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setShowClearHistoryModal(true)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer outline-none"
                      >
                        <Trash size={16} className="text-slate-400 shrink-0" />
                        <span>Clear History</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteChannel}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer outline-none mt-1 border-t border-slate-100 dark:border-white/5"
                      >
                        <Trash2 size={16} className="text-rose-500 shrink-0" />
                        <span>Delete Channel</span>
                      </DropdownMenuItem>
                    </>
                  ) : isMember ? (
                    <DropdownMenuItem
                      onClick={handleLeaveChannel}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer outline-none mt-1 border-t border-slate-100 dark:border-white/5"
                    >
                      <LogOut size={16} className="text-rose-500 shrink-0" />
                      <span>Leave Channel</span>
                    </DropdownMenuItem>
                  ) : null}

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Pinned Messages Banner */}
          {showPinned && activeChannel.id === "c2" && (
            <div className="bg-[#F8FAFC] dark:bg-[#0B101D] border-b border-slate-150 dark:border-white/5 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-350 z-10 transition-all shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <Pin size={14} className="text-slate-400 dark:text-slate-400 rotate-45 shrink-0" />
                <div className="border-l-2 border-slate-350 dark:border-white/5 pl-3 min-w-0">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-0.5">Pinned message</p>
                  <p className="text-[11px] font-medium leading-relaxed truncate text-slate-600 dark:text-slate-400">
                    HOW TO JOIN VIP GROUP? 🔑 1. Register* through vantage link. Ensure minimum deposit of ₹100.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPinned(false)}
                className="text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-6 amazing-scrollbar min-h-0"
            style={{
              backgroundColor: themeMode === "dark" ? "#0A0A0A" : "#F1F5F9",
              backgroundImage: themeMode === "dark" 
                ? "none" 
                : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%2394a3b8' fill-opacity='0.05'%3E%3Cpath d='M9 15c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm3 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm35 15c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm35-15c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm3 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM15 75c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm3 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm72 15c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          >
            
                  {/* Render active channel messages */}
            {finalMessages.map((msg: any) => (
              <div key={msg.id} className={`flex gap-4 items-end max-w-2xl ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="shrink-0 mb-1">
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender} 
                    className="w-9 h-9 rounded-full border border-slate-200/50 dark:border-white/5 object-cover shadow-sm" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                  />
                </div>

                
                {/* Bubble Container */}
                <div 
                  className={`rounded-[22px] border max-w-2xl transition-all overflow-hidden backdrop-blur-xl shadow-sm ${
                    msg.isMe 
                      ? "rounded-br-sm bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-400/30 text-white shadow-indigo-500/20" 
                      : "rounded-bl-sm bg-white/90 border-slate-200/60 dark:bg-[#1E1F22]/90 dark:border-white/5 text-slate-800 dark:text-slate-100"
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      messageId: msg.id,
                      isMe: msg.isMe,
                      content: msg.content
                    });
                  }}
                >
                  {/* Sender details (only show for others) */}
                  {!msg.isMe && (
                    <div className={`flex justify-between items-center px-4 pt-3.5 mb-1.5`}>
                      <span className="text-[12.5px] font-extrabold text-slate-700 dark:text-slate-350 flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
                        {msg.sender}
                        <CheckCircle2 size={12} className="text-slate-400 fill-slate-450 dark:text-slate-400 dark:fill-slate-550 text-white shrink-0" />
                      </span>
                    </div>
                  )}

                  {msg.image && (
                    <div 
                      onClick={() => setLightboxImage(msg.image)}
                      className="w-full flex items-center justify-center relative group cursor-pointer hover:opacity-95 transition-opacity"
                    >
                      <img 
                        src={msg.image} 
                        className="w-full h-auto object-contain block" 
                        alt="Shared image"
                      />
                    </div>
                  )}

                  {msg.video && (
                    <div className="w-full flex items-center justify-center relative group">
                      <video src={msg.video} controls className="w-full h-auto object-contain block" />
                    </div>
                  )}

                  {msg.type === 'poll' && msg.poll && (

                    <div className="mb-2 bg-slate-50 dark:bg-[#121212] rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/60 m-3">
                      <h4 className="font-bold text-sm mb-3 text-slate-800 dark:text-slate-200">{msg.poll.question}</h4>
                      <div className="space-y-2">
                        {msg.poll.options.map((opt: any, idx: number) => {
                          const percentage = msg.poll.totalVotes > 0 ? Math.round((opt.votes / msg.poll.totalVotes) * 100) : 0;
                          return (
                            <div key={idx} className="relative overflow-hidden rounded-lg bg-slate-200/50 dark:bg-slate-800/50 p-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                              onClick={() => {
                                // Dummy click action for the poll to feel interactive
                                toast.success("Vote recorded!");
                              }}
                            >
                              <div className="absolute left-0 top-0 bottom-0 bg-blue-500/20 dark:bg-blue-500/30 transition-all duration-500" style={{ width: `${percentage}%` }} />
                              <div className="relative flex items-center justify-between z-10 text-[12px] font-medium text-slate-700 dark:text-slate-300">
                                <span>{opt.text}</span>
                                <span>{percentage}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 text-right">
                        {msg.poll.totalVotes} votes
                      </div>
                    </div>
                  )}

                  {msg.content && msg.type !== 'poll' && (
                    <p className={`text-[13.5px] leading-relaxed font-medium whitespace-pre-wrap break-words ${msg.isMe ? 'text-white text-right' : 'text-slate-700 dark:text-slate-200'} px-4 pb-2 ${msg.image || msg.video ? 'pt-3' : (!msg.isMe ? 'pt-0' : 'pt-3.5')}`}>
                      {msg.content}
                    </p>
                  )}

                  <div className={`flex justify-end items-center mt-0.5 text-[10px] font-bold gap-2 px-4 pb-2 ${msg.isMe ? 'text-white/70' : 'text-slate-400 dark:text-slate-400'} ${(!msg.content && (msg.image || msg.video)) ? 'pt-3' : 'pt-0'}`}>

                    <div className="flex items-center gap-1">
                      <Eye size={11} />
                      <span className="tabular-nums">{msg.views || "154"}</span>
                    </div>
                    <span className="tabular-nums">{msg.time}</span>
                  </div>

                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className={`flex flex-wrap items-center gap-1.5 mt-2 ${msg.isMe ? 'justify-end' : 'justify-start'} px-4 pb-2 pt-1`}>

                      {Object.entries(msg.reactions).map(([emoji, count]: any) => (
                        <button
                          key={emoji}
                          onClick={() => handleReactionClick(msg.id, emoji)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold shadow-xs transition-all focus:outline-none border bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/40 border-slate-200/50 dark:border-[#2A2A2A] text-slate-650 dark:text-slate-350"
                        >
                          <span className="text-[12px]">{emoji}</span>
                          <span className="opacity-80">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}

            {dbLoading && activeChannelId && finalMessages.length === 0 && (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
            )}

            {finalMessages.length === 0 && !dbLoading && (
              isEffectiveMember ? (
                <div className="text-center py-12 px-6 max-w-md mx-auto my-auto rounded-[24px] border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] shadow-xs">
                  <div className="flex justify-center mb-3.5">
                    {renderChannelAvatar(activeChannel, "w-16 h-16 text-xl", "rounded-2xl shadow-sm")}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h4 className="text-[17px] font-bold text-slate-900 dark:text-white">
                      Welcome to #{activeChannel.name}
                    </h4>
                    {isChannelAdmin && <Crown size={15} className="text-amber-500 fill-amber-500/20 shrink-0" />}
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed mb-5">
                    {isChannelAdmin
                      ? "Your broadcast channel is live. Post trading setups, signals, charts, or announcements below."
                      : "No signals or broadcasts posted yet. Live execution alerts and analysis will appear here in real time."}
                  </p>

                  {isChannelAdmin && (
                    <div className="flex items-center justify-center gap-2 flex-wrap pt-3 border-t border-slate-200/60 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setInputText("📢 Market Update: ")}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[12px] font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-white/20 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      >
                        📢 Update
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputText("⚡ Setup: ")}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[12px] font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-white/20 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      >
                        ⚡ Signal
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPollModalOpen(true)}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[12px] font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-white/20 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      >
                        📊 Poll
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 px-6 max-w-md mx-auto my-auto rounded-[24px] border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] shadow-xs">
                  <div className="flex justify-center mb-4">
                    {renderChannelAvatar(activeChannel, "w-16 h-16 text-lg", "rounded-2xl")}
                  </div>
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">
                    {activeChannel.name}
                  </h3>
                  <p className="text-[12px] font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                    {activeChannel.subscribers}
                  </p>
                  <p className="text-[13px] text-slate-600 dark:text-zinc-300 mt-3 leading-relaxed max-w-xs mx-auto">
                    {activeChannel.content || "Join this channel to receive real-time signals, analysis, and community broadcasts."}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={joinChannel}
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[13px] hover:opacity-90 active:scale-95 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus size={16} />
                      <span>Join Channel</span>
                    </button>
                  </div>
                </div>
              )
            )}

            <div ref={messageEndRef} />
          </div>

          {/* --- RIGHT CHAT FOOTER PANEL --- */}
          <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex items-center justify-center z-10 shadow-xs shrink-0 w-full">
            {!isEffectiveMember && activeChannel?.id !== "saved" ? (
                <div className="w-full max-w-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate">
                      Previewing {activeChannel.name}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 truncate">
                      Join this channel to participate in discussions and get live broadcasts
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={joinChannel} 
                    className="px-6 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[13px] hover:opacity-90 active:scale-95 shrink-0 transition-all cursor-pointer shadow-xs"
                  >
                    Join Channel
                  </button>
                </div>
            ) : (() => {
                const rules = typeof activeChannel?.rules === 'string' ? JSON.parse(activeChannel.rules || '{}') : (activeChannel?.rules || {});
                const allowMessages = rules.allow_messages !== false;
                const isAdmin = activeChannel?.created_by === user?.id;

                if (!allowMessages && !isAdmin && activeChannel?.id !== "saved") {
                    return (
                      <div className="w-full max-w-2xl mx-auto py-3 px-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 text-center flex items-center justify-center gap-2 text-[12.5px] font-semibold text-slate-500 dark:text-zinc-400 shadow-2xs">
                        <Lock size={14} className="text-slate-400" />
                        <span>Only channel admins can broadcast messages here.</span>
                      </div>
                    );
                }

                return activeChannel?.id === "saved" || dbChannels.length > 0 ? (
                  <div className="w-full max-w-4xl mx-auto relative flex flex-col gap-1.5">
                    {/* Floating Attachment Preview if any */}
                    {attachmentPreview && (
                      <div className="relative inline-flex items-center gap-2.5 p-1.5 pr-3 bg-white dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-white/10 shadow-sm w-fit max-w-full">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 shrink-0">
                          <img src={attachmentPreview} alt="Attachment preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className="text-[11.5px] font-bold text-slate-800 dark:text-white truncate">Attached media</p>
                          <p className="text-[10px] text-slate-400">Ready to broadcast</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={removeAttachment} 
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}

                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-3 left-0 z-50 shadow-2xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme={themeMode as any} />
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2 sm:gap-2.5">
                      {/* Left: Attachment & Poll Buttons matching Inbox Style */}
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0 outline-none cursor-pointer"
                        title="Attach Chart or Image"
                      >
                        <Paperclip size={18} />
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setIsPollModalOpen(true)} 
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0 outline-none cursor-pointer hidden sm:flex"
                        title="Create Poll"
                      >
                        <BarChart2 size={17} />
                      </button>

                      <input type="file" ref={fileInputRef} onChange={handleAttachmentSelect} className="hidden" accept="image/*,video/*" />

                      {/* Center Input Capsule matching Inbox Style */}
                      <div className="flex-1 bg-slate-100/95 dark:bg-white/[0.07] border border-transparent focus-within:border-slate-300 dark:focus-within:border-white/20 rounded-full flex items-center px-4 py-1 transition-all relative">
                        {editingMessageId && (
                          <div className="absolute -top-7 left-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <span>Editing</span>
                            <button onClick={handleCancelEdit} type="button" className="p-0.5 hover:text-white">
                              <X size={10} />
                            </button>
                          </div>
                        )}
                        <input 
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          placeholder={isUploading ? "Uploading attachment..." : "Broadcast a setup, signal, or message..."}
                          className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-normal text-[14px] py-1.5"
                          disabled={isUploading}
                        />

                        {/* Inline Emoji trigger inside pill */}
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full transition-colors shrink-0 cursor-pointer ml-1"
                          title="Emoji"
                        >
                          <Smile size={18} />
                        </button>
                      </div>

                      {/* Right: Circular Send Button matching Inbox Style */}
                      <button 
                        type="submit" 
                        disabled={(!inputText.trim() && !attachment) || isUploading}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 shrink-0 outline-none select-none ${
                          (inputText.trim() || attachment) && !isUploading
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer active:scale-95 shadow-xs'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                        }`}
                        title="Broadcast message"
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                        ) : (
                          <SendHorizonal size={18} strokeWidth={2.4} className="ml-0.5" />
                        )}
                      </button>
                    </form>
                  </div>
                ) : null;
            })()}
          </div>

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#000000]">
              <div className="text-center py-12 px-6 max-w-md w-full mx-auto rounded-[24px] border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center mx-auto text-slate-700 dark:text-white mb-4 border border-slate-200/80 dark:border-white/15 shadow-xs">
                  <Radio size={24} className="text-blue-500 animate-pulse" />
                </div>
                <h4 className="text-[17px] font-bold text-slate-900 dark:text-white mb-1.5">
                  {filteredChannels.length > 0 ? "Select a Channel" : "No Channels Yet"}
                </h4>
                <p className="text-[13px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed mb-6">
                  {filteredChannels.length > 0
                    ? "Choose a channel from the left sidebar to view signals, live analysis, and announcements."
                    : "Create your own broadcasting channel to share signals and analysis, or explore active community channels."}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[13px] hover:opacity-90 active:scale-95 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Create Channel</span>
                  </button>
                  <Link
                    to="/discover"
                    className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-[13px] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <IconlyDiscovery set="curved" primaryColor="currentColor" size={16} />
                    <span>Explore Discover</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 3. SLIDE-OUT CHANNEL DETAILS DRAWER --- */}
        <div 
          className={`shrink-0 border-l border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex flex-col transition-all duration-300 ease-in-out h-full ${
            showDetails && activeChannel 
              ? "fixed md:relative inset-0 md:inset-auto z-40 md:z-auto w-full md:w-[360px]" 
              : "w-0 overflow-hidden border-l-0"
          }`}
        >
          <div className="p-4 px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 h-[60px]">
            <span className="text-[14px] font-bold text-slate-800 dark:text-white">Channel Info</span>
            <button 
              onClick={() => setShowDetails(false)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-800 dark:hover:text-white outline-none"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto amazing-scrollbar p-6 space-y-6">
            {activeChannel && (
              <>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                {renderChannelAvatar(activeChannel, "w-[88px] h-[88px] text-2xl", "rounded-2xl shadow-sm")}
              </div>
              <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5 mt-3 leading-tight">
                {activeChannel.name}
                {isChannelAdmin && <Crown size={15} className="text-amber-500 fill-amber-500/20 shrink-0" title="You are the creator" />}
                {activeChannel.verified && <CheckCircle2 size={15} className="text-blue-500 fill-blue-500/20 shrink-0" />}
              </h3>
              <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 font-semibold leading-none">
                {activeDetails.subscribers}
              </p>
              
              {isChannelAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    const rules = typeof activeChannel.rules === 'string' ? JSON.parse(activeChannel.rules || '{}') : (activeChannel.rules || {});
                    setManageType(rules.is_vip ? 'vip' : (activeChannel.channel_type || 'public'));
                    setManageMessages(rules.allow_messages !== false);
                    setManageVipPrice(rules.vip_price || "");
                    setManageBrokerLink(rules.broker_link || "");
                    setManageAvatar(rules.avatar || "");
                    setIsManageModalOpen(true);
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-[12px] font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all shadow-2xs cursor-pointer"
                >
                  <Settings size={14} />
                  <span>Manage Channel Settings</span>
                </button>
              ) : (
                <Link
                  to={`/user/${activeChannel.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-[12px] font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all shadow-2xs cursor-pointer"
                >
                  <User size={14} />
                  <span>View Creator Profile</span>
                </Link>
              )}
            </div>

            {/* Action Grid (3 buttons) */}
            <div className="grid grid-cols-3 gap-2 px-1">
              <button 
                onClick={handleToggleMute}
                className="flex flex-col items-center justify-center py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-all group active:scale-95 cursor-pointer shadow-2xs"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white mb-1 transition-colors" />
                ) : (
                  <Volume2 size={18} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white mb-1 transition-colors" />
                )}
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mt-1">{isMuted ? "Unmute" : "Mute"}</span>
              </button>

              <button 
                onClick={() => {
                  const inviteUrl = `${window.location.origin}/channel/${activeChannel.handle || activeChannel.id}`;
                  navigator.clipboard.writeText(inviteUrl);
                  toast.success("Channel link copied!");
                }}
                className="flex flex-col items-center justify-center py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-all group active:scale-95 cursor-pointer shadow-2xs"
              >
                <Share2 size={18} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white mb-1 transition-colors" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mt-1">Share</span>
              </button>

              {isChannelAdmin ? (
                <button 
                  onClick={() => {
                    const rules = typeof activeChannel.rules === 'string' ? JSON.parse(activeChannel.rules || '{}') : (activeChannel.rules || {});
                    setManageType(rules.is_vip ? 'vip' : (activeChannel.channel_type || 'public'));
                    setManageMessages(rules.allow_messages !== false);
                    setManageVipPrice(rules.vip_price || "");
                    setManageBrokerLink(rules.broker_link || "");
                    setManageAvatar(rules.avatar || "");
                    setIsManageModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-all group active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Settings size={18} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white mb-1 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mt-1">Settings</span>
                </button>
              ) : (
                <button 
                  onClick={handleLeaveChannel}
                  className="flex flex-col items-center justify-center py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-all group active:scale-95 cursor-pointer shadow-2xs"
                >
                  <LogOut size={18} className="text-slate-500 group-hover:text-rose-500 mb-1 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 mt-1">Leave</span>
                </button>
              )}
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* Link & Description */}
            <div className="space-y-3">
              {/* Link Box */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Channel Link
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    title="Show QR Code"
                  >
                    <IconlyScan set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
                  </button>
                </div>
                <div
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/5 cursor-pointer group"
                  onClick={() => {
                    const inviteUrl = `${window.location.origin}/channel/${activeChannel.handle || activeChannel.id}`;
                    navigator.clipboard.writeText(inviteUrl);
                    toast.success("Link copied!");
                  }}
                >
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 truncate group-hover:text-blue-500 transition-colors">
                    {window.location.host}/channel/{activeChannel.handle || activeChannel.id}
                  </span>
                  <Copy size={14} className="text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                </div>
              </div>

              {/* Description Box */}
              {activeChannel.content && (
                <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                    About Channel
                  </span>
                  <p className="text-[13px] font-medium text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                    {activeChannel.content}
                  </p>
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* Shared Content Stats Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 block">
                Channel Content
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ImageIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-slate-900 dark:text-white leading-none">
                      {photosCount + videosCount}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">Media & Charts</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Link2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-slate-900 dark:text-white leading-none">
                      {linksCount}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">Links Shared</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BarChart2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-slate-900 dark:text-white leading-none">
                      {pollsCount}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">Polls</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-slate-900 dark:text-white leading-none">
                      {activeChannel.memberCount || 1}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">Subscribers</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* Actions / Danger Zone */}
            <div className="space-y-1.5 font-bold text-[13px]">
              {isChannelAdmin ? (
                <button 
                  onClick={handleDeleteChannel}
                  className="flex items-center gap-2.5 px-3 py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all text-left w-full outline-none cursor-pointer"
                >
                  <Trash2 size={16} strokeWidth={2.2} className="text-rose-500 shrink-0" />
                  <span>Delete Channel</span>
                </button>
              ) : (
                <>
                  {isMember && (
                    <button 
                      onClick={handleLeaveChannel}
                      className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-left w-full outline-none cursor-pointer"
                    >
                      <LogOut size={16} className="shrink-0" />
                      <span>Leave Channel</span>
                    </button>
                  )}
                  <button 
                    onClick={() => toast.info("Report submitted. Our moderation team will review this channel.")}
                    className="flex items-center gap-2.5 px-3 py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all text-left w-full outline-none cursor-pointer"
                  >
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>Report Channel</span>
                  </button>
                </>
              )}
            </div>
              </>
            )}
          </div>
        </div>

      </div>



      {/* Create Channel Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[460px] max-h-[90vh] flex flex-col bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-[28px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <div>
              <DialogTitle className="text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {createStep === 1 ? "Create a Channel" : "Invite Members"}
              </DialogTitle>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium leading-normal">
                {createStep === 1
                  ? "Share trading setups, alerts, and analysis with your community."
                  : "Invite your followers to your new broadcast room."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleCreateChannel} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {createStep === 1 ? (
              <div className="flex-1 overflow-y-auto amazing-scrollbar p-6 space-y-4">
                {/* 1. Channel Picture + Channel Name Row */}
                <div className="flex items-center gap-3.5">
                  <input
                    ref={channelAvatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => channelAvatarInputRef.current?.click()}
                    className="group relative w-14 h-14 rounded-2xl cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 transition-colors shrink-0 flex items-center justify-center bg-slate-50 dark:bg-white/5"
                    title="Upload Channel Picture"
                  >
                    {newAvatarPreview ? (
                      <img
                        src={newAvatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      renderChannelAvatar(
                        { name: newChannelName || "CH" },
                        "w-full h-full text-sm",
                        "rounded-none"
                      )
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Camera size={16} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="text-[12.5px] font-bold text-slate-900 dark:text-white block mb-1">
                      Channel Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g. VIP Forex Signals"
                      className="w-full h-10 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-white/30 rounded-xl px-3 text-[13.5px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Channel Type (Public vs Private) */}
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-slate-900 dark:text-white block">
                    Channel Type
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setNewChannelType("public")}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        newChannelType === "public"
                          ? "border-slate-900 bg-slate-900/5 dark:border-white dark:bg-white/10 ring-1 ring-slate-900 dark:ring-white"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} className="text-slate-800 dark:text-white" />
                        <span className="text-[12.5px] font-extrabold text-slate-900 dark:text-white">
                          Public
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                        Anyone can search & join
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isStarter) {
                          toast.error("Pro Feature: Upgrade to Pro to create Private Channels");
                          return;
                        }
                        setNewChannelType("private");
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        newChannelType === "private"
                          ? "border-slate-900 bg-slate-900/5 dark:border-white dark:bg-white/10 ring-1 ring-slate-900 dark:ring-white"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.05]"
                      } ${isStarter ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Lock size={14} className="text-slate-800 dark:text-white" />
                        <span className="text-[12.5px] font-extrabold text-slate-900 dark:text-white">
                          Private {isStarter ? "(Pro)" : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                        Invite link only
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3. Description */}
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-slate-900 dark:text-white block">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    placeholder="What kind of signals or updates will you post here?"
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-slate-400 dark:focus:border-white/30 rounded-xl p-3 text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-colors resize-none"
                  />
                </div>

                {/* 4. Optional "More options" */}
                <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-2.5 px-3.5 flex items-center justify-between text-left bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <span className="text-[11.5px] font-bold text-slate-700 dark:text-zinc-300">
                      More options (Market, VIP price, Broker link)
                    </span>
                    {showAdvanced ? (
                      <ChevronUp size={14} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={14} className="text-slate-400" />
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="p-3.5 space-y-3.5 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212]">
                      {/* Market focus */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                          Market Focus
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {MARKET_CATEGORIES.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setNewChannelMarket(m)}
                              className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                                newChannelMarket === m
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/5 dark:text-zinc-300"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* VIP price */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                          VIP Price (Optional)
                        </label>
                        <input
                          type="text"
                          value={newVipPrice}
                          onChange={(e) => {
                            if (!isElite && e.target.value.trim()) {
                              toast.error("Elite Feature: Upgrade to Elite to monetize VIP Channels");
                              return;
                            }
                            setNewVipPrice(e.target.value);
                            if (e.target.value.trim()) setNewChannelType("vip");
                          }}
                          placeholder={isElite ? "e.g. ₹999/month (Leave blank if free)" : "Upgrade to Elite for paid VIP pricing"}
                          className="w-full h-8.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 text-[12px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                        />
                      </div>

                      {/* Broker link */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                          Broker Link (Optional)
                        </label>
                        <input
                          type="url"
                          value={newBrokerLink}
                          onChange={(e) => setNewBrokerLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full h-8.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 text-[12px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Step 2: Invite followers */
              <div className="flex-1 overflow-y-auto amazing-scrollbar p-6 space-y-3">
                <p className="text-[13px] font-semibold text-slate-600 dark:text-zinc-300">
                  Select followers to invite to your new channel:
                </p>
                <div className="space-y-1.5">
                  {followedUsers.length > 0 ? (
                    followedUsers.map((fUser) => {
                      const isInvited = Boolean(selectedInvites[fUser.id]);
                      return (
                        <div
                          key={fUser.id}
                          onClick={() => toggleInvite(fUser.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-slate-150 dark:border-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={fUser.avatar_url || "/default-avatar.svg"}
                              alt={fUser.username}
                              className="w-9 h-9 rounded-full object-cover bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/default-avatar.svg";
                              }}
                            />
                            <div>
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                                {fUser.display_name || fUser.username}
                              </p>
                              <p className="text-[11px] text-slate-500">@{fUser.username}</p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isInvited
                                ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                                : "border-slate-300 dark:border-white/20"
                            }`}
                          >
                            {isInvited && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-[13px]">
                      You don't have any followers yet. You can still invite people later with your channel link.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 px-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
              <button
                type="button"
                onClick={() =>
                  createStep === 2 ? setCreateStep(1) : setIsCreateModalOpen(false)
                }
                className="text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                {createStep === 2 ? "Back" : "Cancel"}
              </button>

              <button
                type="submit"
                disabled={isCreating || (createStep === 1 && !newChannelName.trim())}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-[13px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isCreating ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black animate-spin" />
                ) : (
                  <>
                    <span>
                      {createStep === 1
                        ? followedUsers.length > 0
                          ? "Continue"
                          : "Create Channel"
                        : "Create Channel"}
                    </span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Manage Channel Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-[24px] shadow-2xl p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manage Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Channel Profile Picture URL</label>
              <input 
                type="text"
                placeholder="https://example.com/avatar.png"
                value={manageAvatar}
                onChange={(e) => setManageAvatar(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-[13.5px] font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Leave blank to use the default initials avatar.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Privacy Mode</label>
              <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setManageType("public")}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all ${manageType === "public" ? "border-indigo-500/50 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-[#252528]"}`}
                  >
                      Public
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                       if (isStarter) {
                          toast.error(
                             <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                 <Crown size={16} className="text-amber-500" />
                                 <span className="font-bold text-slate-900 dark:text-white">Pro Feature</span>
                               </div>
                               <span className="text-slate-600 dark:text-slate-300">Upgrade to Pro to make this channel private.</span>
                             </div>
                          );
                          return;
                       }
                       setManageType("private");
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all ${manageType === "private" ? "border-indigo-500/50 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-[#252528]"}`}
                  >
                      Private
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!isElite) {
                        toast.error("Elite Feature: Upgrade to Elite to enable paid VIP channels.");
                        return;
                      }
                      setManageType("vip");
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all ${manageType === "vip" ? "border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-2 ring-amber-500/20" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-[#252528]"} ${!isElite ? "opacity-70" : ""}`}
                  >
                      VIP Access {!isElite ? "(Elite)" : ""}
                  </button>
              </div>
            </div>

            {manageType === "vip" && (
              <div className="space-y-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-amber-500" />
                  <h4 className="text-[13px] font-bold text-amber-900 dark:text-amber-500">VIP Access Models</h4>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Monthly Subscription Price ($)</label>
                  <input 
                    type="number"
                    value={manageVipPrice}
                    onChange={(e) => setManageVipPrice(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">Users pay this monthly to unlock your channel.</p>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-white/5"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="bg-amber-50/50 dark:bg-[#1A1A1E] px-2 text-slate-500">OR</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Broker Referral Link (IB Unlock)</label>
                  <input 
                    type="url"
                    value={manageBrokerLink}
                    onChange={(e) => setManageBrokerLink(e.target.value)}
                    placeholder="https://exness.com/referral/..."
                    className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">Users who register a new broker account via this link get VIP access for free.</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Messaging Permissions</label>
              <div 
                onClick={() => setManageMessages(!manageMessages)}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#252528] transition-colors"
              >
                  <div>
                      <p className="text-[13.5px] font-bold text-slate-800 dark:text-white">Allow Direct Messages</p>
                      <p className="text-[12px] text-slate-500 font-medium">If disabled, only admins can send messages.</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${manageMessages ? "bg-indigo-500" : "bg-slate-200 dark:bg-white/10"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${manageMessages ? "left-5.5" : "left-0.5"}`} />
                  </div>
              </div>
            </div>
            
            <DialogFooter className="pt-2">
              <button 
                type="button" 
                onClick={() => setIsManageModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[14px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252528] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-[14px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-none"
              >
                {isSavingSettings ? "Saving..." : "Save Settings"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Poll Creation Modal */}
      <Dialog open={isPollModalOpen} onOpenChange={setIsPollModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2A2A2A] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-slate-900 dark:text-white">Create a Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Question</label>
              <input 
                type="text" 
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-[13.5px] font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Options</label>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[idx] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500"
                  />
                  {idx >= 2 && (
                    <button 
                      type="button" 
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-blue-500 text-[12px] font-bold mt-2 hover:text-blue-600 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Option
                </button>
              )}
            </div>
            
            <DialogFooter className="pt-4">
              <button 
                type="button" 
                onClick={() => setIsPollModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCreatePoll}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-colors"
              >
                Send Poll
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-[320px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none rounded-2xl p-0 overflow-hidden [&>button]:hidden">
          <X 
            size={20} 
            className="absolute right-4 top-4 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer z-10" 
            onClick={() => setShowQrModal(false)} 
          />
          <div className="flex flex-col items-center text-center p-8 space-y-6 pt-10">
            <DialogTitle className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">
              Share Channel
            </DialogTitle>
            <div className="w-[180px] h-[180px] bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://' + activeDetails.link)}&margin=0`} 
                alt="QR Code" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[12px] font-semibold text-slate-500">Scan this QR code to join</p>
            <button 
              type="button" 
              onClick={() => {
                navigator.clipboard.writeText(`https://${activeDetails.link}`);
                setShowQrModal(false);
                toast.success("Link copied to clipboard!");
              }}
              className="w-full py-3 rounded-full font-semibold text-slate-700 dark:text-white border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:brightness-95 dark:hover:brightness-110 transition-all text-[14px] active:scale-95"
            >
              Copy Link
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear History Confirmation Modal */}
      <Dialog open={showClearHistoryModal} onOpenChange={setShowClearHistoryModal}>
        <DialogContent className="sm:max-w-[360px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none rounded-2xl p-0 overflow-hidden [&>button]:hidden">
          <X 
            size={20} 
            className="absolute right-4 top-4 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer z-10" 
            onClick={() => setShowClearHistoryModal(false)} 
          />
          <div className="flex flex-col items-center text-center p-8 space-y-6 pt-10">
            <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={36} className="text-[#fa5252]" />
            </div>
            
            <div className="space-y-2.5">
              <DialogTitle className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                Clear Channel History?
              </DialogTitle>
              
              <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed px-2 font-medium">
                This action is permanent and cannot be undone. It will delete all messages for everyone in this channel.
              </p>
            </div>

            <div className="flex w-full gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowClearHistoryModal(false)}
                className="flex-1 py-3.5 rounded-full font-semibold text-slate-700 dark:text-white border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:brightness-95 dark:hover:brightness-110 transition-all text-[15px] active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  setShowClearHistoryModal(false);
                  await clearHistory();
                }}
                className="flex-1 py-3.5 rounded-full font-semibold text-white bg-gradient-to-b from-[#ff6b6b] to-[#fa5252] border-2 border-[#fa5252]/30 shadow-[0_4px_14px_rgba(250,82,82,0.3),0_0_0_2px_rgba(250,82,82,0.15)] hover:brightness-110 transition-all text-[15px] active:scale-95"
              >
                Clear History
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Modal */}
      <Dialog open={!!showDeleteMessageModal} onOpenChange={(open) => !open && setShowDeleteMessageModal(null)}>
        <DialogContent className="sm:max-w-[360px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none rounded-2xl p-0 overflow-hidden [&>button]:hidden">
          <X 
            size={20} 
            className="absolute right-4 top-4 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer z-10" 
            onClick={() => setShowDeleteMessageModal(null)} 
          />
          <div className="flex flex-col items-center text-center p-8 space-y-6 pt-10">
            <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center shrink-0">
              <Trash size={36} className="text-[#fa5252]" />
            </div>
            
            <div className="space-y-2.5">
              <DialogTitle className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                Delete Message?
              </DialogTitle>
              
              <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed px-2 font-medium">
                This action is permanent and cannot be undone. This message will be deleted for everyone.
              </p>
            </div>

            <div className="flex w-full gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowDeleteMessageModal(null)}
                className="flex-1 py-3.5 rounded-full font-semibold text-slate-700 dark:text-white border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:brightness-95 dark:hover:brightness-110 transition-all text-[15px] active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (showDeleteMessageModal) {
                    deleteMessage(showDeleteMessageModal);
                    setShowDeleteMessageModal(null);
                  }
                }}
                className="flex-1 py-3.5 rounded-full font-semibold text-white bg-gradient-to-b from-[#ff6b6b] to-[#fa5252] border-2 border-[#fa5252]/30 shadow-[0_4px_14px_rgba(250,82,82,0.3),0_0_0_2px_rgba(250,82,82,0.15)] hover:brightness-110 transition-all text-[15px] active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Telegram Style Custom Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[9999] flex flex-col gap-2 animate-in fade-in zoom-in duration-200"
          style={{ 
            ...(contextMenu.y > window.innerHeight / 2 ? { bottom: window.innerHeight - contextMenu.y } : { top: contextMenu.y }),
            ...(contextMenu.x > window.innerWidth / 2 ? { right: window.innerWidth - contextMenu.x } : { left: contextMenu.x }),
            transformOrigin: `${contextMenu.x > window.innerWidth / 2 ? 'right' : 'left'} ${contextMenu.y > window.innerHeight / 2 ? 'bottom' : 'top'}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reactions Pill */}
          <div className="rounded-full px-2.5 py-1.5 flex gap-2.5 text-lg overflow-hidden mb-1.5 border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
            {['❤️', '👍', '👎', '🔥', '🥰', '👏'].map(emoji => (
              <button 
                key={emoji}
                className="hover:scale-125 transition-transform outline-none"
                onClick={() => {
                  handleReactionClick(contextMenu.messageId, emoji);
                  setContextMenu(null);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          {/* Actions Menu */}
          <div className="w-[240px] rounded-2xl p-1.5 border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
            <button 
               className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none"
            >
               <CornerUpRight size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Reply
            </button>
            
            {contextMenu.isMe && (
              <button 
                onClick={() => {
                  let text = contextMenu.content;
                  try {
                    const parsed = JSON.parse(text);
                    if (parsed && typeof parsed === 'object') {
                       text = parsed.type === 'poll' ? (parsed.question || '') : (parsed.text || '');
                    }
                  } catch(e) {}
                  setEditingMessageId(contextMenu.messageId);
                  setInputText(text);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none"
              >
                 <Edit2 size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Edit
              </button>
            )}

            <button 
               className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none"
            >
               <Pin size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Pin
            </button>
            
            <button 
               onClick={() => {
                 let text = contextMenu.content;
                 try {
                   const parsed = JSON.parse(text);
                   if (parsed && typeof parsed === 'object') {
                      text = parsed.type === 'poll' ? (parsed.question || '') : (parsed.text || '');
                   }
                 } catch(e) {}
                 navigator.clipboard.writeText(text);
                 toast.success("Text copied!");
                 setContextMenu(null);
               }}
               className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none"
            >
               <Copy size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Copy Text
            </button>

            <button 
               onClick={() => {
                 navigator.clipboard.writeText(`${window.location.origin}/channel/${activeChannelId}?msg=${contextMenu.messageId}`);
                 toast.success("Link copied!");
                 setContextMenu(null);
               }}
               className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none"
            >
               <Link2 size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Copy Post Link
            </button>

            <button 
               className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none"
            >
               <Share2 size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Forward
            </button>
            
            {contextMenu.isMe && (
              <button 
                onClick={() => {
                  setShowDeleteMessageModal(contextMenu.messageId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer outline-none transition-colors text-[13px] font-medium"
              >
                <Trash size={17} className="text-red-500 dark:text-red-400 shrink-0" />
                <span>Delete Message</span>
              </button>
            )}

            <button 
               className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all outline-none border-t border-slate-100 dark:border-white/5 mt-1 pt-2"
            >
               <CheckCircle2 size={17} className="text-slate-400 dark:text-slate-400 shrink-0" /> Select
            </button>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm select-none cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close button in top right corner (cross button to close) */}
          <button 
            onClick={() => setLightboxImage(null)} 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer border border-white/10 shadow-lg"
            title="Close"
          >
            <X size={24} />
          </button>
          
          {/* Full screen image */}
          <img 
            src={lightboxImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </CommunityPageWrapper>
  );
}
