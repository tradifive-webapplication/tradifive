const fs = require('fs');

// Read the current broken file
const content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// The file currently starts at what should be the body of the component
// (after all the imports and PollBlock were lost). 
// We need to prepend the correct header.

const header = `import React, { useState, useEffect } from "react";
import { addXP } from "@/utils/gamification";
import DashboardLayout from "@/components/DashboardLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Calendar, MoreHorizontal,
  Search, Heart, MessageCircle, Bookmark, Share2,
  TrendingUp, Globe, Flame, ShieldCheck, Trophy,
  Star, BarChart2, FileText, Shield, Info, Target, Scale,
  Crown, ArrowRight, ChevronDown, Radio, Play, UserPlus, UserCheck, Mail, Lock, Clock } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import FeedCard from "@/components/FeedCard";
import { toast } from "sonner";
import { calculateTradingMetrics } from "@/utils/tradeMetrics";
import { FollowListModal } from "@/components/FollowListModal";

// Placeholder display names to filter out from suggestions
const PLACEHOLDER_NAMES = ["new trader", "guest trader", "demo trader", "trader", "guest"];

// --- MOCK FALLBACK TRADES ---
const MOCK_TRADES_FALLBACK = [
  { id: "t1", ticket: "8472910", symbol: "XAUUSD", profit: 1420.50, trade_type: 0, lot_size: 2.0, closed_at: new Date(Date.now() - 3600000 * 4).toISOString(), created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "t2", ticket: "8472911", symbol: "EURUSD", profit: -340.00, trade_type: 1, lot_size: 1.5, closed_at: new Date(Date.now() - 3600000 * 12).toISOString(), created_at: new Date(Date.now() - 3600000 * 13).toISOString() },
  { id: "t3", ticket: "8472912", symbol: "GBPUSD", profit: 890.20, trade_type: 0, lot_size: 1.0, closed_at: new Date(Date.now() - 3600000 * 24).toISOString(), created_at: new Date(Date.now() - 3600000 * 25).toISOString() },
  { id: "t4", ticket: "8472913", symbol: "XAUUSD", profit: 2450.00, trade_type: 0, lot_size: 3.0, closed_at: new Date(Date.now() - 3600000 * 48).toISOString(), created_at: new Date(Date.now() - 3600000 * 50).toISOString() },
  { id: "t5", ticket: "8472914", symbol: "USDCAD", profit: -120.00, trade_type: 1, lot_size: 1.0, closed_at: new Date(Date.now() - 3600000 * 72).toISOString(), created_at: new Date(Date.now() - 3600000 * 73).toISOString() }
];

function PollBlock({
  post,
  currentUserId,
  onVoteSuccess
}: {
  post: any;
  currentUserId: string;
  onVoteSuccess: () => void;
}) {
  const votedOptionKey = \`tradifive_voted_poll_\${post.id}\`;
  const [votedOption, setVotedOption] = useState<number | null>(() => {
    const val = localStorage.getItem(votedOptionKey);
    return val !== null ? Number(val) : null;
  });

  let pollData: { options: string[]; votes: number[] } | null = null;
  if (post.post_type === "poll" && post.media_url) {
    try {
      pollData = JSON.parse(post.media_url);
    } catch (e) {}
  }

  if (!pollData) return null;

  const handleVoteOption = async (index: number) => {
    if (!pollData || votedOption !== null || post.user_id === currentUserId) return;
    const updatedVotes = [...pollData.votes];
    updatedVotes[index]++;
    const updatedPoll = { ...pollData, votes: updatedVotes };
    localStorage.setItem(votedOptionKey, String(index));
    setVotedOption(index);
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ media_url: JSON.stringify(updatedPoll) })
        .eq('id', post.id);
      if (error) throw error;
      onVoteSuccess();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const totalPollVotes = pollData.votes.reduce((a, b) => a + b, 0);
  const hasVotedOrOwns = votedOption !== null || post.user_id === currentUserId;

  return (
    <div className="mb-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 space-y-3">
      {pollData.options.map((opt, idx) => {
        const votes = pollData!.votes[idx] || 0;
        const percentage = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
        return hasVotedOrOwns ? (
          <div key={idx} className="relative w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0D18] overflow-hidden select-none font-semibold text-xs text-slate-800 dark:text-white flex items-center justify-between">
            <div className="absolute left-0 top-0 bottom-0 bg-blue-500/10 dark:bg-blue-500/15 transition-all duration-500" style={{ width: \`\${percentage}%\` }} />
            <span className="relative z-10 flex items-center gap-2 font-bold">
              {opt} {votedOption === idx && <span className="text-[10px] text-blue-500 font-extrabold">(Your Vote)</span>}
            </span>
            <span className="relative z-10 font-extrabold text-slate-700 dark:text-slate-355">
              {percentage}% ({votes})
            </span>
          </div>
        ) : (
          <button
            key={idx}
            onClick={() => handleVoteOption(idx)}
            className="w-full text-left p-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50/10 dark:hover:bg-blue-500/5 transition-all font-semibold text-xs text-slate-700 dark:text-slate-300 hover:text-blue-500 select-none cursor-pointer"
          >
            {opt}
          </button>
        );
      })}
      <div className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 px-1 pt-1 flex justify-between">
        <span>Total: {totalPollVotes} vote{totalPollVotes !== 1 ? 's' : ''}</span>
        {post.user_id === currentUserId && <span className="text-blue-500">Your Poll</span>}
      </div>
    </div>
  );
}

export default function UserProfilePublic() {
  const { username } = useParams<{ username: string }>();
  const [currentUserId, setCurrentUserId] = useState<string>("");
`;

// Now check: does the current content start with the component body?
// It should start with "  const [profile..."
let body = content;
if (body.trimStart().startsWith('const [profile')) {
  // Good - prepend our header
  body = body.trimStart();
} else if (body.includes('const [profile, setProfile]')) {
  // Find where the component body starts
  const idx = body.indexOf('const [profile, setProfile]');
  body = body.substring(idx);
} else {
  console.error('Could not find component body start!');
  process.exit(1);
}

const fixed = header + '\n  ' + body;
fs.writeFileSync('src/pages/UserProfilePublic.tsx', fixed);
console.log('Done! Lines:', fixed.split('\n').length);
