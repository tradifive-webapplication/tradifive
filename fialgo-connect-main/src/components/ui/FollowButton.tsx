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
                className={`bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1 shrink-0 ${disabled ? 'cursor-default' : 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'} ${className}`}
            >
                {followingText}
            </button>
        );
    }

    return (
        <button
            disabled={disabled}
            onClick={onToggleFollow}
            className={`bg-gradient-to-b from-[#60A5FA] to-[#3B82F6] dark:bg-none dark:bg-[#3B82F6] text-white border border-[#93C5FD] dark:border-[#3B82F6] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full hover:scale-[1.03] transition-transform shrink-0 flex items-center justify-center gap-1 ${className}`}
        >
            <IconlyAddUser set="curved" primaryColor="currentColor" size={11} /> {text}
        </button>
    );
}
