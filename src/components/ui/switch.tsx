import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.HTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, onChange, disabled, ...props }, ref) => (
    <label 
      className={cn("custom-ui-switch shrink-0", className)}
      style={{ fontSize: "2.8px" }}
    >
      <input 
        type="checkbox" 
        ref={ref}
        checked={checked} 
        onChange={(e) => {
          if (typeof onChange === "function") {
            onChange(e.target.checked);
          }
          if (typeof onCheckedChange === "function") {
            onCheckedChange(e.target.checked);
          }
        }}
        disabled={disabled}
        {...props}
      />
      <div className="rail"><span></span></div>
      <div className="slider"></div>
    </label>
  )
);
Switch.displayName = "Switch";

export { Switch };
