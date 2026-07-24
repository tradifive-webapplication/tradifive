import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button styles matching the 3D "Save" button design:
 * - Normal:  dark rounded rect, bottom shadow gives depth/elevation
 * - Hover:   slightly lighter bg, shadow stays
 * - Active:  shadow drops away + translates down (pressed-in feel)
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[14px] font-semibold text-white select-none cursor-pointer",
    "transition-all duration-100 ease-out",
    // Active / pressed state: shadow gone, button shifts down
    "active:shadow-none active:translate-y-[3px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Dark charcoal — matches the screenshots exactly
        default:
          "bg-[#232323] hover:bg-[#2e2e2e] " +
          "shadow-[0_5px_0_0_#111111,0_8px_20px_rgba(0,0,0,0.45)] " +
          "hover:shadow-[0_5px_0_0_#111111,0_8px_16px_rgba(0,0,0,0.35)]",

        // Red / destructive
        destructive:
          "bg-[#c0392b] hover:bg-[#d44132] " +
          "shadow-[0_5px_0_0_#7b241c,0_8px_20px_rgba(192,57,43,0.45)] " +
          "hover:shadow-[0_5px_0_0_#7b241c,0_6px_16px_rgba(192,57,43,0.35)]",

        // Outline / neutral dark
        outline:
          "bg-[#2a2a2a] hover:bg-[#343434] border border-[#3f3f3f] " +
          "shadow-[0_5px_0_0_#111111,0_8px_20px_rgba(0,0,0,0.40)] " +
          "hover:shadow-[0_5px_0_0_#111111,0_6px_16px_rgba(0,0,0,0.30)]",

        // Secondary / lighter gray
        secondary:
          "bg-[#3d3d3d] hover:bg-[#484848] " +
          "shadow-[0_5px_0_0_#1c1c1c,0_8px_20px_rgba(0,0,0,0.35)] " +
          "hover:shadow-[0_5px_0_0_#1c1c1c,0_6px_14px_rgba(0,0,0,0.25)]",

        ghost:
          "bg-transparent hover:bg-white/10 text-slate-400 hover:text-white shadow-none active:translate-y-0",

        link: "bg-transparent text-blue-400 underline-offset-4 hover:underline shadow-none active:translate-y-0",
      },
      size: {
        default: "h-9 px-5 text-[13.5px]",
        sm: "h-8 px-4 text-[12.5px]",
        lg: "h-10 px-7 text-[14px]",
        icon: "h-9 w-9",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
