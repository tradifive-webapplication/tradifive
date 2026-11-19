import React from 'react';
import { UserPlus, Check } from 'lucide-react';

interface FollowButtonProps {
    isFollowing: boolean;
    onToggleFollow: (e: React.MouseEvent) => void;
    className?: string;
    text?: string;
    followingText?: string;
    disabled?: boolean;
}

export function FollowButton({
    isFollowing,
    onToggleFollow,
    className = "",
    text = "Follow",
    followingText = "Following",
    disabled = false,
}: FollowButtonProps) {
    if (isFollowing) {
        return (
            <button
                disabled={disabled}
                onClick={onToggleFollow}
                type="button"
                className={`h-7 px-3 rounded-full text-[11.5px] font-semibold select-none inline-flex items-center justify-center gap-1.5 transition-all bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-[0.98]'} ${className}`}
            >
                <Check size={12} strokeWidth={2.5} className="text-emerald-500" />
                <span>{followingText}</span>
            </button>
        );
    }

    return (
        <button
            disabled={disabled}
            onClick={onToggleFollow}
            type="button"
            className={`h-7 px-3.5 rounded-full text-[11.5px] font-semibold select-none inline-flex items-center justify-center gap-1.5 transition-all bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] border border-slate-900 dark:border-white ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-[0.98]'} ${className}`}
        >
            <UserPlus size={12} strokeWidth={2.2} />
            <span>{text}</span>
        </button>
    );
}
