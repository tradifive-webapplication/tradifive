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
import DashboardLayout from "@/components/DashboardLayout";
import { 
    Activity, ArrowLeft, Heart, MoreHorizontal, MoreVertical, Search, Share2, ShieldCheck, Star, 
    Pin, Gift, Phone, User, Users, Bookmark, Settings as SettingsIcon, 
    Send, Plus, Eye, MessageSquare, Menu, LogOut, AlertTriangle, Info,
    Image as ImageIcon, Film, Folder, Link2, BarChart2, Mic, QrCode, Trash, Paperclip, Smile, Edit2, Copy, Crown, Video, GraduationCap, CreditCard, Cpu, LineChart, BookOpen, MessageCircle,
    Megaphone, CheckCircle2, VolumeX, Volume2, X, CornerUpRight, SendHorizonal, Search as SearchIcon, Globe, Lock, ArrowRight, Bell, ShieldAlert, Settings, CornerUpLeft, EyeOff, ChevronLeft, Download, PenLine, ExternalLink, Trash2, Shield, Check
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

export default function Channel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { canAccess, isStarter } = usePlan();

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
  const [newChannelType, setNewChannelType] = useState("public");
  const [newVipPrice, setNewVipPrice] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [selectedInvites, setSelectedInvites] = useState<Record<string, boolean>>({});
  
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

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const isChannelAdmin = dbChannels.find(c => c.id === activeChannelId)?.created_by === user?.id;

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
        setNewVipPrice("");
    }
  }, [isCreateModalOpen, user?.id]);

  const handleCreateChannel = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (createStep === 1) {
        if (!newChannelName.trim()) {
            toast.error('Channel name is required');
            return;
        }
        setCreateStep(2);
        return;
    }

    setIsCreating(true);
    try {
      const currentUser = user;
      if (!currentUser) {
        toast.error('You must be logged in to create a channel');
        setIsCreating(false);
        return;
      }

      const slug = newChannelName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
      const { data, error } = await supabase.from('channels').insert({
          name: newChannelName,
          description: newChannelDesc,
          slug: slug,
          created_by: currentUser.id,
          channel_type: newChannelType === 'vip' ? 'private' : newChannelType,
          is_official: false,
          rules: newChannelType === 'vip' ? JSON.stringify({ is_vip: true, vip_price: newVipPrice }) : null
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
      if (data?.id) setActiveChannelId(data.id);
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
            navigate('/community');
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
      <DashboardLayout 
        noPadding={true} 
        noScroll={true}
        breadcrumbs={[{ label: 'Channel', path: '/channel' }, { label: 'Loading...' }]}
      >
        <ChannelSkeleton />
      </DashboardLayout>
    );
  }

  // Blended Channels mapping
  const finalChannels = dbChannels.map(ch => {
    let rulesObj: any = {};
    try {
      rulesObj = typeof ch.rules === 'string' ? JSON.parse(ch.rules || '{}') : (ch.rules || {});
    } catch(e){}

    const charCodeSum = ch.name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return {
      id: ch.id,
      name: ch.name,
      handle: ch.slug,
      unread: 0,
      time: new Date(ch.created_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      content: ch.description || "Welcome to the channel!",
      avatar: ch.avatar_url || rulesObj.avatar || `https://i.pravatar.cc/150?img=${charCodeSum % 70}`,
      verified: ch.is_official || false,
      subscribers: ch.member_count !== null ? `${ch.member_count} subscribers` : "250 subscribers",
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
    link: `t.me/${activeChannel.handle}`,
    description: activeChannel.content || "Official Tradifive communication channel.",
    giftsCount: "0 gifts",
    photosCount: `${photosCount} ${photosCount === 1 ? 'photo' : 'photos'}`,
    videosCount: `${videosCount} ${videosCount === 1 ? 'video' : 'videos'}`,
    filesCount: "0 files",
    linksCount: `${linksCount} shared ${linksCount === 1 ? 'link' : 'links'}`,
    pollsCount: `${pollsCount} ${pollsCount === 1 ? 'poll' : 'polls'}`,
    voicesCount: "0 voice messages",
    gifsCount: "0 GIFs",
    similarCount: "4 similar channels",
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
    similarCount: "0 similar channels",
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

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.08),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all active:scale-95 cursor-pointer outline-none"
          title="Channel Menu"
        >
          <Menu size={20} />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none p-1.5 z-[100] outline-none">
        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          Channel Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-white/5" />
        
        <DropdownMenuItem 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <Users size={16} className="text-slate-400" />
          <span>New Group</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <Megaphone size={16} className="text-slate-400" />
          <span>New Channel</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => toast.info("Settings console requested")}
          className="flex items-center gap-3 text-[13.5px] font-medium text-slate-700 dark:text-slate-350 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 px-3 py-2.5 rounded-xl transition-all cursor-pointer outline-none"
        >
          <SettingsIcon size={16} className="text-slate-400" />
          <span>Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DashboardLayout 
      noPadding={true} 
      noScroll={true} 
      headerActions={headerActions}
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

        {/* --- 1. CHANNEL LIST COLUMN --- */}
        <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] shrink-0 border-r border-slate-150 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#121212] flex-col overflow-hidden h-full`}>
          
          {/* List Search Header */}
          <div className="p-3 px-4 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#121212] h-[60px] shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={15} strokeWidth={2.5} />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none rounded-xl pl-10 pr-4 py-2 text-[13px] font-normal placeholder:text-slate-400 dark:placeholder:text-slate-655 text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-all"
              />
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-95"
              title="Create Channel or Group"
            >
              <IconlyPlus set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} />
            </button>
          </div>

          {/* Channels Scrollable list */}
          <div className="flex-1 overflow-y-auto amazing-scrollbar bg-white dark:bg-[#121212] min-h-0">
            {filteredChannels.map(ch => {
              const isActive = ch.id === activeChannelId;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    setActiveChannelId(ch.id);
                    setMobileView('chat');
                  }}
                  className={`relative text-left w-full p-4 flex gap-3.5 border-b border-slate-100/60 dark:border-white/5 transition-all duration-200 outline-none items-center cursor-pointer select-none ${
                    isActive 
                      ? "bg-slate-100/70 dark:bg-slate-800/30 text-slate-900 dark:text-white" 
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-500 dark:bg-slate-400 rounded-r-full shadow-xs" />
                  )}
                  
                  <img src={ch.avatar} alt={ch.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100 dark:border-white/5 shadow-xs" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                  
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13.5px] font-semibold leading-none truncate flex items-center gap-1 min-w-0 text-slate-900 dark:text-white">
                        <span className="truncate">{ch.name}</span>
                        {ch.created_by === user?.id && <Crown size={14} className="text-amber-500 fill-amber-500/20 shrink-0 ml-0.5" title="You created this channel" />}
                        {ch.verified && <CheckCircle2 size={13} className="text-slate-400 fill-slate-400 dark:text-slate-400 dark:fill-slate-550 text-white shrink-0" />}
                      </h4>
                      <span className="text-[11px] shrink-0 font-semibold tabular-nums text-slate-400 dark:text-slate-400">
                        {ch.time}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between gap-2.5">
                      <p className="text-[12.5px] font-normal leading-snug line-clamp-2 flex-1 text-slate-555 dark:text-slate-400">
                        {ch.content}
                      </p>
                      
                      {ch.unread > 0 && (
                        <span className={`shrink-0 self-end px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs tabular-nums mt-0.5 ${
                          isActive 
                            ? "bg-slate-700 dark:bg-slate-600 text-white" 
                            : "bg-slate-100 dark:bg-slate-800/60 text-slate-650 dark:text-slate-400 border border-slate-200/50 dark:border-white/5"
                        }`}>
                          {ch.unread > 999 ? `${(ch.unread / 1000).toFixed(1)}k` : ch.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
                className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 shrink-0 active:scale-95"
                title="Back to Channels"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="cursor-pointer flex-1 flex items-center gap-2.5 sm:gap-3 min-w-0" onClick={() => setShowDetails(!showDetails)}>
                <img src={activeChannel.avatar} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200/50 dark:border-white/10 shadow-sm shrink-0" alt="Channel avatar" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] sm:text-[15px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none mb-1 truncate">
                    <span className="truncate">{activeChannel.name}</span>
                    {isChannelAdmin && <Crown size={14} className="text-amber-500 fill-amber-500/20 shrink-0 ml-0.5" title="You created this channel" />}
                    {activeChannel.verified && <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/20 dark:text-blue-400 dark:fill-blue-400/20 shrink-0" />}
                  </h2>
                  <p className="text-[10.5px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-none truncate">
                    {activeChannel.id === "saved" ? "Personal saved notes" : activeChannel.subscribers || "Conversation"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95 ${showDetails ? 'bg-slate-100 dark:bg-slate-800 text-blue-500 dark:text-blue-400' : ''}`}
                title="Channel Details"
              >
                <IconlyUser set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} />
              </button>
              
              <button 
                onClick={handleToggleMute}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <IconlyVolumeOff set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} /> : <IconlyVolumeUp set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} />}
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 active:scale-95">
                <Search size={18} strokeWidth={2} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 outline-none active:scale-95">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[260px] mt-2 rounded-2xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none p-1.5 z-[100] outline-none">

                  <DropdownMenuItem
                    onClick={() => toast.info("Channel Info")}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <IconlyInfoCircle set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0" />
                    <span>View channel info</span>
                  </DropdownMenuItem>

                  {activeChannel?.created_by === user?.id && (
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
                      className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                    >
                      <IconlySetting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0" />
                      <span>Manage Channel</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => toast.info("Story Archive")}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <IconlyFolder set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0" />
                    <span>Story Archive</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => toast.info("Boost Channel")}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <IconlyArrowUp set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0 rotate-45" />
                    <span>Boost Channel</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => toast.info("Create Poll")}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <IconlyGraph set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0" />
                    <span>Create poll</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => toast.info("Export chat history")}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <IconlyUpload set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0" />
                    <span>Export chat history</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowClearHistoryModal(true)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none"
                  >
                    <IconlyDelete set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-400 shrink-0" />
                    <span>Clear history</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => toast.error("Left channel")}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer outline-none mt-1 border-t border-slate-100 dark:border-white/5 pt-2.5"
                  >
                    <IconlyLogout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-red-500 dark:text-red-400 shrink-0" />
                    <span>Leave channel</span>
                  </DropdownMenuItem>

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
              <div className="text-center py-20 rounded-2xl p-6 max-w-sm mx-auto flex-shrink-0 border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#121212] flex items-center justify-center mx-auto text-slate-400 dark:text-slate-300 mb-4 border border-slate-200/30 dark:border-white/5">
                  <MessageSquare size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">No Broadcasts Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  You have successfully joined 📣 {activeChannel.name}. Live execution alerts and signal broadcasts will appear here in real-time.
                </p>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* --- RIGHT CHAT FOOTER PANEL --- */}
          <div className="p-4 px-6 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#121212] flex items-center justify-center z-10 shadow-xs shrink-0 w-full">
            {!isMember && activeChannel?.id !== "saved" ? (
                <button onClick={joinChannel} className="px-8 py-2.5 rounded-full text-[13px] font-bold transition-all border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white active:scale-95">
                    Join Channel
                </button>
            ) : (() => {
                const rules = typeof activeChannel?.rules === 'string' ? JSON.parse(activeChannel.rules || '{}') : (activeChannel?.rules || {});
                const allowMessages = rules.allow_messages !== false;
                const isAdmin = activeChannel?.created_by === user?.id;

                if (!allowMessages && !isAdmin && activeChannel?.id !== "saved") {
                    return <p className="text-[12px] font-bold text-slate-400">Only admins can send messages in this channel.</p>;
                }

                return activeChannel?.id === "saved" || dbChannels.length > 0 ? (
                  <div className="w-full relative flex flex-col gap-2">
                    {attachmentPreview && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                         <img src={attachmentPreview} alt="Attachment preview" className="w-full h-full object-cover" />
                         <button onClick={removeAttachment} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/70">
                           <X size={12} />
                         </button>
                      </div>
                    )}
                    {showEmojiPicker && (
                      <div className="absolute bottom-16 left-0 z-50 shadow-2xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme={themeMode as any} />
                      </div>
                    )}
                    <form onSubmit={handleSendMessage} className="w-full flex items-end gap-2">
                      
                      <div className="flex items-center gap-1 shrink-0 pb-1">
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 outline-none active:scale-95">
                          <Smile size={20} />
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 outline-none active:scale-95">
                          <Paperclip size={20} />
                        </button>
                      </div>

                      <input type="file" ref={fileInputRef} onChange={handleAttachmentSelect} className="hidden" accept="image/*,video/*" />
                      
                      <div className="flex-1 bg-slate-100/80 dark:bg-[#1E1F22] border border-slate-200/50 dark:border-white/5 shadow-inner rounded-[24px] flex items-center px-4 py-3 transition-all relative">
                        {editingMessageId && (
                          <div className="absolute -top-10 left-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] px-3 py-1 rounded-full flex items-center gap-2 font-bold uppercase tracking-wider shadow-sm">
                            <span>Editing Message</span>
                            <button onClick={handleCancelEdit} type="button" className="hover:text-blue-800 dark:hover:text-blue-200 bg-white/50 dark:bg-black/20 rounded-full p-0.5">
                              <X size={12} />
                            </button>
                          </div>
                        )}
                        <textarea 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={isUploading ? "Uploading attachment..." : "Write a message..."}
                          className="w-full bg-transparent outline-none text-[14px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none min-h-[22px] max-h-[120px] py-0 custom-scrollbar"
                          disabled={isUploading}
                          rows={1}
                        />
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0 pb-1">
                        {!inputText.trim() && !attachment && !isUploading ? (
                          <button type="button" onClick={() => setIsPollModalOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 outline-none active:scale-95">
                            <IconlyActivity set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                          </button>
                        ) : (
                          <button 
                            type="submit"
                            disabled={(!inputText.trim() && !attachment) || isUploading}
                            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all text-white outline-none active:scale-95"
                          >
                            {isUploading ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <IconlySend set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} className="ml-[1px]" />}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="w-full h-10 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl" />
                );
            })()}
          </div>

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#000000]">
              <div className="text-center py-16 rounded-[24px] p-6 max-w-md w-full mx-auto flex-shrink-0 border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#121212] flex items-center justify-center mx-auto text-slate-400 dark:text-slate-300 mb-6 border border-slate-200/30 dark:border-white/5">
                  <Megaphone size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">No Channels Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Explore and join official broadcasting channels from the Discover page to keep up with news and signal flows.
                </p>
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-white">User Info</span>
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
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden mx-auto border-2 border-slate-100 dark:border-white/5 shadow-sm relative group bg-slate-50">
                <img 
                  src={activeChannel.avatar} 
                  alt={activeChannel.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                />
              </div>
              <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-3 leading-tight">
                {activeChannel.name}
                {activeChannel.verified && <CheckCircle2 size={15} className="text-slate-400 fill-slate-450 dark:text-slate-400 dark:fill-slate-550 text-white shrink-0" />}
              </h3>
              <p className="text-[12.5px] text-slate-400 dark:text-slate-400 font-semibold leading-none">
                {activeDetails.subscribers}
              </p>
              
              <Link to={`/user/${activeChannel.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`} className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-slate-200 dark:border-white/5 text-[12px] font-bold uppercase tracking-wider text-slate-700 hover:text-blue-500 hover:border-blue-500 dark:text-slate-355 dark:hover:text-blue-400 dark:hover:border-blue-500/40 transition-colors shadow-3xs bg-slate-50/5 dark:bg-slate-900/20">
                View Creator Profile
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 px-1">
              <button 
                onClick={handleToggleMute}
                className="flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none transition-all group active:scale-95"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white mb-1 transition-colors" />
                ) : (
                  <Volume2 size={18} className="text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white mb-1 transition-colors" />
                )}
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">Mute</span>
              </button>

              <button 
                onClick={() => toast.success("Gift feature panel coming soon!")}
                className="flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none transition-all group active:scale-95"
              >
                <Gift size={18} className="text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white mb-1 transition-colors" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">Gift</span>
              </button>

              <button 
                onClick={() => toast.warning("Confirmation: Are you sure you want to leave?")}
                className="flex flex-col items-center justify-center py-2.5 rounded-2xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none transition-all group active:scale-95"
              >
                <LogOut size={18} className="text-slate-400 group-hover:text-rose-500 mb-1 transition-colors" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">Leave</span>
              </button>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            <div className="space-y-4 text-[13px]">
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none">
                <div 
                  className="space-y-1 cursor-pointer group"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${activeDetails.link}`);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <span 
                    className="text-slate-700 dark:text-slate-350 group-hover:text-blue-500 font-bold text-[13.5px] leading-tight block transition-colors"
                  >
                    {activeDetails.link}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-blue-400 transition-colors">Link</span>
                </div>
                <button 
                  onClick={() => setShowQrModal(true)}
                  className="p-2 rounded-lg border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all active:scale-95"
                >
                  <IconlyScan set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 hover:text-slate-700 dark:hover:text-white" />
                </button>
              </div>

              <div className="space-y-1 p-3 text-left">
                <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed text-[13.5px]">
                  {activeDetails.description}
                </p>
                <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider pt-1.5">Description</span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            <div className="space-y-4 font-semibold text-slate-750 dark:text-slate-350 text-[13px]">
              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyTicketStar set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.giftsCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyImage set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.photosCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyVideo set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.videosCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyFolder set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.filesCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyPaper set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.linksCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyGraph set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.pollsCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyVoice set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.voicesCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyBookmark set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.gifsCount}</span>
              </div>

              <div className="flex items-center gap-3.5 px-1 py-0.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                <IconlyNotification set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                <span className="text-[13.5px]">{activeDetails.similarCount}</span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            <div className="space-y-4 font-bold text-[13.5px]">
              {isChannelAdmin ? (
                <button 
                  onClick={handleDeleteChannel}
                  className="flex items-center gap-3.5 px-1 py-1 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-500 transition-colors text-left w-full outline-none"
                >
                  <Trash size={21} strokeWidth={2.2} className="text-rose-500 dark:text-rose-400 shrink-0" />
                  <span>Delete channel</span>
                </button>
              ) : isMember ? (
                <button 
                  onClick={handleLeaveChannel}
                  className="flex items-center gap-3.5 px-1 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-left w-full outline-none"
                >
                  <IconlyLogout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />
                  <span>Leave channel</span>
                </button>
              ) : null}

              <button 
                onClick={() => toast.error("Report dialog opened")}
                className="flex items-center gap-3.5 px-1 py-1 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-500 transition-colors text-left w-full outline-none"
              >
                <IconlyDanger set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-rose-500 dark:text-rose-400 shrink-0" />
                <span>Report</span>
              </button>
            </div>
              </>
            )}
          </div>
        </div>

      </div>



      {/* Create Channel Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[400px] bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] dark:shadow-none border-2 border-white dark:border-white/5 rounded-[24px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none p-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-500/10 dark:to-transparent pointer-events-none" />
          
          <button 
            onClick={() => setIsCreateModalOpen(false)}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-[#1E1E1E]/80 dark:hover:bg-[#252528] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors z-10"
          >
            <X size={16} />
          </button>
          
          <div className="p-6 relative pt-6">
            <DialogHeader className="mb-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600/20 dark:ring-indigo-500/30">
                <Megaphone size={18} className="fill-indigo-600/20" />
              </div>
              <div>
                <DialogTitle className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {createStep === 1 ? "Create a Channel" : "Invite Members"}
                </DialogTitle>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {createStep === 1 ? "Set up a dedicated space for your signals, updates, and community broadcasts." : "Select followers to invite to your new channel."}
                </p>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              {createStep === 1 ? (
                  <>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-800 dark:text-slate-200 ml-1">Channel Name</label>
                        <input 
                          type="text" 
                          required
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="e.g. VIP Forex Signals"
                          className="w-full bg-white dark:bg-[#1E1E1E] border-2 border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-[#1A1A1A] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-800 dark:text-slate-200 ml-1">Description</label>
                        <textarea 
                          value={newChannelDesc}
                          onChange={(e) => setNewChannelDesc(e.target.value)}
                          placeholder="What kind of alerts will you broadcast here?"
                          rows={2}
                          className="w-full bg-white dark:bg-[#1E1E1E] border-2 border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-[#1A1A1A] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm"
                        />
                      </div>
                      {userAccountType === 'creator' && (
                          <>
                              <div className="space-y-3 pt-2">
                                  <label className="text-[13px] font-bold text-slate-800 dark:text-slate-200 ml-1">Privacy Mode</label>
                                  <div className="grid grid-cols-2 gap-3">
                                      <button 
                                        type="button"
                                        onClick={() => setNewChannelType("public")}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${newChannelType === "public" ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] text-slate-500 hover:border-slate-300 dark:hover:border-[#444]"}`}
                                      >
                                          <div className={`w-6 h-6 rounded-full mb-1.5 flex items-center justify-center ${newChannelType === "public" ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-slate-100 dark:bg-[#1E1E1E]"}`}>
                                              <Globe size={12} />
                                          </div>
                                          <span className="text-[11px] font-bold">Public</span>
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                           if (!canAccess('private_channels')) {
                                              toast.error(
                                                 <div className="flex flex-col gap-1">
                                                   <div className="flex items-center gap-2">
                                                     <Crown size={16} className="text-amber-500" />
                                                     <span className="font-bold text-slate-900 dark:text-white">Pro Feature</span>
                                                   </div>
                                                   <span className="text-slate-600 dark:text-slate-300">Upgrade to Pro to create private channels.</span>
                                                 </div>
                                              );
                                              return;
                                           }
                                           setNewChannelType("private");
                                        }}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${newChannelType === "private" ? "border-rose-500 bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20" : "border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] text-slate-500 hover:border-slate-300 dark:hover:border-[#444]"}`}
                                      >
                                          <div className={`w-6 h-6 rounded-full mb-1.5 flex items-center justify-center ${newChannelType === "private" ? "bg-rose-100 dark:bg-rose-500/20" : "bg-slate-100 dark:bg-[#1E1E1E]"}`}>
                                              <Lock size={12} />
                                          </div>
                                          <span className="text-[11px] font-bold">Private</span>
                                      </button>
                                  </div>
                              </div>
                        </>
                    )}
                </>
            ) : (
                <div className="max-h-[300px] overflow-y-auto amazing-scrollbar space-y-2 pr-2">
                    {followedUsers.length > 0 ? followedUsers.map(fUser => (
                        <div key={fUser.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer" onClick={() => toggleInvite(fUser.id)}>
                            <div className="flex items-center gap-3">
                                <img src={fUser.avatar_url || "/default-avatar.svg"} alt={fUser.username} className="w-10 h-10 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }} />
                                <div>
                                    <p className="text-[13px] font-bold text-slate-800 dark:text-white">{fUser.display_name || fUser.username}</p>
                                    <p className="text-[11px] text-slate-500">@{fUser.username}</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedInvites[fUser.id] ? "bg-blue-600 border-blue-600" : "border-slate-300 dark:border-white/5"}`}>
                                {selectedInvites[fUser.id] && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-[13px] text-slate-400 py-6">You aren't following anyone yet.</p>
                    )}
                </div>
            )}
            
              <div className="pt-6 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => createStep === 2 ? setCreateStep(1) : setIsCreateModalOpen(false)}
                  className="px-6 py-3 rounded-2xl text-[14px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all outline-none"
                >
                  {createStep === 2 ? "Back" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating || (createStep === 1 && !newChannelName.trim())}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_-4px_rgba(79,70,229,0.5)] outline-none flex items-center gap-2 group"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    <>
                      {createStep === 1 ? "Continue" : "Create Channel"}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
                    onClick={() => setManageType("vip")}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all ${manageType === "vip" ? "border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-2 ring-amber-500/20" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-[#252528]"}`}
                  >
                      VIP Access
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
    </DashboardLayout>
  );
}
