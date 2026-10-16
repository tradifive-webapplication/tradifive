import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Crown, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_pro?: boolean;
  is_verified?: boolean;
}

export function FollowListModal({ isOpen, onClose, userId, type }: FollowListModalProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        let profileIds: string[] = [];

        if (type === 'followers') {
          const { data } = await supabase
            .from('social_follows')
            .select('follower_id')
            .eq('following_id', userId);
          if (data) profileIds = data.map(d => d.follower_id);
        } else {
          const { data } = await supabase
            .from('social_follows')
            .select('following_id')
            .eq('follower_id', userId);
          if (data) profileIds = data.map(d => d.following_id);
        }

        if (profileIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, is_pro, is_verified')
            .in('id', profileIds);
            
          if (profilesData) {
            setUsers(profilesData);
          } else {
            setUsers([]);
          }
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching follow list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    setSearchQuery(""); // reset search
  }, [isOpen, userId, type]);

  const getCleanedFirstName = (fullName: string) => {
    if (!fullName) return "";
    return fullName.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim().split(' ')[0] || "Trader";
  };

  const getCleanedFullName = (fullName: string) => {
    if (!fullName) return "";
    return fullName.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[99990] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-slate-200/50 dark:border-white/5 overflow-hidden flex flex-col max-h-[85vh] pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white capitalize">
                  {type}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-4 py-3 shrink-0">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#18181A] border-none rounded-xl text-[14px] text-slate-900 dark:text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-blue-500/50 transition-shadow"
                  />
                </div>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto min-h-[300px] px-2 pb-4 scrollbar-hide">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 pt-20">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <span className="text-[14px] font-medium">Loading {type}...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
                    <User size={32} className="mb-3 opacity-20" />
                    <span className="text-[14px] font-medium">
                      {searchQuery ? "No matches found" : `No ${type} yet`}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          onClose();
                          navigate(`/user/${user.username}`);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      >
                        {/* Avatar */}
                        <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700/50 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[16px] font-black text-slate-500 dark:text-slate-400">
                              {getCleanedFirstName(user.display_name).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate font-sans">
                              {getCleanedFullName(user.display_name || "Trader")}
                            </span>
                            {user.is_pro && (
                              <div className="px-1 py-[1px] rounded bg-purple-100 dark:bg-purple-500/20 flex items-center shrink-0">
                                <Crown size={9} className="text-purple-600 dark:text-purple-400 mr-0.5" />
                                <span className="text-[8px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                  Pro
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium truncate font-sans">
                            @{user.username || "user"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
