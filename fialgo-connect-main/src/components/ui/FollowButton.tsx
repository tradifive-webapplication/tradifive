import React from 'react';
import { Check } from 'lucide-react';

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
                className={`h-7 px-3.5 rounded-full text-[12px] font-bold select-none inline-flex items-center justify-center gap-1.5 transition-all tactile-white-pill text-emerald-600 dark:text-emerald-400 ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-95'} ${className}`}
            >
                <Check size={11} strokeWidth={2.8} />
                <span>{followingText}</span>
            </button>
        );
    }

    return (
        <button
            disabled={disabled}
            onClick={onToggleFollow}
            type="button"
            className={`h-7 px-4 rounded-full text-[12px] font-bold select-none inline-flex items-center justify-center transition-all tactile-black-pill ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-95'} ${className}`}
        >
            <span>{text}</span>
        </button>
    );
}
