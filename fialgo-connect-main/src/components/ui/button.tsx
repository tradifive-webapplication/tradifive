import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none select-none",
  {
    variants: {
      variant: {
        default: "bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_2px_8px_-2px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#2563eb]",
        solid: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(37,99,235,0.4)] border-none",
        destructive: "bg-[#f53a3a] hover:bg-[#df2c2c] text-white shadow-[0_2px_8px_-2px_rgba(245,58,58,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#d62828]",
        outline: "border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1c] hover:bg-slate-50 dark:hover:bg-[#232325] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.05)] text-slate-800 dark:text-white",
        secondary: "bg-slate-100 dark:bg-[#2B2B2B] text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-[#3B3B3B] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50 dark:border-[#333333]",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
        tradifive: "bg-white hover:bg-slate-50 text-slate-800 hover:text-blue-600 border border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_3px_rgba(0,0,0,0.06)] dark:bg-gradient-to-r dark:from-[#1e293b] dark:to-[#0f172a] dark:hover:from-[#253347] dark:hover:to-[#131c33] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)] dark:border-none",
      },
      size: {
        default: "h-9 px-4 text-xs tracking-wide",
        sm: "h-7 px-3 text-[11px] tracking-wide",
        lg: "h-11 px-6 text-sm tracking-wide",
        icon: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
