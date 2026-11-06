import React from 'react';
import { AddUser as IconlyAddUser } from 'react-iconly';

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
                className={`bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 text-[10.5px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-center gap-1 shrink-0 transition-all duration-150 active:scale-[0.985] ${disabled ? 'cursor-default' : 'cursor-pointer'} ${className}`}
            >
                {followingText}
            </button>
        );
    }

    return (
        <button
            disabled={disabled}
            onClick={onToggleFollow}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-[10.5px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_5px_rgba(37,99,235,0.3)] border-none transition-all duration-150 active:scale-[0.985] shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${className}`}
        >
            <IconlyAddUser set="curved" primaryColor="currentColor" size={12} /> {text}
        </button>
    );
}
