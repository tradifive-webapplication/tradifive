import React from "react";
import { cn } from "@/lib/utils";

export interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  children,
  text,
  className,
  ...props
}) => {
  return (
    <span
      className={cn("btn-shine", className)}
      {...props}
    >
      {children || text}
    </span>
  );
};

export default ShinyText;
