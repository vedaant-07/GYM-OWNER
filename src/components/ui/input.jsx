import * as React from "react"

import { cn } from "@/lib/utils"
import { normalizePhone10 } from "@/lib/phone"

function isPhoneInput(props) {
  const key = `${props.name || ""} ${props.id || ""} ${props.type || ""} ${props.autoComplete || ""}`.toLowerCase();
  return key.includes("phone") || key.includes("mobile") || key.includes("tel");
}

const Input = React.forwardRef(({ className, type, onChange, maxLength, inputMode, pattern, ...props }, ref) => {
  const phoneInput = isPhoneInput({ ...props, type });

  const handleChange = (event) => {
    if (phoneInput) {
      event.currentTarget.value = normalizePhone10(event.currentTarget.value);
    }
    onChange?.(event);
  };

  return (
    (<input
      type={phoneInput ? "tel" : type}
      inputMode={phoneInput ? "numeric" : inputMode}
      maxLength={phoneInput ? 10 : maxLength}
      pattern={phoneInput ? "[0-9]{10}" : pattern}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      onChange={handleChange}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
