import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none select-none",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#1e293b] to-[#0f172a] hover:from-[#253347] hover:to-[#131c33] text-[#60a5fa] hover:text-[#93c5fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)] border-none",
        solid: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(37,99,235,0.4)] border-none",
        destructive: "bg-gradient-to-r from-red-950/80 to-slate-900 hover:from-red-900/80 hover:to-slate-900 text-red-400 hover:text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)] border border-red-500/20",
        outline: "bg-[#171717] hover:bg-[#222222] text-white/90 hover:text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.2)] border-none",
        secondary: "bg-[#171717] hover:bg-[#222222] text-white/90 hover:text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.2)] border-none",
        ghost: "hover:bg-slate-800/50 text-slate-300 hover:text-white rounded-full",
        link: "text-blue-400 underline-offset-4 hover:underline",
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
