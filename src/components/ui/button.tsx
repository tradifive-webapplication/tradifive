import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_2px_8px_-2px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#2563eb]",
        destructive: "bg-[#f53a3a] hover:bg-[#df2c2c] text-white shadow-[0_2px_8px_-2px_rgba(245,58,58,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#d62828]",
        outline: "border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1c] hover:bg-slate-50 dark:hover:bg-[#232325] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.05)] text-slate-800 dark:text-white",
        secondary: "bg-slate-100 dark:bg-[#2B2B2B] text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-[#3B3B3B] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50 dark:border-[#333333]",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 text-[13px]",
        sm: "h-7 px-2 text-[12px]",
        lg: "h-9 px-4 text-[13px]",
        icon: "h-8 w-8",
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


