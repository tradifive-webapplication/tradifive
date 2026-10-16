import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Check } from "lucide-react";
import { FollowButton } from "@/components/ui/FollowButton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { supabase } from "@/lib/supabase";

interface UserHoverCardProps {
  userId: string;
  username: string;
  authorName: string;
  authorAvatar: string;
  currentUserId?: string;
  isFollowing?: boolean;
  onToggleFollow?: (id: string, name: string) => void;
  children: React.ReactNode;
}

export function UserHoverCard({ 
  userId, 
  username, 
  authorName, 
  authorAvatar, 
  currentUserId,
  isFollowing,
  onToggleFollow,
  children 
}: UserHoverCardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isOpen && !hasFetched && userId && !userId.startsWith("local-")) {
      const fetchData = async () => {
        try {
          // Fetch profile details
          const { data: profileData } = await supabase
            .from("profiles")
            .select("bio, banner_url")
            .eq("id", userId)
            .single();

          if (profileData) setProfile(profileData);

          // Fetch followers & following count
          const [followersRes, followingRes] = await Promise.all([
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId)
          ]);

          setFollowerCount(followersRes.count || 0);
          setFollowingCount(followingRes.count || 0);
          
          setHasFetched(true);
        } catch (error) {
          console.error("Error fetching hover card data:", error);
        }
      };
      fetchData();
    }
  }, [isOpen, hasFetched, userId]);

  return (
    <HoverCard openDelay={300} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-[320px] p-5 border border-slate-200 dark:border-white/10 shadow-xl rounded-2xl bg-white dark:bg-[#1C1C1E] z-[60]"
        sideOffset={8}
      >
        <div className="flex justify-between items-start mb-3">
          {/* Avatar with Verified Badge */}
          <div className="relative">
            <Link to={`/user/${username.replace('@', '')}`}>
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="w-14 h-14 rounded-full object-cover bg-slate-200 dark:bg-slate-800"
                onError={(e) => { e.currentTarget.src = "/default-avatar.svg"; }}
              />
            </Link>
            {/* Verified badge */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-[#1C1C1E] rounded-full p-[2px]">
               <div className="bg-[#00BA7C] text-white rounded-full p-0.5">
                 <Check size={10} strokeWidth={4} />
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 dark:border-white/10 rounded-[10px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300">
              <MessageSquare size={16} />
            </button>
            {userId !== currentUserId && onToggleFollow && (
                <FollowButton
                    isFollowing={isFollowing || false}
                    onToggleFollow={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        onToggleFollow(userId, authorName); 
                    }}
                />
            )}
          </div>
        </div>

        {/* User Info */}
        <div>
          <Link to={`/user/${username.replace('@', '')}`} className="block hover:underline w-fit">
            <h4 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight">
              {authorName}
            </h4>
          </Link>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">
            {username} · {followerCount} followers
          </p>

          {/* Bio */}
          {profile?.bio ? (
              <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300 mt-3 leading-snug line-clamp-3">
                {profile.bio}
              </p>
          ) : (
              <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300 mt-3 leading-snug line-clamp-3">
                A Frontend developer providing interactive and immersive experiences in 3D and webapps
              </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
