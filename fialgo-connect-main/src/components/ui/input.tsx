import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatedInput } from "./animated-input";

export interface InputProps extends React.ComponentProps<"input"> {
  animated?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, animated = false, ...props }, ref) => {
    if (animated) {
      return (
        <AnimatedInput
          type={type}
          className={className}
          ref={ref}
          {...props}
        />
      );
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, AnimatedInput };
